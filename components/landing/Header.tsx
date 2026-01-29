import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.tsx';
import { Music, LayoutDashboard } from 'lucide-react';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] p-4">
      <nav className="max-w-7xl mx-auto bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-[32px] px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Music className="text-white" size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">Olie<span className="text-sky-400">Music</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#metodologia" className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Metodologia</a>
          <a href="#loja" className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Loja</a>
          <a href="#gcm" className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">GCM Maestro</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/app">
            <Button variant="primary" className="rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest" leftIcon={LayoutDashboard}>
              Portal Maestro
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};