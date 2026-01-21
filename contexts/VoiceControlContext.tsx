
import React, { createContext, useContext, useEffect, useState } from 'react';
import { notify } from '../lib/notification';
import { uiSounds } from '../lib/uiSounds';

interface VoiceControlContextType {
    isListening: boolean;
    lastCommand: string | null;
    toggleVoice: (active: boolean) => void;
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export const VoiceControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.lang = 'pt-BR';
            rec.interimResults = false;

            rec.onresult = (event: any) => {
                const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
                processCommand(command);
            };

            rec.onend = () => {
                if (isListening) rec.start();
            };

            setRecognition(rec);
        }
    }, []);

    const processCommand = (cmd: string) => {
        setLastCommand(cmd);
        if (cmd.includes('lucca') || cmd.includes('luca')) {
            uiSounds.playClick();
            if (cmd.includes('próximo') || cmd.includes('proximo')) {
                window.dispatchEvent(new CustomEvent('maestro-command', { detail: 'NEXT' }));
                notify.info("Maestro Voice: Avançando...");
            }
            if (cmd.includes('parar')) {
                window.dispatchEvent(new CustomEvent('maestro-command', { detail: 'STOP' }));
            }
            if (cmd.includes('tocar')) {
                window.dispatchEvent(new CustomEvent('maestro-command', { detail: 'PLAY' }));
            }
        }
    };

    const toggleVoice = (active: boolean) => {
        setIsListening(active);
        if (active) recognition?.start();
        else recognition?.stop();
    };

    return (
        <VoiceControlContext.Provider value={{ isListening, lastCommand, toggleVoice }}>
            {children}
            {isListening && (
                <div className="fixed top-20 right-6 z-[100] flex items-center gap-3 bg-slate-900/80 p-3 rounded-full border border-sky-500/30 backdrop-blur-md animate-in slide-in-from-right">
                    <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse-mic shadow-[0_0_10px_#0ea5e9]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Maestro Voice Online</span>
                </div>
            )}
        </VoiceControlContext.Provider>
    );
};

export const useVoice = () => {
    const context = useContext(VoiceControlContext);
    if (!context) throw new Error('useVoice must be used within VoiceControlProvider');
    return context;
};
