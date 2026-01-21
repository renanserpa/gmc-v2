

import React, { useEffect, useState } from 'react';
import { StoreItem, Student, StoreOrder } from '../types';
import { fetchStoreItemsForStudent, purchaseStoreItem, getStudentInventory, toggleEquipItem } from '../services/storeService';
// FIX: CardDescription is now exported from ./ui/Card
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { ShoppingBag, Coins, Sparkles, ShieldCheck, AlertCircle, Package, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../lib/haptics';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { uiSounds } from '../lib/uiSounds';

interface StudentStoreProps {
  student: Student;
  onPurchaseSuccess: () => void;
}

export default function StudentStore({ student, onPurchaseSuccess }: StudentStoreProps) {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [inventory, setInventory] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadStore = async () => {
    if (!student?.id) return;
    setLoading(true);
    try {
      const [storeItems, playerInventory] = await Promise.all([
        fetchStoreItemsForStudent(),
        getStudentInventory(student.id)
      ]);
      setItems(storeItems || []);
      setInventory(playerInventory || []);
    } catch (err) {
        console.error("Erro ao carregar bazar:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadStore(); }, [student.id]);

  const handleBuy = async (item: StoreItem) => {
    haptics.medium();
    setActionId(item.id);
    const result = await purchaseStoreItem({ studentId: student.id, storeItemId: item.id });

    if (result.success) {
        uiSounds.playSuccess();
        setMessage({ type: 'success', text: `Item ${item.name} resgatado!` });
        onPurchaseSuccess();
        loadStore();
        setTimeout(() => setMessage(null), 3000);
    } else {
        uiSounds.playError();
        setMessage({ type: 'error', text: result.error || 'Erro na transação.' });
    }
    setActionId(null);
  };

  const handleEquip = async (order: StoreOrder) => {
    haptics.heavy();
    setActionId(order.id);
    const success = await toggleEquipItem(order.id, student.id, order.is_equipped || false);
    if (success) {
        uiSounds.playClick();
        loadStore();
        onPurchaseSuccess(); // Para forçar o HUD a recarregar cosméticos
    }
    setActionId(null);
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Abrindo Bazar Maestro...</p>
    </div>
  );

  return (
    <Card className="border-slate-800 bg-slate-900 shadow-2xl overflow-hidden relative min-h-[500px] rounded-[48px]">
      <CardHeader className="relative z-10 border-none pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="flex items-center gap-3">
                    <ShoppingBag className="text-yellow-400" /> Olie Marketplace
                </CardTitle>
                <CardDescription>Invista suas moedas em estilo e proteção.</CardDescription>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5">
                <button 
                    onClick={() => setActiveTab('shop')}
                    className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'shop' ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                >
                    Loja
                </button>
                <button 
                    onClick={() => setActiveTab('inventory')}
                    className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'inventory' ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                >
                    Meus Itens ({inventory.length})
                </button>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-8">
        <AnimatePresence mode="wait">
          {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("p-4 mb-6 rounded-2xl text-xs font-black border flex items-center gap-3 uppercase tracking-widest", message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                  {message.type === 'success' ? <Sparkles size={16} /> : <AlertCircle size={16} />}
                  {message.text}
              </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'shop' ? (
                items.map(item => {
                    const isOwned = inventory.some(o => o.store_item_id === item.id);
                    const canAfford = student.coins >= item.price_coins;
                    const isShield = item.name.toLowerCase().includes('escudo');

                    return (
                        <motion.div key={item.id} layout whileHover={{ y: -4 }} className="p-6 rounded-[32px] border bg-slate-950/50 border-slate-800 flex flex-col justify-between group transition-all">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={cn("p-4 rounded-2xl", isShield ? "bg-emerald-500/10 text-emerald-400" : "bg-sky-500/10 text-sky-400")}>
                                        {isShield ? <ShieldCheck size={28} /> : <Zap size={28} />}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full font-black text-[10px] flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                        <Coins size={12} fill="currentColor" /> {item.price_coins}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-tight">{item.name}</h3>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-1">{item.description}</p>
                                </div>
                            </div>
                            {/* FIX: The 'variant' and 'isLoading' props are now supported by the updated Button component */}
                            <Button
                                onClick={() => handleBuy(item)}
                                disabled={isOwned || !canAfford || actionId !== null}
                                className="mt-8 w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl"
                                variant={isOwned ? 'secondary' : 'primary'}
                                isLoading={actionId === item.id}
                            >
                                {isOwned ? 'Já Adquirido' : 'Resgatar Agora'}
                            </Button>
                        </motion.div>
                    );
                })
            ) : (
                inventory.length === 0 ? (
                    <div className="col-span-full py-20 text-center opacity-40">
                        <Package size={48} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">Inventário Vazio</p>
                    </div>
                ) : (
                    inventory.map(order => (
                        <motion.div key={order.id} layout className={cn("p-6 rounded-[32px] border transition-all flex flex-col justify-between", order.is_equipped ? "bg-purple-500/10 border-purple-500/40" : "bg-slate-950/50 border-slate-800")}>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className={cn("p-3 rounded-xl", order.is_equipped ? "bg-purple-500 text-white" : "bg-slate-900 text-slate-600")}>
                                        {order.is_equipped ? <Check size={20} /> : <Package size={20} />}
                                    </div>
                                    {order.is_equipped && <span className="text-[8px] font-black text-purple-400 uppercase tracking-[0.2em] animate-pulse">Equipado</span>}
                                </div>
                                <h3 className="font-black text-white uppercase tracking-tight">{order.store_items?.name}</h3>
                            </div>
                            {/* FIX: The 'variant' and 'isLoading' props are now supported by the updated Button component */}
                            <Button
                                onClick={() => handleEquip(order)}
                                className="mt-8 w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl"
                                variant={order.is_equipped ? 'outline' : 'purple'}
                                isLoading={actionId === order.id}
                            >
                                {order.is_equipped ? 'Desequipar' : 'Equipar Item'}
                            </Button>
                        </motion.div>
                    ))
                )
            )}
        </div>
      </CardContent>
    </Card>
  );
}