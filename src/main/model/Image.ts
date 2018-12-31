import axios from "axios";
import { load } from "cheerio";
import { writeFileSync } from "fs";
import { basename, join } from "path";
import { parse } from "url";
import { PathHelper } from "../helper/PathHelper";

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
    if (PathHelper.exists(filePath)) {
      return;
    }

    const body = await axios
      .get(src, { responseType: "arraybuffer" })
      .then(res => res.data);
    writeFileSync(filePath, body);
  }
}
