import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, Globe, Save, 
    Loader2, Sparkles, Building, Info, Terminal, 
    ShieldAlert, RefreshCw, Palette, Image as ImageIcon,
    Settings2, ChevronRight, CheckCircle2
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
    const [isBrandingOpen, setIsBrandingOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);
    
    // Form States
    const [newSchool, setNewSchool] = useState({ name: '', slug: '' });
    const [brandingForm, setBrandingForm] = useState({
        primaryColor: '#38bdf8',
        secondaryColor: '#0f172a',
        logoUrl: '',
        borderRadius: '24px'
    });

    // ENGINE REALTIME: Monitoramento global da tabela schools
    const { data: tenants, loading, refresh } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });

    const handleCreateSchool = async () => {
        if (!newSchool.name.trim() || !newSchool.slug.trim()) {
            notify.warning("Preencha o nome e o slug da unidade.");
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase.from('schools').insert([{
                name: newSchool.name.trim(),
                slug: newSchool.slug.toLowerCase().trim().replace(/\s+/g, '-'),
                branding: { primaryColor: '#38bdf8', secondaryColor: '#0f172a', borderRadius: '24px' }
            }]);
            if (error) throw error;
            notify.success(`Unidade "${newSchool.name}" provisionada!`);
            setIsAddOpen(false);
            setNewSchool({ name: '', slug: '' });
            await refresh();
        } catch (e: any) {
            notify.error(e.message || "Falha ao provisionar unidade.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenBranding = (school: any) => {
        setSelectedSchool(school);
        setBrandingForm({
            primaryColor: school.branding?.primaryColor || '#38bdf8',
            secondaryColor: school.branding?.secondaryColor || '#0f172a',
            logoUrl: school.branding?.logoUrl || '',
            borderRadius: school.branding?.borderRadius || '24px'
        });
        setIsBrandingOpen(true);
        haptics.light();
    };

    const handleSaveBranding = async () => {
        if (!selectedSchool) return;
        setIsSaving(true);
        haptics.heavy();

        try {
            const { error } = await supabase
                .from('schools')
                .update({ branding: brandingForm })
                .eq('id', selectedSchool.id);

            if (error) throw error;

            notify.success(`Identidade visual de "${selectedSchool.name}" atualizada!`);
            setIsBrandingOpen(false);
            await refresh();
        } catch (e: any) {
            notify.error("Falha ao salvar customização.");
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
                <Button 
                    onClick={() => { setIsAddOpen(true); haptics.light(); }} 
                    leftIcon={Plus} 
                    className="rounded-2xl px-10 py-7 bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-900/20 text-xs font-black uppercase tracking-widest"
                >
                    Provisionar Unidade
                </Button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center py-32 gap-6 opacity-40">
                    <Loader2 className="animate-spin text-sky-500" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Unidades...</p>
                </div>
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
                                schoolId === t.id ? "border-sky-500 ring-2 ring-sky-500/20" : "border-white/5"
                            )}>
                                {/* Preview de Cor no Topo */}
                                <div 
                                    className="h-2 w-full" 
                                    style={{ backgroundColor: t.branding?.primaryColor || '#38bdf8' }}
                                />

                                <div className="p-10 space-y-8 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="p-5 bg-slate-900 rounded-[28px] text-sky-400 group-hover:scale-110 transition-transform shadow-inner">
                                            {t.branding?.logoUrl ? (
                                                <img src={t.branding.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                                            ) : (
                                                <Building2 size={32} />
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleOpenBranding(t)}
                                            className="p-3 bg-slate-900/50 text-slate-500 hover:text-sky-400 rounded-2xl border border-white/5 transition-colors"
                                        >
                                            <Palette size={18} />
                                        </button>
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

                                <div className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-2">
                                    <Button 
                                        onClick={() => handleSelectContext(t.id)}
                                        variant={schoolId === t.id ? "primary" : "ghost"}
                                        className="flex-1 py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em]"
                                    >
                                        {schoolId === t.id ? "Gerenciando" : "Ativar Contexto"}
                                    </Button>
                                </div>
                            </Card>
                        </M.div>
                    ))}
                </div>
            )}

            {/* MODAL DE BRANDING (WHITE LABEL) */}
            <Dialog open={isBrandingOpen} onOpenChange={setIsBrandingOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-12 max-w-xl shadow-2xl">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Customizar Escola</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Ajuste a identidade visual para o modo White Label.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Cor Primária</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="color" 
                                        value={brandingForm.primaryColor}
                                        onChange={e => setBrandingForm({...brandingForm, primaryColor: e.target.value})}
                                        className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer" 
                                    />
                                    <input 
                                        type="text" 
                                        value={brandingForm.primaryColor}
                                        onChange={e => setBrandingForm({...brandingForm, primaryColor: e.target.value})}
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 text-white text-xs font-mono uppercase" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Cor Secundária</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="color" 
                                        value={brandingForm.secondaryColor}
                                        onChange={e => setBrandingForm({...brandingForm, secondaryColor: e.target.value})}
                                        className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer" 
                                    />
                                    <input 
                                        type="text" 
                                        value={brandingForm.secondaryColor}
                                        onChange={e => setBrandingForm({...brandingForm, secondaryColor: e.target.value})}
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 text-white text-xs font-mono uppercase" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">URL do Logo (SVG/PNG)</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                <input 
                                    value={brandingForm.logoUrl}
                                    onChange={e => setBrandingForm({...brandingForm, logoUrl: e.target.value})}
                                    placeholder="https://sua-escola.com/logo.svg"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-xs outline-none focus:ring-2 focus:ring-sky-500/20" 
                                />
                            </div>
                        </div>

                        {/* Preview do Tema */}
                        <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-4">
                            <p className="text-[9px] font-black text-slate-700 uppercase text-center mb-2">Live Preview de Interface</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl shadow-lg" style={{ backgroundColor: brandingForm.primaryColor }} />
                                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: brandingForm.primaryColor }} />
                            </div>
                            <Button 
                                className="w-full py-4 rounded-2xl pointer-events-none" 
                                style={{ backgroundColor: brandingForm.primaryColor }}
                            >
                                Botão Exemplo
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="mt-12 gap-4">
                        <Button variant="ghost" onClick={() => setIsBrandingOpen(false)} className="text-[10px] font-black uppercase text-slate-500">Cancelar</Button>
                        <Button onClick={handleSaveBranding} isLoading={isSaving} className="flex-1 py-8 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-widest shadow-xl" leftIcon={Save}>Salvar Identidade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL DE ADICIONAR ESCOLA (SIMPLIFICADO) */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-12 max-w-xl">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase italic">Provisionar Unidade</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <input value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} placeholder="Nome da Escola" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white" />
                        <input value={newSchool.slug} onChange={e => setNewSchool({...newSchool, slug: e.target.value})} placeholder="slug-da-url" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sky-400 font-mono" />
                    </div>
                    <DialogFooter className="mt-12">
                        <Button onClick={handleCreateSchool} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 text-white font-black uppercase" leftIcon={Save}>Criar Unidade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
