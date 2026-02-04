
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Terminal, ShieldCheck, UserPlus, Mail, 
    Lock, ShieldAlert, Cpu, Zap, Activity,
    Shield, Building2, UserCog, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { supabase } from '../lib/supabaseClient.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';
import { UserRole } from '../types.ts';
import { cn } from '../lib/utils.ts';

const M = motion as any;

export default function SystemConsole() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'saas_admin_global'
    });

    const handleCreateAdmin = async () => {
        if (!form.email || !form.password || !form.fullName) {
            notify.error("Preencha todos os campos do manifesto de identidade.");
            return;
        }

        setLoading(true);
        haptics.heavy();

        try {
            // 1. Criar Usuário no Auth (Conceitualmente via signUp no client)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.fullName,
                        role: form.role
                    }
                }
            });

            if (authError) throw authError;

            // 2. Forçar entrada na tabela profiles (Garantia de Sincronia)
            if (authData.user) {
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    email: form.email,
                    full_name: form.fullName,
                    role: form.role,
                    created_at: new Date().toISOString()
                });
                if (profileError) throw profileError;
            }

            notify.success(`Identidade [${form.role}] provisionada com sucesso!`);
            setForm({ fullName: '', email: '', password: '', role: 'saas_admin_global' });
        } catch (e: any) {
            notify.error("Falha no provisionamento: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-cyan-500/20 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[120px] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-cyan-600 rounded-3xl text-white shadow-xl shadow-cyan-900/40">
                        <Terminal size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Kernel <span className="text-cyan-500">Console</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-[0.4em]">Gerenciamento de Identidades Administrativas</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/80 px-6 py-3 rounded-2xl border border-white/5 shadow-inner relative z-10">
                    <Activity size={14} className="text-cyan-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sovereign Mode Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[48px] overflow-hidden shadow-2xl p-12">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-4">
                                <UserPlus className="text-cyan-400" size={24} />
                                <h2 className="text-xl font-black text-white uppercase italic">Provisionar Staff</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome Completo</label>
                                    <input 
                                        value={form.fullName} 
                                        onChange={e => setForm({...form, fullName: e.target.value})}
                                        placeholder="Nome do Admin/Gestor" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail Corporativo</label>
                                    <input 
                                        value={form.email} 
                                        onChange={e => setForm({...form, email: e.target.value})}
                                        placeholder="admin@oliemusic.com" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-mono" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Senha de Acesso</label>
                                    <input 
                                        type="password"
                                        value={form.password} 
                                        onChange={e => setForm({...form, password: e.target.value})}
                                        placeholder="••••••••" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Papel de Autoridade</label>
                                    <select 
                                        value={form.role} 
                                        onChange={e => setForm({...form, role: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white appearance-none outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                    >
                                        <option value="saas_admin_global">SaaS Global Admin</option>
                                        <option value="manager">Gestor de Unidade (B2B)</option>
                                        <option value="saas_admin_finance">Financeiro Staff</option>
                                        <option value="god_mode">Oracle / God Mode</option>
                                    </select>
                                </div>
                            </div>

                            <Button 
                                onClick={handleCreateAdmin} 
                                isLoading={loading}
                                className="w-full py-8 rounded-[32px] bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.3em] shadow-2xl" 
                                leftIcon={ShieldCheck}
                            >
                                Validar e Injetar Staff
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-cyan-500 shrink-0" size={24} />
                            <div>
                                <h5 className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-3">Protocolo de Provisionamento</h5>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    A criação de usuários via console ignora o fluxo de convite padrão para permitir a ativação imediata de contas de infraestrutura. Todas as operações são registradas no <span className="text-cyan-400">Audit Trail</span> do Kernel.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 bg-slate-900/60 border border-white/5 rounded-[40px] space-y-6 shadow-inner">
                         <div className="flex items-center gap-3">
                             <Cpu size={16} className="text-cyan-500" />
                             <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado da Rede Neural</h4>
                         </div>
                         <div className="space-y-3">
                             <div className="flex justify-between items-center text-[10px]">
                                 <span className="text-slate-600 uppercase font-bold">API Auth Cloud</span>
                                 <span className="text-emerald-500 font-black">ESTÁVEL</span>
                             </div>
                             <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                                 <div className="h-full w-full bg-cyan-500 animate-pulse" />
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
