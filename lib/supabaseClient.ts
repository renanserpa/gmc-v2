import { createClient } from '@supabase/supabase-js';
import { config } from '../config.ts';

// Pega as chaves do arquivo de configuração
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

// Validação de segurança para não quebrar a tela branca
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ GCM ALERTA: Chaves de API do Supabase não encontradas no arquivo de configuração. O sistema rodará em modo limitado.');
}

// Criação do cliente exportado com persistência reforçada
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage // Garante uso do localStorage para "Salvar Login"
    }
  }
);
