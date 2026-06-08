import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server.ts'],
  outfile: 'dist/server.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  external: ['vite', '@vitejs/plugin-react', '@tailwindcss/vite', 'express', 'cors', 'jsonwebtoken', 'dotenv', 'better-sqlite3'],
}).catch(() => process.exit(1));
