
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Define o diretório base absoluto de forma robusta para ambientes ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // O alias '@' mapeia para a raiz do projeto (o diretório 'src' conceitual).
      // Isso permite que o código use imports como '@/components/ui/Card' de forma consistente.
      '@': path.resolve(__dirname, './'),
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
