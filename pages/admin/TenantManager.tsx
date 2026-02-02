import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, Globe, Hash, Save, X, 
    ShieldCheck, Loader2, Sparkles, LayoutGrid, 
    ChevronRight, MapPin, Palette
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';

const M = motion as any;

export default function TenantManager() {
    const { schoolId, setSchoolOverride } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State
    const [newSchool, setNewSchool] = useState({ name: '', slug: '' });

    // ENGINE REALTIME V7: Monitoramento global da tabela schools
    const { data: tenants, loading, refresh } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });

    const handleCreateSchool = async () => {
        if (!newSchool.name || !newSchool.slug) {
            notify.warning("Preencha o nome e o slug da unidade.");
            return;
        }

        setIsSaving(true);
        haptics.heavy();

        try {
            const { data, error } = await supabase
                .from('schools')
                .insert([{
                    name: newSchool.name,
                    slug: newSchool.slug.toLowerCase().trim().replace(/\s+/g, '-'),
                    branding: { 
                        primaryColor: '#38bdf8', 
                        secondaryColor: '#0f172a', 
                        borderRadius: '24px' 
                    }
                }])
                .select()
                .single();

            if (error) throw error;

            notify.success(`Unidade ${newSchool.name} provisionada!`);
            setIsAddOpen(false);
            setNewSchool({ name: '', slug: '' });
            refresh();
        } catch (e: any) {
            notify.error(`Erro no Kernel: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectContext = (id: string) => {
        haptics.medium();
        setSchoolOverride(id);
        notify.info("Contexto do Kernel Alterado.");
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        School <span className="text-sky-500">Factory</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
                        Provisionamento de Unidades e Governança Multi-Tenant
                    </p>
                </div>
                <Button 
                    onClick={() => setIsAddOpen(true)} 
                    leftIcon={Plus} 
                    className="rounded-2xl px-10 py-7 bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-900/20 text-xs font-black uppercase tracking-widest relative z-10"
                >
                    Projetar Unidade
                </Button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center py-32 gap-6">
                    <Loader2 className="animate-spin text-sky-500" size={48} />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Sincronizando Core...</p>
                </div>
            ) : tenants.length === 0 ? (
                <M.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-32 flex flex-col items-center justify-center text-center px-6 bg-slate-900/20 border-4 border-dashed border-white/5 rounded-[64px]"
                >
                    <div className="w-24 h-24 bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-600 mb-8">
                        <Building2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">O Kernel está Vazio</h2>
                    <p className="text-slate-500 max-w-md mt-4 text-lg leading-relaxed italic">
                        Não existem unidades escolares cadastradas nesta rede. Vamos provisionar a primeira agora.
                    </p>
                    <Button 
                        onClick={() => setIsAddOpen(true)} 
                        className="mt-10 px-12 py-8 rounded-3xl text-sm font-black uppercase tracking-widest"
                        leftIcon={Sparkles}
                    >
                        Provisionar RedHouse Cuiabá
                    </Button>
                </M.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tenants.map((t, idx) => (
                        <M.div 
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={cn(
                                "bg-[#0a0f1d] border transition-all rounded-[56px] overflow-hidden shadow-2xl relative flex flex-col h-full group",
                                schoolId === t.id ? "border-sky-500 ring-2 ring-sky-500/20" : "border-white/5 hover:border-white/20"
                            )}>
                                <div className="p-10 space-y-8 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="p-5 bg-slate-900 rounded-[28px] text-sky-400 group-hover:scale-110 transition-transform">
                                            <Building2 size={32} />
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            t.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {t.is_active ? 'Online' : 'Inativo'}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate leading-none">
                                            {t.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">/{t.slug}</span>
                                        </div>
                                    </div>

                                    <div className="bg-black/20 rounded-3xl p-6 border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between text-[8px] font-black text-slate-600 uppercase">
                                            <span>Kernel ID</span>
                                            <span className="font-mono">{t.id.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[8px] font-black text-slate-600 uppercase">
                                            <span>Sincronia</span>
                                            <span className="text-emerald-500">Live CDC</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-950/50 border-t border-white/5">
                                    <Button 
                                        onClick={() => handleSelectContext(t.id)}
                                        variant={schoolId === t.id ? "primary" : "ghost"}
                                        className="w-full py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em]"
                                    >
                                        {schoolId === t.id ? "Gerenciando Unidade" : "Ativar Contexto"}
                                    </Button>
                                </div>
                            </Card>
                        </M.div>
                    ))}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-12 max-w-xl shadow-2xl">
                    <DialogHeader className="space-y-4 mb-8">
                        <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Plus size={32} />
                        </div>
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Provisionar Unidade</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Criação de novo Tenant isolado por RLS no Banco de Dados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Nome da Escola</label>
                            <input 
                                value={newSchool.name} 
                                onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                                placeholder="Ex: RedHouse School Cuiabá" 
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white text-base outline-none focus:ring-4 focus:ring-sky-500/20 transition-all" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Slug da URL (Único)</label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-sm">/</div>
                                <input 
                                    value={newSchool.slug} 
                                    onChange={e => setNewSchool({...newSchool, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                    placeholder="redhouse-cuiaba" 
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 pl-10 text-sky-400 font-mono text-sm outline-none focus:ring-4 focus:ring-sky-500/20 transition-all" 
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-12 gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsAddOpen(false)} 
                            className="text-[10px] font-black uppercase"
                        >
                            Abortar
                        </Button>
                        <Button 
                            onClick={handleCreateSchool} 
                            isLoading={isSaving} 
                            className="flex-1 py-8 rounded-3xl bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest shadow-2xl" 
                            leftIcon={Save}
                        >
                            Provisionar na Cloud
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
