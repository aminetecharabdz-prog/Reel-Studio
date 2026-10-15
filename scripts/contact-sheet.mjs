// Visual QA contact sheets: node scripts/contact-sheet.mjs [demo] [at-seconds] [aspect]
import { chromium } from '@playwright/test';
const demos = process.argv[2] ? [process.argv[2]] : ['dentist', 'engine', 'phone-holder'];
const at = process.argv[3] ?? '1.0';
const aspect = process.argv[4] ? `&aspect=${process.argv[4]}` : '';
const base = process.env.BASE ?? 'http://localhost:4173/';
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const d of demos) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
  await page.goto(`${base}#/qa?demo=${d}&at=${at}${aspect}`);
  await page.waitForSelector('[data-testid=qa-sheet]', { timeout: 60000 });
  await page.waitForTimeout(4000);
  const metrics = await page.evaluate(() => globalThis.__qaMetrics ?? null);
  if (metrics) console.log(`metrics ${d}@${at}`, JSON.stringify(metrics));
  const out = `.qa/sheet-${d}-${at}${process.argv[4] ? '-' + process.argv[4].replace(':', 'x') : ''}.png`;
  await page.screenshot({ path: out, fullPage: true });
  console.log(out, errs.length ? `errors: ${errs.slice(0, 5).join(' | ')}` : 'ok');
  await page.close();
}
await browser.close();
