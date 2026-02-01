import React from 'react';
import { Card, CardContent } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { ShoppingBag, Star, ArrowUpRight, Zap, Book, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';

const M = motion as any;

const PRODUCTS = [
    {
        id: 'apostila-master',
        title: 'Apostila Master v1',
        tag: 'Essencial',
        desc: 'O guia definitivo para os primeiros passos rítmicos e melódicos. Ilustrada e 100% prática.',
        price: '147,90',
        color: 'from-sky-600 to-indigo-900',
        icon: Book,
        checkout: 'https://kiwify.com.br',
        features: ['Teoria Lúdica', 'Exercícios Coloridos', 'Acesso ao App Base']
    },
    {
        id: 'combo-atividades',
        title: 'Combo de Atividades',
        tag: 'Sazonal',
        desc: 'Kits de rítmica, jogos de memória auditiva e dinâmicas sensoriais para pais e professores.',
        price: '97,00',
        color: 'from-purple-600 to-pink-900',
        icon: Zap,
        checkout: 'https://kiwify.com.br',
        features: ['Material Imprimível', 'Vídeo-Aulas de Apoio', 'Sugestões Suzuki']
    }
];

export const ProductGrid = () => {
    return (
        <section id="loja" className="py-40 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
                    <div className="space-y-6">
                        <M.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-[11px] font-black text-purple-500 uppercase tracking-[0.5em]"
                        >
                            Olie Music Shop
                        </M.span>
                        <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none italic">
                            Materiais de <br /> <span className="text-purple-500 font-black">Prática</span>
                        </h2>
                    </div>
                    <Button variant="outline" className="rounded-3xl h-16 px-10 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5 shadow-2xl" leftIcon={ShoppingBag}>
                        Ver Catálogo Completo
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {PRODUCTS.map((product, idx) => (
                        <M.div
                            key={product.id}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="bg-slate-900/40 border-white/5 overflow-hidden rounded-[80px] shadow-2xl group transition-all hover:border-purple-500/40 hover:bg-slate-900/80 duration-500">
                                <div className={cn("aspect-[16/10] relative overflow-hidden bg-gradient-to-br", product.color)}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <product.icon className="text-white/10 group-hover:scale-125 transition-transform duration-1000" size={240} />
                                    </div>
                                    <div className="absolute top-12 left-12 bg-white/20 backdrop-blur-xl border border-white/20 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl">
                                        {product.tag}
                                    </div>
                                </div>
                                <CardContent className="p-16 space-y-10">
                                    <div className="space-y-6">
                                        <h3 className="text-5xl font-black text-white uppercase tracking-tight leading-none">{product.title}</h3>
                                        <p className="text-slate-400 text-xl font-medium leading-relaxed italic opacity-80">"{product.desc}"</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {product.features.map(f => (
                                            <div key={f} className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                <CheckCircle2 size={16} className="text-sky-400" /> {f}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between pt-12 border-t border-white/10 gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Acesso Imediato</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-slate-500 text-xl font-bold">R$</span>
                                                <span className="text-6xl font-black text-white tracking-tighter">{product.price}</span>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => window.open(product.checkout, '_blank')}
                                            className="w-full sm:w-auto px-16 py-10 rounded-[48px] bg-white text-slate-950 hover:bg-sky-400 hover:text-white shadow-[0_20px_60px_rgba(255,255,255,0.1)] font-black uppercase text-xs tracking-[0.2em] transition-all hover:scale-105"
                                            rightIcon={ArrowUpRight}
                                        >
                                            Comprar Agora
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </M.div>
                    ))}
                </div>
            </div>
        </section>
    );
};