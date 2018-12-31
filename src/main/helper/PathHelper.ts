import { accessSync } from "fs";

export class PathHelper {
  public static exists(path: string) {
    try {
      accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}
