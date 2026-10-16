/* global window */
// Preview (Player thumbnail) vs exported still (@remotion/web-renderer) at the same frames → side-by-side sheet.
// Usage: node scripts/qa/fidelity.mjs --demo product-ad --aspect 9:16 --frames 45,240 --out .qa/fid
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? [...a, [x.slice(2), arr[i + 1]]] : a), []));
const aspect = args.aspect ?? '9:16';
const out = args.out ?? '.qa/fid';
fs.mkdirSync(out, { recursive: true });
const dims = { '9:16': [1080, 1920], '4:5': [1080, 1350], '1:1': [1080, 1080], '16:9': [1920, 1080] }[aspect];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: dims[0], height: dims[1] } });
await p.goto(`${args.url ?? 'http://localhost:5179/qa.html'}?demo=${args.demo}&aspect=${aspect}`);
await p.waitForFunction(() => window.__qa?.ready, null, { timeout: 60000 });
const pairs = [];
for (const f of args.frames.split(',').map(Number)) {
  await p.evaluate((n) => window.__qa.frame(n), f);
  await p.waitForTimeout(150);
  const a = path.join(out, `${args.demo}_${f}_preview.png`);
  await p.locator('#stage').screenshot({ path: a });
  const d = await p.evaluate((n) => window.__qa.still(n), f);
  const e = path.join(out, `${args.demo}_${f}_export.png`);
  fs.writeFileSync(e, Buffer.from(d.split(',')[1], 'base64'));
  pairs.push([a, e]);
}
await b.close();
const py = `
import sys,json
from PIL import Image
pairs=json.loads(sys.argv[1]); H=720
row=[]
for a,e in pairs:
  A=Image.open(a).convert('RGB'); E=Image.open(e).convert('RGB')
  w=int(A.width*H/A.height); row+= [A.resize((w,H)), E.resize((w,H))]
W=sum(i.width+6 for i in row); s=Image.new('RGB',(W,H),(255,0,80)); x=0
for i in row: s.paste(i,(x,0)); x+=i.width+6
s.save(sys.argv[2],quality=85)
`;
execFileSync('python3', ['-c', py, JSON.stringify(pairs), path.join(out, `${args.demo}_${aspect.replace(':', 'x')}_fidelity.jpg`)]);
console.log('ok', pairs.length);
