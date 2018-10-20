import { app, BrowserWindow, ipcMain, Event, Menu, remote } from 'electron';
import { spawn } from 'child_process';
import build from './cli';
import Options from './models/options.model';

console.log("Starting!");

let win: BrowserWindow;
let runningExamples = [];

app.on("ready", () => {
  win = new BrowserWindow();
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
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
    },
    {
      label: "Debug",
      submenu: [
        {
          label: "Toggle Dev Tools",
          click() {
            win.webContents.toggleDevTools();
          }
        }
      ]
    }
  ]);
  win.setTitle("LibAssist");
  Menu.setApplicationMenu(menu);
  win.loadFile(__dirname + "/views/index.html");
});

ipcMain.on('runExample', async (event: Event, options: Options, workingDir: string) => {
  console.log(options, workingDir);
  const name = await build(options, workingDir);
  console.log(name);
  const ports: string[] = [];
  options.Ports.forEach(port => ports.push('-p', port));
  const exampleProcess = spawn("docker", ["run", ...ports, name]);
  console.log('running!');
  exampleProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    win.webContents.send('exampleOutput', data, options.Example, true);
  });
  exampleProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    win.webContents.send('exampleOutput', data, options.Example, false);
  });
  // exampleProcess.stdout.on("data", data => {
  //   console.log("STDOUT: ", data);
  //   win.webContents.send('exampleOutput', data);
  // })
});
