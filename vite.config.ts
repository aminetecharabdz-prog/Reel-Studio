import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { BRAND } from './src/brand/config';
import { logoSvg } from './src/brand/logo';

const brandHtml = (): Plugin => ({
  name: 'brand-html',
  transformIndexHtml(html) {
    return html
      .replaceAll('%BRAND_TITLE%', `${BRAND.nameAr} · ${BRAND.name} — ${BRAND.taglineAr}`)
      .replaceAll('%BRAND_DESC%', BRAND.descriptionAr)
      .replaceAll('%BRAND_BG%', BRAND.colors.night)
      .replaceAll('%BRAND_ICON%', `data:image/svg+xml,${encodeURIComponent(logoSvg({ size: 64, tile: true }))}`);
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'icon.svg', source: logoSvg({ size: 512, tile: true }) });
    this.emitFile({
      type: 'asset',
      fileName: 'manifest.webmanifest',
      source: JSON.stringify({
        name: `${BRAND.nameAr} · ${BRAND.name}`,
        short_name: BRAND.nameAr,
        description: BRAND.descriptionAr,
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

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), brandHtml()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { target: 'es2022', chunkSizeWarningLimit: 8000, sourcemap: false },
});
