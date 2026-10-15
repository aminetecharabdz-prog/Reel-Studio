// node scripts/gen-library.mjs — writes src/engine/library.ts from public/art/{obj,bg}
import { readdirSync, writeFileSync } from 'node:fs';
const list = (d) => readdirSync(`public/art/${d}`).filter((f) => f.endsWith('.webp')).map((f) => `${d}/${f.replace('.webp', '')}`).sort();
const all = [...list('obj'), ...list('bg')];
writeFileSync('src/engine/library.ts', `/** Bundled openly licensed photos (credits: public/art/photo/credits.json). obj/* are cut-outs, bg/* are 9:16 backgrounds. */
export const LIBRARY_LIST = ${JSON.stringify(all)} as const;
export const LIBRARY = new Set<string>(LIBRARY_LIST);
`);
console.log(all.length);
