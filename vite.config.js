import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // reescreve o caminho, se necessário:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
});