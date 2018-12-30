import axios from "axios";
import {load} from 'cheerio';
import {basename, join} from "path";
import {parse} from "url";
import {PathHelper} from "../helper/PathHelper";
import {writeFileSync} from "fs";

export class Image {
  url: string;

  constructor (url) {
    this.url = url
  }

  async download(basePath: string) {
    const $ = await axios.get(this.url).then(res => res.data).then(load);
    const src = $('#img').attr('src');
    const fileName = basename(parse(src).pathname);
    const filePath = join(basePath, fileName);
    if (PathHelper.exists(filePath)) {
      return;
    }

    const body = await axios.get(src, {responseType: 'arraybuffer'}).then(res => res.data);
    writeFileSync(filePath, body);
  }
}
