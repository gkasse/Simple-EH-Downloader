import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { homedir } from 'os';
import { cancel, download } from './download';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 350,
    useContentSize: true,
    width: 450,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

export default function notice(eventName, ...args) {
  mainWindow.webContents.send(eventName, args);
}

ipcMain.on('start-download', (event, url, doArchive) => {
  let saveDir;
  try {
    [saveDir] = dialog.showOpenDialog(mainWindow, {
      title: '保存場所を選択する',
      defaultPath: join(homedir(), 'Downloads'),
      properties: ['openDirectory', 'treatPackageAsDirectory'],
    });
  } catch (e) {
    notice('canceled');
    return;
  }
  notice('selected-directory');
  download(url, saveDir, doArchive).then(() => notice('complete'), () => notice('error'));
});

ipcMain.on('cancel', () => {
  cancel().then(() => notice('canceled'));
});
