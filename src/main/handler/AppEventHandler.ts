import { init } from "@sentry/node";
import { app, BrowserWindow } from "electron"; // tslint:disable-line

export let mainWindow;
app.on("ready", () => {
  init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
  });

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    height: 350,
    useContentSize: true,
    webPreferences: {
      webSecurity: false
    },
    width: 450
  });

  mainWindow.loadURL(
    process.env.WINDOW_URL || `file://${__dirname}/index.html`
  );
  mainWindow.on("closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});
