import path from 'path';
import fs from 'fs-extra';
import { Settings } from 'luxon';

export * as puppeteer from './puppeteer.js';

Settings.defaultZone = "utc";
Settings.throwOnInvalid = true;

const { name, version } = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));

export const env = process.env.ENV ?? 'undefined';
export const luxon_format = 'yyyy-LL-dd HH:mm:ss.SSS';

export { name, version };