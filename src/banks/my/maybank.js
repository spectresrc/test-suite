import _ from 'lodash';
import { DateTime } from 'luxon';
import { setTimeout } from "node:timers/promises";
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
// import * as CONFIG from '../../config/index.js';

const username = 'visxxxx';
const password = '';
const recipient = {
  bank: 'rhb',
  account: '21212500188157',
};
const sender = {
  account: '123123123'
};

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
const args = [
  // '--executablePath=',
  `--window-size=1920,1080`,
  '--no-sandbox',
  '--no-zygote',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
  `--start-maximized`,
  '--disable-background-networking',
  '--disable-client-side-phishing-detection',
  '--disable-default-apps',
  '--disable-hang-monitor',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  '--disable-dev-shm-usage',
  '--disable-sync',
  '--disable-translate',
  '--disable-notifications',
  '--metrics-recording-only',
  '--no-first-run',
  '--safebrowsing-disable-auto-update',
  '--enable-automation',
  '--password-store=basic',
  '--use-mock-keychain',
  '--force-color-profile=srgb',
  '--disable-gpu',
  '--disable-3d-apis',
  '--hide-scrollbars',
  '--mute-audio',
  '--disable-accelerated-2d-canvas',
  '--no-zygote',
  '--disk-cache-size=0',
  '--enable-features=NetworkServiceInProcess',
  '--disable-features=NetworkService',
  '--disable-blink-features=AutomationControlled',
  '--disable-features=OpaqueResponseBlocking',
  '--enable-quic',
];
const launch = {
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: false,
  permissions: ['notifications'],
  userAgent,
  args,
};

const proxy = {
  server: 'http://43.217.54.162:3128',
  // auth: 'hunkok:Hk123456',
  username: 'hunkok',
  password: 'Hk123456',
};

async function main() {
  console.log(`🕛`, `${DateTime.now().toSQL()}`);
  console.log(`🔆 Start Troubleshoot`);

  // chromium.use(stealth());

  // if (proxy) {
  //   console.log(`😎 PROXY LOGIN detected:`, proxy.server);
  //   launch.proxy = _.pick(proxy, ['server', 'username', 'password']);
  // }

  const browser = await chromium.launch(launch);
  const page = await browser.newPage();
  const version = await browser.version();
  console.log(`😎 Chrome version:`, version);
  console.log(`😎 CONFIG.launch:`, launch);

  // await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
  page.on('dialog', async (dialog) => await dialog.accept());

  // get current ip address
  const ip = await page.goto('https://checkip.amazonaws.com/', { timeout: 5_000 });
  console.log(`😎 IP Address:`, (await ip.text()).trim());
  // await page.goto('https://api.ipify.org/', { timeout: 5_000 });
  // await page.goto('https://scrapfly.io/web-scraping-tools/http2-fingerprint', { timeout: 5_000 });
  // await page.goto('https://scrapfly.io/web-scraping-tools/ja3-fingerprint', { timeout: 5_000 });
  await setTimeout(2_000);
  const URL = 'https://www.maybank2u.com.my/home/m2u/common/login.do';
  await page.goto(URL, { timeout: 15_000 });
  await page.locator('input#username').pressSequentially(username, { delay: 120 });
  // await page.locator('input#username').fill(username);
  await page.keyboard.press('Tab');
  await setTimeout(2_000);
  await page.keyboard.press('Space');
  // await page.locator('button[class^=LoginUsername---login-button]').click();

}

main();