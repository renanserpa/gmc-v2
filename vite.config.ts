
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /**
       * Mapeia '@' para a raiz absoluta do projeto (conceitualmente o diretório 'src').
       * Utiliza a API de URL do Node para garantir que o caminho seja absoluto e 
       * resolvido corretamente em qualquer sistema operacional e ambiente ESM.
       */
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
});
