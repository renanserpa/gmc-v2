
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Sword, Flame, ShieldAlert, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

interface BossSpawnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSpawn: (boss: any) => void;
}

const PRESET_BOSSES = [
    { id: 'jitter', name: 'The Jitter Phantom', task: 'Manter estabilidade de timing acima de 90%', hp: 1000, color: 'text-sky-400', icon: Target },
    { id: 'resonance', name: 'The Dynamic Hydra', task: 'Combinar ressonância com a backing track', hp: 1500, color: 'text-purple-400', icon: Zap },
    { id: 'tempo', name: 'Tempo Overlord', task: 'Nenhum miss permitido por 32 compassos', hp: 2000, color: 'text-red-500', icon: ShieldAlert }
];

export const BossSpawnerModal: React.FC<BossSpawnerModalProps> = ({ isOpen, onClose, onSpawn }) => {
    const [selected, setSelected] = useState(PRESET_BOSSES[0]);

    const handleSpawn = () => {
        haptics.heavy();
        onSpawn({
            name: selected.name,
            maxHp: selected.hp,
            currentHp: selected.hp,
            isEnraged: false,
            isActive: true
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-slate-950 border-red-500/30 rounded-[48px] p-8 shadow-2xl">
                <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/40">
                        <Sword size={32} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Lançar Boss Raid</DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                        Transforme a prática técnica em um evento épico de sala de aula.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 my-8">
                    {PRESET_BOSSES.map((boss) => (
                        <button
                            key={boss.id}
                            onClick={() => { setSelected(boss); haptics.light(); }}
                            className={cn(
                                "w-full p-5 rounded-[32px] border-2 transition-all text-left flex items-center gap-4 group",
                                selected.id === boss.id 
                                    ? "bg-red-600/10 border-red-500 shadow-lg" 
                                    : "bg-slate-900 border-white/5 opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={cn("p-3 rounded-2xl bg-slate-950", selected.id === boss.id ? boss.color : "text-slate-700")}>
                                <boss.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className={cn("font-black uppercase tracking-tight", selected.id === boss.id ? "text-white" : "text-slate-400")}>{boss.name}</h4>
                                <p className="text-[10px] font-medium text-slate-500">{boss.task}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-600 uppercase">HP Pool</p>
                                <p className="text-sm font-black text-white">{boss.hp}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleSpawn} 
                        className="w-full py-5 rounded-2xl font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/20"
                        leftIcon={Flame}
                    >
                        Spwan Boss Now!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
