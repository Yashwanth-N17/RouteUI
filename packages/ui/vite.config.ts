import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/__routeui': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy API endpoints to the target Express backend during Vite dev mode
      '^/(?!src|@|node_modules|assets|favicon.ico|index.html).*': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        bypass(req) {
          // If browser is opening the root HTML page directly, don't proxy
          if (req.headers.accept?.includes('text/html') && (req.url === '/' || req.url === '/index.html')) {
            return '/index.html';
          }
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      // keep the entry point name stable for inline script
      input: 'index.html'
    }
  }
});
