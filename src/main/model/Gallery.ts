import { captureException } from "@sentry/node";
import archiver from "archiver";
import axios from "axios";
import { load } from "cheerio";
import { WebContents } from "electron"; // tslint:disable-line
import { createWriteStream, readdirSync, rmdirSync, unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { of, from, queueScheduler } from "rxjs";
import { delay, tap, flatMap } from "rxjs/operators";
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

  public async store(path: string, eventEmitter: WebContents) {
    if (!this.title) {
      throw new Error("title is falsy.");
    }

    const workDir = DirectoryResolver.resolve(tmpdir(), this.title);
    const fileName = `${join(path, CharacterResolver.resolve(this.title))}.zip`;
    await of(...this.images, queueScheduler).pipe(
        flatMap(image => from(image.download(workDir))),
        delay(500),
        tap(
            () => eventEmitter.send("update-now"),
            captureException,
            () => this.createArchive(workDir, fileName)
        )
    ).toPromise();
  }

  private createArchive(workDir: string, fileName: string) {
    const stream = createWriteStream(fileName);
    stream.on("close", () => this.cleaning(workDir));
    const archive = archiver.create("zip", {
      zlib: {
        level: 9
      }
    });
    archive.pipe(stream);
    archive.directory(`${workDir}/`, false);
    archive.finalize();
  }

  private cleaning(workDirPath: string) {
    const files = readdirSync(workDirPath);
    files.filter(file => existsSync(join(workDirPath, file))).forEach(file => unlinkSync(join(workDirPath, file)));
    rmdirSync(workDirPath);
  }
}
