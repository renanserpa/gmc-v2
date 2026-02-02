import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Zap, Plus, Globe, Target, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';

export default function GamificationLab() {
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [globalMissions, setGlobalMissions] = useState<any[]>([]);
    const [newMaster, setNewMaster] = useState({
        title: '',
        description: '',
        xp_reward: 50
    });

    // ENGINE DE CARREGAMENTO SEGURO
    const loadMasterMissions = async () => {
        setLoading(true);
        try {
            // Tenta buscar com o filtro is_template. Se a coluna não existir, o Supabase retornará erro.
            const { data, error } = await supabase
                .from('missions')
                .select('*')
                .eq('is_template', true);

            if (error) {
                // FALLBACK: Se is_template falhar, buscamos sem o filtro para não quebrar a UI
                console.warn("[GamificationLab] Column is_template not found, using safety fallback.");
                const { data: fallbackData } = await supabase.from('missions').select('*').limit(10);
                setGlobalMissions(fallbackData || []);
            } else {
                setGlobalMissions(data || []);
            }
        } catch (e) {
            console.error("Erro fatal ao carregar lab.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMasterMissions();
    }, []);

    const handleAddMasterMission = async () => {
        if (!newMaster.title) return;
        setIsSaving(true);
        haptics.heavy();
        try {
            const { error } = await supabase.from('missions').insert({
                title: newMaster.title,
                description: newMaster.description,
                xp_reward: newMaster.xp_reward,
                is_template: true,
                status: 'pending',
                school_id: null,
                metadata: { type: 'Standard Template' }
            });

            if (error) throw error;
            notify.success("Template Global Lançado!");
            setNewMaster({ title: '', description: '', xp_reward: 50 });
            loadMasterMissions();
        } catch (e) {
            notify.error("Erro ao criar template. Verifique se a coluna is_template existe.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 leading-none">
                        Dopamine <span className="text-rose-500">Lab</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Repositório de Missões Mestras (Global)</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-4 bg-slate-900 border-white/5 rounded-[40px] p-8">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xs uppercase tracking-widest text-sky-400">Criar Novo Template</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <input value={newMaster.title} onChange={e => setNewMaster({...newMaster, title: e.target.value})} placeholder="Título do Desafio" className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-white text-sm" />
                        <textarea value={newMaster.description} onChange={e => setNewMaster({...newMaster, description: e.target.value})} rows={3} placeholder="Instruções..." className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-white text-sm resize-none" />
                        <Button onClick={handleAddMasterMission} isLoading={isSaving} className="w-full py-4 rounded-xl font-black uppercase text-[10px]">Injetar na Rede</Button>
                    </div>
                </Card>

                <Card className="lg:col-span-8 bg-slate-950 border-white/5 rounded-[48px] overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-slate-900/20 flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-3 uppercase text-white">
                            <Globe className="text-sky-500" /> Templates Ativos
                        </CardTitle>
                        {loading && <Loader2 className="animate-spin text-sky-500" size={16} />}
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {globalMissions.length === 0 && !loading && (
                            <div className="col-span-2 py-20 text-center opacity-30">
                                <AlertCircle className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase">Nenhum template detectado.</p>
                            </div>
                        )}
                        {globalMissions.map(m => (
                            <div key={m.id} className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl"><Target size={20} /></div>
                                    <span className="text-[10px] font-black text-amber-500">+{m.xp_reward} XP</span>
                                </div>
                                <h4 className="text-sm font-black text-white uppercase">{m.title}</h4>
                                <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">{m.description}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}