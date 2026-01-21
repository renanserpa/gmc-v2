
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Megaphone, X, ChevronRight, Bell } from 'lucide-react';
import { getNotices } from '../services/dataService';
import { Notice } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/date';
import { cn } from '../lib/utils';

export const NoticeBoardWidget: React.FC<{ studentId?: string }> = ({ studentId }) => {
    const { user, role } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (role === 'student' || role === 'guardian') {
            const target = studentId || user.id;
            getNotices(target, 'student').then(data => {
                setNotices(data.slice(0, 3));
                setLoading(false);
            });
        }
    }, [user, role, studentId]);

    if (loading || notices.length === 0) return null;

    return (
        <Card className="bg-gradient-to-r from-sky-600/20 to-transparent border-sky-500/20 rounded-[40px] overflow-hidden mb-8">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <Megaphone size={16} className="text-sky-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Mural de Avisos Maestro</h3>
                </div>
                
                <div className="space-y-3">
                    {notices.map(notice => (
                        <motion.div 
                            key={notice.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex items-start gap-4 group hover:border-sky-500/30 transition-all cursor-pointer"
                        >
                            <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                                <Bell size={18} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-black text-white uppercase">{notice.title}</h4>
                                    <span className="text-[9px] font-mono text-slate-600">{formatDate(notice.created_at, 'dd/MM')}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 line-clamp-2">{notice.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
