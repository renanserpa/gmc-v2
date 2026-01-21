import { config } from '../config';

class Logger {
  private currentLevel: 'debug' | 'info' | 'warn' | 'error';

  constructor() {
    this.currentLevel = 'info';
    try {
      // @ts-ignore
      const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isDev) {
        this.currentLevel = 'debug';
      }
    } catch (e) {
      this.currentLevel = 'info';
    }
  }

  private formatError(error: any): string {
    if (!error) return 'Erro desconhecido';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    
    if (typeof error === 'object') {
      const parts = [];
      if (error.message) parts.push(error.message);
      if (error.code) parts.push(`[Código: ${error.code}]`);
      if (error.details) parts.push(`(Detalhes: ${error.details})`);
      if (error.hint) parts.push(`Sugestão: ${error.hint}`);
      
      if (parts.length > 0) return parts.join(' | ');
      
      try {
        return JSON.stringify(error);
      } catch (e) {
        return 'Objeto de erro não serializável';
      }
    }
    
    return String(error);
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(`%c[${config.app.name}] ℹ️ ${message}`, 'color: #38bdf8', ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[${config.app.name}] ⚠️ ${message}`, ...args);
    }
  }

  error(message: string, error: any, ...args: any[]) {
    if (this.shouldLog('error')) {
      const errorDetail = this.formatError(error);
      console.error(`%c[${config.app.name}] 🚨 ${message}`, 'color: #ef4444; font-weight: bold', '->', errorDetail);
      
      // Auto-Diagnosis para erros comuns de Supabase RLS
      const lowError = errorDetail.toLowerCase();
      if (lowError.includes('permission denied') || lowError.includes('42501') || lowError.includes('policy')) {
        console.group('%c💡 DIAGNÓSTICO MAESTRO: Falha de Permissão (RLS)', 'color: #fbbf24; font-weight: bold');
        console.log("Causa Provável: O usuário não tem permissão para acessar esta linha.");
        console.log("Ação Sugerida: Verifique se o registro na tabela 'students' tem o 'auth_user_id' correto.");
        console.log("Comando SQL de Reparo:");
        console.log("%cALTER TABLE students ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"Allow student access\" ON students FOR SELECT USING (auth.uid() = auth_user_id);", 'font-family: monospace; color: #a78bfa');
        console.groupEnd();
      }
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[${config.app.name}] 🐛 ${message}`, ...args);
    }
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error') {
    const levels: ('debug' | 'info' | 'warn' | 'error')[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.currentLevel);
  }
}

export const logger = new Logger();