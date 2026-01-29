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
       * Mapeia '@' para a raiz do projeto.
       * Conforme as diretrizes, a raiz atua como o diretório 'src'.
       */
      '@': path.resolve(__dirname, './'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  }
});