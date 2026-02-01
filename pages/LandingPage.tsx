import React, { useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { Header } from '../components/landing/Header.tsx';
import { Hero } from '../components/landing/Hero.tsx';
import { Methodology } from '../components/landing/Methodology.tsx';
import { ProductGrid } from '../components/landing/ProductGrid.tsx';
import { GCMPreview } from '../components/landing/GCMPreview.tsx';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

export default function LandingPage() {
  usePageTitle("Música leve e divertida");
  const { user, role, getDashboardPath, loading } = useAuth();
  const navigate = useNavigate();

  // Auto-Redirect: Se o usuário já está logado, pula a Landing Page
  useEffect(() => {
    if (!loading && user && role) {
      navigate(getDashboardPath(role), { replace: true });
    }
  }, [user, role, loading, navigate, getDashboardPath]);

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-sky-500/30 font-sans">
      <Header />
      
      <main>
        <Hero />
        <Methodology />
        <ProductGrid />
        <GCMPreview />
      </main>

      <footer className="py-32 px-6 border-t border-white/5 bg-slate-950/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-6">
                <h3 className="font-black text-2xl text-white italic uppercase tracking-tighter">Olie<span className="text-sky-500">Music</span></h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">Revolucionando o ensino musical através da fusão entre ludicidade clássica e tecnologia futurista.</p>
            </div>
            <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Navegação</h4>
                <ul className="space-y-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <li><a href="#metodologia" className="hover:text-sky-400">Metodologia</a></li>
                    <li><a href="#loja" className="hover:text-sky-400">Produtos</a></li>
                    <li><a href="#gcm" className="hover:text-sky-400">GCM Maestro</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Suporte</h4>
                <ul className="space-y-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <li><a href="#" className="hover:text-sky-400">Termos de Uso</a></li>
                    <li><a href="#" className="hover:text-sky-400">Privacidade</a></li>
                    <li><a href="#" className="hover:text-sky-400">Contato</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Newsletter</h4>
                <div className="flex bg-slate-900 rounded-xl p-1 border border-white/10">
                    <input type="email" placeholder="Seu e-mail" className="bg-transparent border-none outline-none text-xs px-4 w-full text-white" />
                    <button className="bg-sky-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Ok</button>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">© 2024 Olie Music Group - All Rights Reserved • Built by AtlasIA Maestro Core</p>
        </div>
      </footer>
    </div>
  );
}