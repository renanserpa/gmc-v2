
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Building2, Users, Shield, Plus, Globe, ArrowRight, Lock, Loader2, Palette, AlertCircle } from 'lucide-react';
import { getAdminSchools, createAdminSchool } from '../../services/dataService.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/Dialog.tsx';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

export default function TenantManager() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newSchool, setNewSchool] = useState({ name: '', slug: '', primaryColor: '#38bdf8' });

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        setLoading(true);
        try {
            const schools = await getAdminSchools();
            setTenants(schools);
        } catch (e) {
            notify.error("Erro ao carregar ecossistema B2B.");
        } finally {
            setLoading(false);
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
                }
            });
            
            notify.success("Unidade Provisionada com Sucesso!");
            setIsAddOpen(false);
            setNewSchool({ name: '', slug: '', primaryColor: '#38bdf8' });
            loadTenants();
        } catch (e: any) {
            console.error("[TenantManager] Erro fatal na criação:", e);
            notify.error(e.message?.includes('unique') ? "Este Slug já está em uso." : "Falha na conexão com o Banco de Dados.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Tenant <span className="text-purple-500">Master</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Governança B2B e Isolamento de Redes</p>
                </div>
                <Button 
                    onClick={() => { haptics.light(); setIsAddOpen(true); }}
                    leftIcon={Plus} 
                    className="rounded-2xl px-10 py-6 bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-900/20 text-xs font-black uppercase tracking-widest"
                >
                    Projetar Nova Escola
                </Button>
            </header>

            {loading ? (
                <div className="py-20 text-center space-y-4">
                    <Loader2 className="animate-spin mx-auto text-purple-500" size={48} />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sincronizando Malha de Escolas...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenants.map(t => (
                        <Card key={t.id} className="bg-slate-900 border-white/5 rounded-[40px] overflow-hidden hover:border-purple-500/40 transition-all group">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div 
                                        className="p-4 rounded-2xl text-white group-hover:scale-110 transition-all shadow-inner"
                                        style={{ backgroundColor: t.branding?.primaryColor || '#6366f1' }}
                                    >
                                        <Building2 size={28} />
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase border border-emerald-500/20">
                                        Node Ativo
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{t.name}</h3>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 flex items-center gap-1">
                                        <Lock size={10} /> {t.id.substring(0,18)}...
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} className="text-slate-500" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase">Slug: {t.slug || 'n/a'}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-[10px] font-black uppercase">Admin</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {tenants.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[48px]">
                            <Building2 className="mx-auto text-slate-800 mb-4" size={48} />
                            <p className="text-slate-500 font-black uppercase text-xs">Nenhum tenant externo conectado.</p>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[40px] max-w-lg p-8 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Plus size={32} />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Provisionar Unidade</DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Criação de novo isolamento de dados B2B.</DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome da Instituição</label>
                            <input 
                                value={newSchool.name} 
                                onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                                placeholder="Ex: Conservatório Olie Music SP"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-purple-600/20 transition-all" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Identificador Único (Slug)</label>
                            <input 
                                value={newSchool.slug} 
                                onChange={e => setNewSchool({...newSchool, slug: e.target.value})}
                                placeholder="conservatorio-sp"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-4 focus:ring-purple-600/20 font-mono" 
                            />
                            <p className="text-[8px] text-slate-600 font-bold uppercase ml-1 flex items-center gap-1">
                                <AlertCircle size={10} /> O slug define a URL da escola e não pode ser alterado.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
                                <Palette size={12} /> Branding: Cor Primária
                            </label>
                            <div className="flex gap-4 items-center bg-slate-950 p-4 rounded-2xl border border-white/5">
                                <input 
                                    type="color"
                                    value={newSchool.primaryColor} 
                                    onChange={e => setNewSchool({...newSchool, primaryColor: e.target.value})}
                                    className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                                />
                                <span className="text-xs font-mono text-slate-400 font-bold">{newSchool.primaryColor.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 border-t border-white/5 pt-6">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[10px] font-black uppercase">Cancelar</Button>
                        <Button 
                            onClick={handleCreate} 
                            isLoading={isSaving}
                            disabled={!newSchool.name || !newSchool.slug}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                        >
                            {isSaving ? "Executando..." : "Confirmar Provisionamento"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
