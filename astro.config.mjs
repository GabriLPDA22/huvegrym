// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://huvegrym.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS crítico inline: elimina peticiones render-blocking (FCP/LCP)
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  // Clases en lugar de atributos data-astro-cid-*: HTML más ligero
  scopedStyleStrategy: 'class',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    responsiveStyles: false,
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'DM Sans',
      cssVariable: '--font-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/dm-sans-latin-wght-normal.woff2'],
            weight: '100 1000',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/instrument-serif-latin-400-normal.woff2'],
            weight: 400,
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/instrument-serif-latin-400-italic.woff2'],
            weight: 400,
            style: 'italic',
          },
        ],
      },
    },
  ],
});
