import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./public/pages/index.html', import.meta.url)),
        hugo: fileURLToPath(new URL('./public/pages/portfolio-hugo.html', import.meta.url)),
        vega: fileURLToPath(new URL('./public/pages/portfolio-vega.html', import.meta.url)),
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['crypto']
  }
});
