// Dev helper: screenshot pages of the built app at phone size. Usage: node scripts/shot.mjs <hash-path> <out.png> [waitMs]
import { chromium } from '@playwright/test';
const [, , path = '/', out = '.qa/shot.png', wait = '4000'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
const logs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(`http://localhost:4173/#${path}`);
await page.waitForTimeout(Number(wait));
await page.screenshot({ path: out, fullPage: process.env.FULL === '1' });
console.log(logs.slice(0, 20).join('\n'));
await browser.close();
