const {app, BrowserWindow} = require('electron');

export let mainWindow;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    useContentSize: true,
    autoHideMenuBar: true,
    height: 350,
    width: 450
  });

  mainWindow.loadURL(process.env.WINDOW_URL);
  mainWindow.on('closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });
});
