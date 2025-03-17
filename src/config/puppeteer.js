export const user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

// export const proxy = null;
export const proxy = {
  host: 'http://43.217.54.162:3128',
  auth: 'hunkok:Hk123456',
};
// export const proxy = {
//   host: 'http://gw.dataimpulse.com:823',
//   auth: '479dfc9dbe26dc72315f__cr.my:73ad5849b066f1d8',
// };

export const headless = false; // 'new'
export const args = [
  // '--executablePath=',
  '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
  '--disable-blink-features=AutomationControlled',
];

export const option = {
  executablePath: '/usr/bin/google-chrome',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  timeout: 0,
  protocolTimeout: 0,
  headless,
  args,
  defaultViewport: null,
  ignoreHTTPSErrors: true,
  dumpio: false,
  channel: 'chrome',
  env: {},
};