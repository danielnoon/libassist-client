import { app, BrowserWindow, ipcMain, Event, Menu, globalShortcut, dialog } from 'electron';
import { ChildProcess, spawn } from 'child_process';
import build from './cli';
import Parser from './parse';
import path from 'path';
import { Example } from "./models/library.model";
import { ncp } from "ncp";
import fs from 'fs';
import Server from "./server";

console.log("Starting!");

interface IRunningProcess {
  process: ChildProcess | null;
  state: number;
  name: string;
}

let win: BrowserWindow;
let runningExamples: IRunningProcess[] = [];
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

if (!fs.existsSync(path.resolve(getUserDataFolder(), 'LibAssist'))) {
  fs.mkdir(path.resolve(getUserDataFolder(), 'LibAssist'), err => {
    err ? console.log("Error creating storage directory!", err) : console.log("Created local storage directory!");
    if (!fs.existsSync(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'))) {
      fs.mkdir(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'), err => {
        err ? console.log("Error creating assets directory!", err) : console.log("Created assets storage directory!");
      });
    }
  });
}
else {
  if (!fs.existsSync(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'))) {
    fs.mkdir(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'), err => {
      err ? console.log("Error creating assets directory!", err) : console.log("Created assets storage directory!");
    });
  }
}

function getUserDataFolder() {
  return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
}

function openDoc() {
  const lapath = dialog.showOpenDialog({
    properties: ['openFile'], filters: [{extensions: ['ladoc'], name: "LibAssist Documentation"}]
  });
  if (lapath[0]) {
    const parser = new Parser(lapath[0]);
    const document = parser.parse();
    if (document.assets) {
      const localAssetsDir = path.resolve(getUserDataFolder(), 'LibAssist', 'assets', document.package);
      if (!fs.existsSync(localAssetsDir)) {
        fs.mkdirSync(localAssetsDir);
      }
      ncp(path.parse(lapath[0]).dir + "/" + document.assets, localAssetsDir, err => {
        err ? console.log("Error copying assets dir: ", err) : console.log("Copied doc assets!");
        win.webContents.send('openLaFile', document);
      });
    }
    else win.webContents.send('openLaFile', document);
  }
}

app.on("ready", () => {
  win = new BrowserWindow();
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open",  
          click() {
            openDoc();
          },
          accelerator: "CommandOrControl+o"
        }
      ]
    },
    {
      label: "Theme",
      submenu: [
        {
          label: "Light",
          click() {
            win.webContents.send('changeTheme', 'light')
          }
        },
        {
          label: "Dark",
          click() {
            win.webContents.send('changeTheme', 'dark')
          }
        }
      ]
    }
  ]);

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win.webContents.toggleDevTools();
  });

  win.setTitle("LibAssist");

  Menu.setApplicationMenu(menu);

  if (serve) {
    win.loadURL('http://localhost:4200');
  }
  else {
    win.loadFile(__dirname + "/app/index.html");
  }

  const assetServer = new Server(path.resolve(getUserDataFolder(), 'LibAssist', 'assets'), 9949);
  assetServer.start();

  win.on('closed', () => {
    process.exit();
  });
});

function kill(image: string) {
  const ex = runningExamples.filter(example => example.name === image)[0];
  if (ex) {
    if (ex.state >= 2) {
      const command = `docker rm $(docker stop $(docker ps -a -q --filter ancestor=${image} --format="{{.ID}}"))`;
      const kill = spawn(command);
      kill.on('exit', () => console.log("Exited!"));
    }
    ex.state = -1;
  }
  win.webContents.send(`stoppedExample${image}`);
}

ipcMain.on('runExample', async (event: Event, options: Example, libFile: string, project: string) => {
  // Create the name of the Docker container which will host the example.
  const name = `ladoc/${project.toLowerCase().replace(" ", "-")}-${options.name.toLowerCase().replace(" ", "-")}`;

  // Create an object to hold the state of the Docker process.
  const rp = {state: 0, process: null, name};
  runningExamples.push(rp);

  const workingDir = options.template === 'custom' ? path.parse(libFile).dir : __dirname + "/templates/" + options.template;
  console.log(workingDir);
  console.log(options, workingDir);
  await build(options, workingDir, name);
  if (rp.state === -1) return;
  rp.state++;
  console.log(name);
  win.webContents.send(`exampleBuilt${options.name}${project}`, name);
  const ports: string[] = [];
  options.ports.forEach(port => ports.push('-p', port));
  const exampleProcess = spawn("docker", ["run", ...ports, name]);
  if (rp.state === -1) return;
  rp.state++;
  console.log('running!');
  exampleProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    win.webContents.send(`exampleOutput${options.name}${project}`, data, options.path, true);
  });
  exampleProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    win.webContents.send(`exampleOutput${options.name}${project}`, data, options.path, false);
  });
  exampleProcess.once('exit', () => {
    console.log("PROCESS ENDED: ", name);
    win.webContents.send(`stoppedExample${name}`);
  });
});

ipcMain.on('stopExample', async (event: Event, image: string) => {
  kill(image);
});
ipcMain.on('sendStdIn', async (event: Event, name: string, message: string) => {
  const process = runningExamples.filter(proc => proc.name === name)[0];
  if (process) {

  }
});

ipcMain.on('openDoc', () => {
  openDoc();
});
