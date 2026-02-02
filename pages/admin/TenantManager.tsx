import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Power, PowerOff, Settings2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function TenantManager() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAllTenants = async () => {
        setLoading(true);
        try {
            // SUPER ADMIN BYPASS: Busca pura em todas as escolas
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTenants(data || []);
        } catch (e) {
            notify.error("Erro ao sincronizar tenants globais.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllTenants();
    }, []);

    const handleToggleStatus = async (id: string, current: boolean) => {
        haptics.heavy();
        const { error } = await supabase.from('schools').update({ is_active: !current }).eq('id', id);
        if (!error) {
            notify.info("Status da unidade atualizado.");
            loadAllTenants();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Tenant <span className="text-sky-500">Master</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Visão Root: Todas as Unidades Escolares</p>
                </div>
                <Button leftIcon={Plus} className="rounded-2xl px-10 py-6 bg-sky-600 shadow-xl text-xs font-black uppercase tracking-widest">
                    Nova Franquia
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map(t => (
                    <M.div layout key={t.id}>
                        <Card className={cn(
                            "bg-slate-900 border transition-all rounded-[40px] overflow-hidden shadow-2xl",
                            t.is_active ? "border-white/5 hover:border-sky-500/40" : "border-red-500/30 opacity-70"
                        )}>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div 
                                        className="p-4 rounded-2xl text-white shadow-inner"
                                        style={{ backgroundColor: t.branding?.primaryColor || '#0ea5e9' }}
                                    >
                                        <Building2 size={28} />
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                                        t.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                        {t.is_active ? 'Ativo' : 'Suspenso'}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{t.name}</h3>
                                    <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-1">/{t.slug}</p>
                                </div>

                                <div className="pt-4 flex justify-between items-center gap-2">
                                    <button 
                                        onClick={() => handleToggleStatus(t.id, t.is_active)}
                                        className={cn(
                                            "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest",
                                            t.is_active ? "text-red-500" : "text-emerald-500"
                                        )}
                                    >
                                        {t.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                        {t.is_active ? 'Suspender' : 'Ativar'}
                                    </button>
                                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-sky-400">
                                        <Settings2 size={14} className="mr-2"/> Config
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </M.div>
                ))}
            </div>
        </div>
    );
}