
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kernel Panic captured:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/20 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-50" />
            
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Kernel Panic</h1>
            
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              O ecossistema Maestro encontrou uma instabilidade crítica na rede neural. O rastro do erro foi registrado para análise de soberania.
            </p>
            
            <div className="bg-black/40 rounded-2xl p-4 mb-8 text-left border border-white/5">
                <p className="text-[10px] font-mono text-red-400/80 break-all line-clamp-3">
                    {this.state.error?.message || 'Erro de segmentação desconhecido'}
                </p>
            </div>
            
            <Button 
                onClick={() => window.location.reload()} 
                className="w-full py-8 rounded-[24px] bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest shadow-xl shadow-red-950/20"
                leftIcon={RefreshCcw}
            >
                Reiniciar Estúdio
            </Button>
          </div>
        </div>
      );
    }

    // FIX: Explicitly casting this to any to access props.children and bypass environment-specific type resolution issues
    return (this as any).props.children;
  }
}
