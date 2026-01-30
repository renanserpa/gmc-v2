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
       * Configura o alias '@' para o diretório raiz absoluto.
       * Como este projeto segue uma estrutura plana onde o código-fonte reside na raiz,
       * o mapeamento para '.' garante que caminhos como '@/components/...' funcionem
       * tanto no Vite quanto via importmaps nativos.
       */
      '@': path.resolve(__dirname, '.'),
    },
    // Extensões suportadas para resolução automática de módulos
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    strictPort: true,
  }
});