import { app, BrowserWindow, dialog, Event, ipcMain, Menu } from 'electron';
import { ChildProcess, spawn } from 'child_process';
import { IExample } from './models/library.model';
import { ncp } from 'ncp';
import Server from './server';
import Parser from './parse';
import build from './cli';
import path from 'path';
import fs from 'fs';
import loadDeps from './loadDeps';
import { sanitizeName } from './utils';

console.log('Starting!');

interface IRunningProcess {
  process: ChildProcess | null;
  state: number;
  name: string;
}

let win: BrowserWindow;
let splash: BrowserWindow;
let runningExamples: IRunningProcess[] = [];
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

if (!fs.existsSync(path.resolve(getUserDataFolder(), 'LibAssist'))) {
  fs.mkdir(path.resolve(getUserDataFolder(), 'LibAssist'), err => {
    err
      ? console.log('Error creating storage directory!', err)
      : console.log('Created local storage directory!');
    if (
      !fs.existsSync(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'))
    ) {
      fs.mkdir(
        path.resolve(getUserDataFolder(), 'LibAssist', 'assets'),
        err => {
          err
            ? console.log('Error creating assets directory!', err)
            : console.log('Created assets storage directory!');
        }
      );
    }
  });
} else {
  if (
    !fs.existsSync(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'))
  ) {
    fs.mkdir(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'), err => {
      err
        ? console.log('Error creating assets directory!', err)
        : console.log('Created assets storage directory!');
    });
  }
}

function getUserDataFolder() {
  return (
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + 'Library/Preferences'
      : '/var/local')
  );
}

function openDoc(root: string) {
  const parser = new Parser(root);
  const document = parser.parse();
  if (document.assets) {
    const localAssetsDir = path.resolve(
      getUserDataFolder(),
      'LibAssist',
      'assets',
      document.package
    );
    if (!fs.existsSync(localAssetsDir)) {
      fs.mkdirSync(localAssetsDir);
    }
    ncp(path.parse(root).dir + '/' + document.assets, localAssetsDir, err => {
      err
        ? console.log('Error copying assets dir: ', err)
        : console.log('Copied doc assets!');
      win.webContents.send('openLaFile', document);
    });
  } else {
    win.webContents.send('openLaFile', document);
  }
}

app.on('ready', () => {
  win = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, 'assets/logo.png'),
  });

  splash = new BrowserWindow({
    titleBarStyle: 'hidden',
    width: 400,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  splash.loadFile(__dirname + '/views/splash/index.html');

  if (serve) {
    win.loadURL('http://localhost:4200');
  } else {
    win.loadFile(__dirname + '/app/index.html');
  }

  win.setTitle('LibAssist');

  win.on('ready-to-show', () => {
    const assetServer = new Server(
      path.resolve(getUserDataFolder(), 'LibAssist', 'assets'),
      9949
    );

    assetServer.start().then(() => start());
  });
});

function start() {
  splash.destroy();
  win.show();

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click() {
            const root = dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { extensions: ['ladoc'], name: 'LibAssist Documentation' },
              ],
            });
            if (root) {
              if (root[0]) {
                openDoc(root[0]);
              }
            }
          },
          accelerator: 'CommandOrControl+o',
        },
        {
          label: 'Open Project',
          async click() {
            const root = dialog.showOpenDialog({
              properties: ['openDirectory'],
            });
            console.log(root);
            if (root) {
              if (root[0]) {
                (await loadDeps(root[0])).forEach(openDoc);
              }
            }
          },
          accelerator: 'CommandOrControl+Shift+o',
        },
      ],
    },
    {
      label: 'Theme',
      submenu: [
        {
          label: 'Light',
          click() {
            win.webContents.send('changeTheme', 'light');
          },
        },
        {
          label: 'Dark',
          click() {
            win.webContents.send('changeTheme', 'dark');
          },
        },
      ],
    },
    {
      label: 'Debug',
      submenu: [
        {
          label: 'Toggle DevTools',
          click() {
            win.webContents.toggleDevTools();
          },
          accelerator: 'CommandOrControl+Shift+i',
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  win.on('closed', () => {
    process.exit();
  });
}

async function kill(image: string) {
  const ex = runningExamples.filter(example => example.name === image)[0];
  console.log('EX!', ex);
  if (ex) {
    if (ex.state >= 2) {
      let containerId: string;
      const getId = spawn('docker', [
        'ps',
        '-a',
        '-q',
        '--filter',
        'ancestor=' + image,
        '--format="{{.ID}}"',
      ]);
      getId.stdout.on('data', chunk => {
        console.log('DOCKER OUTPUT SOMETHING! ', chunk.toString());
        containerId = chunk.toString().trim();
      });
      getId.on('exit', () => {
        console.log(containerId);
        const stopper = spawn('docker', [
          'stop',
          containerId.substring(1, containerId.length - 1),
        ]);
        stopper.on('exit', () => {
          console.log(`STOPPED CONTAINER ${containerId}`);
          ex.state = -1;
          win.webContents.send(`stoppedExample${image}`);
        });
        stopper.stdout.on('data', chunk => console.log(chunk.toString()));
        stopper.stderr.on('data', chunk => console.log(chunk.toString()));
      });
    } else {
      ex.state = -1;
      win.webContents.send(`stoppedExample${image}`);
    }
  }
}

ipcMain.on(
  'runExample',
  async (event: Event, options: IExample, libFile: string, project: string) => {
    // Create the name of the Docker container which will host the example.
    const name =
      'ladoc/' +
      sanitizeName(`${project.toLowerCase()}-${options.name.toLowerCase()}`);

    // Create an object to hold the state of the Docker process.
    const rp = { state: 0, process: null, name };
    runningExamples.push(rp);

    const workingDir =
      options.template === 'custom'
        ? path.parse(libFile).dir
        : __dirname + '/templates/' + options.template;

    console.log(workingDir);
    console.log(options, workingDir);
    await build(options, workingDir, name);
    if (rp.state === -1) return;
    rp.state++;

    console.log(name);
    win.webContents.send(
      sanitizeName(`exampleBuilt${options.name}${project}`),
      name
    );
    const ports: string[] = [];
    options.ports.forEach(port => ports.push('-p', port));

    const exampleProcess = spawn('docker', ['run', '--rm', ...ports, name]);

    if (rp.state === -1) return;
    rp.state++;

    console.log(
      'running `docker run --rm ' + ports.join(' ') + ' ' + name + '`'
    );

    exampleProcess.stdout.on('data', data => {
      console.log(`stdout: ${data.toString()}`);
      win.webContents.send(
        sanitizeName(`exampleOutput${options.name}${project}`),
        data.toString(),
        options.path,
        true
      );
    });
    exampleProcess.stderr.on('data', data => {
      console.log(`stderr: ${data.toString()}`);
      win.webContents.send(
        sanitizeName(`exampleOutput${options.name}${project}`),
        data.toString(),
        options.path,
        false
      );
    });
    exampleProcess.once('exit', () => {
      console.log('PROCESS ENDED: ', name);
      win.webContents.send(`stoppedExample${name}`);
    });
  }
);

ipcMain.on('stopExample', async (event: Event, image: string) => {
  kill(image);
});
ipcMain.on('sendStdIn', async (event: Event, name: string, message: string) => {
  const process = runningExamples.filter(proc => proc.name === name)[0];
  if (process) if (process.process) process.process.send(message);
});

ipcMain.on('openDoc', () => {
  const root = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ extensions: ['ladoc'], name: 'LibAssist Documentation' }],
  });
  if (root) {
    if (root[0]) {
      openDoc(root[0]);
    }
  }
});
