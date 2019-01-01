import { app, BrowserWindow, ipcMain, Event, Menu, globalShortcut, dialog } from 'electron';
import { ChildProcess, spawn } from 'child_process';
import build from './cli';
import parse from './parser';
import path from 'path';
import { Example } from "./models/library.model";

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

function openDoc() {
  const path = dialog.showOpenDialog({
    properties: ['openFile'], filters: [{extensions: ['ladoc'], name: "LibAssist Documentation"}]
  });
  if (path[0]) {
    const document = parse(path[0]);
    win.webContents.send('openLaFile', document);
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
