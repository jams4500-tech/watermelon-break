import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    hmr: { overlay: false },
  },
  build: {
    outDir: 'dist/web/web',
    rollupOptions: {
      input: { sdk: './sdk-entry.js' },
      output: {
        entryFileNames: 'sdk-bundle.js',
        format: 'iife',
        name: 'AitSdk',
      }
    },
    emptyOutDir: false,
  },
});
