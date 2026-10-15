import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { BRAND, logoSvg } from './src/brand';

const brandHtml = (): Plugin => ({
  name: 'brand-html',
  transformIndexHtml(html) {
    return html
      .replaceAll('%BRAND_TITLE%', `${BRAND.name} · ${BRAND.nameAr} — ${BRAND.taglineAr}`)
      .replaceAll('%BRAND_DESC%', BRAND.taglineAr)
      .replaceAll('%BRAND_BG%', BRAND.colors.ink)
      .replaceAll('%BRAND_ICON%', `data:image/svg+xml,${encodeURIComponent(logoSvg({ size: 64 }))}`);
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'icon.svg', source: logoSvg({ size: 512 }) });
    this.emitFile({
      type: 'asset',
      fileName: 'manifest.webmanifest',
      source: JSON.stringify({ name: `${BRAND.name} · ${BRAND.nameAr}`, short_name: BRAND.name, lang: 'ar', dir: 'rtl', start_url: './', display: 'standalone', background_color: BRAND.colors.ink, theme_color: BRAND.colors.ink, icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }),
    });
  },
});

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), brandHtml()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { target: 'es2022', chunkSizeWarningLimit: 8000, sourcemap: false },
});
