
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Coins, Sparkles, Zap, 
    Star, ArrowRight, ShieldCheck, Heart,
    X, CheckCircle2, Guitar, Palette
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { notify } from '../../../lib/notification.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { uiSounds } from '../../../lib/uiSounds.ts';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

const SHOP_ITEMS = [
    { id: 'skin_fire', name: 'Palheta de Fogo', price: 250, desc: 'Aumenta sua velocidade rítmica visualmente.', icon: Zap, color: 'text-orange-500', bg: 'from-orange-600/20 to-transparent' },
    { id: 'skin_neon', name: 'Guitarra Neon', price: 800, desc: 'Brilho intenso na lousa digital mirror.', icon: Guitar, color: 'text-sky-400', bg: 'from-sky-600/20 to-transparent' },
    { id: 'skin_royal', name: 'Coroa de Ouro', price: 1500, desc: 'Um selo de mestre para seu avatar.', icon: Star, color: 'text-amber-500', bg: 'from-amber-600/20 to-transparent' },
    { id: 'skin_dark', name: 'Modo Sombra', price: 500, desc: 'Efeito blackout nos botões do estúdio.', icon: Palette, color: 'text-slate-400', bg: 'from-slate-600/20 to-transparent' },
];

export default function Shop() {
    const { student, refetch } = useCurrentStudent();
    const navigate = useNavigate();
    const [purchased, setPurchased] = useState<string | null>(null);
    const [isBuying, setIsBuying] = useState<string | null>(null);

    const handleBuy = async (item: any) => {
        if (!student) return;
        if (student.coins < item.price) {
            notify.error("Olie Coins insuficientes para este item.");
            haptics.error();
            return;
        }

        setIsBuying(item.id);
        haptics.fever();
        uiSounds.playSuccess();

        // Simulação de compra (no piloto apenas front-end feedback)
        setTimeout(() => {
            setPurchased(item.id);
            setIsBuying(null);
            notify.success(`Item "${item.name}" desbloqueado!`);
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            
            {/* Lucca Merchant Popup */}
            <AnimatePresence>
                {purchased && (
                    <M.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40"
                    >
                        <Card className="bg-[#0a0f1d] border-2 border-sky-500/50 rounded-[64px] p-12 max-w-lg text-center shadow-[0_0_100px_rgba(56,189,248,0.2)]">
                            <div className="w-32 h-32 rounded-full border-4 border-sky-500 mx-auto overflow-hidden bg-slate-800 mb-8">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca&backgroundColor=b6e3f4`} className="w-full h-full" />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Belo Equipamento!</h2>
                            <p className="text-slate-400 text-lg font-medium italic leading-relaxed mb-10">
                                "Isso vai te ajudar muito na próxima missão! Mal posso esperar para ver você tocando com estilo."
                            </p>
                            <Button 
                                onClick={() => { setPurchased(null); haptics.medium(); }}
                                className="w-full py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 font-black uppercase tracking-widest text-xs"
                            >
                                CONTINUAR SHOPPING
                            </Button>
                        </Card>
                    </M.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <ShoppingBag size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Equipment Hub</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Skins <span className="text-purple-500">Shop</span>
                    </h1>
                </div>
                <div className="bg-slate-950/80 px-10 py-6 rounded-[32px] border border-white/10 flex items-center gap-6 relative z-10 shadow-2xl">
                    <div className="p-4 bg-amber-500 rounded-3xl text-slate-950 shadow-xl"><Coins size={32} fill="currentColor" /></div>
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Seu Saldo</p>
                        <p className="text-4xl font-black text-white tracking-tighter">{student?.coins || 0}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {SHOP_ITEMS.map((item, idx) => (
                    <M.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden group hover:border-purple-500/40 transition-all shadow-2xl h-full flex flex-col">
                            <div className={cn("aspect-square relative flex items-center justify-center bg-gradient-to-br", item.bg)}>
                                <item.icon size={80} className={cn("transition-transform group-hover:scale-125 group-hover:rotate-6 duration-700", item.color)} />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)]" />
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{item.name}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed font-medium opacity-80">{item.desc}</p>
                                </div>

                                <Button 
                                    onClick={() => handleBuy(item)}
                                    isLoading={isBuying === item.id}
                                    className={cn(
                                        "w-full py-6 rounded-[24px] font-black uppercase text-[10px] tracking-widest transition-all",
                                        student && student.coins >= item.price ? "bg-purple-600 hover:bg-purple-500" : "bg-slate-900 text-slate-700 opacity-50 grayscale cursor-not-allowed"
                                    )}
                                >
                                    COMPRAR • {item.price} <Coins size={14} className="ml-2" fill="currentColor" />
                                </Button>
                            </div>
                        </Card>
                    </M.div>
                ))}
            </div>
            
            <footer className="py-20 text-center border-t border-white/5 opacity-40">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Olie Music Marketplace • v1.0 Private Draft</p>
            </footer>
        </div>
    );
}
