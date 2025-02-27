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
}

main();