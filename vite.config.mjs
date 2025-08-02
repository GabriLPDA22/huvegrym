import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        hugo: fileURLToPath(new URL('./portfolio-hugo.html', import.meta.url)),
        vega: fileURLToPath(new URL('./portfolio-vega.html', import.meta.url)),
      },
    },
  },
});
