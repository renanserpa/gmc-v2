
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, Globe, Save, 
    Loader2, Sparkles, Building, Info, 
    ShieldAlert, RefreshCw, Settings2, 
    ChevronRight, CheckCircle2, Trash2,
    /* Added 'Users' to imports to resolve the 'Cannot find name Users' error */
    DollarSign, Power, Ban, UserCheck, Users
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
    const { user } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newSchool, setNewSchool] = useState({ name: '', slug: '', monthly_fee: 150 });

    const { data: tenants, loading } = useRealtimeSync<any>('schools', undefined, { column: 'name', ascending: true });
    const { data: students } = useRealtimeSync<any>('students');

    const handleCreateSchool = async () => {
        if (!newSchool.name.trim()) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('schools').insert([{
                name: newSchool.name,
                slug: newSchool.slug || newSchool.name.toLowerCase().replace(/\s+/g, '-'),
                owner_id: user.id,
                monthly_fee: newSchool.monthly_fee,
                is_active: true
            }]);
            if (error) throw error;
            notify.success("Unidade ativada no Kernel!");
            setIsAddOpen(false);
        } catch (e: any) {
            notify.error("Falha no provisionamento.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSchoolStatus = async (id: string, currentStatus: boolean) => {
        haptics.heavy();
        const { error } = await supabase.from('schools').update({ is_active: !currentStatus }).eq('id', id);
        if (error) notify.error("Falha no Kill Switch.");
        else notify.warning(`Unidade ${!currentStatus ? 'ATIVADA' : 'SUSPENSA'}.`);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-center bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Gestão de <span className="text-sky-500">Unidades</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-widest">Controle de Acesso e Contratos SaaS</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} leftIcon={Plus} className="rounded-3xl px-10 h-16 bg-sky-600 font-black uppercase text-xs shadow-2xl">Provisionar Escola</Button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center animate-pulse"><Loader2 className="animate-spin mx-auto" /></div>
                ) : tenants.map((t: any) => {
                    const schoolStudents = students.filter((s: any) => s.school_id === t.id).length;
                    return (
                        <Card key={t.id} className={cn(
                            "bg-[#0a0f1d] border rounded-[48px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all",
                            t.is_active ? "border-white/5" : "border-red-500/20 bg-red-950/5 grayscale"
                        )}>
                            <div className="flex items-center gap-8 flex-1">
                                <div className={cn("p-6 rounded-[32px] shadow-inner", t.is_active ? "bg-slate-900 text-sky-400" : "bg-black text-slate-700")}>
                                    <Building2 size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">{t.name}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            {/* Fix: Added Users icon from lucide-react */}
                                            <Users size={12} /> {schoolStudents} Alunos
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                            <DollarSign size={12} /> R$ {t.monthly_fee}/mês
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="rounded-2xl border-white/10 text-[10px] font-black uppercase">Editar Contrato</Button>
                                <button 
                                    onClick={() => toggleSchoolStatus(t.id, t.is_active)}
                                    className={cn(
                                        "px-6 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase transition-all shadow-xl",
                                        t.is_active ? "bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white" : "bg-emerald-600 text-white"
                                    )}
                                >
                                    {t.is_active ? <Ban size={14} /> : <Power size={14} />}
                                    {t.is_active ? "Suspender" : "Reativar"}
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 rounded-[56px] p-12 max-w-xl">
                    <DialogHeader className="text-center mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter italic">Lançar Nova Unidade</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nome da Escola</label>
                            <input value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white" placeholder="Ex: RedHouse Cuiabá" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Fee Fixo Mensal (R$)</label>
                            <input type="number" value={newSchool.monthly_fee} onChange={e => setNewSchool({...newSchool, monthly_fee: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white" />
                        </div>
                    </div>
                    <DialogFooter className="mt-10">
                        <Button onClick={handleCreateSchool} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 font-black uppercase">Confirmar Abertura</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
