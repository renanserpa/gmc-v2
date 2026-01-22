import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Configuração OlieMusic GCM Maestro
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Points '@' to the project root, which is conceptually the 'src' directory.
      // FIX: Replace `__dirname` with `.` to resolve to the current working directory and avoid TypeScript errors.
      '@': path.resolve('./'),
    },
    // Garante a priorização de arquivos TypeScript e React na resolução de módulos
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mjs'],
  },
  server: {
    host: true,
    port: 3000,
    hmr: {
      overlay: true
    }
  },
  // Otimização de dependências críticas para o tempo de execução
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion', 
      'lucide-react', 
      '@supabase/supabase-js'
    ]
  }
});