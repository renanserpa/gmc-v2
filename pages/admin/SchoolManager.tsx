
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Building2, Save, Palette, Globe, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';

export default function SchoolManager() {
    const { schoolId, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [school, setSchool] = useState<any>({
        name: '',
        address: '',
        logo_url: '',
        branding: {
            primaryColor: '#38bdf8',
            secondaryColor: '#0f172a',
            borderRadius: '24px'
        }
    });

    useEffect(() => {
        if (schoolId) loadSchool();
    }, [schoolId]);

    const loadSchool = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        if (data) setSchool(data);
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        haptics.heavy();
        try {
            const { error } = await supabase.from('schools').upsert({
                id: schoolId,
                name: school.name,
                address: school.address,
                logo_url: school.logo_url,
                branding: school.branding,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
            
            // Aplica as cores no :root instantaneamente para feedback visual
            document.documentElement.style.setProperty('--brand-primary', school.branding.primaryColor);
            
            notify.success("Configurações da Unidade Sincronizadas!");
            await refreshProfile();
        } catch (e: any) {
            notify.error("Erro ao salvar: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-sky-500 font-black uppercase tracking-widest">Acessando Registro da Unidade...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex items-center gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-white/5 backdrop-blur-xl">
                <div className="p-4 bg-sky-600 rounded-3xl text-white shadow-xl">
                    <Building2 size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Gestão da <span className="text-sky-500">Unidade</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Configuração de Identidade Visual e Localização</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-6">
                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Building2 size={16} /> Dados Institucionais
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Nome da Escola</label>
                                <input value={school.name} onChange={e => setSchool({...school, name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-sky-500/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Endereço / Unidade</label>
                                <input value={school.address} onChange={e => setSchool({...school, address: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase ml-1">URL da Logo (PNG/SVG)</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input value={school.logo_url} onChange={e => setSchool({...school, logo_url: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Palette size={16} /> White Label (Branding)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Cor Primária</label>
                                <div className="flex gap-2">
                                    <input type="color" value={school.branding.primaryColor} onChange={e => setSchool({...school, branding: {...school.branding, primaryColor: e.target.value}})} className="w-12 h-12 rounded-xl bg-transparent cursor-pointer" />
                                    <input value={school.branding.primaryColor} onChange={e => setSchool({...school, branding: {...school.branding, primaryColor: e.target.value}})} className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 text-white font-mono text-xs" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Arredondamento</label>
                                <select value={school.branding.borderRadius} onChange={e => setSchool({...school, branding: {...school.branding, borderRadius: e.target.value}})} className="w-full h-12 bg-slate-950 border border-white/10 rounded-xl px-4 text-white text-xs appearance-none">
                                    <option value="0px">Reto (0px)</option>
                                    <option value="12px">Suave (12px)</option>
                                    <option value="24px">Maestro (24px)</option>
                                    <option value="48px">Super Circular (48px)</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <aside className="md:col-span-5 space-y-6">
                    <div className="p-8 bg-sky-500/5 border border-sky-500/20 rounded-[40px] text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-900 border-2 border-white/5 mx-auto rounded-3xl flex items-center justify-center overflow-hidden">
                            {school.logo_url ? <img src={school.logo_url} className="w-full h-full object-contain p-2" /> : <Building2 className="text-slate-700" size={40} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic">{school.name || 'Nome da Unidade'}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Preview de Identidade</p>
                        </div>
                        <div className="flex justify-center gap-2">
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: school.branding.primaryColor }} />
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: school.branding.secondaryColor }} />
                        </div>
                    </div>

                    <Button onClick={handleSave} isLoading={saving} className="w-full py-10 rounded-[32px] bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest shadow-2xl" leftIcon={Save}>
                        Salvar e Aplicar Marca
                    </Button>
                </aside>
            </div>
        </div>
    );
}
