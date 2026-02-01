import React from 'react';
import * as RRD from 'react-router-dom';
const { Link } = RRD as any;
import { Button } from '../ui/Button.tsx';
import { Music, LayoutDashboard, Menu, ShoppingCart } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none">
      <nav className="max-w-7xl mx-auto bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-[32px] px-6 md:px-10 py-4 flex items-center justify-between shadow-2xl pointer-events-auto ring-1 ring-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-900/20">
            <Music className="text-white" size={22} />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">
            Olie<span className="text-sky-400">Music</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a href="#metodologia" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-all hover:scale-105">Metodologia</a>
          <a href="#loja" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-all hover:scale-105">Materiais</a>
          <a href="#gcm" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-all hover:scale-105">GCM Maestro</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app" className="hidden sm:block">
            <Button variant="ghost" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest">
              Login
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="primary" className="rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-sky-900/20 border border-white/10" leftIcon={LayoutDashboard}>
              Portal Maestro
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};