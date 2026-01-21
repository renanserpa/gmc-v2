
import React, { useState, useRef, useEffect } from 'react';
import { MaestroAudioPro } from '../lib/audioPro';
import { Button } from './ui/Button';
import { Mic, Circle, Loader2, ShieldAlert } from 'lucide-react';
import { notify } from '../lib/notification';
import { supabase } from '../lib/supabaseClient';
import { haptics } from '../lib/haptics';
import { cn } from '../lib/utils';
import { savePerformanceRecording } from '../services/dataService';

interface PerformanceRecorderProps {
    audioPro: MaestroAudioPro;
    studentId: string;
    songId: string;
    professorId: string;
    songTitle: string;
}

export const PerformanceRecorder: React.FC<PerformanceRecorderProps> = ({ 
    audioPro, studentId, songId, professorId, songTitle 
}) => {
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [micPermission, setMicPermission] = useState<PermissionState | 'unknown'>('unknown');
    
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const recordedChunks = useRef<Blob[]>([]);

    useEffect(() => {
        const checkPerm = async () => {
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    const status = await navigator.permissions.query({ name: 'microphone' as any });
                    setMicPermission(status.state);
                    status.onchange = () => setMicPermission(status.state);
                }
            } catch (e) {
                console.warn("[PerformanceRecorder] Permissions API unavailable");
            }
        };
        checkPerm();
    }, []);

    const toggleMic = async () => {
        if (!isMicEnabled) {
            try {
                await audioPro.connectMicrophone();
                setIsMicEnabled(true);
                notify.success("Microfone Conectado ao Mixer de Gravação");
            } catch (e) {
                notify.error("Acesso ao microfone negado.");
            }
        } else {
            setIsMicEnabled(false);
        }
    };

    const startRecording = () => {
        recordedChunks.current = [];
        const stream = audioPro.getRecordingStream();
        if (!stream) {
            notify.error("Não foi possível obter o stream de áudio.");
            return;
        }
        
        try {
            mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            
            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
                await uploadPerformance(blob);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            haptics.heavy();
            notify.info("REC: Gravando Performance...");
        } catch (err) {
            console.error("[Recorder] Start failed:", err);
            notify.error("Erro ao iniciar gravação.");
        }
    };

    const stopRecording = () => {
        mediaRecorder.current?.stop();
        setIsRecording(false);
        haptics.medium();
    };

    const uploadPerformance = async (blob: Blob) => {
        setIsUploading(true);
        const fileName = `${studentId}/${songId}_${Date.now()}.webm`;
        
        try {
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('performances')
                .upload(fileName, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('performances')
                .getPublicUrl(fileName);

            await savePerformanceRecording({
                student_id: studentId,
                song_id: songId,
                professor_id: professorId,
                audio_url: publicUrl
            });

            notify.success("Sua performance foi salva com sucesso!");
        } catch (e: any) {
            console.error("Upload error:", e);
            notify.error("Erro ao salvar gravação.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {micPermission === 'denied' && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase">
                    <ShieldAlert size={16} /> Microfone bloqueado no navegador.
                </div>
            )}

            <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
                <button 
                    onClick={toggleMic}
                    className={cn(
                        "p-3.5 rounded-xl transition-all",
                        isMicEnabled ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                    title="Ativar Microfone"
                >
                    <Mic size={20} />
                </button>

                <div className="w-px h-8 bg-white/5 mx-1" />

                {!isRecording ? (
                    <button 
                        onClick={startRecording}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition-all font-black uppercase text-xs tracking-widest border border-red-500/20"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Circle size={16} fill="currentColor" />}
                        {isUploading ? 'Processando...' : 'Gravar Aula'}
                    </button>
                ) : (
                    <button 
                        onClick={stopRecording}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-red-900/40 animate-pulse"
                    >
                        <div className="w-3 h-3 bg-white rounded-sm" />
                        Parar Gravação
                    </button>
                )}
            </div>
        </div>
    );
};
