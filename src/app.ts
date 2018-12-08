import { app, BrowserWindow, ipcMain, Event, Menu, globalShortcut, dialog } from 'electron';
import { spawn } from 'child_process';
import build from './cli';
import Options from './models/options.model';
import parse from './parser';
import path from 'path';

console.log("Starting!");

let win: BrowserWindow;
let runningExamples = [];

app.on("ready", () => {
  win = new BrowserWindow();
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open",  
          click() {
            const path = dialog.showOpenDialog({
              properties: ['openFile'], filters: [{extensions: ['ladoc'], name: "LibAssist Documentation"}]
            });
            const document = parse(path[0]);
            win.webContents.send('openLaFile', document);
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
  })
  win.setTitle("LibAssist");
  Menu.setApplicationMenu(menu);
  win.loadFile(__dirname + "/views/index.html");
});

ipcMain.on('runExample', async (event: Event, options: Options, libFile: string) => {
  const workingDir = path.parse(libFile).dir;
  console.log(options, workingDir);
  const name = await build(options, workingDir);
  console.log(name);
  win.webContents.send(`exampleBuilt${options.Name}${options.Project}`, name);
  const ports: string[] = [];
  options.Ports.forEach(port => ports.push('-p', port));
  const exampleProcess = spawn("docker", ["run", ...ports, name]);
  console.log('running!');
  exampleProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    win.webContents.send(`exampleOutput${options.Name}${options.Project}`, data, options.Example, true);
  });
  exampleProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    win.webContents.send(`exampleOutput${options.Name}${options.Project}`, data, options.Example, false);
  });
  // exampleProcess.stdout.on("data", data => {
  //   console.log("STDOUT: ", data);
  //   win.webContents.send('exampleOutput', data);
  // })
});

ipcMain.on('stopExample', async (event: Event, image: string) => {
  const command = `docker rm $(docker stop $(docker ps -a -q --filter ancestor=${image} --format="{{.ID}}"))`;
  const kill = spawn(command);
  kill.on('exit', () => console.log("Exited!"));
});
