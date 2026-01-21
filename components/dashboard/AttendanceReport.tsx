
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Student } from '../../types';
import { getStudentAttendanceRate } from '../../services/dataService';
import { ClipboardCheck, TrendingUp, AlertCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AttendanceReportProps {
    students: Student[];
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ students }) => {
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRates = async () => {
            const results: Record<string, number> = {};
            await Promise.all(students.map(async (s) => {
                results[s.id] = await getStudentAttendanceRate(s.id);
            }));
            setRates(results);
            setLoading(false);
        };
        loadRates();
    }, [students]);

    if (loading) return <div className="p-8 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest text-[10px]">Calculando métricas de assiduidade...</div>;

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="text-sky-400" size={20} /> Mapa de Assiduidade Maestro
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map(s => {
                        const rate = rates[s.id] || 0;
                        const isLow = rate < 75;

                        return (
                            <motion.div 
                                key={s.id}
                                whileHover={{ y: -2 }}
                                className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center justify-between"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-white truncate max-w-[120px]">{s.name}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{s.instrument}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className={cn(
                                        "px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter flex items-center gap-1 border",
                                        rate >= 90 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        rate >= 75 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>
                                        {isLow && <AlertCircle size={10} />}
                                        {rate}%
                                    </div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase mt-1">Frequência</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="mt-6 p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10 flex items-start gap-3">
                    <TrendingUp className="text-sky-400 shrink-0" size={16} />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        <strong className="text-sky-400 uppercase">Dica Maestro:</strong> Alunos com assiduidade acima de 90% tendem a completar missões 3x mais rápido. O sistema concede XP bônus automaticamente por presença!
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
