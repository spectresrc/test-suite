import _ from 'lodash';
import { DateTime } from 'luxon';
// import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as CONFIG from '../../config/index.js';

puppeteer.use(StealthPlugin());

const username = 'sitisitisiti';
const password = 'On$4669668';
const amount = 25;
const recipient = {
  bank: 'maybank',
  account: '107171021537',
};
const sender = {
  account: '4483829319'
};

const bankMappings = {
  cimb: "CIMB BANK BERHAD",
  maybank: "MAYBANK BERHAD",
  publicbank: "PUBLIC BANK/PUBLIC FINANCE BERHAD",
  rhb: "RHB BANK BERHAD",
  bsn: "BANK SIMPANAN NASIONAL BERHAD",
  ambank: "AMBANK/AMFINANCE BERHAD",
  ocbcmy: "OCBC", //OCBC BANK (M) BHD/OCBC AL-AMIN BANK BHD
  affinbank: "AFFIN BANK BERHAD",
  alliancebank: "ALLIANCE BANK MALAYSIA BERHAD"
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

  // set page's viewport
  // await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });

  const version = await browser.version();
  console.log(`😎 Chrome version:`, version);
  console.log(`😎 user_agent:`, CONFIG.puppeteer.user_agent);
  console.log(`😎 CONFIG.puppeteer.option:`, CONFIG.puppeteer.option);

  page.setUserAgent(CONFIG.puppeteer.user_agent);

  page.on("dialog", (dialog) => dialog.accept());

  if (CONFIG.puppeteer.proxy) {
    const [username, password] = CONFIG.puppeteer.proxy.auth.split(':');
    await page.authenticate({ username, password });
    console.log(`😎 PROXY LOGIN authenticated:`, CONFIG.puppeteer.proxy.host, { username, password });
  }

  // get current ip address
  const ip = await page.goto('https://checkip.amazonaws.com/', { waitUntil: ['networkidle0'], timeout: 5_000 });
  console.log(`😎 IP Address:`, (await ip.text()).trim());
  await new Promise(_ => setTimeout(_, 1_000));

  // await page.goto('https://api.ipify.org/', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/http2-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/ja3-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });

  const HONGLEONG_URL = 'https://s.hongleongconnect.my/rib/app/fo/login';
  const HONGLEONG_TRANSFER_URL = 'https://s.hongleongconnect.my/rib/app/fo/trx/3rdpartytrsf';

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "userAgentData", {
      get: () => ({ brands: [{ brand: "Google Chrome", version: "134" }] })
    });
  });
  await page.goto(HONGLEONG_URL, { waitUntil: 'networkidle0' });
  
  try {
    await page.waitForSelector('a.simplemodal-close', { visible: true, timeout: 3_000 });
    await page.click('a.simplemodal-close');
    console.log('🔆 Popup detected');
  } catch (error) {
    console.log('🔆 No popup detected');
  }

  await page.waitForSelector('#idLoginIdForm', { visible: true, timeout: 3_000 });

  await page.type('#idLoginId', username);
  await page.click('#idBtnSubmit1');

  await page.waitForSelector('.access-loginbox-securepic', { visible: true, timeout: 3_000 });
  await page.evaluate(() => checkConfirmPicText());
  await page.type('#idPswd', password);
  await new Promise(_ => setTimeout(_, 1_000));
  await page.click('#idBtnSubmit2');

  // await page.evaluate(username => { login(username); }, username);
}

main();