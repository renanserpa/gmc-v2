
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Plus, Globe, Save, 
    Loader2, Sparkles, Building, Info, Terminal, 
    ShieldAlert, RefreshCw, Palette, Image as ImageIcon,
    Settings2, ChevronRight, CheckCircle2, Upload, Trash2,
    FileText, Phone, User, DollarSign, ShieldCheck
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';

const M = motion as any;

export default function TenantManager() {
    const { schoolId, setSchoolOverride, user, role } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);
    
    // Form States
    const [newSchool, setNewSchool] = useState({ name: '', slug: '' });
    const [editForm, setEditForm] = useState({
        name: '',
        contract_status: 'trial',
        branding: { primaryColor: '#38bdf8', secondaryColor: '#0f172a', logoUrl: '', borderRadius: '24px' }
    });

    // ENGINE REALTIME: Filtra pelo proprietário se não for Super Admin
    const filter = (user?.email === 'serparenan@gmail.com' || role === 'super_admin') 
        ? undefined 
        : `owner_id=eq.${user?.id}`;

    const { data: tenants, loading } = useRealtimeSync<any>('schools', filter, { column: 'name', ascending: true });

    const handleCreateSchool = async () => {
        if (!newSchool.name.trim() || !newSchool.slug.trim() || !user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('schools').insert([{
                name: newSchool.name.trim(),
                slug: newSchool.slug.toLowerCase().trim().replace(/\s+/g, '-'),
                owner_id: user.id, // VINCULO FUNDAMENTAL DO PROFESSOR-OWNER
                branding: { primaryColor: '#38bdf8', secondaryColor: '#0f172a', borderRadius: '24px' }
            }]);
            if (error) throw error;
            notify.success(`Unidade "${newSchool.name}" provisionada!`);
            setIsAddOpen(false);
            setNewSchool({ name: '', slug: '' });
        } catch (e: any) {
            notify.error("Slug já utilizado ou erro de permissão.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenEdit = (school: any) => {
        setSelectedSchool(school);
        setEditForm({
            name: school.name || '',
            contract_status: school.contract_status || 'trial',
            branding: school.branding || { primaryColor: '#38bdf8' }
        });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                        {role === 'professor' ? 'Minhas' : 'School'} <span className="text-sky-500">Unidades</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Infraestrutura Multi-Tenant GCM Maestro</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} leftIcon={Plus} className="rounded-2xl px-10 py-7 bg-sky-600 font-black uppercase text-xs">Provisionar Unidade</Button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center py-32 gap-6 opacity-40">
                    <Loader2 className="animate-spin text-sky-500" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Unidades...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tenants.map((t: any, idx: number) => (
                        <M.div key={t.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Card className={cn(
                                "bg-[#0a0f1d] border transition-all rounded-[56px] overflow-hidden shadow-2xl flex flex-col h-full group",
                                schoolId === t.id ? "border-sky-500 ring-2 ring-sky-500/20" : "border-white/5"
                            )}>
                                <div className="p-10 space-y-8 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="p-5 bg-slate-900 rounded-[28px] text-sky-400 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                                            {t.branding?.logoUrl ? <img src={t.branding.logoUrl} className="w-8 h-8 object-contain" /> : <Building2 size={32} />}
                                        </div>
                                        <button onClick={() => handleOpenEdit(t)} className="p-3 bg-slate-900 text-slate-500 hover:text-sky-400 rounded-2xl transition-colors"><Settings2 size={18} /></button>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate leading-none">{t.name}</h3>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Globe size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-mono text-sky-500 uppercase tracking-widest">/{t.slug}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-950/50 border-t border-white/5">
                                    <Button 
                                        onClick={() => { setSchoolOverride(t.id); notify.info("Escola Ativa alterada."); }} 
                                        variant={schoolId === t.id ? "primary" : "ghost"} 
                                        className="w-full py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em]"
                                    >
                                        {schoolId === t.id ? "Contexto Ativo" : "Gerenciar"}
                                    </Button>
                                </div>
                            </Card>
                        </M.div>
                    ))}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 rounded-[48px] p-12 max-w-xl shadow-2xl">
                    <DialogHeader className="mb-8 text-center space-y-4">
                        <div className="w-20 h-20 bg-sky-600 rounded-[32px] flex items-center justify-center mx-auto text-white shadow-xl shadow-sky-900/40"><Building size={40} /></div>
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Nova Unidade</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-bold uppercase">Crie seu próprio hub pedagógico.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <input value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} placeholder="Nome da Unidade (Ex: RedHouse Renan)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-white" />
                        <input value={newSchool.slug} onChange={e => setNewSchool({...newSchool, slug: e.target.value})} placeholder="slug-unico (Ex: redhouse-cuiaba)" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sky-400 font-mono" />
                    </div>
                    <DialogFooter className="mt-12">
                        <Button onClick={handleCreateSchool} isLoading={isSaving} className="w-full py-8 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-widest shadow-xl">Confirmar Lançamento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
