import React from 'react';
// FIX: CardDescription is now exported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, UserPlus, Star, GraduationCap, Clock, MoreVertical, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

export default function TeacherManager() {
    const teachers = [
        { id: '1', name: 'Renan Serpa', classes: 8, students: 32, academyScore: 1200, status: 'Admin' },
        { id: '2', name: 'Ana Beatriz', classes: 5, students: 18, academyScore: 850, status: 'Ativo' },
        { id: '3', name: 'Carlos Guitar', classes: 2, students: 6, academyScore: 150, status: 'Treinamento' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Corpo Docente</h1>
                    <p className="text-slate-500 mt-1">Gerencie permissões e monitore o engajamento dos professores.</p>
                </div>
                {/* FIX: The 'leftIcon' prop is now supported by the updated Button component */}
                <Button 
                    leftIcon={UserPlus} 
                    onClick={() => haptics.medium()}
                    className="px-8 shadow-xl shadow-sky-900/10"
                >
                    Convidar Professor
                </Button>
            </header>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden rounded-[32px]">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Professor</th>
                                    <th className="px-6 py-4">Turmas Ativas</th>
                                    <th className="px-6 py-4">Total Alunos</th>
                                    <th className="px-6 py-4">Score Academy</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teachers.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center font-black text-slate-500">
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-slate-900 uppercase block">{t.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Membro desde 2023</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{t.classes}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{t.students}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 bg-purple-50 text-purple-600 px-2 py-1 rounded-lg w-fit text-xs font-black">
                                                <Star size={12} fill="currentColor" /> {t.academyScore}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-1 rounded-lg border",
                                                t.status === 'Admin' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                t.status === 'Ativo' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                            )}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-sky-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-12 bg-white/10 blur-3xl rounded-full" />
                    <GraduationCap className="mb-4 opacity-50" size={32} />
                    <h3 className="text-xl font-black uppercase leading-none">Academy Sync</h3>
                    <p className="text-sky-100 text-xs mt-3 leading-relaxed">
                        Seus professores concluíram 85% dos módulos de inclusão este mês.
                    </p>
                    <div className="mt-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                        Ver Ranking Academy <ArrowRight size={12} />
                    </div>
                </motion.div>

                <div className="bg-white border border-slate-200 p-8 rounded-[40px] flex flex-col justify-between shadow-sm">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NPS Médio</p>
                        <h4 className="text-3xl font-black text-slate-900">9.4</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Satisfação dos alunos com o corpo docente atual.</p>
                </div>
            </div>
        </div>
    );
}