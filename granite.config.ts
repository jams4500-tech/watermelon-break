import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'watermelon-break',
  brand: {
    displayName: '수박 깨기',
    primaryColor: '#2e7d32',
    icon: 'https://static.toss.im/appsintoss/30705/1e023176-068e-42b8-811c-91bb763ab1fd.png',
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
