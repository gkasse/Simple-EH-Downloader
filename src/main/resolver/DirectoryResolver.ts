import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { CharacterResolver } from "./CharacterResolver";

export class DirectoryResolver {
  public static resolve(path: string, name: string) {
    const dirPath = join(path, CharacterResolver.resolve(name));
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath);
    }
    return dirPath;
  }
}
