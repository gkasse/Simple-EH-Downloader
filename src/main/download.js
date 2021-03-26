import archiver from 'archiver';
import fetch from 'node-fetch';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { parse } from 'url';
import { accessSync, createWriteStream, mkdirSync, writeFileSync } from 'fs';
import { internet } from 'faker/locale/ja';
import { launch } from 'puppeteer';
import notice from './index';

function exist(path) {
  try {
    accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
}

async function sleep(millisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, millisec);
  });
}

async function parseThumbnailAnchors(page) {
  const list = [];
  const anchors = await page.$$('.gdtm a');
  for (const anchor of anchors) {
    list.push(await page.evaluate(node => node.href, anchor));
  }
  return list;
}

async function downloadImage(page, url, saveDir) {
  page.goto(url, {
    timeout: 60000,
  }).then(async () => {
    await page.waitForSelector('#img');

    const imageUrl = await page.evaluate(img => img.src, await page.$('#img'));
    const fileName = basename(parse(imageUrl).pathname);
    const body = await fetch(imageUrl);
    const filePath = join(saveDir, fileName);
    if (!exist(filePath)) {
      writeFileSync(filePath, new Buffer(await body.arrayBuffer()), 'binary');
    }
    notice('update-now');
    await page.close();
  }, async () => {
    await page.close();
  });
}

function compress(fileName, targetDir) {
  const stream = createWriteStream(`${fileName}.zip`);
  const archive = archiver('zip', {
    zlib: {
      level: 9,
    },
  });
  archive.pipe(stream);
  archive.directory(`${targetDir}/`, false);
  archive.finalize();
}

function convertUnusableCharacter(strings) {
  strings = strings.replace(/\\/g, '￥');
  strings = strings.replace(/\//g, '／');
  strings = strings.replace(/:/g, '：');
  strings = strings.replace(/\*/g, '＊');
  strings = strings.replace(/\?/g, '？');
  strings = strings.replace(/"/g, '”');
  strings = strings.replace(/</g, '＜');
  strings = strings.replace(/>/g, '＞');
  strings = strings.replace(/\|/g, '｜');
  return strings;
}

let browser;
export async function download(rootUrl, baseDir, doArchive) {
  try {
    browser = await launch();
    const page = await browser.newPage();
    await page.setUserAgent(internet.userAgent());
    await page.goto(rootUrl);

    let title = await page.evaluate(h1 => h1.innerText, await page.$('#gj'));
    title = convertUnusableCharacter(title);
    const saveDir = join(doArchive ? tmpdir() : baseDir, title);
    if (!exist(saveDir)) {
      mkdirSync(saveDir);
    }

    const [, total] = await page.evaluate(p => /^([0-9]+) pages$/.exec(p.innerText), await page.$('#gdd > table > tbody > tr:nth-last-child(2) > td:nth-child(2)'));
    notice('update-max', total);

    const links = [];
    links.push(...(await parseThumbnailAnchors(page)));

    const lastPage = await page.evaluate(td => td.innerText - 1, await page.$('table.ptt > tbody > tr > td:nth-last-child(2)'));
    for (let i = 1; i <= lastPage; i += 1) {
      await page.goto(`${rootUrl}?p=${i}`);
      await sleep(3000);
      links.push(...(await parseThumbnailAnchors(page)));
    }

    notice('start-downloading');
    for (const link of links) {
      let pages = await browser.pages();
      downloadImage(await browser.newPage(), link, saveDir).catch((reason) => {
        throw new Error(reason);
      });

      while (pages.length >= 10) {
        await sleep(1000);
        pages = await browser.pages();
      }
    }

    let pages = await browser.pages();
    while (pages.length !== 2) {
      await sleep(1000);
      pages = await browser.pages();
    }
    await browser.close();
    browser = null;

    if (!doArchive) {
      return;
    }
    compress(join(baseDir, title), saveDir);
  } catch (e) {
    if (browser !== null) {
      throw e;
    }
  }
}

export async function cancel() {
  await browser.close();
  browser = null;
}
