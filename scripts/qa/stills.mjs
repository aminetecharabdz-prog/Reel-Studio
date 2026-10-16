/* global window, document */
// Render stills of demos / local-planner videos through the QA page, then build contact sheets.
// Usage: node scripts/qa/stills.mjs --url http://localhost:5179/qa.html --out .qa/product --demo product-ad --aspect 9:16 --every 1
//        node scripts/qa/stills.mjs ... --script "..." --style product --name topic3
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? [...a, [x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : '1']] : a), []));
const base = args.url ?? 'http://localhost:5179/qa.html';
const out = args.out ?? '.qa/out';
const aspect = args.aspect ?? '9:16';
const every = Number(args.every ?? 1);
const times = args.times ? args.times.split(',').map(Number) : null;
const name = args.name ?? args.demo ?? 'video';
fs.mkdirSync(out, { recursive: true });

const q = new URLSearchParams({ aspect });
if (args.demo) q.set('demo', args.demo);
for (const k of ['script', 'style', 'topic', 'brand', 'product', 'seed']) if (args[k]) q.set(k, args[k]);

const dims = { '9:16': [1080, 1920], '4:5': [1080, 1350], '1:1': [1080, 1080], '16:9': [1920, 1080] }[aspect];
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: dims[0], height: dims[1] }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`${base}?${q}`);
await page.waitForFunction(() => window.__qa?.ready, null, { timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
const { frames, fps } = await page.evaluate(() => ({ frames: window.__qa.frames, fps: window.__qa.fps }));
const list = times ? times.map((t) => Math.round(t * fps)) : Array.from({ length: Math.floor(frames / (fps * every)) }, (_, i) => Math.round((i * every + every / 2) * fps));
const files = [];
for (const f of list) {
  await page.evaluate((n) => window.__qa.frame(n), Math.min(frames - 1, f));
  await page.waitForTimeout(120);
  const file = path.join(out, `${name}_${aspect.replace(':', 'x')}_${String(f).padStart(5, '0')}.png`);
  await page.locator('#stage').screenshot({ path: file });
  files.push({ file, t: f / fps });
}
const info = await page.evaluate(() => window.__qa.info());
fs.writeFileSync(path.join(out, `${name}_${aspect.replace(':', 'x')}.json`), JSON.stringify({ frames, fps, files, errors, info }, null, 1));
await browser.close();
console.log(JSON.stringify({ frames, fps, n: files.length, errors }));
