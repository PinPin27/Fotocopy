import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // process.cwd() dijamin aman buat Windows!
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR === 'true' ? false : {
      port: Number(process.env.HMR_PORT || 24679),
    },
  },
});
