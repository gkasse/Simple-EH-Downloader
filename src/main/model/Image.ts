import axios from "axios";
import { load } from "cheerio";
import { existsSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { parse } from "url";

export class Image {
  private readonly url: string;

  constructor(url) {
    this.url = url;
  }

  public async download(basePath: string) {
    const $ = await axios
      .get(this.url)
      .then(res => res.data)
      .then(load);
    const src = $("#img").attr("src");
    const fileName = basename(parse(src).pathname);
    const filePath = join(basePath, fileName);
    if (existsSync(filePath)) {
      return;
    }

    await axios
      .get(src, { responseType: "arraybuffer" })
      .then(res => writeFileSync(filePath, res.data));
  }
}
