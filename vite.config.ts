import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // GitHub Pages subfolder deploy (NorbApp /apps/cashhub-app/)
    base: '/apps/cashhub-app/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    // FONTOS: build környezetben lehet, hogy nincs GEMINI_API_KEY → legyen üres string, ne dőljön el
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
