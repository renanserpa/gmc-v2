import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog.tsx';
import { Student } from '../../types.ts';
import { getStudentDetailedStats } from '../../services/dataService.ts';
import { UserAvatar } from '../ui/UserAvatar.tsx';
import { Headphones, Trophy, Play, Pause, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { formatDate } from '../../lib/date.ts';
import { uiSounds } from '../../lib/uiSounds.ts';

interface StudentDetailModalProps {
    student: Student | null;
    onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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

    audio.onended = () => setPlayingAudioId(null);

    if (!student) return null;

    return (
        <Dialog open={!!student} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 rounded-[48px] p-0 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 h-[80vh]">
                    <div className="md:col-span-4 bg-slate-900/50 p-8 border-r border-white/5 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="relative inline-block">
                                <UserAvatar src={student.avatar_url} name={student.name} size="xl" className="mx-auto border-4 border-sky-500/20 shadow-2xl" />
                                <div className="absolute -bottom-2 -right-2 bg-sky-500 text-white p-2 rounded-2xl shadow-xl">
                                    <Trophy size={16} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{student.name}</h2>
                                <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mt-1">{student.instrument}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Nível</p>
                                <p className="text-xl font-black text-white">{student.current_level}</p>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Streak</p>
                                <p className="text-xl font-black text-orange-500 flex items-center justify-center gap-1">
                                    <Zap size={14} fill="currentColor" /> {student.current_streak_days}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-8 p-10 overflow-y-auto custom-scrollbar space-y-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acessando Dossiê...</p>
                            </div>
                        ) : (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Headphones size={20} className="text-purple-400" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Últimas Transmissões</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {stats?.recordings.map((rec: any) => (
                                        <div key={rec.id} className="flex items-center gap-4 p-5 bg-slate-900/50 rounded-[28px] border border-white/5 hover:border-sky-500/30 transition-all">
                                            <button 
                                                onClick={() => togglePlay(rec.audio_url, rec.id)}
                                                className={cn(
                                                    "p-4 rounded-2xl transition-all",
                                                    playingAudioId === rec.id ? "bg-sky-500 text-white" : "bg-slate-950 text-sky-400"
                                                )}
                                            >
                                                {playingAudioId === rec.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                            </button>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-white uppercase tracking-tighter">{rec.songs?.title || 'Exercício Técnico'}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1">
                                                        <Calendar size={10} /> {formatDate(rec.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};