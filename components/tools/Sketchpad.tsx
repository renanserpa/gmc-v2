
import React, { useState, useRef, useEffect } from 'react';
import { MaestroAudioPro } from '../../lib/audioPro';
import { audioDB, AudioTake } from '../../lib/indexedDB';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Mic, Square, Loader2, Trash2, CloudUpload, History, Zap, Edit3, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../../lib/notification';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Sketchpad: React.FC = () => {
    const { user } = useAuth();
    const audioPro = useRef(new MaestroAudioPro());
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const [isRecording, setIsRecording] = useState(false);
    const [localTakes, setLocalTakes] = useState<AudioTake[]>([]);
    const [isSyncing, setIsSyncing] = useState<string | null>(null);
    const [syncProgress, setSyncProgress] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        loadLocalBuffer();
    }, []);

    const loadLocalBuffer = async () => {
        const takes = await audioDB.getLatest(5);
        setLocalTakes(takes);
    };

    const startRecording = async () => {
        try {
            const { stream } = await audioPro.current.connectMicrophone();
            chunks.current = [];
            mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            
            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                const newTake: AudioTake = {
                    id: `riff_${Date.now()}`,
                    blob,
                    timestamp: Date.now(),
                    title: `Riff s/ Nome`
                };
                
                await audioDB.saveTake(newTake);
                loadLocalBuffer();
                audioPro.current.disconnectMicrophone();
                notify.info("Ideia capturada!");
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            haptics.heavy();
        } catch (e) {
            notify.error("Acesso ao microfone negado.");
        }
    };

    const stopRecording = () => {
        mediaRecorder.current?.stop();
        setIsRecording(false);
        haptics.medium();
    };

    const syncToCloud = async (take: AudioTake) => {
        if (!user) return;
        setIsSyncing(take.id);
        setSyncProgress(0);
        
        // Simulação de progresso para feedback visual robusto
        const progressTimer = setInterval(() => {
            setSyncProgress(p => p < 90 ? p + 10 : p);
        }, 150);

        const fileName = `sketches/${user.id}/${take.id}.webm`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('performances')
                .upload(fileName, take.blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('performances')
                .getPublicUrl(fileName);

            await supabase.from('student_sketches').insert({
                student_id: user.id,
                audio_url: publicUrl,
                title: take.title
            });

            setSyncProgress(100);
            await new Promise(r => setTimeout(r, 400));
            await audioDB.deleteTake(take.id);
            loadLocalBuffer();
            notify.success("Ideia sincronizada!");
        } catch (e) {
            notify.error("Erro na sincronização.");
        } finally {
            clearInterval(progressTimer);
            setIsSyncing(null);
            setSyncProgress(0);
        }
    };

    const startRename = (take: AudioTake) => {
        setEditingId(take.id);
        setEditValue(take.title);
    };

    const saveRename = async () => {
        if (editingId && editValue.trim()) {
            await audioDB.updateTakeTitle(editingId, editValue.trim());
            setEditingId(null);
            loadLocalBuffer();
            haptics.success();
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 left-0 p-32 bg-sky-500/5 blur-[100px] pointer-events-none" />
            
            <CardHeader>
                <CardTitle className="text-sky-400 flex items-center gap-2">
                    <Mic size={20}/> Sketchpad Resiliente
                </CardTitle>
                <CardDescription>Grave sem internet. Nomeie seus riffs e suba para a nuvem.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                        "w-full py-20 rounded-[48px] border-2 border-dashed transition-all flex flex-col items-center gap-6 group relative overflow-hidden",
                        isRecording ? "bg-red-500/10 border-red-500 animate-pulse" : "bg-slate-950 border-slate-800 hover:border-sky-500/40"
                    )}
                >
                    <div className={cn(
                        "p-8 rounded-full transition-transform group-hover:scale-110 relative z-10",
                        isRecording ? "bg-red-500 text-white" : "bg-slate-900 text-slate-500"
                    )}>
                        {isRecording ? <Square size={48} fill="currentColor" /> : <Mic size={48} />}
                    </div>
                    <span className="font-black uppercase text-xs tracking-[0.4em] text-slate-400 relative z-10">
                        {isRecording ? "Gravando Ideia..." : "Toque para Registrar um Riff"}
                    </span>
                </button>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <History size={12}/> Seus Últimos Riffs (Offline)
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence>
                            {localTakes.map(take => (
                                <motion.div 
                                    key={take.id} 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-4 p-4 bg-slate-950 rounded-[28px] border border-white/5 group transition-all relative overflow-hidden"
                                >
                                    {isSyncing === take.id && (
                                        <div 
                                            className="absolute bottom-0 left-0 h-1 bg-sky-500 transition-all duration-300"
                                            style={{ width: `${syncProgress}%` }}
                                        />
                                    )}

                                    <div className="p-3 bg-slate-900 rounded-2xl text-sky-400">
                                        <Zap size={18} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {editingId === take.id ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    autoFocus
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && saveRename()}
                                                    className="bg-slate-900 border border-sky-500/50 rounded-lg px-2 py-1 text-xs text-white w-full outline-none"
                                                />
                                                <button onClick={saveRename} className="text-green-500"><Check size={16}/></button>
                                                <button onClick={() => setEditingId(null)} className="text-slate-500"><X size={16}/></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 group/title">
                                                <p className="text-xs font-black text-slate-200 truncate">{take.title}</p>
                                                <button onClick={() => startRename(take)} className="opacity-0 group-hover/title:opacity-100 text-slate-600 hover:text-sky-400 transition-all">
                                                    <Edit3 size={12} />
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                                            {Math.round(take.blob.size / 1024)} KB • {new Date(take.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => syncToCloud(take)} 
                                            disabled={!!isSyncing}
                                            className="p-3 bg-sky-500/10 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                                        >
                                            {isSyncing === take.id ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16}/>}
                                        </button>
                                        <button 
                                            onClick={() => audioDB.deleteTake(take.id).then(loadLocalBuffer)} 
                                            className="p-3 text-slate-600 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
