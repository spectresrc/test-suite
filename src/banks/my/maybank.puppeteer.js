import _ from 'lodash';
import { DateTime } from 'luxon';
import { setTimeout } from "node:timers/promises";
import puppeteer from 'puppeteer';
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// puppeteer.use(StealthPlugin());
import * as CONFIG from '../../config/index.js';

const username = 'accelerate';
const password = '';
const recipient = {
  bank: 'rhb',
  account: '21212500188157',
};
const sender = {
  account: '123123123'
};

const bankMappings = {

};

async function main() {
  console.log(`🕛`, `${DateTime.now().toSQL()}`);
  console.log(`🔆 Start Troubleshoot`);

  if (CONFIG.puppeteer.proxy) {
    console.log(`😎 PROXY LOGIN detected:`, CONFIG.puppeteer.proxy.host);
    CONFIG.puppeteer.option.args.push(`--proxy-server=${CONFIG.puppeteer.proxy.host}`);
  }

  const browser = await puppeteer.launch(CONFIG.puppeteer.option);
  const pages = await browser.pages();
  const page = pages.shift();

  const version = await browser.version();
  console.log(`😎 Chrome version:`, version);
  console.log(`😎 user_agent:`, CONFIG.puppeteer.user_agent);
  console.log(`😎 CONFIG.puppeteer.option:`, CONFIG.puppeteer.option);

  page.setUserAgent(CONFIG.puppeteer.user_agent);
  // await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
  page.on("dialog", (dialog) => dialog.accept());

  if (CONFIG.puppeteer.proxy) {
    const [username, password] = CONFIG.puppeteer.proxy.auth.split(':');
    await page.authenticate({ username, password });
    console.log(`😎 PROXY LOGIN authenticated:`, CONFIG.puppeteer.proxy.host, { username, password });
  }

  // get current ip address
  const ip = await page.goto('https://checkip.amazonaws.com/', { waitUntil: ['networkidle0'], timeout: 5_000 });
  console.log(`😎 IP Address:`, (await ip.text()).trim());

  // await page.goto('https://api.ipify.org/', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/http2-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/ja3-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });

  const URL = 'https://www.maybank2u.com.my/home/m2u/common/login.do';

  await page.goto(URL, { waitUntil: ['networkidle0'], timeout: 15_000 });
  await page.waitForSelector('button[class^=LoginUsername---login-button]', { visible: true, timeout: 3_000 });

  await page.click('input#username');
  await page.type('input#username', username, { delay: 20 });
  await page.click('input#username');
  // await setTimeout(3_000);
  await page.click('button[class^=LoginUsername---login-button]');
  // document.querySelector('button[class^=LoginUsername---login-button]').click();

  // await setTimeout(3_000);
  // await page.evaluate(() => {
  //   document.querySelector('input#username').click();
  //   document.querySelector('input#username').blur();
  //   document.querySelector('button[class^=LoginUsername---login-button]').click();
  // });

  // await page.waitForSelector('div[class*=SecurityPhrase---container]', { visible: true, timeout: 17_000 });
  // await page.click('div[class*=SecurityPhrase---right-btn-container] > button');
}

main();