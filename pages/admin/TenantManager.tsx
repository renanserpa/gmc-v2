import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, Globe, Save, 
    Loader2, Sparkles, Building, Info, Terminal, 
    ShieldAlert, RefreshCw, Palette, Image as ImageIcon,
    Settings2, ChevronRight, CheckCircle2, Upload, Trash2,
    FileText, Phone, User, DollarSign, ShieldCheck
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

type ModalTab = 'branding' | 'admin';

export default function TenantManager() {
    const { schoolId, setSchoolOverride } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isBrandingOpen, setIsBrandingOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ModalTab>('branding');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);
    
    // Form States
    const [newSchool, setNewSchool] = useState({ name: '', slug: '' });
    const [editForm, setEditForm] = useState({
        name: '',
        cnpj: '',
        contact_manager: '',
        contact_phone: '',
        fee_per_student: 0,
        contract_status: 'trial',
        branding: {
            primaryColor: '#38bdf8',
            secondaryColor: '#0f172a',
            logoUrl: '',
            borderRadius: '24px'
        }
    });

    const [brandingForm, setBrandingForm] = useState({
        primaryColor: '#38bdf8',
        secondaryColor: '#0f172a',
        logoUrl: '',
        borderRadius: '24px'
    });

    // ENGINE REALTIME: Sincronização estabilizada
    const { data: tenants, setData: setTenants, loading } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });

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
        } catch (e: any) {
            notify.error(e.message || "Falha ao provisionar unidade.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedSchool) return;

        setIsUploading(true);
        haptics.medium();

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logos/${selectedSchool.id}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('branding')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('branding')
                .getPublicUrl(fileName);

            if (isBrandingOpen) {
                setBrandingForm(prev => ({ ...prev, logoUrl: publicUrl }));
            } else {
                setEditForm(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, logoUrl: publicUrl } 
                }));
            }
            notify.success("Logo carregado com sucesso!");
        } catch (err: any) {
            console.error(err);
            notify.error("Erro no upload do logo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenEdit = (school: any) => {
        setSelectedSchool(school);
        setEditForm({
            name: school.name || '',
            cnpj: school.cnpj || '',
            contact_manager: school.contact_manager || '',
            contact_phone: school.contact_phone || '',
            fee_per_student: school.fee_per_student || 0,
            contract_status: school.contract_status || 'trial',
            branding: {
                primaryColor: school.branding?.primaryColor || '#38bdf8',
                secondaryColor: school.branding?.secondaryColor || '#0f172a',
                logoUrl: school.branding?.logoUrl || '',
                borderRadius: school.branding?.borderRadius || '24px'
            }
        });
        setActiveTab('branding');
        setIsEditOpen(true);
        setShowSuccess(false);
        haptics.light();
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
        setShowSuccess(false);
        haptics.light();
    };

    const handleSaveSchool = async () => {
        if (!selectedSchool) return;
        setIsSaving(true);
        haptics.heavy();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const { error } = await supabase
                .from('schools')
                .update({ 
                    name: editForm.name,
                    cnpj: editForm.cnpj,
                    contact_manager: editForm.contact_manager,
                    contact_phone: editForm.contact_phone,
                    fee_per_student: editForm.fee_per_student,
                    contract_status: editForm.contract_status,
                    branding: editForm.branding 
                })
                .eq('id', selectedSchool.id)
                .select()
                .single();

            if (error) throw error;

            console.log(`[Maestro Admin] Escola [${editForm.name}] atualizada com sucesso.`);

            setTenants(prev => prev.map(t => t.id === selectedSchool.id ? { ...t, ...editForm } : t));

            setShowSuccess(true);
            haptics.success();
            notify.success(`Unidade "${editForm.name}" sincronizada!`);
            
            // Aguarda a animação de sucesso antes de fechar
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsEditOpen(false);
        } catch (e: any) {
            if (e.name === 'AbortError') {
                notify.error("O servidor demorou demais para responder.");
            } else {
                notify.error("Falha ao salvar alterações.");
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    const handleSaveBranding = async () => {
        if (!selectedSchool) return;
        setIsSaving(true);
        haptics.heavy();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const { error } = await supabase
                .from('schools')
                .update({ branding: brandingForm })
                .eq('id', selectedSchool.id)
                .select()
                .single();

            if (error) throw error;

            setTenants(prev => prev.map(t => t.id === selectedSchool.id ? { ...t, branding: brandingForm } : t));

            setShowSuccess(true);
            haptics.success();
            notify.success(`Identidade de "${selectedSchool.name}" sincronizada!`);
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsBrandingOpen(false);
        } catch (e: any) {
            if (e.name === 'AbortError') {
                notify.error("O servidor demorou demais para responder.");
            } else {
                notify.error("Falha ao salvar customização.");
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    const handleSelectContext = (id: string) => {
        haptics.medium();
        setSchoolOverride(id);
        notify.info("Contexto do Kernel Alterado.");
    };

    const getStatusBadge = (status: string) => {
        const configs: any = {
            trial: { label: 'Trial', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
            active: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
            suspended: { label: 'Suspenso', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
            canceled: { label: 'Cancelado', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' }
        };
        const config = configs[status] || configs.trial;
        return <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest", config.color)}>{config.label}</span>;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto px-4">
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
                                <div 
                                    className="h-2 w-full" 
                                    style={{ backgroundColor: t.branding?.primaryColor || '#38bdf8' }}
                                />

                                <div className="p-10 space-y-8 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="p-5 bg-slate-900 rounded-[28px] text-sky-400 group-hover:scale-110 transition-transform shadow-inner overflow-hidden border border-white/5">
                                            {t.branding?.logoUrl ? (
                                                <img src={t.branding.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                                            ) : (
                                                <Building2 size={32} />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(t.contract_status)}
                                            <button 
                                                onClick={() => handleOpenEdit(t)}
                                                className="p-3 bg-slate-900/50 text-slate-500 hover:text-sky-400 rounded-2xl border border-white/5 transition-colors"
                                            >
                                                <Settings2 size={18} />
                                            </button>
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

            {/* MODAL DE EDIÇÃO (TABS) */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-0 max-w-2xl shadow-2xl overflow-hidden">
                    <div className="flex flex-col h-[90vh]">
                        <DialogHeader className="p-12 pb-6 shrink-0">
                            <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Gerenciar Unidade</DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                Alterações impactam em tempo real o White Label e o Dashboard de {selectedSchool?.name}.
                            </DialogDescription>
                            
                            {/* Abas Estilizadas */}
                            <div className="flex gap-2 mt-8 bg-slate-950 p-1.5 rounded-[20px] border border-white/5">
                                <button 
                                    onClick={() => { setActiveTab('branding'); haptics.light(); }}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === 'branding' ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <Palette size={14} /> Identidade Visual
                                </button>
                                <button 
                                    onClick={() => { setActiveTab('admin'); haptics.light(); }}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === 'admin' ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <ShieldCheck size={14} /> Administrativo
                                </button>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-12 py-6 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {activeTab === 'branding' ? (
                                    <M.div 
                                        key="branding"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-10"
                                    >
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                                <ImageIcon size={14} /> Logotipo da Unidade
                                            </label>
                                            <div className="flex items-center gap-6 p-6 bg-slate-950 rounded-3xl border border-white/5">
                                                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden group">
                                                    {editForm.branding.logoUrl ? (
                                                        <img src={editForm.branding.logoUrl} className="w-full h-full object-contain" alt="Preview" />
                                                    ) : (
                                                        <Building2 className="text-slate-700" size={32} />
                                                    )}
                                                    {isUploading && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <Loader2 className="animate-spin text-sky-500" size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg flex items-center gap-2">
                                                        <Upload size={14} /> {isUploading ? 'Enviando...' : 'Selecionar Logo'}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} disabled={isUploading} />
                                                    </label>
                                                    <button 
                                                        onClick={() => setEditForm(prev => ({ ...prev, branding: { ...prev.branding, logoUrl: '' } }))}
                                                        className="text-[9px] font-black text-slate-600 hover:text-red-500 uppercase text-left ml-1 transition-colors"
                                                    >
                                                        Remover Imagem
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Cor Primária</label>
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="color" 
                                                        value={editForm.branding.primaryColor}
                                                        onChange={e => setEditForm(prev => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))}
                                                        className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0" 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={editForm.branding.primaryColor}
                                                        onChange={e => setEditForm(prev => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))}
                                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 text-white text-xs font-mono uppercase" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Arredondamento</label>
                                                <select 
                                                    value={editForm.branding.borderRadius}
                                                    onChange={e => setEditForm(prev => ({ ...prev, branding: { ...prev.branding, borderRadius: e.target.value } }))}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 h-12 text-white text-xs uppercase font-bold outline-none"
                                                >
                                                    <option value="0px">Quadrado</option>
                                                    <option value="12px">Suave</option>
                                                    <option value="24px">Maestro (Padrão)</option>
                                                    <option value="48px">Super Curvado</option>
                                                </select>
                                            </div>
                                        </div>
                                    </M.div>
                                ) : (
                                    <M.div 
                                        key="admin"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8 pb-8"
                                    >
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                                    <Building size={14} /> Nome da Unidade
                                                </label>
                                                <input 
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
                                                    placeholder="Ex: RedHouse Cuiabá"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                                        <FileText size={14} /> CNPJ
                                                    </label>
                                                    <input 
                                                        value={editForm.cnpj}
                                                        onChange={e => setEditForm({...editForm, cnpj: e.target.value})}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none font-mono"
                                                        placeholder="00.000.000/0000-00"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                                        <ShieldCheck size={14} /> Status Contrato
                                                    </label>
                                                    <select 
                                                        value={editForm.contract_status}
                                                        onChange={e => setEditForm({...editForm, contract_status: e.target.value})}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm appearance-none outline-none"
                                                    >
                                                        <option value="trial">Trial (Teste)</option>
                                                        <option value="active">Ativo (Pago)</option>
                                                        <option value="suspended">Suspenso</option>
                                                        <option value="canceled">Cancelado</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                                        <User size={14} /> Gestor Responsável
                                                    </label>
                                                    <input 
                                                        value={editForm.contact_manager}
                                                        onChange={e => setEditForm({...editForm, contact_manager: e.target.value})}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none"
                                                        placeholder="Nome do Diretor(a)"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                                        <Phone size={14} /> Telefone Contato
                                                    </label>
                                                    <input 
                                                        value={editForm.contact_phone}
                                                        onChange={e => setEditForm({...editForm, contact_phone: e.target.value})}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none"
                                                        placeholder="(00) 00000-0000"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                                    <DollarSign size={14} /> Valor por Aluno Ativo (Royalty)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">R$</span>
                                                    <input 
                                                        type="number"
                                                        value={editForm.fee_per_student}
                                                        onChange={e => setEditForm({...editForm, fee_per_student: parseFloat(e.target.value)})}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 pl-10 text-white text-sm outline-none font-mono"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </M.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <DialogFooter className="p-8 bg-slate-950 border-t border-white/5 shrink-0 gap-4">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="text-[10px] font-black uppercase text-slate-500">Descartar</Button>
                            <Button 
                                onClick={handleSaveSchool} 
                                isLoading={isSaving} 
                                className={cn(
                                    "flex-1 py-8 rounded-3xl text-white font-black uppercase tracking-widest shadow-xl transition-all duration-500",
                                    showSuccess ? "bg-emerald-600 scale-105" : "bg-sky-600"
                                )} 
                                leftIcon={showSuccess ? CheckCircle2 : Save}
                            >
                                {showSuccess ? "Sincronizado!" : "Salvar Alterações"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL DE BRANDING (WHITE LABEL) */}
            <Dialog open={isBrandingOpen} onOpenChange={setIsBrandingOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-12 max-w-xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Customizar Escola</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Ajuste a identidade visual para o modo White Label da {selectedSchool?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                                <ImageIcon size={14} /> Logotipo da Unidade
                            </label>
                            <div className="flex items-center gap-6 p-6 bg-slate-950 rounded-3xl border border-white/5">
                                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden group">
                                    {brandingForm.logoUrl ? (
                                        <img src={brandingForm.logoUrl} className="w-full h-full object-contain" alt="Preview" />
                                    ) : (
                                        <Building2 className="text-slate-700" size={32} />
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-sky-500" size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg flex items-center gap-2">
                                        <Upload size={14} /> {isUploading ? 'Enviando...' : 'Selecionar Logo'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} disabled={isUploading} />
                                    </label>
                                    <button 
                                        onClick={() => setBrandingForm({...brandingForm, logoUrl: ''})}
                                        className="text-[9px] font-black text-slate-600 hover:text-red-500 uppercase text-left ml-1 transition-colors"
                                    >
                                        Remover Imagem
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Cor Primária</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="color" 
                                        value={brandingForm.primaryColor}
                                        onChange={e => setBrandingForm({...brandingForm, primaryColor: e.target.value})}
                                        className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0" 
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
                                        className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0" 
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

                        {/* Preview do Tema */}
                        <div className="p-8 bg-slate-950 rounded-[40px] border border-white/5 space-y-6">
                            <p className="text-[9px] font-black text-slate-700 uppercase text-center mb-2 tracking-[0.3em]">Live Core Preview</p>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl shadow-lg border border-white/10 flex items-center justify-center bg-slate-900">
                                     {brandingForm.logoUrl ? <img src={brandingForm.logoUrl} className="w-8 h-8 object-contain" alt="Logo" /> : <Building2 className="text-slate-800" />}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-2 w-2/3 rounded-full opacity-20" style={{ backgroundColor: brandingForm.primaryColor }} />
                                    <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: brandingForm.primaryColor }} />
                                </div>
                            </div>
                            <Button 
                                className="w-full py-6 rounded-2xl pointer-events-none shadow-xl border-none font-black uppercase text-[10px] tracking-widest" 
                                style={{ backgroundColor: brandingForm.primaryColor }}
                            >
                                Botão Exemplo Unitário
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="mt-12 gap-4">
                        <Button variant="ghost" onClick={() => setIsBrandingOpen(false)} className="text-[10px] font-black uppercase text-slate-500">Descartar</Button>
                        <Button 
                            onClick={handleSaveBranding} 
                            isLoading={isSaving} 
                            className={cn(
                                "flex-1 py-8 rounded-3xl text-white font-black uppercase tracking-widest shadow-xl transition-all duration-500",
                                showSuccess ? "bg-emerald-600 scale-105" : "bg-sky-600"
                            )} 
                            leftIcon={showSuccess ? CheckCircle2 : Save}
                        >
                            {showSuccess ? "Sincronizado!" : "Salvar e Propagar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-12 max-w-xl">
                    <DialogHeader className="mb-8 text-center space-y-4">
                        <div className="w-20 h-20 bg-sky-600 rounded-[32px] flex items-center justify-center mx-auto text-white shadow-xl shadow-sky-900/20"><Building size={40} /></div>
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Nova Unidade</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <input value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} placeholder="Nome da Escola (Ex: RedHouse)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/20" />
                        <input value={newSchool.slug} onChange={e => setNewSchool({...newSchool, slug: e.target.value})} placeholder="slug-da-url (Ex: cuiaba)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sky-400 font-mono outline-none focus:ring-4 focus:ring-sky-500/20" />
                    </div>
                    <DialogFooter className="mt-12">
                        <Button onClick={handleCreateSchool} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-widest shadow-xl" leftIcon={Save}>Finalizar Provisionamento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
