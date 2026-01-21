
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TablatureView } from './TablatureView';
import { Button } from '../ui/Button';
import { Fretboard } from './Fretboard';
import { Zap, Dumbbell, Play, Pause, TrendingUp, Award, Settings2, Sparkles, Target, Activity } from 'lucide-react';
import { RENAN_SERPA_TABS } from '../../lib/tabsStore';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';
import { applyXpEvent } from '../../services/gamificationService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const FINGER_COLORS: Record<number, string> = {
    1: 'text-emerald-400', // Indicador -> Verde
    2: 'text-yellow-400',  // Médio -> Amarelo
    3: 'text-orange-500',  // Anelar -> Laranja
    4: 'text-red-500'      // Mínimo -> Vermelho
};

const EXERCISES = [
    { id: 'spider_walk_v1', label: 'Caminhada da Aranha', icon: '🕷️', desc: 'Metodologia Renan Serpa: Nível 1' },
    { id: 'thumb_jump', label: 'Salto do Polegar', icon: '👍', desc: 'Foco no Dedo P (Mão Direita)' },
    { id: 'seven_nation_army', label: 'Riff: Seven Nation', icon: '🎸', desc: 'Seu primeiro Riff de Rock!' }
];

export const TechniqueGym: React.FC = () => {
    const { user } = useAuth();
    const [type, setType] = useState<keyof typeof RENAN_SERPA_TABS>('spider_walk_v1');
    const [isTraining, setIsTraining] = useState(false);
    const [loopCount, setLoopCount] = useState(0);
    const [highlightedNote, setHighlightedNote] = useState<any>(null);

    const apiRef = useRef<any>(null);

    const toggleTraining = () => {
        if (!apiRef.current) return;
        apiRef.current.player.playPause();
        setIsTraining(!isTraining);
        haptics.medium();
    };

    const handleReady = (api: any) => {
        apiRef.current = api;
        api.playerFinished.on(() => {
            setLoopCount(c => c + 1);
            haptics.success();
            if (isTraining) api.player.play();
            
            if (loopCount === 4) {
                 notify.success("BADGE DESBLOQUEADA: O Domador de Aranhas! 🕷️✨");
                 applyXpEvent({
                    studentId: user.id,
                    eventType: 'MISSION_COMPLETE',
                    xpAmount: 100,
                    contextType: 'tools'
                 });
            }
        });
    };

    const getFingerInfo = (fret: number) => {
        if (type !== 'spider_walk_v1') return null;
        if (fret >= 1 && fret <= 4) return { id: fret, color: FINGER_COLORS[fret] };
        return null;
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-32">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sky-400">
                        <Dumbbell size={24} />
                        <span className="text-[12px] font-black uppercase tracking-[0.4em]">Academia Técnica Maestro</span>
                    </div>
                    <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Technique Gym</h2>
                </div>
                
                <div className="flex bg-slate-900/60 p-3 rounded-[32px] border border-white/10 backdrop-blur-2xl shadow-2xl">
                    <div className="px-8 py-2 border-r border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase text-center mb-1">Ciclos Concluídos</p>
                        <p className="text-4xl font-black text-white font-mono text-center">{loopCount}<span className="text-slate-700 text-lg">/5</span></p>
                    </div>
                    <button 
                        onClick={toggleTraining}
                        className={cn(
                            "px-12 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ml-4 flex items-center gap-3",
                            isTraining ? "bg-red-600 text-white shadow-red-900/20" : "bg-sky-600 text-white shadow-sky-900/20"
                        )}
                    >
                        {isTraining ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        {isTraining ? "PAUSAR" : "INICIAR TREINO"}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <main className="lg:col-span-9 space-y-8">
                    <TablatureView 
                        alphaTex={RENAN_SERPA_TABS[type]} 
                        isTvMode={true}
                        onReady={handleReady}
                        onNoteHighlight={setHighlightedNote}
                    />
                    
                    {/* Fretboard com Pulso para Thumb Jump */}
                    <div className="relative">
                        <AnimatePresence>
                            {type === 'thumb_jump' && highlightedNote && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest z-50 shadow-xl border-4 border-slate-950"
                                >
                                    Tocar Corda {highlightedNote.string}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Fretboard 
                            rootKey="E" 
                            detectedNoteIdx={highlightedNote?.fret} 
                            className={cn(
                                "opacity-95 transition-all duration-300",
                                type === 'thumb_jump' ? "border-amber-500/50 shadow-amber-500/10" : "shadow-sky-500/10"
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-slate-950 border-slate-800 p-10 rounded-[48px] shadow-2xl flex flex-col items-center text-center group">
                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6">Instrução Técnica</p>
                            <div className={cn(
                                "text-7xl font-black transition-all duration-500 drop-shadow-xl",
                                highlightedNote ? (getFingerInfo(highlightedNote.fret)?.color || "text-slate-800") : "text-slate-800"
                            )}>
                                {highlightedNote && getFingerInfo(highlightedNote.fret) ? `DEDO ${highlightedNote.fret}` : "--"}
                            </div>
                            <div className="mt-8 flex gap-3">
                                {[1,2,3,4].map(f => (
                                    <div key={f} className={cn(
                                        "w-4 h-4 rounded-full border-2 border-white/10 transition-all duration-300",
                                        highlightedNote?.fret === f ? FINGER_COLORS[f].replace('text', 'bg') : 'bg-slate-900'
                                    )} 
                                    style={{ boxShadow: highlightedNote?.fret === f ? '0 0 20px currentColor' : 'none' }}
                                    />
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-slate-950 border-slate-800 p-10 rounded-[48px] shadow-2xl flex flex-col items-center text-center justify-center gap-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-20 bg-sky-500/5 blur-3xl rounded-full" />
                             <div className="w-20 h-20 bg-sky-500/10 rounded-[32px] flex items-center justify-center text-sky-400 relative z-10">
                                <Activity size={40} />
                             </div>
                             <div className="relative z-10">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight">Dica de Performance</h4>
                                <p className="text-sm text-slate-500 leading-relaxed mt-3 italic font-medium">
                                    {type === 'spider_walk_v1' 
                                        ? '"Mantenha o arco da mão esquerda. Não encoste a palma no braço do violão!"' 
                                        : type === 'thumb_jump' 
                                            ? '"Use apenas o peso do polegar. A corda deve soar limpa e constante."'
                                            : '"Sinta a batida constante na corda Lá. Rock n\' Roll!"'}
                                </p>
                             </div>
                        </Card>
                    </div>
                </main>

                <aside className="lg:col-span-3 space-y-6">
                    <Card className="bg-slate-900 border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-slate-950/60 p-8 border-b border-white/5">
                            <CardTitle className="text-[11px] uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
                                <Settings2 size={16} /> Playlist Nível 1
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {EXERCISES.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => { setType(g.id as any); setLoopCount(0); haptics.light(); }}
                                    className={cn(
                                        "w-full p-6 rounded-3xl border-2 transition-all text-left group relative overflow-hidden",
                                        type === g.id 
                                            ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-xl" 
                                            : "bg-slate-950 border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-black uppercase tracking-tight">{g.icon} {g.label}</span>
                                        {type === g.id && <Sparkles size={16} className="text-amber-500 animate-pulse" fill="currentColor" />}
                                    </div>
                                    <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">{g.desc}</p>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="p-12 bg-slate-950 border-2 border-dashed border-slate-800 rounded-[48px] text-center space-y-6 shadow-2xl group hover:border-amber-500/30 transition-all">
                        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-amber-500/20 group-hover:scale-110 transition-transform">
                            <Award size={48} className="text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-md font-black text-white uppercase tracking-widest">Desafio Lucca</h4>
                            <p className="text-xs text-slate-500 leading-relaxed italic mt-4 font-medium">
                                "Ajude a Aranha Lucca a subir a parede sem cair! Cada nota é um degrau. Complete 5 ciclos para ganhar a Badge Dourada!"
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};
