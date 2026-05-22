import app from './api/index.js';
import path from 'path';
import express from 'express';

const PORT = 3000;

async function configureServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite middleware in development mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
    console.log('⚡ Running Express with Vite HMR middleware (Development)');
  } else {
    // Serve build directory in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('📦 Serving compiled static bundle (Production)');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Africa Pool & Spa Expo 2026 server running at http://localhost:${PORT}`);
  });
}

configureServer().catch((err) => {
  console.error('Failed to configure and boot the Express + Vite server:', err);
});
