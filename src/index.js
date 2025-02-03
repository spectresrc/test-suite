import _ from 'lodash';
import { DateTime } from 'luxon';
import { setTimeout } from "node:timers/promises";
import puppeteer from 'puppeteer';
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

  // await page.goto('https://api.ipify.org/', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/http2-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });
  // await page.goto('https://scrapfly.io/web-scraping-tools/ja3-fingerprint', { timeout: 60000, waitUntil: ['networkidle0', 'networkidle2'] });

  const url = 'https://www.maybank2u.com.my/home/m2u/common/login.do';
  await page.goto('https://www.maybank2u.com.my/home/m2u/common/login.do', { waitUntil: ['load'], timeout: 12_000 });
  await page.waitForSelector('button[class^=LoginUsername---login-button]', { visible: true, timeout: 12_000 });

  await page.type('input#username', 'hahaha', { delay: 20 });

  await page.waitForSelector('button[class^=LoginUsername---login-button]', { visible: true, timeout: 12_000 });
  await page.click('button[class^=LoginUsername---login-button]');

  await page.waitForSelector('div[class*=SecurityPhrase---container]', { visible: true, timeout: 12_000 });
  await page.click('div[class*=SecurityPhrase---right-btn-container] > button');

  await page.type('#my-password-input', 'hehehe', { delay: 20 });

}

main();