import {accessSync} from "fs";

export class PathHelper {


  static exists(path: string) {
    try {
      accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}
