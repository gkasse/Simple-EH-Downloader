import { dialog } from "electron"; // tslint:disable-line
import { homedir } from "os";
import { join } from "path";
import { mainWindow } from "../handler/AppEventHandler";

export class StorePathResolver {
  public static resolve(): string {
    const [location] = dialog.showOpenDialog(mainWindow, {
      defaultPath: join(homedir(), "Downloads"),
      properties: ["openDirectory", "treatPackageAsDirectory"],
      title: "保存場所を選択する"
    });
    return location;
  }
}
