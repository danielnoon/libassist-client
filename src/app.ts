import { app, BrowserWindow, ipcMain, Event } from 'electron';
import build from './cli';
import Options from './models/options.model';

console.log("Starting!");

let win = null;

app.on("ready", () => {
  win = new BrowserWindow();

  win.setTitle("LibAssist");

  win.loadFile(__dirname + "/views/index.html");
});

ipcMain.on('buildExample', async (event: Event, options: Options, workingDir: string) => {
  console.log(options, workingDir);
  const name = await build(options, workingDir);
  console.log(name);
});
