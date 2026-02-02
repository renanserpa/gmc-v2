
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Student, AttendanceStatus } from '../../types.ts';
import { markAttendance, getTodayAttendanceForClass, logClassSession } from '../../services/dataService.ts';
import { UserAvatar } from '../ui/UserAvatar.tsx';
import { Button } from '../ui/Button.tsx';
import { CheckCircle2, XCircle, Clock, Loader2, Sparkles, AlertCircle, Save } from 'lucide-react';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    musicClass: { id: string, name: string, school_id: string };
    students: Student[];
    professorId: string;
    onSuccess: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, musicClass, students, professorId, onSuccess }) => {
    const [markedStudents, setMarkedStudents] = useState<Record<string, AttendanceStatus>>({});
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [finishing, setFinishing] = useState(false);

    useEffect(() => {
        if (isOpen && musicClass.id) {
            getTodayAttendanceForClass(musicClass.id).then(setMarkedStudents);
        }
    }, [isOpen, musicClass.id]);

    const handleMark = async (studentId: string, status: AttendanceStatus) => {
        setLoadingId(studentId);
        try {
            await markAttendance(studentId, musicClass.id, status, professorId);
            setMarkedStudents(prev => ({ ...prev, [studentId]: status }));
            haptics.success();
        } catch (e) {
            notify.error("Falha ao registrar presença.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleFinalizeSession = async () => {
        setFinishing(true);
        haptics.heavy();
        try {
            // Lógica ERP: Registra a aula no banco para faturamento do professor
            await logClassSession({
                classId: musicClass.id,
                schoolId: musicClass.school_id,
                teacherId: professorId,
                durationMinutes: 60 // Padrão
            });

            notify.success("Sessão finalizada e log de faturamento gerado!");
            onSuccess();
            onClose();
        } catch (e) {
            notify.error("Erro ao finalizar sessão de faturamento.");
        } finally {
            setFinishing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-800 shadow-2xl rounded-[40px] p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-slate-950/60 border-b border-white/5">
                    <DialogTitle className="flex items-center gap-3 uppercase italic tracking-tighter text-white">
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                             <Sparkles size={20} />
                        </div>
                        Chamada: {musicClass.name}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
                        Sincronização reativa com Kernel Maestro
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-3 max-h-[45vh] overflow-y-auto custom-scrollbar">
                    {students.length === 0 ? (
                        <div className="py-12 text-center space-y-4 opacity-40">
                            <AlertCircle className="mx-auto" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum aluno matriculado nesta turma</p>
                        </div>
                    ) : (
                        students.map(student => {
                            const status = markedStudents[student.id];
                            const isMarked = !!status;

                            return (
                                <div key={student.id} className={cn(
                                    "p-4 rounded-3xl border transition-all flex items-center justify-between",
                                    isMarked ? "bg-slate-950/40 border-emerald-500/20" : "bg-slate-800/40 border-white/5"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <UserAvatar name={student.name} src={student.avatar_url} size="md" className={cn(isMarked && "opacity-50")} />
                                        <span className={cn("text-xs font-black uppercase", isMarked ? "text-slate-600" : "text-white")}>{student.name.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {['present', 'late', 'absent'].map((st) => (
                                            <button 
                                                key={st}
                                                disabled={isMarked || loadingId === student.id}
                                                onClick={() => handleMark(student.id, st as any)}
                                                className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all text-[10px] font-black",
                                                    status === st 
                                                        ? (st === 'present' ? "bg-emerald-500 text-white" : st === 'late' ? "bg-amber-500 text-white" : "bg-red-500 text-white")
                                                        : "bg-slate-900 text-slate-600 hover:text-white"
                                                )}
                                            >
                                                {st.charAt(0).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <DialogFooter className="p-8 bg-slate-950/40 border-t border-white/5">
                    <Button 
                        onClick={handleFinalizeSession} 
                        isLoading={finishing}
                        className="w-full py-7 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-widest shadow-xl"
                        leftIcon={Save}
                    >
                        Finalizar e Logar Aula
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
