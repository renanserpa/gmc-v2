
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  children?: ReactNode;
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

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Maestro Kernel Panic]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="bg-red-500/10 p-6 rounded-[40px] border border-red-500/20 mb-8 animate-pulse">
            <AlertTriangle size={64} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
            O Maestro <span className="text-red-500">Desafinou</span>
          </h1>
          <p className="text-slate-500 max-w-md mb-8 text-sm">
            Uma falha crítica foi capturada no kernel da aplicação. A integridade dos dados foi preservada.
          </p>
          
          <div className="w-full max-w-xl bg-black border border-white/5 rounded-3xl p-6 text-left mb-8 overflow-hidden">
             <div className="flex items-center gap-2 text-red-400 mb-2 font-mono text-[10px] uppercase font-black">
                <Terminal size={14} /> Log de Falha
             </div>
             <code className="text-slate-400 text-xs font-mono block break-words">
                {this.state.error?.message || "Erro de integridade modular."}
             </code>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 bg-white text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-white/5"
          >
            <RefreshCw size={18} /> Reiniciar Orquestra
          </button>
        </div>
      );
    }

    // Fix: Accessing children from props using a cast to any to resolve property visibility issues in this environment
    return (this as any).props.children;
  }
}

export default ErrorBoundary;
