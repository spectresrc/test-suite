import _ from 'lodash';
import { DateTime } from 'luxon';
import { setTimeout } from "node:timers/promises";
// import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import * as CONFIG from '../../config/index.js';

const bankMappings = {
  maybank: "027",
  hongleongbank: "024",
  publicbank: "033",
  rhb: "018",
  bsn: "010",
  ambank: "008",
  ocbcmy: "029",
  affinbank: "032",
  alliancebank: "012"
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

  const username = '';
  const password = '';
  const recipient = {
    bank: 'rhb',
    account: '21212500188157',
  };
  const sender = {
    account: '8011304070'
  };


  await page.waitForSelector('input#user-id');
  await page.type('input#user-id', username, { delay: 20 });

  // await setTimeout(1_000);

  try {
    const selector = '#modal-action > div > div > div:nth-child(2) > a';
    await page.waitForSelector(selector, { visible: true, timeout: 2_000 });
    await page.click(selector);
    console.log(`🎠 page.click:`, selector);
  } catch (error) {
    console.log(`🎠 selector not found:`, '#modal-action');
  }

  try {
    const selector = '.googleCapthaCls';
    await page.waitForSelector(selector, { visible: true, timeout: 2_000 });
    await page.click(selector);
    console.log(`🎠 page.click:`, selector);
  } catch (error) {
    console.log(`🎠 selector not found:`, '.googleCapthaCls');
  }

  await page.waitForSelector('#load-account-id', { visible: true, timeout: 5_000 });
  let checkbox = await page.$$('#loginCheckBox');
  await checkbox[0].evaluate((e) => e.click());

  await page.waitForSelector('input#password', { visible: true, timeout: 5_000 });
  await page.type('input#password', password, { delay: 20 });

  await page.click('.btn-login');

  try {
    let popupClick = await page.waitForSelector('.modal a.secondary-link', { visible: true, timeout: 5_000 });
    popupClick.click();
  } catch (error) {
    console.log(`🎠 selector not found:`, '.modal a.secondary-link');
  }

  await page.waitForSelector(".menu-item-inner", { visible: true, timeout: 5_000 });

  try {
    let tnc_Click = await page.waitForSelector('button.btn.btn-primary.pull-right', { visible: true, timeout: 2_000 });
    tnc_Click.click();
  } catch (error) {
    console.log(`🎠 selector not found:`, 'button.btn.btn-primary.pull-right');
  }

  await page.waitForSelector('.preloader', { hidden: true });

  console.log(`🎠 Yeah! Login completed, next to Transfer page`);

  // Transfer Page
  await page.evaluate(() => {
    document.querySelector('.menu-item-inner > .pay-transfer a').click();
    document.querySelector('.pay-sub-menu .multi-column li:nth-child(1) a.sub-menu-link').click();
  });

  await page.waitForResponse(`${CIMB_API_URL}/transaction/debiting-account/f-sendMoney`);

  await page.waitForSelector("input.android-fixes");
  await page.focus("input.android-fixes");
  await page.waitForSelector('.jasper_found_select2opt_container_ui');
  await page.type("input.android-fixes", recipient.account, { delay: 20 });
  console.log(`🎠 Entered recipient bank account:`, recipient.account);

  await setTimeout(3_000);
  await page.waitForSelector(".send-money-account", { visible: true, timeout: 5_000 });
  await page.click(".send-money-account");

  await setTimeout(3_000);

  // INTERBANK
  const type = await page.$('.col-recipient select');
  if (type !== null) {
    await page.select('.col-recipient select', 'Local');
  }

  await page.select('select[name=bank-name]', bankMappings[recipient.bank]);
  console.log(`🎠 Select recipient type:`, bankMappings[recipient.bank]);

  // CIMB has 2 input types of instant transfer (dropdown and radio),
  // depending on if bank account is a favourite
  const inbt = await page.$$('input[name=transfer-method]');
  await setTimeout(3_000);

  console.log(`🎠 input[name=transfer-method]:`, inbt.length);
  if (inbt.length == 2) {
    await page.evaluate(() => document.querySelectorAll('input[name=transfer-method]')[0].click());
  } else {
    await page.select('select[name=transfer-method]', 'IBFT');
  }

  await setTimeout(3_000);
  await page.click('#select2-payment-type-container + .select2-selection__arrow');
  await page.waitForSelector('#select2-payment-type-results li', { visible: true });
  await page.click('#select2-payment-type-results > li:nth-child(1)');
  await page.evaluate(() => { 
    const select = document.querySelector('select[name=transaction-type]');
    select.value = 'FT';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('input', { bubbles: true }));
    document.activeElement.blur(); 
  });

  // await setTimeout(3_000);
  // await page.select('select[name=transaction-type]', 'FT');
  // console.log(`🎠 select[name=transaction-type]:`, 'FT');

  await page.click('#select2-select2optgroup-container + .select2-selection__arrow');
  await page.waitForSelector('#select2-select2optgroup-results .select2-results__item');
  const fromAccounts = await page.$$('#select2-select2optgroup-results .select2-results__item');

  for (let i = 0; i < fromAccounts.length; i++) {
    const elem = await fromAccounts[i].$eval('span', div => div.innerText);
    console.log(`🎠 fromAccounts(${i}):`, elem);
    if (true || elem.includes(sender.account)) {
      await fromAccounts[i].click();         
      break;
    }
  };
  await setTimeout(3_000);
  await page.evaluate(() => { document.activeElement.blur(); });   

  await page.select('select[name=from-account-select]', sender.account);
  console.log(`🎠 select[name=from-account-select]:`, sender.account);

  await page.type('input[name="amount"]', '1.00', { delay: 20 });
  const remark = await page.$('textarea[id="recipient-reference-extended-length-textarea"]');
  if (remark !== null) {
    await page.type('textarea[id="recipient-reference-extended-length-textarea"]', 'Fund Transfer', { delay: 20 });
  } else {
    await page.type('input[name="rep-refer"]', 'Fund Transfer', { delay: 20 });
  }

  const disabled = await page.$eval("button.scroll", button => button.disabled);
  console.log(`🎠 disabled:`, disabled);
}

main();