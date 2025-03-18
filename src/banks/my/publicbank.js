import _ from 'lodash';
import { DateTime } from 'luxon';
import puppeteer from 'puppeteer';
import * as CONFIG from '../../config/index.js';

const username = 'hgun77';
const password = 'On$4669668';
const recipient = {
  bank: 'maybank',
  account: '107171021537',
};
const sender = {
  account: '4483829319'
};

const bankMappings = {
  cimb: "501855",
  maybank: "588734",
  hongleongbank: "588830",
  rhb: "564160",
  bsn: "420709",
  ambank: "564169",
  ocbcmy: "504324",
  affinbank: "501664",
  alliancebank: "504374"
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

  const PUBLICBANK_URL = 'https://www2.pbebank.com/pbemain.html';
  const PUBLICBANK_LOGIN_URL = 'https://www2.pbebank.com/eaijct/Public_Bank/user_cnpy';

  await page.goto(PUBLICBANK_URL, { waitUntil: 'networkidle0' });
  await page.goto(PUBLICBANK_LOGIN_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#NextBtn', { timeout: 5_000 });
  await page.type('input[name=tempusername]', username);
  await page.click('#NextBtn');

  // await page.waitForSelector("#phrase_image");
  await page.waitForSelector('input[type="radio"][name="passcred"]', { timeout: 5_000 });

  // await page.evaluate(() => clickLabelAndChange('YES'));
  await page.click('input[type="radio"][name="passcred"][value="YES"]');

  await page.type('input[name=password]', password);
  await page.click('#SubmitBtn');

  await new Promise(_ => setTimeout(_, 1_000));

  try {
    await page.waitForSelector('#DuplicateLoginDialog', { timeout: 3_000 });
    console.log('Duplicate Login Dialog Found');
    await page.goto('https://www2.pbebank.com/myIBK/apppbb/servlet/BxxxServlet?RDOName=BxxxAuth&MethodName=duplicateLogin');

  } catch (error) {
    console.log('No Duplicate Login Dialog');
  };

  // javascript:location.href='https://www2.pbebank.com/myIBK/apppbb/servlet/BxxxServlet?RDOName=BxxxAuth&MethodName=duplicateLogin'
  // https://www2.pbebank.com/myIBK/apppbb/servlet/BxxxServlet?RDOName=BxxxAuth&MethodName=duplicateLogin

  await new Promise(_ => setTimeout(_, 5_000));

  {
    console.log('🔆 Click on Account');
    // last resort to use page.evaluate
    await page.evaluate(() => document.querySelectorAll('.tiles a')[0].click());
  }

  await new Promise(_ => setTimeout(_, 1_000));

  {
    console.log('🔆 Click on Fund Transfer');
    await page.waitForSelector('.top-menu a:nth-child(3)', { timeout: 5_000 });
    await page.click('.top-menu a:nth-child(3)');
  }

  await new Promise(_ => setTimeout(_, 1_000));

  {
    console.log('🔆 Click on Other Bank Account');
    await page.waitForSelector('ul.page-sidebar-menu>li', { timeout: 2_000 });
    await page.evaluate(() => {
      const exp = "//a[.//span[@class='title' and normalize-space()='Other Bank Account']]";
      const query = document.evaluate(exp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      if (query.singleNodeValue) { query.singleNodeValue.click() };
    });
  }

  await new Promise(_ => setTimeout(_, 1_000));

  {
    console.log('🔆 Click on DuitNow Transfer');
    await page.waitForSelector('ul.page-sidebar-menu>li', { timeout: 2_000 });
    await page.evaluate(() => {
      const exp = "//a[.//span[@class='title' and normalize-space()='DuitNow Transfer']]";
      const query = document.evaluate(exp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      if (query.singleNodeValue) { query.singleNodeValue.click() };
    });
  }

  await new Promise(_ => setTimeout(_, 1_000));

  {
    console.log('🔆 Click on To Other Account');
    await page.waitForSelector('ul.page-sidebar-menu>li', { timeout: 2_000 });
    await page.evaluate(() => {
      const exp = "//li[@class='open']//ul[@class='sub-menu']//a[normalize-space()='To Other Account']";
      const query = document.evaluate(exp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      if (query.singleNodeValue) { query.singleNodeValue.click() };
    });
  }

  await page.waitForSelector('.page-container', { timeout: 2_000 });

  await page.select('select[name=FROM_ACC_NO]', `${sender.account}`);
  await page.select('select[name=TO_BANK_NBR]', bankMappings[recipient.bank]);

  await new Promise(_ => setTimeout(_, 3_000));

  await page.type('input[name=BENE_ACC_NO]', recipient.account);
  await page.select('select[name=PAYMENT_TYPE]', "00");

  await page.type('input[name=RECIPIENT_REFERENCE]', 'remark');
  await page.type('input[name=TRANSACTION_AMT]', '30');

  await page.click('#DuitNowTC');

  await page.click('#submitBtn');

  try {
    await page.waitForSelector('#transferAlert', { visible: true, timeout: 3_000 })
    await page.click('button[name="reject"]');
    console.log('🔆 Transfer Alert Found');
  } catch (error) {
  
  }

// <button type="button" class="btn red" id="next2" name="next2" onclick="confirm2FAPN();return false" data-role="none">Confirm</button>
}

main();