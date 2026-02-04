
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog.tsx';
import { Student } from '../../types.ts';
import { getStudentDetailedStats } from '../../services/dataService.ts';
import { aiPedagogy } from '../../services/aiService.ts';
import { UserAvatar } from '../ui/UserAvatar.tsx';
import { Headphones, Trophy, Play, Pause, Calendar, Zap, MessageSquare, Loader2, Share2, Activity, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { formatDate } from '../../lib/date.ts';
import { uiSounds } from '../../lib/uiSounds.ts';
import { notify } from '../../lib/notification.ts';

const M = motion as any;

export const StudentDetailModal: React.FC<{ student: Student | null; onClose: () => void }> = ({ student, onClose }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const [audio] = useState(new Audio());

    useEffect(() => {
        if (student) {
            setLoading(true);
            getStudentDetailedStats(student.id).then(data => {
                setStats(data);
                setLoading(false);
            });
        }
    }, [student]);

    const handleGenerateReport = async () => {
        if (!student) return;
        setGeneratingReport(true);
        uiSounds.playClick();
        const text = await aiPedagogy.generateParentReport(student.name, student.xp || 0, student.instrument, stats);
        setReport(text);
        setGeneratingReport(false);
        notify.success("Relatório gerado pelo Maestro!");
    };

    const togglePlay = (url: string, id: string) => {
        if (playingAudioId === id) {
            audio.pause();
            setPlayingAudioId(null);
        } else {
            audio.src = url;
            audio.play();
            setPlayingAudioId(id);
            uiSounds.playClick();
        }
    };

    if (!student) return null;

    return (
        <Dialog open={!!student} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 rounded-[48px] p-0 overflow-hidden shadow-2xl h-[90vh]">
                <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                    {/* Lateral Info */}
                    <div className="md:col-span-4 bg-slate-900/50 p-10 border-r border-white/5 flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <UserAvatar src={student.avatar_url} name={student.name} size="xl" className="mx-auto border-4 border-sky-500/20 shadow-2xl" />
                                    <div className="absolute -bottom-2 -right-2 bg-sky-500 text-white p-2 rounded-2xl shadow-xl">
                                        <Trophy size={16} />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{student.name}</h2>
                                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mt-1">{student.instrument}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 text-center">
                                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Nível</p>
                                    <p className="text-xl font-black text-white">{student.current_level}</p>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 text-center">
                                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">XP Total</p>
                                    <p className="text-xl font-black text-amber-500">{student.xp}</p>
                                </div>
                            </div>

                            {/* Proficiency Visualization (Mock) */}
                            <div className="space-y-4 pt-4">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">Radar de Proficiência</p>
                                <div className="flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-sky-500/20 flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-sky-500/5 rounded-full blur-2xl" />
                                        <Target className="text-sky-500/20" size={60} />
                                        {/* Simulação de pontos de radar */}
                                        <div className="absolute top-2 left-1/2 w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_10px_#38bdf8]" />
                                        <div className="absolute bottom-10 right-4 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a78bfa]" />
                                        <div className="absolute bottom-4 left-6 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#34d399]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={handleGenerateReport} 
                            isLoading={generatingReport}
                            className="w-full py-8 rounded-[32px] bg-purple-600 hover:bg-purple-500 text-[10px] font-black uppercase tracking-widest"
                            leftIcon={MessageSquare}
                        >
                            Gerar Relatório para Pais
                        </Button>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-8 p-10 overflow-y-auto custom-scrollbar bg-black/20 flex flex-col gap-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <Loader2 className="animate-spin text-sky-500" size={48} />
                                <p className="text-[10px] font-black text-slate-500 uppercase">Sincronizando Dossiê...</p>
                            </div>
                        ) : (
                            <>
                                <AnimatePresence>
                                    {report && (
                                        <M.div 
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-purple-900/10 border border-purple-500/30 p-8 rounded-[40px] relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-20"><Share2 size={40} /></div>
                                            <p className="text-sm font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Zap size={14} fill="currentColor" /> Relatório IA Sugerido
                                            </p>
                                            <p className="text-slate-300 leading-relaxed italic text-lg font-medium">"{report}"</p>
                                            <div className="flex gap-4 mt-8">
                                                <Button size="sm" className="bg-sky-600 rounded-xl text-[9px] uppercase font-black">Copiar para WhatsApp</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setReport(null)} className="text-[9px] uppercase font-black">Refazer</Button>
                                            </div>
                                        </M.div>
                                    )}
                                </AnimatePresence>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Headphones size={20} className="text-sky-400" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Performances Recentes</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {stats?.recordings.map((rec: any) => (
                                            <div key={rec.id} className="flex items-center gap-5 p-6 bg-slate-900/50 rounded-[32px] border border-white/5 hover:border-sky-500/30 transition-all group">
                                                <button 
                                                    onClick={() => togglePlay(rec.audio_url, rec.id)}
                                                    className={cn(
                                                        "p-5 rounded-2xl transition-all shadow-xl",
                                                        playingAudioId === rec.id ? "bg-sky-500 text-white" : "bg-slate-950 text-sky-400 group-hover:bg-slate-800"
                                                    )}
                                                >
                                                    {playingAudioId === rec.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                                </button>
                                                <div className="flex-1">
                                                    <p className="text-lg font-black text-white uppercase tracking-tight">{rec.songs?.title || 'Exercício Técnico'}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                                                            <Calendar size={12} /> {formatDate(rec.created_at)}
                                                        </span>
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1.5">
                                                            <Activity size={12} /> 92% Precisão
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
