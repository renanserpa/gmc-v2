
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Eye, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { TablatureView } from '../tools/TablatureView';
import { Button } from '../ui/Button';
import { haptics } from '../../lib/haptics';

interface GordonAudiationViewProps {
    alphaTex: string;
    audioUrl: string;
    onReadyToPerform: () => void;
}

export const GordonAudiationView: React.FC<GordonAudiationViewProps> = ({ alphaTex, audioUrl, onReadyToPerform }) => {
    const [isAudiationComplete, setIsAudiationComplete] = useState(false);
    const [isPlayingReference, setIsPlayingReference] = useState(false);

    const handlePlayReference = () => {
        setIsPlayingReference(true);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
            setIsPlayingReference(false);
            haptics.medium();
        };
    };

    const handleCompleteAudiation = () => {
        setIsAudiationComplete(true);
        haptics.heavy();
        onReadyToPerform();
    };

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">
                {!isAudiationComplete ? (
                    <motion.div 
                        key="audiation-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900 border-2 border-sky-500/30 rounded-[48px] p-12 flex flex-col items-center text-center gap-8 shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-sky-500 rounded-[32px] flex items-center justify-center text-white shadow-xl animate-bounce">
                            <Headphones size={48} />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Ouvir primeiro, ver depois</h2>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                Escute a melodia e cante-a mentalmente. Este é o segredo do Maestro Gordon.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button 
                                onClick={handlePlayReference}
                                isLoading={isPlayingReference}
                                variant="outline"
                                className="px-10 py-6 rounded-2xl"
                                leftIcon={Play}
                            >
                                Ouvir Referência
                            </Button>
                            
                            <Button 
                                onClick={handleCompleteAudiation}
                                className="px-10 py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500"
                                leftIcon={Eye}
                            >
                                Já ouvi, mostrar partitura
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="performance-step"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl w-fit">
                            <CheckCircle2 size={18} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Audiation Concluída: Foco no Visual</span>
                        </div>
                        <TablatureView alphaTex={alphaTex} isTvMode={true} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
