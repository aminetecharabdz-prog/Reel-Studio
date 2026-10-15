// node scripts/contact-sheet.mjs <demo> [out.png] [per] — needs `vite preview` on :4173
import { chromium } from '@playwright/test';
const [demo = 'content', out = `.qa/${demo}.png`, per = '3', extra = ''] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
p.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto(`http://localhost:4173/#/qa?demo=${demo}&per=${per}${extra}`);
await p.waitForSelector('[data-qa-ready="1"]', { timeout: 60000 });
await p.waitForTimeout(2500);
await p.locator('[data-qa-ready]').screenshot({ path: out });
await b.close();
console.log('wrote', out);
