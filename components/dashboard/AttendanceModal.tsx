import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog.tsx';
import { Student, AttendanceStatus } from '../../types.ts';
import { markAttendance, getTodayAttendanceForClass } from '../../services/dataService.ts';
import { UserAvatar } from '../ui/UserAvatar.tsx';
import { Button } from '../ui/Button.tsx';
import { CheckCircle2, XCircle, Clock, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    musicClass: { id: string, name: string };
    students: Student[];
    professorId: string;
    onSuccess: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, musicClass, students, professorId, onSuccess }) => {
    const [markedStudents, setMarkedStudents] = useState<Record<string, AttendanceStatus>>({});
    const [loadingId, setLoadingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && musicClass.id) {
            getTodayAttendanceForClass(musicClass.id).then(setMarkedStudents);
        }
    }, [isOpen, musicClass.id]);

    const handleMark = async (studentId: string, status: AttendanceStatus) => {
        setLoadingId(studentId);
        try {
            const result = await markAttendance(studentId, musicClass.id, status, professorId);
            
            if (result === true) {
                setMarkedStudents(prev => ({ ...prev, [studentId]: status }));
                haptics.success();
                
                if (status === 'present') notify.success(`Presença confirmada! +20 XP para o aluno.`);
                if (status === 'late') notify.warning(`Atraso registrado. +10 XP para o aluno.`);
                if (status === 'absent') notify.info(`Falta registrada.`);
                
                onSuccess();
            } else {
                notify.warning("Registro já realizado hoje para este aluno.");
            }
        } catch (e) {
            console.error(e);
            notify.error("Falha ao registrar presença.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-800 shadow-2xl">
                <DialogHeader className="border-b border-white/5 pb-4">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                             <Sparkles size={20} />
                        </div>
                        Chamada: {musicClass.name}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        O sistema concede recompensas de XP automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {students.length === 0 ? (
                        <div className="py-10 text-center space-y-2 opacity-40">
                            <AlertCircle className="mx-auto" />
                            <p className="text-xs font-black uppercase tracking-widest">Nenhum aluno nesta turma</p>
                        </div>
                    ) : (
                        students.map(student => {
                            const status = markedStudents[student.id];
                            const isMarked = !!status;

                            return (
                                <motion.div 
                                    layout
                                    key={student.id} 
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                                        isMarked ? "bg-slate-950/50 border-emerald-500/20" : "bg-slate-800/40 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <UserAvatar name={student.name} src={student.avatar_url} size="md" className={cn(isMarked && "opacity-50")} />
                                        <div>
                                            <p className={cn("text-sm font-black transition-colors", isMarked ? "text-slate-500" : "text-white")}>
                                                {student.name}
                                            </p>
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{student.instrument}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {isMarked ? (
                                            <div className={cn(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                status === 'present' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                status === 'late' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {status === 'present' ? 'Presente' : status === 'late' ? 'Atraso' : 'Falta'}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    disabled={loadingId !== null}
                                                    onClick={() => handleMark(student.id, 'present')}
                                                    className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    {loadingId === student.id ? <Loader2 className="animate-spin" size={16} /> : <span className="font-black">P</span>}
                                                </button>
                                                <button 
                                                    disabled={loadingId !== null}
                                                    onClick={() => handleMark(student.id, 'late')}
                                                    className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-500 border border-amber-500/20 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all"
                                                >
                                                    <Clock size={16} />
                                                </button>
                                                <button 
                                                    disabled={loadingId !== null}
                                                    onClick={() => handleMark(student.id, 'absent')}
                                                    className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {Object.keys(markedStudents).length} de {students.length} Registrados
                    </p>
                    <Button variant="ghost" className="text-xs uppercase font-black" onClick={onClose}>Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};