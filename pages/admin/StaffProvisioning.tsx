
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    UserCog, ShieldCheck, Mail, Key, 
    Plus, Loader2, UserPlus, 
    ShieldAlert, Terminal, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { UserRole } from '../../types.ts';
import { provisionStaffMember } from '../../services/dataService.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function StaffProvisioning() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        role: UserRole.SaaSAdminGlobal as UserRole
    });

    const handleProvision = async () => {
        if (!form.fullName || !form.email) {
            notify.error("Preencha todos os campos da identidade staff.");
            return;
        }
        setLoading(true);
        haptics.heavy();
        try {
            await provisionStaffMember(form);
            notify.success(`Staff "${form.fullName}" ativado!`);
            setForm({ fullName: '', email: '', role: UserRole.SaaSAdminGlobal });
        } catch (e: any) {
            notify.error("Falha no provisionamento: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl">
                        <Terminal size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                            Staff <span className="text-red-500">Provisioning</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Gestão de Autoridade Governamental</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-7 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 border-b border-white/5 bg-slate-950/40">
                        <CardTitle className="text-xl font-black text-white uppercase flex items-center gap-4">
                            <UserPlus className="text-sky-400" /> Ativar Membro Equipe
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome Completo</label>
                                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-5 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail Corporativo</label>
                                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-5 text-white font-mono" />
                            </div>
                        </div>
                        <Button onClick={handleProvision} isLoading={loading} className="w-full py-10 rounded-[40px] bg-red-600 font-black uppercase tracking-[0.3em]" leftIcon={ShieldCheck}>
                            Confirmar Ativação
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
