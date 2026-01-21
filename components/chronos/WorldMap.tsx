
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, Play, X, Music, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

interface Region {
    id: string;
    name: string;
    location: string;
    x: number; // %
    y: number; // %
    sound_preview: string;
    description: string;
    genre: string;
}

const REGIONS: Region[] = [
    { id: 'brazil', name: 'Salvador', location: 'Brasil', x: 30, y: 70, sound_preview: 'Samba/Axé', genre: 'Samba-Reggae', description: 'O pulsar dos tambores do Pelourinho e a herança rítmica africana.' },
    { id: 'nola', name: 'New Orleans', location: 'EUA', x: 20, y: 35, sound_preview: 'Jazz', genre: 'Trad Jazz', description: 'Onde o blues encontrou o sopro e o jazz nasceu nas ruas.' },
    { id: 'vienna', name: 'Viena', location: 'Áustria', x: 52, y: 30, sound_preview: 'Clássico', genre: 'Sinfonia', description: 'O epicentro da música clássica e o lar de gênios como Mozart.' },
    { id: 'tokyo', name: 'Tokyo', location: 'Japão', x: 85, y: 40, sound_preview: 'Shamisen', genre: 'Tradicional', description: 'A delicadeza das cordas do Koto e do Shamisen ancestral.' },
];

export const WorldMap: React.FC = () => {
    const [selected, setSelected] = useState<Region | null>(null);

    const handlePinClick = (reg: Region) => {
        haptics.medium();
        setSelected(reg);
    };

    return (
        <div className="relative w-full aspect-video bg-slate-950 rounded-[64px] border border-white/5 overflow-hidden shadow-2xl">
            {/* SVG Simbolizando o Mapa (Placeholder) */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 grayscale scale-110">
                <path 
                    d="M 10 30 Q 30 10 50 40 T 90 20 T 80 80 T 40 90 T 10 30" 
                    fill="none" stroke="#38bdf8" strokeWidth="0.5" 
                />
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.1" strokeDasharray="1 2" />
            </svg>

            {/* Pins Interativos */}
            {REGIONS.map(reg => (
                <motion.button
                    key={reg.id}
                    onClick={() => handlePinClick(reg)}
                    whileHover={{ scale: 1.5 }}
                    className="absolute z-20 group"
                    style={{ left: `${reg.x}%`, top: `${reg.y}%` }}
                >
                    <div className="relative">
                        <div className="absolute -inset-4 bg-sky-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MapPin size={24} className={cn("transition-colors", selected?.id === reg.id ? "text-amber-400" : "text-sky-500")} fill="currentColor" />
                    </div>
                </motion.button>
            ))}

            <div className="absolute top-10 left-10 pointer-events-none">
                <div className="flex items-center gap-3">
                    <Globe className="text-sky-400 animate-spin-slow" size={32} />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Etno-Mapa Sonoro</h3>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Explore a diversidade musical do planeta</p>
            </div>

            {/* Modal de Detalhes da Região */}
            <AnimatePresence>
                {selected && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute top-8 right-8 w-80 z-30 bg-slate-900/90 backdrop-blur-2xl border-2 border-white/10 rounded-[40px] shadow-2xl p-8"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                                <Target size={24} />
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">{selected.location}</span>
                                <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{selected.name}</h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="bg-slate-950 px-2 py-1 rounded border border-white/5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{selected.genre}</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed font-medium">"{selected.description}"</p>

                            <button className="w-full py-4 mt-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl">
                                <Play size={18} fill="currentColor" /> Ouvir Experiência
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
