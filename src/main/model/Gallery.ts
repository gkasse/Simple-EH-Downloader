import archiver from "archiver";
import axios from "axios";
import { load } from "cheerio";
import { createWriteStream, readdir, rmdir, unlink } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import { CharacterResolver } from "../resolver/CharacterResolver";
import { DirectoryResolver } from "../resolver/DirectoryResolver";
import { Image } from "./Image";

export class Gallery {
  /**
   * @param url
   * @returns {Promise<Gallery>}
   */
  public static async parse(url) {
    const $ = await axios
      .get(`${url}`, {
        headers: {
          Cookie: "nw=1;"
        }
      })
      .then(res => res.data)
      .then(load);
    const title = $("#gj").text() || $("#gn").text();
    const images = await this.fetchAllImages($);
    return new Gallery(url, title, images);
  }

  private static async fetchAllImages($, images: Image[] = []) {
    images = images.concat(
      $(".gdtm a")
        .map((_, el) => $(el).attr("href"))
        .get()
        .map(url => new Image(url))
    );
    if (this.isLastPage($)) {
      return images;
    }

    const nextPage = $(".ptt td:last-child > a").attr("href");
    await this.wait(3000);
    return this.fetchAllImages(
      await axios
        .get(nextPage)
        .then(res => res.data)
        .then(load),
      images
    );
  }

  private static isLastPage($) {
    return $(".ptt td:last-child > a").attr("href") === undefined;
  }

  private static async wait(millisecond: number) {
    return new Promise(resolve => setTimeout(resolve, millisecond));
  }

  public readonly url: string;
  public readonly title: string;
  public readonly images: Image[];

  /**
   * @param url string
   * @param title string
   * @param images Image[]
   */
  constructor(url, title, images) {
    this.url = url;
    this.title = title;
    this.images = images;
  }

  public async store(path: string) {
    if (!this.title) {
      throw new Error("title is falsy.");
    }
    const workDir = DirectoryResolver.resolve(tmpdir(), this.title);
    await Promise.all(
      this.images.map(image => {
        return Gallery.wait(3000).then(() => image.download(workDir));
      })
    );

    const fileName = `${join(path, CharacterResolver.resolve(this.title))}.zip`;
    const stream = createWriteStream(fileName);
    stream.on("close", async () => this.cleaning(workDir));
    const archive = archiver.create("zip", {
      zlib: {
        level: 9
      }
    });
    archive.pipe(stream);
    archive.directory(`${workDir}/`, false);
    archive.finalize();
  }

  private async cleaning(workDirPath: string) {
    const readdirAsync = promisify(readdir);
    const unlinkAsync = promisify(unlink);
    const rmdirAsync = promisify(rmdir);
    const files = await readdirAsync(workDirPath);
    await Promise.all(files.map(file => unlinkAsync(join(workDirPath, file))));
    rmdirAsync(workDirPath);
  }
}
