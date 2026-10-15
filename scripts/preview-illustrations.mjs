// Preview the vector illustrations without a build: node scripts/preview-illustrations.mjs out.html
// (Node ≥ 22.18 strips TypeScript types natively.) Then screenshot the HTML with any Chromium.
import { writeFileSync } from 'node:fs';
const { ILLUSTRATIONS } = await import('../src/video/illustrations/index.ts');

const cases = [
  ['tooth-cross', { highlight: 'none' }], ['tooth-cross', { highlight: 'crack' }], ['tooth-cross', { highlight: 'cold' }], ['tooth-cross', { highlight: 'cavity' }],
  ['teeth-row', { plaque: true }], ['teeth-row', { plaque: true, floss: true }], ['teeth-row', { clean: true }], ['teeth-row', { bad: 2 }],
  ['engine-cylinder', { stroke: 1 }], ['engine-cylinder', { stroke: 2 }], ['engine-cylinder', { stroke: 3 }], ['engine-cylinder', { stroke: 4 }],
  ['car-dash', { phone: 'mounted' }], ['car-dash', { phone: 'falling', bumpy: true }], ['car-dash', { phone: 'rotate' }], ['gauge-dial', { value: 3, max: 8 }],
];
const times = (process.env.TIMES ?? '0.6,1.4').split(',').map(Number);
const c = { primary: '#1E6FD9', accent: '#FFB020', text: '#0B1B2E', bg: '#EAF3FF', good: '#15803D', bad: '#C62828' };
let html = '<html><body style="margin:0;background:#2b3442;font-family:sans-serif"><div style="display:grid;grid-template-columns:repeat(8,250px);gap:6px;padding:6px">';
let k = 0;
for (const [id, p] of cases) {
  for (const t of times) {
    const svg = ILLUSTRATIONS[id].fn({ f: Math.round(t * 30), fps: 30, dur: 90, uid: `u${k++}`, c, p });
    html += `<div style="background:#eaf3ff;color:#000;font-size:11px"><svg viewBox="0 0 1000 1000" width="250" height="250">${svg}</svg>${id} ${JSON.stringify(p)} t=${t}</div>`;
  }
}
html += '</div></body></html>';
writeFileSync(process.argv[2] ?? 'illus.html', html);
