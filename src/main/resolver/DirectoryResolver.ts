import { mkdirSync } from "fs";
import { join } from "path";
import { PathHelper } from "../helper/PathHelper";
import { CharacterResolver } from "./CharacterResolver";

export class DirectoryResolver {
  public static resolve(path: string, name: string) {
    const dirPath = join(path, CharacterResolver.resolve(name));
    if (!PathHelper.exists(dirPath)) {
      mkdirSync(dirPath);
    }
    return dirPath;
  }
}
