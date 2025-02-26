import _ from 'lodash';
import { DateTime } from 'luxon';
import { setTimeout } from "node:timers/promises";
// import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import * as CONFIG from './config/index.js';

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
  // console.log(`😎 CONFIG.puppeteer.option:`, CONFIG.puppeteer.option);

  page.setUserAgent(CONFIG.puppeteer.user_agent);
  // await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });

  if (CONFIG.puppeteer.proxy) {
    const [username, password] = CONFIG.puppeteer.proxy.auth.split(':');
    await page.authenticate({ username, password });
    console.log(`😎 PROXY LOGIN authenticated:`, CONFIG.puppeteer.proxy.host, { username, password });
  }

  // get current ip address
  const ip = await page.goto('https://checkip.amazonaws.com/', { waitUntil: ['networkidle0'], timeout: 5_000 });
  console.log(`😎 IP Address:`, (await ip.text()).trim());

  // await setTimeout(5_000);

  // await page.goto('https://api.ipify.org/', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/http2-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/ja3-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });

  const CIMB_URL = 'https://www.cimbclicks.com.my/clicks/#/';
  const CIMB_API_URL = 'https://www.cimbclicks.com.my/api/v1';

  await page.goto(CIMB_URL, { waitUntil: ['networkidle0'], timeout: 995_000 });
  await page.waitForSelector('cimb-app', { timeout: 5_000 });

  // await setTimeout(1_000);

  const username = 'username';
  const password = 'password';
  await page.waitForSelector('input#user-id');
  await page.type('input#user-id', username, { delay: 20 });

  // await setTimeout(1_000);

  try {
    const selector = '#modal-action > div > div > div:nth-child(2) > a';
    await page.waitForSelector(selector, { visible: true, timeout: 2_000 });
    await page.click(selector);
    console.log(`🎠 page.click:`, selector);
  } catch (error) {
    console.log(`🎠 selector not found`, '#modal-action');
  }

  try {
    const selector = '.googleCapthaCls';
    await page.waitForSelector(selector, { visible: true, timeout: 2_000 });
    await page.click(selector);
    console.log(`🎠 page.click:`, selector);
  } catch (error) {
    console.log(`🎠 selector not found`, '.googleCapthaCls');
  }

  await page.waitForSelector('#load-account-id', { visible: true, timeout: 5_000 });
  let checkbox = await page.$$('#loginCheckBox');
  await checkbox[0].evaluate((e) => e.click());

  await page.waitForSelector('input#password', { visible: true, timeout: 5_000 });
  await page.type('input#password', password, { delay: 20 });

  // Transfer Page
  await page.evaluate(() => {
    document.querySelector('.menu-item-inner > .pay-transfer a').click();
    document.querySelector('.pay-sub-menu .multi-column li:nth-child(1) a.sub-menu-link').click();
  });

  await page.waitForResponse(`${CIMB_API_URL}/transaction/debiting-account/f-sendMoney`);

  await page.waitForSelector("input.android-fixes");
  await page.focus("input.android-fixes");
  await page.waitForSelector('.jasper_found_select2opt_container_ui');
  await page.type("input.android-fixes", data.recipientAccount);

  await setTimeout(2_000);
  await page.waitForSelector(".send-money-account", { visible: true });
  await page.click(".send-money-account");

  await setTimeout(2_000);
  const type = await page.$('.col-recipient select');

  // INTERBANK
  if (type !== null) await page.select('.col-recipient select', 'Local');

  await page.select('select[name=bank-name]', bankMappings[data.interbank]);

  //CIMB has 2 input types of instant transfer (dropdown and radio),
  //depending on if bank account is a favourite
  const inbt = await page.$$('input[name=transfer-method]');
  if (inbt.length == 2) {
    await page.evaluate(() => document.querySelectorAll('input[name=transfer-method]')[0].click());
  }
  else await page.select('select[name=transfer-method]', 'IBFT');

  await page.waitForTimeout(2000);
  await page.click('#select2-payment-type-container + .select2-selection__arrow');
  await page.waitForSelector('#select2-payment-type-results li', { visible: true });
  await page.click('#select2-payment-type-results > li:nth-child(1)');

  try {
    if (await page.$('select[name=transaction-type]') !== null) {
      await page.select('select[name=transaction-type]', 'FT');
      logger.log(data.hash, 'DEBUG', 'CIMB.tac', 'transaction-type', 'FT');
    }
  } catch (error) {
    logger.log(data.hash, 'DEBUG', 'CIMB.tac', 'transaction-type', error.message);
  }
}

main();