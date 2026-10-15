import { copyFileSync, writeFileSync, existsSync } from 'node:fs';
if (!existsSync('dist/index.html')) throw new Error('dist/index.html missing');
copyFileSync('dist/index.html', 'dist/404.html');
writeFileSync('dist/.nojekyll', '');
writeFileSync('dist/version.json', JSON.stringify({ builtAt: new Date().toISOString(), sha: process.env.GITHUB_SHA ?? 'local' }));
