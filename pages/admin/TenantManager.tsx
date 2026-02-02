import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, Globe, Save, 
    Loader2, Sparkles, Building, Info, Terminal, ShieldAlert, RefreshCw, Key
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
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
    const { schoolId, setSchoolOverride, role, user, refreshProfile } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);
    
    // Form State
    const [newSchool, setNewSchool] = useState({ name: '', slug: '' });

    // ENGINE REALTIME: Monitoramento global da tabela schools
    const { data: tenants, loading, error, refresh } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });

    const handleCreateSchool = async () => {
        if (!newSchool.name.trim() || !newSchool.slug.trim()) {
            notify.warning("Preencha o nome e o slug da unidade.");
            return;
        }

        setIsSaving(true);
        haptics.heavy();

        try {
            const finalSlug = newSchool.slug.toLowerCase().trim().replace(/\s+/g, '-');
            
            const { error: insertError } = await supabase
                .from('schools')
                .insert([{
                    name: newSchool.name.trim(),
                    slug: finalSlug,
                    branding: { 
                        primaryColor: '#38bdf8', 
                        secondaryColor: '#0f172a', 
                        borderRadius: '24px' 
                    }
                }]);

            if (insertError) throw insertError;

            notify.success(`Unidade "${newSchool.name}" provisionada!`);
            setIsAddOpen(false);
            setNewSchool({ name: '', slug: '' });
            await refresh();
        } catch (e: any) {
            console.error("[Kernel Factory Error]", e);
            const msg = e.code === '42501' 
                ? "Permissão Negada: Seu perfil de Super Admin não está ativo no banco." 
                : (e.message || "Falha ao provisionar unidade.");
            notify.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRepairIdentity = async () => {
        setIsRepairing(true);
        haptics.fever();
        try {
            notify.info("Iniciando Protocolo de Reparo...");
            // Forçamos o refresh do perfil via AuthContext
            await refreshProfile();
            notify.success("Identidade Maestro sincronizada. Tente criar a escola novamente.");
        } catch (e) {
            notify.error("Falha no reparo automático.");
        } finally {
            setIsRepairing(false);
        }
    };

    const handleSelectContext = (id: string) => {
        haptics.medium();
        setSchoolOverride(id);
        notify.info("Contexto do Kernel Alterado.");
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3 leading-none">
                        School <span className="text-sky-500">Factory</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                        <Terminal size={12} className="text-sky-500" /> Governança Multi-Tenant GCM Maestro
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <Button 
                        onClick={() => { setIsAddOpen(true); haptics.light(); }} 
                        leftIcon={Plus} 
                        className="rounded-2xl px-10 py-7 bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-900/20 text-xs font-black uppercase tracking-widest"
                    >
                        Provisionar Unidade
                    </Button>
                </div>
            </header>

            {/* DIAGNÓSTICO DE PERMISSÃO (PERFIL PENDENTE) */}
            {role !== 'super_admin' && user?.email === 'serparenan@gmail.com' && (
                <M.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-red-500/10 border-2 border-red-500/20 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
                >
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase italic">Autoridade Root Desincronizada</h3>
                            <p className="text-slate-400 text-sm max-w-md">Você está logado como root, mas o banco de dados ainda não reconheceu seus privilégios de escrita.</p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleRepairIdentity} 
                        isLoading={isRepairing}
                        className="bg-white text-red-600 hover:bg-red-50 font-black uppercase text-[10px] px-8 py-5 rounded-2xl"
                        leftIcon={RefreshCw}
                    >
                        Forçar Reparo de Identidade
                    </Button>
                </M.div>
            )}

            {loading ? (
                <div className="flex flex-col items-center py-32 gap-6 opacity-40">
                    <Loader2 className="animate-spin text-sky-500" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Core...</p>
                </div>
            ) : tenants.length === 0 ? (
                <M.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-32 flex flex-col items-center justify-center text-center px-6 bg-slate-900/20 border-4 border-dashed border-white/5 rounded-[64px]"
                >
                    <div className="w-24 h-24 bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-600 mb-8">
                        <Building2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">O Kernel está Vazio</h2>
                    <p className="text-slate-500 max-w-md mt-4 text-lg leading-relaxed italic">
                        Clique em "Provisionar Unidade" para criar o primeiro tenant.
                    </p>
                </M.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tenants.map((t: any, idx: number) => (
                        <M.div 
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className={cn(
                                "bg-[#0a0f1d] border transition-all rounded-[56px] overflow-hidden shadow-2xl relative flex flex-col h-full group",
                                schoolId === t.id ? "border-sky-500 ring-2 ring-sky-500/20" : "border-white/5 hover:border-white/20"
                            )}>
                                <div className="p-10 space-y-8 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="p-5 bg-slate-900 rounded-[28px] text-sky-400 group-hover:scale-110 transition-transform shadow-inner">
                                            <Building2 size={32} />
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            t.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {t.is_active ? 'Ativa' : 'Inativa'}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate leading-none">
                                            {t.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Globe size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-mono text-sky-500 uppercase tracking-widest">/{t.slug}</span>
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
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Provisionar Unidade</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Criação de novo Tenant isolado no Maestro Core.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Nome da Unidade</label>
                            <input 
                                value={newSchool.name} 
                                onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                                placeholder="Ex: RedHouse School Cuiabá" 
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white text-base outline-none focus:ring-2 focus:ring-sky-500/20" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Slug da URL</label>
                            <input 
                                value={newSchool.slug} 
                                onChange={e => setNewSchool({...newSchool, slug: e.target.value})}
                                placeholder="redhouse-cuiaba" 
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sky-400 font-mono text-sm outline-none focus:ring-2 focus:ring-sky-500/20" 
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-12 gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsAddOpen(false)} 
                            className="text-[10px] font-black uppercase text-slate-500 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleCreateSchool} 
                            isLoading={isSaving} 
                            className="flex-1 py-8 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-widest shadow-xl" 
                            leftIcon={Save}
                        >
                            Confirmar na Cloud
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
