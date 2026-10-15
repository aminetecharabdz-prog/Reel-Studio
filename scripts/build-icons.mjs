// Builds src/generated/icons.json: a small offline subset of Iconify sets with keyword search.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { CONCEPTS } from './icon-concepts.mjs';

const SETS = {
  ph: { file: '@iconify-json/ph/icons.json', suffixes: ['-duotone', '-bold', ''] },
  tabler: { file: '@iconify-json/tabler/icons.json', suffixes: ['', '-filled'] },
  solar: { file: '@iconify-json/solar/icons.json', suffixes: ['-bold-duotone', '-bold', '-linear', ''] },
  'fluent-emoji-flat': { file: '@iconify-json/fluent-emoji-flat/icons.json', suffixes: [''] },
};
const key = { ph: 'ph', tabler: 'tb', solar: 'so', 'fluent-emoji-flat': 'fl' };
const out = { sets: {}, concepts: {} };
const missing = [];
for (const [set, cfg] of Object.entries(SETS)) {
  const json = JSON.parse(readFileSync(new URL(`../node_modules/${cfg.file}`, import.meta.url)));
  const aliases = json.aliases ?? {};
  const resolve = (n) => json.icons[n] ?? (aliases[n] ? json.icons[aliases[n].parent] : undefined);
  out.sets[set] = { width: json.width ?? 24, height: json.height ?? 24, icons: {} };
  for (const [concept, def] of Object.entries(CONCEPTS)) {
    let found = null;
    for (const base of def[key[set]]) {
      for (const suf of cfg.suffixes) {
        const icon = resolve(base + suf);
        if (icon) { found = { name: base + suf, icon }; break; }
      }
      if (found) break;
    }
    if (!found) { missing.push(`${set}:${concept}`); continue; }
    out.sets[set].icons[concept] = { body: found.icon.body, w: found.icon.width, h: found.icon.height };
  }
}
for (const [concept, def] of Object.entries(CONCEPTS)) out.concepts[concept] = def.k.split(/\s+/).filter(Boolean);
mkdirSync(new URL('../src/generated/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/generated/icons.json', import.meta.url), JSON.stringify(out));
console.log(`icons: ${Object.keys(CONCEPTS).length} concepts; missing ${missing.length}: ${missing.join(' ')}`);
