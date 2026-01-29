import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /**
       * Mapeia '@' para a raiz atual no Google AI Studio.
       * Suporta legados enquanto priorizamos caminhos relativos no código.
       */
      '@': path.resolve(__dirname, './'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  // Garante que o servidor de dev entenda a raiz como base
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});