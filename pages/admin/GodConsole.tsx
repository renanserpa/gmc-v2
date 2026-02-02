
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
    Terminal, UserPlus, ShieldAlert, Mail, 
    Lock, Key, Zap, CheckCircle2, Loader2,
    ShieldCheck, Fingerprint
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
            notify.error("O manifesto staff exige preenchimento total.");
            return;
        }

        setLoading(true);
        haptics.heavy();

        try {
            // 1. Registro no Supabase Auth
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

            // 2. Garantia de persistência no profiles (Bypass de Trigger caso necessário)
            if (authData.user) {
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    email: form.email.toLowerCase().trim(),
                    full_name: form.fullName,
                    role: form.role,
                    school_id: null
                });
                if (profileError) throw profileError;
            }

            notify.success(`Protocolo Finalizado: Staff ${form.email} ativado.`);
            setForm({ email: '', password: '', fullName: '', role: 'saas_admin_global' });
        } catch (e: any) {
            notify.error("FALHA NO KERNEL: " + e.message);
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
                            Creator <span className="text-red-500">Terminal</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">High-Privilege Identity Provisioning</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-7 bg-[#050000] border-red-900/30 rounded-[48px] overflow-hidden shadow-2xl">
                    <div className="p-10 border-b border-red-900/10 bg-red-950/10 flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg"><UserPlus size={24} /></div>
                        <div>
                            <h4 className="text-xl font-black text-white uppercase italic">Manifesto de Staff</h4>
                            <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest mt-1">Sincronia direta com Supabase Auth</p>
                        </div>
                    </div>
                    <CardContent className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome do Operador</label>
                                <input 
                                    value={form.fullName}
                                    onChange={e => setForm({...form, fullName: e.target.value})}
                                    placeholder="Ex: Renan Fundador"
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-red-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Poder (Role)</label>
                                <select 
                                    value={form.role}
                                    onChange={e => setForm({...form, role: e.target.value})}
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white outline-none"
                                >
                                    <option value="saas_admin_global">SaaS Global Admin</option>
                                    <option value="saas_admin_finance">SaaS Finance Admin</option>
                                    <option value="saas_admin_ops">SaaS Ops Admin</option>
                                    <option value="god_mode">God Mode (Absolute)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail Corporativo</label>
                            <input 
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                placeholder="exemplo@adm.com"
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Chave de Acesso (Senha)</label>
                            <input 
                                type="password"
                                value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white font-mono"
                            />
                        </div>

                        <Button 
                            onClick={handleCreateStaff}
                            isLoading={loading}
                            className="w-full py-8 mt-4 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] shadow-xl shadow-red-900/30"
                            leftIcon={Zap}
                        >
                            Injetar Staff no Kernel
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-5 space-y-6">
                    <div className="p-8 bg-slate-900/60 border border-white/5 rounded-[40px] space-y-6">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-red-500" size={20} />
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo Root</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            O provisionamento manual via God Mode cria usuários com bypass de convite. O e-mail deve ser corporativo para manter a integridade dos logs de auditoria.
                        </p>
                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                            <Fingerprint className="text-slate-700" size={32} />
                            <p className="text-[10px] text-slate-600 font-bold uppercase leading-snug">
                                Cada disparo aqui gera um log imutável na tabela "audit_logs".
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
