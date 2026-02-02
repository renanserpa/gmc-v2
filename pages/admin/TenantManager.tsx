import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, Power, Palette, MapPin, 
    Loader2, Save, Globe, Hash, Edit3, X, ExternalLink 
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

const M = motion as any;

export default function TenantManager() {
    const { setSchoolOverride, schoolId } = useAuth();
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTenant, setEditingTenant] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            // QUERY MASTER: Super Admin vê tudo sem filtros de propriedade
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setTenants(data || []);
        } catch (e: any) {
            notify.error(`Falha na rede: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleSaveBranding = async () => {
        if (!editingTenant) return;
        setIsSaving(true);
        haptics.heavy();
        
        try {
            const { error } = await supabase
                .from('schools')
                .update({ 
                    name: editingTenant.name,
                    slug: editingTenant.slug,
                    branding: editingTenant.branding 
                })
                .eq('id', editingTenant.id);

            if (error) throw error;
            
            notify.success("Configurações de marca sincronizadas!");
            setEditingTenant(null);
            fetchTenants();
        } catch (e: any) {
            notify.error(`Erro ao salvar: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectContext = (id: string) => {
        haptics.medium();
        setSchoolOverride(id);
        notify.info("Contexto ativo alterado.");
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Ecosystem <span className="text-sky-500">Master</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Gerenciamento de Unidades White Label</p>
                </div>
                <Button leftIcon={Plus} className="rounded-2xl px-10 py-7 bg-sky-600 shadow-xl text-xs font-black uppercase tracking-widest border border-white/10">
                    Projetar Unidade
                </Button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center py-20 gap-4">
                    <Loader2 className="animate-spin text-sky-500" size={40} />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Mapeando Nodes da Rede...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tenants.map(t => (
                        <M.div layout key={t.id}>
                            <Card className={cn(
                                "bg-slate-900 border transition-all rounded-[56px] overflow-hidden shadow-2xl relative flex flex-col h-full",
                                t.is_active ? "border-white/5" : "border-red-500/30 opacity-70",
                                schoolId === t.id && "ring-2 ring-sky-500 border-sky-500 shadow-sky-500/20"
                            )}>
                                <div 
                                    className="h-32 relative overflow-hidden"
                                    style={{ backgroundColor: t.branding?.primaryColor || '#0ea5e9' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-8 flex items-center gap-4">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 text-white shadow-xl">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-white/10 border border-white/20 text-white">
                                            {t.is_active ? 'Online' : 'Suspensa'}
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-8 flex-1 flex flex-col gap-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate leading-none">{t.name}</h3>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Globe size={12} className="text-slate-500" />
                                            <p className="text-[10px] text-slate-500 font-mono tracking-widest">/{t.slug || 'no-slug'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-auto">
                                        <Button 
                                            onClick={() => handleSelectContext(t.id)}
                                            variant={schoolId === t.id ? "primary" : "outline"}
                                            className="w-full rounded-2xl py-6 text-[10px] font-black uppercase tracking-widest h-14"
                                            leftIcon={MapPin}
                                        >
                                            {schoolId === t.id ? "Contexto Ativo" : "Alternar Contexto"}
                                        </Button>
                                        <button 
                                            onClick={() => { haptics.light(); setEditingTenant(t); }}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all tracking-widest flex items-center justify-center gap-2 border border-white/5"
                                        >
                                            <Palette size={14} /> Editar Identidade
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </M.div>
                    ))}
                </div>
            )}

            {/* Modal de Edição de Branding */}
            <AnimatePresence>
                {editingTenant && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <M.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingTenant(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <M.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[48px] p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: editingTenant.branding?.primaryColor }} />
                            
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Branding <span className="text-sky-500">Editor</span></h2>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">White Label Customization</p>
                                </div>
                                <button onClick={() => setEditingTenant(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome da Escola</label>
                                    <input 
                                        value={editingTenant.name} 
                                        onChange={e => setEditingTenant({...editingTenant, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2"><Hash size={12} /> Slug da URL</label>
                                    <input 
                                        value={editingTenant.slug} 
                                        onChange={e => setEditingTenant({...editingTenant, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sky-400 text-sm font-mono outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2"><Palette size={12} /> Cor Primária</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="color"
                                            value={editingTenant.branding?.primaryColor || '#38bdf8'} 
                                            onChange={e => setEditingTenant({
                                                ...editingTenant, 
                                                branding: { ...editingTenant.branding, primaryColor: e.target.value }
                                            })}
                                            className="h-14 w-20 rounded-2xl bg-transparent border-2 border-white/10 cursor-pointer p-1"
                                        />
                                        <input 
                                            value={editingTenant.branding?.primaryColor} 
                                            onChange={e => setEditingTenant({
                                                ...editingTenant, 
                                                branding: { ...editingTenant.branding, primaryColor: e.target.value }
                                            })}
                                            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 text-sm text-white uppercase font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-white/5 flex gap-4">
                                <Button 
                                    onClick={handleSaveBranding} 
                                    isLoading={isSaving}
                                    className="flex-1 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-sky-900/20"
                                    leftIcon={Save}
                                >
                                    Sincronizar Marca
                                </Button>
                            </div>
                        </M.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}