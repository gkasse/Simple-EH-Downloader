import { ipcMain } from 'electron';
import {StorePathResolver} from "../resolver/StorePathResolver";
import {Gallery} from "../model/Gallery";

ipcMain.on('selectStoreLocation', event => {
  const path = StorePathResolver.resolve();
  event.sender.send('selectedLocation', path);
});

ipcMain.on('download', async (event, url: string, path: string) => {
  try {
    event.sender.send('startDownload');
    const gallery = await Gallery.parse(url);
    event.sender.send('update-max', gallery.images.length);
    await gallery.store(path);
    event.sender.send('complete');
  } catch (e) {
    console.error(e);
    event.sender.send('error');
  }
});
