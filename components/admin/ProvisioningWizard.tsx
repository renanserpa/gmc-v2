
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Building2, CreditCard, ChevronRight, 
    CheckCircle2, Loader2, Zap, Layers, Globe, ArrowLeft,
    ShieldCheck, Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

interface ProvisioningWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ProvisioningWizard: React.FC<ProvisioningWizardProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        schoolName: '',
        monthlyFee: 150,
        feePerStudent: 10,
        billingModel: 'fixed',
        modules: {
            gamification: true,
            financial: true,
            ai_pitch: true,
            library: true
        }
    });

    const handleProvision = async () => {
        setLoading(true);
        haptics.heavy();

        try {
            // 1. Provisionar Perfil do Professor (teacher_owner)
            // Em um cenário real, o Supabase Auth cuidaria do convite por e-mail.
            const { data: profile, error: pErr } = await supabase.from('profiles').upsert({
                email: formData.email.toLowerCase().trim(),
                full_name: formData.fullName,
                role: 'teacher_owner',
                reputation_points: 100 // Flag de ativado
            }, { onConflict: 'email' }).select().single();

            if (pErr) throw pErr;

            // 2. Provisionar Unidade Escolar (Tenant) vinculada
            const { error: sErr } = await supabase.from('schools').insert({
                name: formData.schoolName,
                slug: formData.schoolName.toLowerCase().replace(/\s+/g, '-'),
                owner_id: profile.id,
                monthly_fee: formData.monthlyFee,
                fee_per_student: formData.feePerStudent,
                billing_model: formData.billingModel,
                is_active: true,
                contract_status: 'active',
                enabled_modules: formData.modules
            });

            if (sErr) throw sErr;

            notify.success(`Contrato Ativado! ${formData.schoolName} está online.`);
            onSuccess();
            onClose();
            setStep(1);
        } catch (e: any) {
            notify.error("Falha no Provisionamento: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 rounded-[56px] p-0 overflow-hidden shadow-2xl">
                <div className="bg-slate-900/50 p-10 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex gap-2 mb-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", step >= i ? "w-12 bg-sky-500" : "w-4 bg-slate-800")} />
                                ))}
                            </div>
                            <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                                Esteira de <span className="text-sky-500">Vendas</span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-[0.2em]">Deploy de Licenciamento v6.5</DialogDescription>
                        </div>
                        <div className="p-4 bg-sky-600 rounded-3xl text-white shadow-xl shadow-sky-900/30">
                            <Zap size={32} />
                        </div>
                    </div>
                </div>

                <div className="p-12">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <M.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identidade do Mestre (Proprietário)</p>
                                    <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nome Completo do Professor" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/20" />
                                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="E-mail de Acesso" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-sky-500/20 font-mono" />
                                </div>
                                <Button onClick={() => setStep(2)} className="w-full py-8 rounded-3xl" rightIcon={ChevronRight}>Próximo Passo</Button>
                            </M.div>
                        )}

                        {step === 2 && (
                            <M.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Configuração da Unidade (Tenant)</p>
                                    <input value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} placeholder="Nome da Escola (Ex: RedHouse Cuiabá)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none" />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase ml-1">Fee Fixo (R$)</label>
                                            <input type="number" value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white font-mono" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase ml-1">Royalty/Aluno (R$)</label>
                                            <input type="number" value={formData.feePerStudent} onChange={e => setFormData({...formData, feePerStudent: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white font-mono" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-8 rounded-3xl"><ArrowLeft size={18} /></Button>
                                    <Button onClick={() => setStep(3)} className="flex-[3] py-8 rounded-3xl" rightIcon={ChevronRight}>Configurar Módulos</Button>
                                </div>
                            </M.div>
                        )}

                        {step === 3 && (
                            <M.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recursos Habilitados (Gating)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(formData.modules).map(([key, val]) => (
                                            <button 
                                                key={key}
                                                onClick={() => setFormData({...formData, modules: {...formData.modules, [key]: !val}})}
                                                className={cn(
                                                    "p-5 rounded-3xl border-2 flex items-center justify-between transition-all",
                                                    val ? "bg-sky-500/10 border-sky-500 text-white shadow-lg" : "bg-slate-950 border-white/5 text-slate-700"
                                                )}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{key.replace('_', ' ')}</span>
                                                {val ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-slate-800" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-8 rounded-3xl"><ArrowLeft size={18} /></Button>
                                    <Button 
                                        onClick={handleProvision} 
                                        isLoading={loading}
                                        className="flex-[3] py-8 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-2xl"
                                        leftIcon={ShieldCheck}
                                    >
                                        Ativar Novo Cliente
                                    </Button>
                                </div>
                            </M.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};
