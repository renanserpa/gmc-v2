
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, CheckCircle2, Download, Share2, X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { haptics } from '../../lib/haptics.ts';
import { uiSounds } from '../../lib/uiSounds.ts';
import confetti from 'canvas-confetti';

const M = motion as any;

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    moduleTitle: string;
    instrument: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, studentName, moduleTitle, instrument }) => {
    React.useEffect(() => {
        if (isOpen) {
            haptics.fever();
            uiSounds.playSuccess();
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#38bdf8', '#fbbf24', '#ffffff', '#10b981']
            });
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-white border-none rounded-[64px] p-0 overflow-hidden shadow-2xl">
                {/* Verso do Certificado (Estético) */}
                <div className="relative p-20 flex flex-col items-center text-center gap-12 bg-slate-50">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#38bdf8_1px,transparent_1px)] bg-[size:30px_30px]" />
                    </div>

                    <header className="space-y-4 relative z-10">
                         <div className="flex items-center justify-center gap-4 text-sky-600 mb-8">
                             <div className="w-px h-12 bg-sky-200" />
                             <Trophy size={48} />
                             <div className="w-px h-12 bg-sky-200" />
                         </div>
                         <h1 className="text-2xl font-black text-slate-400 uppercase tracking-[0.4em]">Certificado de Maestria</h1>
                    </header>

                    <main className="space-y-10 relative z-10">
                        <p className="text-xl text-slate-500 font-medium italic">OlieMusic GCM e RedHouse School Cuiabá conferem a:</p>
                        
                        <h2 className="text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            {studentName}
                        </h2>

                        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent mx-auto" />

                        <p className="text-2xl text-slate-600 font-bold max-w-2xl leading-relaxed">
                            O título de <span className="text-sky-600 underline decoration-sky-300">EXPLORADOR MUSICAL</span> pela conclusão com excelência do módulo: <br/>
                            <span className="text-slate-900 uppercase mt-4 block text-4xl font-black italic tracking-tight">"{moduleTitle}"</span>
                        </p>
                    </main>

                    <footer className="w-full flex justify-between items-end mt-12 relative z-10">
                        <div className="text-left space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronia Digital</p>
                             <p className="text-xs font-mono font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-10 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
                            <Award size={100} className="text-amber-500 relative z-10 drop-shadow-xl" strokeWidth={1} />
                        </div>

                        <div className="text-right space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professor Responsável</p>
                             <p className="text-xs font-black text-slate-900 uppercase italic">Maestro Renan Serpa</p>
                        </div>
                    </footer>
                </div>

                {/* Footer de Ações Mobile-Ready */}
                <div className="bg-slate-900 p-8 flex gap-4">
                    <Button className="flex-1 py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase text-xs tracking-widest shadow-xl" leftIcon={Download}>
                        Baixar PDF para Imprimir
                    </Button>
                    <Button variant="outline" className="flex-1 py-8 rounded-[32px] border-white/10 text-white font-black uppercase text-xs tracking-widest" leftIcon={Share2}>
                        Compartilhar Orgulho
                    </Button>
                    <button onClick={onClose} className="p-8 bg-slate-800 text-slate-400 rounded-[32px] hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
