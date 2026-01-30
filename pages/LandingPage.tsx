
import React, { useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { Link, useNavigate } = RRD as any;
import { Header } from '../components/landing/Header.tsx';
import { Hero } from '../components/landing/Hero.tsx';
import { Card, CardContent } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Zap, Book, Users, Star, ShoppingBag, Terminal } from 'lucide-react';
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
    <div className="min-h-screen bg-[#020617] selection:bg-sky-500/30">
      <Header />
      
      <main>
        <Hero />

        {/* Seção de Metodologia */}
        <section id="metodologia" className="py-32 px-6 bg-slate-950/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">O Método <span className="text-sky-500">Serpa-Híbrido</span></h2>
              <p className="text-slate-500 max-w-xl mx-auto">Uma fusão poderosa das maiores pedagogias mundiais com o engajamento dos games.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Lúdico', desc: 'Aprendizado através do brincar e do movimento (Dalcroze).', icon: Star, color: 'text-amber-400' },
                { title: 'Natural', desc: 'Processo similar à aquisição da fala (Suzuki/Gordon).', icon: Users, color: 'text-sky-400' },
                { title: 'Digital', desc: 'Feedback imediato via IA e gamificação profunda.', icon: Zap, color: 'text-purple-400' }
              ].map((item, i) => (
                <Card key={i} className="bg-slate-900/50 border-white/5 p-10 rounded-[48px] hover:border-sky-500/20 transition-all group">
                  <CardContent className="p-0 space-y-6">
                    <div className={cn("p-4 rounded-2xl bg-slate-950 w-fit group-hover:scale-110 transition-transform", item.color)}>
                      <item.icon size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Loja de Produtos */}
        <section id="loja" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Materiais de <br /><span className="text-purple-500">Excelência</span></h2>
                <p className="text-slate-500 mt-4 max-w-md">Leve a metodologia Olie Music para sua casa com nossos kits físicos e digitais.</p>
              </div>
              <Button variant="outline" className="rounded-2xl" leftIcon={ShoppingBag}>Ver Todos os Produtos</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Produto 1 */}
              <Card className="bg-slate-900 border-white/5 overflow-hidden rounded-[48px] shadow-2xl group">
                <div className="aspect-[16/9] bg-gradient-to-br from-sky-600 to-indigo-900 relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Book className="text-white/20" size={120} />
                   </div>
                   <div className="absolute top-6 right-6 bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Destaque</div>
                </div>
                <CardContent className="p-10 space-y-6">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Apostila Master v1</h3>
                    <p className="text-slate-400 mt-2 italic">O guia completo para iniciar no violão de forma lúdica.</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-2xl font-black text-white">R$ 147,90</span>
                    <Button onClick={() => window.open('https://kiwify.com.br', '_blank')}>Comprar Agora</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Produto 2 */}
              <Card className="bg-slate-900 border-white/5 overflow-hidden rounded-[48px] shadow-2xl group">
                <div className="aspect-[16/9] bg-gradient-to-br from-purple-600 to-pink-900 relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Zap className="text-white/20" size={120} />
                   </div>
                </div>
                <CardContent className="p-10 space-y-6">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Combo de Atividades</h3>
                    <p className="text-slate-400 mt-2 italic">Kits práticos para aulas em grupo e dinâmicas rítmicas.</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-2xl font-black text-white">R$ 97,00</span>
                    <Button onClick={() => window.open('https://kiwify.com.br', '_blank')}>Comprar Agora</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA GCM */}
        <section id="gcm" className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-tr from-sky-600 to-indigo-700 rounded-[64px] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 blur-3xl rounded-full" />
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto border border-white/30">
                <Terminal className="text-white" size={40} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">Software GCM Maestro</h2>
              <p className="text-sky-100 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                Em breve: O cockpit definitivo para professores e alunos de música. Análise neural, gamificação e gestão em um só lugar.
              </p>
              <div className="pt-6">
                <Link to="/login">
                  <Button className="bg-white text-sky-600 hover:bg-sky-50 px-12 py-8 rounded-[32px] font-black uppercase tracking-widest text-lg shadow-xl">
                    Entrar no Beta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">© 2024 Olie Music - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
