import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Building2, Users, Shield, Plus, Globe, ArrowRight, Loader2, Palette, HardDrive, UserCheck, Power, PowerOff, AlertCircle } from 'lucide-react';
import { getAdminSchools, createAdminSchool, getStudentCountBySchool, updateSchoolStatus } from '../../services/dataService.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/Dialog.tsx';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient.ts';

const ResourceUsage = ({ current, max, label, icon: Icon, color }: any) => {
    const percent = Math.min((current / max) * 100, 100);
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <Icon size={12} className={color} /> {label}
                </div>
                <span className="text-[10px] font-mono font-bold text-white">{current}/{max}</span>
            </div>
            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={cn("h-full transition-all duration-1000", percent > 90 ? "bg-red-500" : percent > 70 ? "bg-amber-500" : color.replace('text-', 'bg-'))}
                />
            </div>
        </div>
    );
};

export default function TenantManager() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [usageData, setUsageData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [newSchool, setNewSchool] = useState({ 
        name: '', 
        slug: '', 
        primaryColor: '#38bdf8',
        max_students: 50,
        storage_gb: 5
    });

    const loadTenants = async () => {
        setLoading(true);
        try {
            const schools = await getAdminSchools();
            setTenants(schools);
            
            const counts: Record<string, number> = {};
            await Promise.all(schools.map(async (s) => {
                counts[s.id] = await getStudentCountBySchool(s.id);
            }));
            setUsageData(counts);
        } catch (e) {
            notify.error("Erro ao carregar ecossistema B2B.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTenants();

        // MOTOR REALTIME: Sincronização automática da malha de escolas
        const channel = supabase.channel('schools-grid-sync')
            .on(
                // FIX: Casting event type string to any to satisfy strict compiler check on Supabase channel overloads
                'postgres_changes' as any,
                { event: '*', table: 'schools' },
                async (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload as any;
                    
                    if (eventType === 'INSERT') {
                        setTenants(prev => [newRecord, ...prev.filter(t => t.id !== newRecord.id)]);
                        // Busca contagem apenas para a nova unidade injetada
                        const count = await getStudentCountBySchool(newRecord.id);
                        setUsageData(prev => ({ ...prev, [newRecord.id]: count }));
                    }
                    
                    if (eventType === 'UPDATE') {
                        setTenants(prev => prev.map(t => t.id === newRecord.id ? { ...t, ...newRecord } : t));
                    }
                    
                    if (eventType === 'DELETE') {
                        setTenants(prev => prev.filter(t => t.id !== oldRecord.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleToggleStatus = async (school: any) => {
        const nextStatus = !school.is_active;
        if (!nextStatus && !window.confirm(`ATENÇÃO: Suspender a unidade "${school.name}" deslogará IMEDIATAMENTE todos os usuários vinculados. Confirmar suspensão?`)) return;

        setActionLoading(school.id);
        haptics.heavy();

        try {
            await updateSchoolStatus(school.id, nextStatus);
            notify.success(nextStatus ? `Unidade "${school.name}" reativada.` : `Unidade "${school.name}" SUSPENSA.`);
            // loadTenants() removido: a UI atualizará via Realtime
        } catch (e) {
            notify.error("Falha ao alterar status da unidade.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreate = async () => {
        if (!newSchool.name || !newSchool.slug) {
            notify.warning("Preencha o nome e o identificador (slug).");
            return;
        }

        setIsSaving(true);
        haptics.heavy();

        try {
            await createAdminSchool({
                name: newSchool.name,
                slug: newSchool.slug.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
                branding: { 
                    primaryColor: newSchool.primaryColor, 
                    secondaryColor: '#a78bfa',
                    borderRadius: '24px', 
                    logoUrl: null 
                },
                settings: {
                    max_students: newSchool.max_students,
                    storage_gb: newSchool.storage_gb
                }
            });
            
            notify.success("Unidade Provisionada com Sucesso!");
            setIsAddOpen(false);
            setNewSchool({ name: '', slug: '', primaryColor: '#38bdf8', max_students: 50, storage_gb: 5 });
            // loadTenants() removido: a UI atualizará via Realtime
        } catch (e: any) {
            notify.error(e.message?.includes('unique') ? "Este Slug já está em uso." : "Falha na conexão.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Tenant <span className="text-purple-500">Master</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Governança B2B e Controle de Resiliência</p>
                </div>
                <Button 
                    onClick={() => { haptics.light(); setIsAddOpen(true); }}
                    leftIcon={Plus} 
                    className="rounded-2xl px-10 py-6 bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-900/20 text-xs font-black uppercase tracking-widest"
                >
                    Projetar Nova Escola
                </Button>
            </header>

            {loading && tenants.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                    <Loader2 className="animate-spin mx-auto text-purple-500" size={48} />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sincronizando Malha de Escolas...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenants.map(t => (
                        <Card key={t.id} className={cn(
                            "bg-slate-900 border transition-all group rounded-[40px] overflow-hidden",
                            t.is_active ? "border-white/5 hover:border-purple-500/40" : "border-red-500/30 opacity-70"
                        )}>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div 
                                        className="p-4 rounded-2xl text-white group-hover:scale-110 transition-all shadow-inner"
                                        style={{ backgroundColor: t.is_active ? (t.branding?.primaryColor || '#6366f1') : '#475569' }}
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
                                
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{t.name}</h3>
                                    <p className="text-[9px] text-slate-500 font-mono">ID: {t.id.substring(0,8)}...</p>
                                </div>

                                <div className="space-y-4 py-4 border-y border-white/5">
                                    <ResourceUsage 
                                        label="Alunos" 
                                        current={usageData[t.id] || 0} 
                                        max={t.settings?.max_students || 100} 
                                        icon={UserCheck} 
                                        color="text-sky-400" 
                                    />
                                    <ResourceUsage 
                                        label="Cloud Storage" 
                                        current={0.1} // Mock for demo
                                        max={t.settings?.storage_gb || 10} 
                                        icon={HardDrive} 
                                        color="text-purple-400" 
                                    />
                                </div>

                                <div className="pt-2 flex justify-between items-center">
                                    <button 
                                        onClick={() => handleToggleStatus(t)}
                                        disabled={actionLoading === t.id}
                                        className={cn(
                                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                            t.is_active ? "text-red-500 hover:text-red-400" : "text-emerald-500 hover:text-emerald-400"
                                        )}
                                    >
                                        {actionLoading === t.id ? (
                                            <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                            t.is_active ? <PowerOff size={14} /> : <Power size={14} />
                                        )}
                                        {t.is_active ? 'Suspender Unidade' : 'Reativar Unidade'}
                                    </button>
                                    <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-[10px] font-black uppercase">Dashboard</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] max-w-xl p-8 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle>Provisionar Unidade</DialogTitle>
                        <DialogDescription>Configuração de Quotas e Isolamento de Dados.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} placeholder="Nome da Instituição" className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none" />
                            <input value={newSchool.slug} onChange={e => setNewSchool({...newSchool, slug: e.target.value})} placeholder="Slug Identificador" className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm font-mono outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Max Alunos</label>
                                <input type="number" value={newSchool.max_students} onChange={e => setNewSchool({...newSchool, max_students: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Storage GB</label>
                                <input type="number" value={newSchool.storage_gb} onChange={e => setNewSchool({...newSchool, storage_gb: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} isLoading={isSaving} className="bg-purple-600">Provisionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}