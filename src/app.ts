import { app, BrowserWindow } from 'electron';

let win = null;

app.on("ready", () => {
  win = new BrowserWindow();

  win.setTitle("LibAssist");

  win.loadFile(__dirname + "/views/index.html");
});
