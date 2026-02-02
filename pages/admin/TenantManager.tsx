
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Settings2, Power, Users, Calculator, 
    Calendar, Eye, Layers, ShieldAlert, Ban, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/Dialog.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { useAdmin } from '../../contexts/AdminContext.tsx';
import { formatDate } from '../../lib/date.ts';

const M = motion as any;

export default function TenantManager() {
    const { impersonate } = useAdmin();
    const { data: schools, loading } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });
    const { data: students } = useRealtimeSync<any>('students');
    const { data: profiles } = useRealtimeSync<any>('profiles');
    
    const [selectedSchool, setSelectedSchool] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleStatus = async (school: any) => {
        haptics.heavy();
        const nextStatus = school.is_active ? 'suspended' : 'active';
        const { error } = await supabase
            .from('schools')
            .update({ is_active: !school.is_active, contract_status: nextStatus })
            .eq('id', school.id);
        
        if (error) notify.error("Falha ao alterar status.");
        else notify.success(`Unidade ${!school.is_active ? 'Reativada' : 'Suspensa'}`);
    };

    const handleImpersonate = (school: any) => {
        const owner = profiles.find(p => p.id === school.owner_id);
        if (owner) {
            haptics.heavy();
            notify.warning(`God Mode: Assumindo visão de ${owner.full_name}`);
            impersonate('professor' as any);
        } else {
            notify.error("Proprietário não vinculado.");
        }
    };

    const handleUpdateContract = async () => {
        if (!selectedSchool) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('schools')
                .update({
                    billing_model: selectedSchool.billing_model,
                    monthly_fee: selectedSchool.monthly_fee,
                    fee_per_student: selectedSchool.fee_per_student,
                    contract_status: selectedSchool.contract_status,
                    enabled_modules: selectedSchool.enabled_modules
                })
                .eq('id', selectedSchool.id);
            
            if (error) throw error;
            notify.success("Contrato sincronizado!");
            setIsEditOpen(false);
        } catch (e) {
            notify.error("Erro ao salvar.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <header className="flex justify-between items-center bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                 <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Gestor de <span className="text-sky-500">Unidades</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-widest">Controle de Assinaturas & Provisionamento White Label</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-900/40 rounded-[48px] animate-pulse" />)
                ) : schools.map((school: any) => {
                    const pupilCount = students?.filter((s: any) => s.school_id === school.id).length || 0;
                    const estimatedRevenue = Number(school.monthly_fee) + (Number(school.fee_per_student) * pupilCount);
                    const owner = profiles.find(p => p.id === school.owner_id);

                    return (
                        <Card key={school.id} className={cn(
                            "bg-[#0a0f1d] border rounded-[48px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all group overflow-hidden relative",
                            !school.is_active && "opacity-60 grayscale border-red-500/20"
                        )}>
                            <div className="flex items-center gap-8 flex-1 min-w-0">
                                <div className={cn(
                                    "p-6 rounded-[32px] shadow-inner transition-colors",
                                    school.is_active ? "bg-slate-900 text-sky-400 group-hover:bg-sky-600 group-hover:text-white" : "bg-black text-slate-700"
                                )}>
                                    <Building2 size={32} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic truncate">{school.name}</h3>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                            school.contract_status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {school.contract_status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Mestre: <span className="text-sky-400">{owner?.full_name || 'N/A'}</span></p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 mt-6">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <Users size={12} /> {pupilCount} Alunos
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                            <Calculator size={12} /> {estimatedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /mês
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                <button 
                                    onClick={() => handleImpersonate(school)}
                                    className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-500 hover:text-sky-400 shadow-xl"
                                    title="Acessar Dashboard do Mestre"
                                >
                                    <Eye size={20} />
                                </button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => { setSelectedSchool(school); setIsEditOpen(true); }}
                                    className="rounded-2xl h-14 px-8 border-white/10 text-[10px] font-black uppercase hover:bg-white/5"
                                >
                                    Gerenciar Plano
                                </Button>
                                <button 
                                    onClick={() => handleToggleStatus(school)}
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                                        school.is_active ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" : "bg-emerald-600 text-white"
                                    )}
                                >
                                    {school.is_active ? <Ban size={20} /> : <Power size={20} />}
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 rounded-[56px] p-12 max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    <DialogHeader className="text-center mb-10">
                        <div className="w-16 h-16 bg-sky-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-sky-900/40 mb-6">
                            <Settings2 size={32} />
                        </div>
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Acesso & Billing</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Configuração de Gating e Parâmetros SaaS</DialogDescription>
                    </DialogHeader>

                    {selectedSchool && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Módulos do Produto</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {['gamification', 'financial', 'ai_pitch', 'library'].map(mod => (
                                        <button 
                                            key={mod}
                                            onClick={() => setSelectedSchool({
                                                ...selectedSchool, 
                                                enabled_modules: { ...selectedSchool.enabled_modules, [mod]: !selectedSchool.enabled_modules[mod] }
                                            })}
                                            className={cn(
                                                "p-5 rounded-3xl border-2 flex items-center justify-between transition-all",
                                                selectedSchool.enabled_modules[mod] 
                                                    ? "bg-sky-500/10 border-sky-500 text-white shadow-lg" 
                                                    : "bg-slate-900 border-white/5 text-slate-700"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{mod.replace('_', ' ')}</span>
                                            {selectedSchool.enabled_modules[mod] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Fee Fixo (R$)</label>
                                    <input type="number" value={selectedSchool.monthly_fee} onChange={e => setSelectedSchool({...selectedSchool, monthly_fee: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Status Contrato</label>
                                    <select value={selectedSchool.contract_status} onChange={e => setSelectedSchool({...selectedSchool, contract_status: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white">
                                        <option value="active">Ativo</option>
                                        <option value="trial">Trial</option>
                                        <option value="suspended">Suspenso</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-12">
                        <Button 
                            onClick={handleUpdateContract} 
                            isLoading={isSaving}
                            className="w-full py-8 rounded-[32px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest shadow-2xl"
                        >
                            Propagar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
