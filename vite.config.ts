import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { BRAND } from './src/config/brand';
import { logoSvg } from './src/config/logo';

/** Injects the brand name/colours into index.html so renaming happens in src/config/brand.ts only. */
const brandHtml = (): Plugin => ({
  name: 'brand-html',
  transformIndexHtml(html) {
    const icon = logoSvg({ tile: true, ...BRAND.colors });
    return html
      .replaceAll('%BRAND_TITLE%', `${BRAND.nameAr} · ${BRAND.nameLatin} — ${BRAND.taglineAr}`)
      .replaceAll('%BRAND_DESC%', BRAND.taglineAr)
      .replaceAll('%BRAND_BG%', BRAND.colors.night)
      .replaceAll('%BRAND_ICON%', `data:image/svg+xml,${encodeURIComponent(icon)}`);
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'icon.svg', source: logoSvg({ tile: true, size: 512, ...BRAND.colors }) });
    this.emitFile({
      type: 'asset',
      fileName: 'manifest.webmanifest',
      source: JSON.stringify({
        name: `${BRAND.nameAr} · ${BRAND.nameLatin}`,
        short_name: BRAND.nameLatin,
        lang: 'ar',
        dir: 'rtl',
        start_url: './',
        display: 'standalone',
        background_color: BRAND.colors.night,
        theme_color: BRAND.colors.night,
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      }),
    });
  },
});

// Relative base so the static build works at https://<user>.github.io/<repo>/ and locally.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), brandHtml()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { target: 'es2022', chunkSizeWarningLimit: 6000, sourcemap: false },
  server: { port: 5173 },
});
