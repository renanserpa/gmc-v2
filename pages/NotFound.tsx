
import React from 'react';
// FIX: Using any to bypass react-router-dom export errors
import * as RRD from 'react-router-dom';
const { Link } = RRD as any;
import { Compass, Home, MoveLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

export default function NotFound() {
  const { role } = useAuth();
  
  // Determines where to send the user back based on their role
  const backLink = role ? `/${role}` : '/';
  const backLabel = role ? 'Voltar ao Painel' : 'Voltar ao Início';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <M.div
        initial={{ opacity: 0, scale: 0.8 } as any}
        animate={{ opacity: 1, scale: 1 } as any}
        transition={{ duration: 0.5 }}
      >
        <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
            <Compass size={120} className="text-slate-700 relative z-10 animate-[spin_10s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-white z-20">
                404
            </div>
        </div>
      </M.div>

      <M.h1 
        initial={{ opacity: 0, y: 20 } as any}
        animate={{ opacity: 1, y: 0 } as any}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-white mb-4"
      >
        Perdido no Compasso?
      </M.h1>
      
      <M.p 
        initial={{ opacity: 0, y: 20 } as any}
        animate={{ opacity: 1, y: 0 } as any}
        transition={{ delay: 0.3 }}
        className="text-slate-400 max-w-md mx-auto mb-8 text-lg"
      >
        A página que você procura desafinou e não pode ser encontrada. Vamos voltar para o ritmo certo.
      </M.p>

      <M.div
        initial={{ opacity: 0, y: 20 } as any}
        animate={{ opacity: 1, y: 0 } as any}
        transition={{ delay: 0.4 }}
      >
        <Link 
            to={backLink} 
            className="group flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-sky-900/40 focus:outline-none focus:ring-4 focus:ring-sky-500/30"
        >
            <MoveLeft className="group-hover:-translate-x-1 transition-transform" /> {backLabel}
        </Link>
      </M.div>
    </div>
  );
}
