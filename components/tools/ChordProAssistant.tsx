
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Save, Type, Sparkles, Wand2, Piano, Trash2, Import, Clock } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { notify } from '../../lib/notification';
import { cn } from '../../lib/utils';
import { NOTES_CHROMATIC, SCALES } from '../../lib/theoryEngine';

export const ChordProAssistant: React.FC<{ audioCurrentTime?: number }> = ({ audioCurrentTime = 0 }) => {
    const [content, setContent] = useState('');
    const [selectedKey, setSelectedKey] = useState('C');
    const [isSyncMode, setIsSyncMode] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Escuta tecla de espaço para inserir o próximo acorde da paleta no tempo atual
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSyncMode && e.code === 'Space') {
                e.preventDefault();
                // Aqui poderíamos inserir um marcador de tempo customizado [Chord@timestamp]
                // Por enquanto, inserimos o acorde tônica para prototipagem rápida
                insertChord(selectedKey);
                notify.info(`Marcador inserido em ${audioCurrentTime.toFixed(1)}s`);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSyncMode, audioCurrentTime, selectedKey]);

    const insertChord = (chord: string) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const text = textarea.value;
        const tag = `[${chord}]`;
        setContent(text.substring(0, start) + tag + text.substring(start));
        haptics.medium();
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 10);
    };

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                    <CardTitle className="text-sky-400 flex items-center gap-2">
                        <Wand2 size={22} /> Sincronizador Maestro
                    </CardTitle>
                    <CardDescription>Importe a letra e marque os acordes no tempo real do áudio.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant={isSyncMode ? "primary" : "secondary"}
                        onClick={() => setIsSyncMode(!isSyncMode)}
                        size="sm"
                        leftIcon={Clock}
                    >
                        {isSyncMode ? "Sync Ativo (Espaço)" : "Modo Sync"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3 space-y-4">
                        <div className="p-4 bg-slate-950 rounded-[32px] border border-white/5 space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paleta de {selectedKey}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['', 'm', 'm', '', '', 'm'].map((suffix, i) => {
                                    const rootIdx = NOTES_CHROMATIC.indexOf(selectedKey);
                                    const chord = NOTES_CHROMATIC[(rootIdx + SCALES.major[i]) % 12] + suffix;
                                    return (
                                        <button key={i} onClick={() => insertChord(chord)} className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 hover:bg-sky-500 hover:text-white transition-all">
                                            {chord}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <Button variant="outline" className="w-full text-[10px]" onClick={() => setContent('')}>
                            <Trash2 size={12} /> Limpar
                        </Button>
                    </div>

                    <div className="md:col-span-9 relative">
                        <textarea
                            ref={textAreaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-[400px] bg-slate-950 border border-slate-800 rounded-[40px] p-8 font-mono text-sm text-slate-300 focus:ring-4 focus:ring-sky-500/20 outline-none resize-none custom-scrollbar"
                            placeholder="Cole a letra pura aqui. Depois use os botões ao lado ou aperte ESPAÇO no tempo da música para inserir os acordes."
                        />
                    </div>
                </div>
                
                <div className="flex justify-between items-center bg-slate-950/80 p-6 rounded-[32px]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                         <Import size={14} className="text-sky-500" /> Sincronia Maestro Engine v1.0
                    </p>
                    <Button onClick={() => notify.success("Cifra sincronizada!")} className="px-10">Finalizar Edição</Button>
                </div>
            </CardContent>
        </Card>
    );
};
