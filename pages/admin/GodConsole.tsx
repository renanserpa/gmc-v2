
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Terminal, UserPlus, ShieldAlert, Mail, 
    Lock, Key, Zap, CheckCircle2, Loader2,
    ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

export default function GodConsole() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'saas_admin_global'
    });

    const handleCreateStaff = async () => {
        if (!form.email || !form.password || !form.fullName) {
            notify.error("Preencha todos os campos do manifesto staff.");
            return;
        }

        setLoading(true);
        haptics.heavy();

        try {
            // 1. Criação no Auth
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

            // 2. Garantia de perfil na tabela profiles (Caso o trigger falhe)
            if (authData.user) {
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    email: form.email,
                    full_name: form.fullName,
                    role: form.role
                });
                if (profileError) throw profileError;
            }

            notify.success(`Staff ${form.email} provisionado com sucesso!`);
            setForm({ email: '', password: '', fullName: '', role: 'saas_admin_global' });
        } catch (e: any) {
            notify.error("Falha no provisionamento nuclear: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl">
                    <Terminal size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Criador de <span className="text-red-500">Staff</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">High-Level Privilege Provisioning</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-7 bg-[#050000] border-red-900/30 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 border-b border-red-900/10">
                        <CardTitle className="text-xl font-black text-white uppercase flex items-center gap-4">
                            <UserPlus className="text-red-500" /> Manifesto de Nova Identidade
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome do Operador</label>
                                <input 
                                    value={form.fullName}
                                    onChange={e => setForm({...form, fullName: e.target.value})}
                                    placeholder="Ex: Pedro Financeiro"
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-4 focus:ring-red-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nível de Poder (Role)</label>
                                <select 
                                    value={form.role}
                                    onChange={e => setForm({...form, role: e.target.value})}
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white outline-none"
                                >
                                    <option value="saas_admin_global">Global SaaS Admin</option>
                                    <option value="saas_admin_finance">Financeiro Global</option>
                                    <option value="saas_admin_ops">Operações SaaS</option>
                                    <option value="god_mode">God Mode (Cuidado!)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail Corporativo</label>
                            <input 
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                placeholder="adm@adm.com"
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-4 focus:ring-red-500/20 font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Senha Manual Inicial</label>
                            <input 
                                type="password"
                                value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                                placeholder="••••••••"
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-4 focus:ring-red-500/20"
                            />
                        </div>

                        <Button 
                            onClick={handleCreateStaff}
                            isLoading={loading}
                            className="w-full py-8 mt-4 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/20"
                            leftIcon={ShieldCheck}
                        >
                            Propagar Identidade no Kernel
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-red-950/20 border border-red-500/30 p-8 rounded-[40px] shadow-xl">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-red-500 shrink-0" size={24} />
                            <div className="space-y-2">
                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo Root</h5>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    Usuários de staff criados aqui não passam pela triagem de convites (Invite Codes). Eles herdam permissões globais de visualização em todos os tenants.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900/40 p-8 rounded-[40px] border border-white/5 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3">
                            <Key size={14} /> Chave Mestra Ativa
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic">
                            O provisionamento manual via God Mode gera um log imediato na tabela 'audit_logs' para rastreabilidade de privilégios.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
