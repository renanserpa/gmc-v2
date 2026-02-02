
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    UserCog, ShieldCheck, Mail, Key, 
    Plus, Loader2, Sparkles, UserPlus, 
    ShieldAlert, Terminal, Users, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { UserRole } from '../../types.ts';
import { provisionStaffMember } from '../../services/dataService.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function SystemConsole() {
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
            // Provisionamento via Bridge Maestro
            await provisionStaffMember(form);
            notify.success(`Staff "${form.fullName}" ativado com autoridade ${form.role.toUpperCase()}!`);
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
                            Creator <span className="text-red-500">Console</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Staff Provisioning & Authority Management</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form de Provisionamento */}
                <Card className="lg:col-span-7 bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 border-b border-white/5 bg-slate-950/40">
                        <CardTitle className="text-xl font-black text-white uppercase flex items-center gap-4">
                            <UserPlus className="text-sky-400" /> Provisionar Equipe GCM
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-2">
                            Novos membros herdam acesso global por padrão.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input 
                                        value={form.fullName}
                                        onChange={e => setForm({...form, fullName: e.target.value})}
                                        placeholder="Ex: Pedro Financeiro" 
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-white outline-none focus:ring-4 focus:ring-sky-500/20 transition-all font-sans" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail Corporativo</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input 
                                        value={form.email}
                                        onChange={e => setForm({...form, email: e.target.value})}
                                        placeholder="adm@adm.com" 
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-white outline-none focus:ring-4 focus:ring-sky-500/20 transition-all font-mono" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Atribuição de Role (Nível de Poder)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { id: UserRole.SaaSAdminGlobal, label: 'Global Admin', desc: 'Visão 360 do Negócio', color: 'border-sky-500 text-sky-400' },
                                        { id: UserRole.SaaSAdminFinance, label: 'Financial Admin', desc: 'Faturamento & Taxas', color: 'border-emerald-500 text-emerald-400' },
                                        { id: UserRole.SaaSAdminOps, label: 'Ops Admin', desc: 'Mestres & Alunos', color: 'border-purple-500 text-purple-400' },
                                        { id: UserRole.TeacherOwner, label: 'Teacher Owner', desc: 'Empreendedor (Franquia)', color: 'border-amber-500 text-amber-400' }
                                    ].map(roleItem => (
                                        <button
                                            key={roleItem.id}
                                            onClick={() => setForm({...form, role: roleItem.id})}
                                            className={cn(
                                                "p-6 rounded-[32px] border-2 transition-all text-left flex flex-col gap-2 group",
                                                form.role === roleItem.id ? `bg-white/5 ${roleItem.color.split(' ')[0]}` : "bg-slate-950 border-white/5 opacity-50"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{roleItem.label}</span>
                                            <span className="text-[8px] font-bold opacity-60 uppercase">{roleItem.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={handleProvision}
                            isLoading={loading}
                            className="w-full py-10 rounded-[40px] bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] shadow-2xl"
                            leftIcon={ShieldCheck}
                        >
                            Ativar Identidade de Staff
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Lateral */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-start gap-5">
                            <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                            <div className="space-y-2">
                                <h5 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Protocolo de Staff</h5>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    O e-mail fornecido deve ser único. O sistema criará um perfil no banco e enviará o link de ativação via Supabase Auth. Membros de staff não podem ser alunos ou professores comuns.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Key className="text-slate-600" size={16} />
                            <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Auditoria Persistente</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic">
                            "Com grandes poderes vêm grandes responsabilidades." <br /> Todas as ações deste staff serão registradas nos Deep Logs do Kernel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
