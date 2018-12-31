import { app, BrowserWindow } from "electron";

export let mainWindow;
app.on("ready", () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    height: 350,
    useContentSize: true,
    width: 450
  });

  mainWindow.loadURL(process.env.WINDOW_URL);
  mainWindow.on("closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});
