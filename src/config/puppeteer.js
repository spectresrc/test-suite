export const user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

export const proxy = null;
// export const proxy = {
//   host: 'http://43.217.54.162:3128',
//   auth: 'hunkok:Hk123456',
// };
// export const proxy = {
//   host: 'http://gw.dataimpulse.com:823',
//   auth: '479dfc9dbe26dc72315f__cr.my:73ad5849b066f1d8',
// };

export const headless = false; // 'new'
export const args = [
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