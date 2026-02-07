
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Coins, Sparkles, Zap, 
    Star, ArrowRight, ShieldCheck, Heart,
    X, CheckCircle2, Guitar, Palette, AlertCircle,
    Package
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { getAvatarAssets, purchaseAsset, getStudentInventory } from '../../../services/storeService.ts';
import { notify } from '../../../lib/notification.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import { uiSounds } from '../../../lib/uiSounds.ts';
import confetti from 'canvas-confetti';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

export default function Shop() {
    const { student, refetch } = useCurrentStudent();
    const navigate = useNavigate();
    
    const [assets, setAssets] = useState<any[]>([]);
    const [inventoryIds, setInventoryIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasedItem, setPurchasedItem] = useState<any>(null);
    const [insufficientFunds, setInsufficientFunds] = useState(false);
    const [isBuying, setIsBuying] = useState<string | null>(null);

    useEffect(() => {
        if (student?.id) {
            loadShopData();
        }
    }, [student?.id]);

    const loadShopData = async () => {
        setLoading(true);
        try {
            const [allAssets, myInv] = await Promise.all([
                getAvatarAssets(),
                getStudentInventory(student!.id)
            ]);
            setAssets(allAssets);
            setInventoryIds(myInv.map((i: any) => i.asset_id));
        } catch (e) {
            notify.error("Erro ao carregar mercado.");
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item: any) => {
        if (!student) return;
        
        if (student.coins < item.price_coins) {
            haptics.error();
            setInsufficientFunds(true);
            return;
        }

        setIsBuying(item.id);
        haptics.fever();
        uiSounds.playSuccess();

        try {
            await purchaseAsset(student.id, item.id, item.price_coins);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setPurchasedItem(item);
            await refetch();
            await loadShopData();
        } catch (e) {
            notify.error("Falha na transação bancária Maestro.");
        } finally {
            setIsBuying(null);
        }
    };

    const getIcon = (category: string) => {
        if (category === 'instrument') return Guitar;
        if (category === 'accessory') return Sparkles;
        return Package;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            
            {/* Lucca Feedback Overlay */}
            <AnimatePresence>
                {(purchasedItem || insufficientFunds) && (
                    <M.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60"
                    >
                        <Card className={cn(
                            "bg-[#0a0f1d] border-2 rounded-[64px] p-12 max-w-lg text-center shadow-2xl relative",
                            purchasedItem ? "border-sky-500/50" : "border-rose-500/50"
                        )}>
                            <div className="w-32 h-32 rounded-full border-4 border-slate-700 mx-auto overflow-hidden bg-slate-800 mb-8 ring-4 ring-sky-500/20">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Lucca&backgroundColor=b6e3f4`} className="w-full h-full" />
                            </div>
                            
                            {purchasedItem ? (
                                <>
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Bela Escolha!</h2>
                                    <p className="text-slate-400 text-lg font-medium italic leading-relaxed mb-10">
                                        "Esse item é lendário! Já está no seu baú, pronto para ser equipado."
                                    </p>
                                    <Button 
                                        onClick={() => setPurchasedItem(null)}
                                        className="w-full py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 font-black uppercase tracking-widest text-xs"
                                    >
                                        CONTINUAR SHOPPING
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-black text-rose-500 uppercase italic tracking-tighter mb-4">Quase lá!</h2>
                                    <p className="text-slate-400 text-lg font-medium italic leading-relaxed mb-10">
                                        "Ainda não temos moedas suficientes! Complete mais 15 minutos de treino para ganhar o bônus de hoje!"
                                    </p>
                                    <div className="flex gap-4">
                                        <Button 
                                            variant="ghost"
                                            onClick={() => setInsufficientFunds(false)}
                                            className="flex-1 py-8 rounded-[32px] text-slate-500 font-black uppercase text-xs"
                                        >
                                            FECHAR
                                        </Button>
                                        <Button 
                                            onClick={() => navigate('/student/practice')}
                                            className="flex-[2] py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 font-black uppercase tracking-widest text-xs"
                                        >
                                            IR PARA TREINO
                                        </Button>
                                    </div>
                                </>
                            )}
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
                {loading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="h-96 bg-slate-900/40 rounded-[48px] animate-pulse" />)
                ) : assets.map((item, idx) => {
                    const isOwned = inventoryIds.includes(item.id);
                    const Icon = getIcon(item.category);
                    const canAfford = student && student.coins >= item.price_coins;

                    return (
                        <M.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className={cn(
                                "bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden group hover:border-purple-500/40 transition-all shadow-2xl h-full flex flex-col relative",
                                isOwned && "opacity-60 grayscale-[0.5]"
                            )}>
                                <div className={cn(
                                    "aspect-square relative flex items-center justify-center bg-gradient-to-br",
                                    item.category === 'instrument' ? 'from-sky-600/20' : 'from-purple-600/20',
                                    "to-transparent"
                                )}>
                                    <Icon size={80} className={cn("transition-transform group-hover:scale-125 group-hover:rotate-6 duration-700", item.category === 'instrument' ? 'text-sky-400' : 'text-purple-400')} />
                                    {isOwned && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircle2 size={12} /> JÁ ADQUIRIDO
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{item.name}</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed font-medium opacity-80">{item.description}</p>
                                    </div>

                                    {!isOwned && (
                                        <Button 
                                            onClick={() => handleBuy(item)}
                                            isLoading={isBuying === item.id}
                                            className={cn(
                                                "w-full py-6 rounded-[24px] font-black uppercase text-[10px] tracking-widest transition-all",
                                                canAfford ? "bg-purple-600 hover:bg-purple-500" : "bg-slate-900 text-slate-700 border-white/5"
                                            )}
                                        >
                                            COMPRAR • {item.price_coins} <Coins size={14} className="ml-2" fill="currentColor" />
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </M.div>
                    );
                })}
            </div>
        </div>
    );
}
