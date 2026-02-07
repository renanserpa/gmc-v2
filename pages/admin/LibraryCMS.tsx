
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, Search, FileText, Video, Image as ImageIcon,
    Plus, Trash2, Link, Save, Globe, Zap, Layers,
    MoreVertical, ExternalLink, X, FilePlus, CloudUpload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getLibraryAssets, saveLibraryAsset } from '../../services/dataService.ts';
import { LibraryAsset } from '../../types.ts';
import { notify } from '../../lib/notification.ts';
import { haptics } from '../../lib/haptics.ts';
import { cn } from '../../lib/utils.ts';

const M = motion as any;

export default function LibraryCMS() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<LibraryAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState<Partial<LibraryAsset>>({
        title: '',
        type: 'video',
        url: '',
        module_link: 'Módulo 1',
        lesson_link: 'Aula 1'
    });

    useEffect(() => {
        if (user?.id) loadAssets();
    }, [user?.id]);

    const loadAssets = async () => {
        setLoading(true);
        try {
            const data = await getLibraryAssets(user!.id);
            setAssets(data);
        } catch (e) {
            notify.error("Falha ao carregar CMS.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.url) return;
        setIsSaving(true);
        haptics.heavy();
        try {
            await saveLibraryAsset({
                ...form,
                professor_id: user!.id
            });
            notify.success("Material vinculado ao Currículo Maestro!");
            setIsAddOpen(false);
            setForm({ title: '', type: 'video', url: '', module_link: 'Módulo 1', lesson_link: 'Aula 1' });
            loadAssets();
        } catch (e) {
            notify.error("Erro ao salvar ativo.");
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = assets.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-10 rounded-[56px] border border-purple-500/20 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Content Management Engine</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Olie <span className="text-purple-500">Library CMS</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3 italic">"O cérebro de conteúdo da RedHouse"</p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <Card className="bg-slate-950/80 border-white/5 p-2 rounded-3xl shadow-xl min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                            <input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Filtrar por missão ou título..." 
                                className="w-full bg-transparent border-none outline-none py-4 pl-12 pr-6 text-sm text-white font-mono placeholder:text-slate-700" 
                            />
                        </div>
                    </Card>
                    <Button onClick={() => setIsAddOpen(true)} className="h-16 px-8 rounded-3xl bg-purple-600 hover:bg-purple-500 shadow-xl" leftIcon={Plus}>
                        Adicionar Ativo
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-900/40 rounded-[32px] animate-pulse" />)
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center border-4 border-dashed border-slate-900 rounded-[56px] opacity-20">
                         <CloudUpload size={64} className="mx-auto text-slate-600 mb-4" />
                         <p className="text-sm font-black uppercase tracking-widest">Nenhum conteúdo vinculado ao currículo</p>
                    </div>
                ) : (
                    filtered.map((asset, idx) => (
                        <Card key={asset.id} className="bg-[#0a0f1d] border-white/5 rounded-[32px] p-6 hover:border-purple-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group shadow-xl">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className={cn(
                                    "p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform",
                                    asset.type === 'video' ? "bg-red-500/10 text-red-400" : "bg-sky-500/10 text-sky-400"
                                )}>
                                    {asset.type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-white uppercase truncate tracking-tight">{asset.title}</h3>
                                        <span className="bg-slate-950 px-2 py-0.5 rounded text-[8px] font-black text-slate-500 uppercase border border-white/5 tracking-widest">
                                            {asset.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-400 uppercase">
                                            <Layers size={12} /> {asset.module_link}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase">
                                            <Zap size={12} /> {asset.lesson_link}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden lg:block text-right pr-6 border-r border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-0.5">Direct Access</p>
                                    <code className="text-[10px] text-sky-500 font-mono">{asset.url.slice(0, 30)}...</code>
                                </div>
                                <button onClick={() => window.open(asset.url, '_blank')} className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all shadow-lg">
                                    <ExternalLink size={20} />
                                </button>
                                <button className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-700 hover:text-red-400 transition-all shadow-lg">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 rounded-[56px] p-0 overflow-hidden shadow-2xl">
                    <div className="p-10 bg-slate-900 border-b border-white/5 flex items-center gap-6">
                        <div className="p-4 bg-purple-600 rounded-3xl text-white shadow-xl shadow-purple-900/40">
                             <FilePlus size={32} />
                        </div>
                        <div>
                             <DialogTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">Vincular Ativo</DialogTitle>
                             <DialogDescription className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Adicione materiais Suzuki e vincule-os ao currículo real.</DialogDescription>
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título do Ativo (Aparece no Aluno)</label>
                             <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Lucca Intro - Módulo 1 Aula 1" className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white outline-none focus:ring-4 focus:ring-purple-600/20" />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tipo de Material</label>
                                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white appearance-none">
                                    <option value="video">Vídeo (YouTube/Vimeo)</option>
                                    <option value="pdf">Documento PDF</option>
                                    <option value="image">Página Apostila (Imagem)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Vínculo Curricular</label>
                                <select value={form.module_link} onChange={e => setForm({...form, module_link: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white appearance-none">
                                    <option>Módulo 1: Fundamentos</option>
                                    <option>Módulo 2: Acordes Amigos</option>
                                    <option>Módulo 3: Ritmos Kids</option>
                                    <option>Módulo 4: Maestria Solo</option>
                                </select>
                            </div>
                         </div>

                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase ml-1">URL de Acesso</label>
                             <div className="relative">
                                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 pl-12 text-white font-mono text-xs" />
                             </div>
                         </div>
                    </div>

                    <DialogFooter className="p-10 bg-slate-900/50">
                         <Button onClick={handleSave} isLoading={isSaving} className="w-full py-8 rounded-[40px] bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest shadow-2xl" leftIcon={Save}>
                             Propagar Ativo para o Sistema
                         </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
