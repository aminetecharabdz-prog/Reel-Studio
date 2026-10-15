/* global document, innerWidth */
// node scripts/shots.mjs route1 route2 … — mobile screenshots of the local preview into .qa/ui-*.png
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
p.on('pageerror', (e) => console.log('pageerror:', e.message));
for (const r of process.argv.slice(2)) {
  await p.goto(`http://localhost:4173/#${r}`);
  await p.waitForTimeout(3500);
  const name = r.replace(/[^a-z0-9]+/gi, '_') || 'home';
  await p.screenshot({ path: `.qa/ui-${name}.png`, fullPage: process.env.FULL === '1' });
  const ow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(r, 'overflow', ow);
}
await b.close();
