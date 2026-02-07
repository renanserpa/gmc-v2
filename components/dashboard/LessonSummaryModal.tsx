
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, CheckCircle2, Zap, Save, 
    X, Star, MessageSquare, Flame, 
    ArrowRight, Loader2, Rocket, Users
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { useMaestro } from '../../contexts/MaestroContext.tsx';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;

const M = motion as any;

interface LessonSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
    students: any[];
}

export const LessonSummaryModal: React.FC<LessonSummaryModalProps> = ({ isOpen, onClose, session, students }) => {
    const { resetLesson, persistTelemetry } = useMaestro();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [masterTip, setMasterTip] = useState('');

    const handleFinalize = async () => {
        setIsSaving(true);
        haptics.heavy();

        try {
            // 1. Persistir Telemetria para cada aluno presente (Sprint 09)
            const telemetryPromises = students.map(s => persistTelemetry(s.id, masterTip));
            await Promise.all(telemetryPromises);

            // 2. Persistir Histórico de Aula (Mestre)
            const { error: histErr } = await supabase.from('lesson_plans').insert([{
                class_id: session.classId,
                title: session.className,
                professor_id: '00000000-0000-0000-0000-000000000000', // Mock professor
                metadata: {
                    max_bpm: session.maxBpmReached,
                    master_tip: masterTip,
                    attendance_count: students.length,
                    completed_at: new Date().toISOString()
                }
            }]);

            if (histErr) throw histErr;

            // 3. Enviar Sinal de "Missão Cumprida" para o Arcade
            await supabase.from('notices').insert([{
                title: 'AULA CONCLUÍDA!',
                message: `Mestre diz: ${masterTip || "Ótima aula! Pratique o exercício da aranha."}`,
                target_audience: 'all',
                priority: 'normal'
            }]);

            notify.success("Aula arquivada e telemetria sincronizada!");
            resetLesson();
            navigate('/teacher/dashboard');
        } catch (e) {
            notify.error("Falha ao salvar resumo da sessão.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-950 border-emerald-500/30 rounded-[56px] p-0 overflow-hidden shadow-2xl">
                <div className="bg-emerald-600 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[80px] pointer-events-none" />
                    <M.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                        <Trophy size={40} className="text-emerald-600" />
                    </M.div>
                    <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Missão Cumprida!</DialogTitle>
                    <DialogDescription className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-2">Resumo da Performance Pedagógica</DialogDescription>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-6 rounded-[32px] border border-white/5 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BPM Máximo</span>
                            <div className="flex items-center gap-3">
                                <Flame className="text-orange-500" size={24} fill="currentColor" />
                                <span className="text-4xl font-black text-white font-mono">{session.maxBpmReached}</span>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[32px] border border-white/5 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Crew Ativa</span>
                            <div className="flex items-center gap-3">
                                <Users className="text-sky-400" size={24} />
                                <span className="text-4xl font-black text-white font-mono">{students.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                             <MessageSquare size={14} className="text-sky-400" /> Dica do Mestre (Dever de Casa)
                         </label>
                         <textarea 
                            value={masterTip}
                            onChange={e => setMasterTip(e.target.value)}
                            placeholder="Ex: Treinar a transição do acorde C para G por 10 minutos diários..."
                            className="w-full bg-slate-900 border-2 border-white/5 rounded-[32px] p-6 text-white text-sm outline-none focus:border-sky-500/40 transition-all resize-none italic"
                            rows={3}
                         />
                    </div>

                    <div className="bg-sky-500/5 p-6 rounded-[32px] border border-sky-500/10 flex items-start gap-4">
                        <Rocket className="text-sky-400 shrink-0 mt-1" size={20} />
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            Ao finalizar, as estatísticas de BPM serão sincronizadas com o Portal da Família e as recompensas de XP creditadas.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-10 bg-slate-900/50 border-t border-white/5">
                    <Button 
                        onClick={handleFinalize} 
                        isLoading={isSaving}
                        className="w-full py-10 rounded-[40px] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.3em] shadow-xl text-xs"
                        leftIcon={Save}
                    >
                        CONFIRMAR E SINCRONIZAR ARCADES
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
