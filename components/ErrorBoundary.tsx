import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
    this.props = props;
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("[ErrorBoundary] Falha capturada:", error, errorInfo);
  }

  render() {
    const { children } = this.props;
    const { hasError, error } = this.state;
    
    if (hasError) {
      // Formata a mensagem de erro de forma amigável
      let errorStr = "Erro desconhecido";
      if (error instanceof Error) {
        errorStr = error.message;
      } else if (typeof error === 'string') {
        errorStr = error;
      } else {
        try {
          errorStr = JSON.stringify(error, null, 2);
        } catch (e) {
          errorStr = String(error);
        }
      }
      
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20 animate-pulse">
            <AlertTriangle size={64} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">O Maestro Desafinou!</h1>
          <p className="text-slate-400 max-w-md mb-8 text-sm">
            Ocorreu um erro inesperado ao carregar os módulos da sinfonia. Tente reiniciar a aplicação.
          </p>
          
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 mb-8 text-left w-full max-w-md overflow-auto max-h-40 shadow-inner">
            <code className="text-xs text-red-400 font-mono whitespace-pre-wrap break-all">
                {errorStr}
            </code>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-lg"
          >
            <RefreshCw size={20} /> Reiniciar Aplicação
          </button>
        </div>
      );
    }

    return children;
  }
}