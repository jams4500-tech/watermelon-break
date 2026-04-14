import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'watermelon-break',
  brand: {
    displayName: '수박 깨기',
    primaryColor: '#2e7d32',
    icon: 'https://watermelon-break.web.app/icon.svg',
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'vercel dev',
      build: 'npm run build',
    },
  },
  permissions: [],
  outdir: 'dist/web/web/web',
  webViewProps: {
    type: 'partner',
  },
});
