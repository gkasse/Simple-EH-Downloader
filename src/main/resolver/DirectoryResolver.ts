import {mkdirSync} from "fs";
import {join} from "path";
import {CharacterResolver} from "./CharacterResolver";
import {PathHelper} from "../helper/PathHelper";

export class DirectoryResolver {
  static resolve(path: string, name: string) {
    const dirPath = join(path, CharacterResolver.resolve(name));
    if (!PathHelper.exists(dirPath)) {
      mkdirSync(dirPath)
    }
    return dirPath;
  }
}
