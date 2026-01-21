
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Megaphone, Plus, Bell, Calendar, User, Users, Trash2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getNotices, createNotice, getMusicClasses } from '../services/dataService';
import { Notice, MusicClass } from '../types';
import { Button } from '../components/ui/Button';
// Fix: Added DialogDescription to Dialog imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/Dialog';
import { notify } from '../lib/notification';
import { motion } from 'framer-motion';
import { formatDate } from '../lib/date';
import { cn } from '../lib/utils';

export default function NoticeBoardPage() {
    const { user, role } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [classes, setClasses] = useState<MusicClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [newNotice, setNewNotice] = useState({
        title: '', message: '', target_audience: 'all'
    });

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user, role]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [noticesData, classesData] = await Promise.all([
                getNotices(user.id, role === 'professor' ? 'all' : 'student'),
                role === 'professor' ? getMusicClasses(user.id) : Promise.resolve([])
            ]);
            setNotices(noticesData);
            setClasses(classesData);
        } catch (e) {
            notify.error("Erro ao carregar avisos.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNotice = async () => {
        if (!newNotice.title || !newNotice.message) return;
        try {
            await createNotice({
                ...newNotice,
                professor_id: user.id,
                created_at: new Date().toISOString()
            });
            notify.success("Aviso publicado!");
            setIsAddOpen(false);
            loadData();
        } catch (e) {
            notify.error("Falha ao publicar aviso.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Mural de Avisos</h1>
                    <p className="text-slate-500 font-medium">Comunicação direta entre Maestro e Alunos.</p>
                </div>
                {role === 'professor' && (
                    <Button onClick={() => setIsAddOpen(true)} leftIcon={Plus} className="px-8 py-6 rounded-2xl">
                        Publicar Aviso
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <main className="lg:col-span-8 space-y-4">
                    {loading ? (
                        <div className="p-20 text-center text-slate-600 animate-pulse uppercase font-black tracking-widest text-xs">Sincronizando mural...</div>
                    ) : notices.length === 0 ? (
                        <div className="p-20 border-2 border-dashed border-slate-800 rounded-[40px] text-center">
                            <Megaphone size={48} className="mx-auto text-slate-700 mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest">Nenhum aviso publicado.</p>
                        </div>
                    ) : (
                        notices.map((notice, idx) => (
                            <motion.div 
                                key={notice.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="bg-slate-900 border-white/5 hover:border-sky-500/20 transition-all p-6 rounded-[32px]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase">{notice.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar size={12} className="text-slate-600" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{formatDate(notice.created_at, 'dd/MM/yyyy')}</span>
                                                    <span className="text-slate-700">•</span>
                                                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                                                        {notice.target_audience === 'all' ? 'Todos os Alunos' : 'Turma Específica'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {role === 'professor' && (
                                            <button className="text-slate-700 hover:text-red-400 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{notice.message}</p>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </main>

                <aside className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-950 border-slate-800 rounded-[32px] overflow-hidden">
                        <CardHeader className="bg-slate-900/50 p-6">
                            <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Megaphone size={14} /> Estatísticas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Avisos este mês</span>
                                <span className="text-lg font-black text-white">{notices.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Taxa de visualização</span>
                                <span className="text-lg font-black text-emerald-400">85%</span>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>

            {/* Modal: Publicar Aviso */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Publicar Novo Aviso</DialogTitle>
                        <DialogDescription>Isso aparecerá instantaneamente no topo do Dashboard dos alunos.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Título do Aviso</label>
                            <input 
                                value={newNotice.title} 
                                onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                                placeholder="Ex: Aula Extra de Técnica"
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Destinatários</label>
                            <select 
                                value={newNotice.target_audience}
                                onChange={e => setNewNotice({...newNotice, target_audience: e.target.value})}
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm"
                            >
                                <option value="all">Todos os meus Alunos</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>Apenas Turma: {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Mensagem</label>
                            <textarea 
                                value={newNotice.message} 
                                onChange={e => setNewNotice({...newNotice, message: e.target.value})}
                                rows={5}
                                placeholder="Escreva o conteúdo do comunicado aqui..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm resize-none" 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateNotice} leftIcon={Send}>Publicar Agora</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
