
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, Zap, Star, ShieldCheck, 
    Guitar, Palette, Check, ArrowLeft,
    Sparkles, Lock, Loader2, Package
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useCurrentStudent } from '../../../hooks/useCurrentStudent.ts';
import { getStudentInventory, equipAsset } from '../../../services/storeService.ts';
import { notify } from '../../../lib/notification.ts';
import { haptics } from '../../../lib/haptics.ts';
import { cn } from '../../../lib/utils.ts';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

export default function Inventory() {
    const { student, refetch } = useCurrentStudent();
    const navigate = useNavigate();
    
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [equippingId, setEquippingId] = useState<string | null>(null);

    useEffect(() => {
        if (student?.id) {
            loadInventory();
        }
    }, [student?.id]);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const data = await getStudentInventory(student!.id);
            setItems(data);
        } catch (e) {
            notify.error("Falha ao abrir baú de itens.");
        } finally {
            setLoading(false);
        }
    };

    const handleEquip = async (assetId: string) => {
        setEquippingId(assetId);
        haptics.heavy();
        try {
            await equipAsset(student!.id, assetId);
            notify.success("Equipamento atualizado!");
            await refetch();
        } catch (e) {
            notify.error("Erro ao equipar item.");
        } finally {
            setEquippingId(null);
        }
    };

    const activeSkinId = student?.metadata?.equipped_skin_id;

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 flex items-center gap-6">
                    <button onClick={() => navigate('/student/dashboard')} className="p-4 bg-slate-950 rounded-2xl text-slate-500 hover:text-white transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <Briefcase size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Hero Equipment</span>
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                            Meu <span className="text-emerald-500">Inventário</span>
                        </h1>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="py-40 text-center animate-pulse text-emerald-500 font-black uppercase tracking-widest">
                    <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                    Sincronizando Baú de Tesouros...
                </div>
            ) : items.length === 0 ? (
                <div className="py-40 text-center border-4 border-dashed border-slate-900 rounded-[80px] opacity-30">
                    <Package size={80} className="mx-auto text-slate-700 mb-6" />
                    <h3 className="text-2xl font-black text-white uppercase italic">Seu baú está vazio</h3>
                    <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest">Visite a loja para gastar suas Olie Coins!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {items.map((item, idx) => {
                        const asset = item.avatar_assets;
                        const isEquipped = activeSkinId === asset.id;

                        return (
                            <M.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className={cn(
                                    "bg-[#0a0f1d] border-2 rounded-[48px] overflow-hidden group transition-all shadow-2xl relative h-full flex flex-col",
                                    isEquipped ? "border-emerald-500/50 shadow-emerald-500/10" : "border-white/5 hover:border-emerald-500/30"
                                )}>
                                    <div className={cn(
                                        "aspect-square relative flex items-center justify-center bg-gradient-to-br",
                                        asset.category === 'instrument' ? 'from-sky-600/10' : 'from-emerald-600/10',
                                        "to-transparent"
                                    )}>
                                        {asset.category === 'instrument' ? <Guitar size={80} className="text-sky-400" /> : <Palette size={80} className="text-emerald-400" />}
                                        
                                        {isEquipped && (
                                            <div className="absolute top-6 right-6 bg-emerald-500 text-white p-2 rounded-full shadow-lg border-4 border-[#0a0f1d] animate-in zoom-in">
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <CardContent className="p-8 flex-1 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{asset.name}</h3>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{asset.category}</p>
                                        </div>

                                        <Button 
                                            onClick={() => handleEquip(asset.id)}
                                            isLoading={equippingId === asset.id}
                                            disabled={isEquipped}
                                            className={cn(
                                                "w-full py-5 rounded-[24px] font-black uppercase text-[10px] tracking-widest mt-6",
                                                isEquipped ? "bg-slate-900 text-slate-500" : "bg-emerald-600 hover:bg-emerald-500"
                                            )}
                                        >
                                            {isEquipped ? 'EQUIPADO' : 'EQUIPAR'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </M.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
