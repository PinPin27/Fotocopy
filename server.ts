import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createHttpServer } from 'node:http';
import pool, { initDB } from './server/db.ts';
import apiRouter from './server/api.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const httpServer = createHttpServer(app);

  app.use(cors());
  app.use(express.json());

  // Jalankan inisialisasi database Supabase
  await initDB();

  // Set up API routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development or Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const { default: react } = await import('@vitejs/plugin-react');
    const { default: tailwindcss } = await import('@tailwindcss/vite');

    const vite = await createViteServer({
      configFile: false,
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), './src'),
        },
      },
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist'); 
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const listen = (port: number) => {
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${port} 🚀`);
    });

    httpServer.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} sudah dipakai, mencoba port ${port + 1}...`);
        httpServer.close(() => listen(port + 1));
        return;
      }

      throw err;
    });
  };

  listen(PORT);
}

startServer();
