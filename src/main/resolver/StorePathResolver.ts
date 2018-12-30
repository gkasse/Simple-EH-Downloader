import {join} from 'path';
import {homedir} from 'os';
import {dialog} from 'electron';
import {mainWindow} from '../handler/AppEventHandler';

export class StorePathResolver {
  static resolve(): string {
    const [location] = dialog.showOpenDialog(mainWindow, {
      title: '保存場所を選択する',
      defaultPath: join(homedir(), 'Downloads'),
      properties: ['openDirectory', 'treatPackageAsDirectory'],
    });
    return location;
  }
}
