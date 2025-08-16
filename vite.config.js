// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em DEV, o front vai proxiar /api para o Node local (http://127.0.0.1:3000)
// Em PROD, você usa VITE_BACKEND_URL+VITE_API_PREFIX no build.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
  },
});
