
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Mic, Timer, SlidersHorizontal, Zap, Headphones, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

interface MixerChannelProps {
    label: string;
    icon: any;
    value: number;
    onChange: (val: number) => void;
    color: string;
    isMuted?: boolean;
    onToggleMute?: () => void;
}

const MixerChannel: React.FC<MixerChannelProps> = ({ label, icon: Icon, value, onChange, color, isMuted, onToggleMute }) => (
    <div className="flex flex-col items-center gap-4 group">
        <div className="h-40 w-4 bg-slate-950 rounded-full relative overflow-hidden flex flex-col justify-end border border-white/5 shadow-inner">
            <motion.div 
                className={cn("w-full rounded-full transition-all", isMuted ? "bg-slate-800" : color)}
                initial={false}
                animate={{ height: `${isMuted ? 0 : value * 100}%` }}
            />
            <input 
                type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : value} 
                onChange={(e) => { onChange(parseFloat(e.target.value)); haptics.light(); }}
                className="absolute inset-0 opacity-0 cursor-pointer h-full w-full rotate-180"
                style={{ appearance: 'slider-vertical' as any }}
            />
        </div>
        <button 
            onClick={() => { onToggleMute?.(); haptics.medium(); }}
            className={cn(
                "p-3 rounded-xl transition-all shadow-lg", 
                isMuted ? "bg-red-500/10 text-red-500" : (value > 0 ? "bg-slate-800 text-white" : "bg-slate-950 text-slate-700")
            )}
        >
            <Icon size={16} />
        </button>
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
    </div>
);

interface MaestroMixerProps {
    gains: { music: number; mic: number; metro: number; vocals?: number; drums?: number; bass?: number };
    onGainChange: (channel: any, val: number) => void;
    micEnhancement: boolean;
    onToggleEnhancement: (val: boolean) => void;
    isMonitoring?: boolean;
    onToggleMonitoring?: (val: boolean) => void;
}

export const MaestroMixer: React.FC<MaestroMixerProps> = ({ 
    gains, onGainChange, micEnhancement, onToggleEnhancement, isMonitoring, onToggleMonitoring 
}) => {
    const hasStems = gains.vocals !== undefined;

    return (
        <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-sky-500/5 blur-[60px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-10 relative z-10 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-600 rounded-xl text-white">
                        <SlidersHorizontal size={18} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Studio Console</span>
                        <span className="text-white font-black text-sm uppercase tracking-widest">Maestro Mixer Pro</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => { onToggleMonitoring?.(!isMonitoring); haptics.medium(); }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all border",
                            isMonitoring ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-slate-950 border-white/5 text-slate-600"
                        )}
                    >
                        <Headphones size={12} /> {isMonitoring ? 'Monitor ON' : 'Monitor'}
                    </button>
                    <button 
                        onClick={() => { onToggleEnhancement(!micEnhancement); haptics.medium(); }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all border",
                            micEnhancement ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-slate-950 border-white/5 text-slate-600"
                        )}
                    >
                        <Zap size={12} fill={micEnhancement ? "currentColor" : "none"} /> Clean
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-end gap-2 relative z-10">
                {hasStems ? (
                    <>
                        <MixerChannel label="Vocals" icon={Mic} value={gains.vocals || 0.7} onChange={(v) => onGainChange('vocals', v)} color="bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
                        <MixerChannel label="Drums" icon={Volume2} value={gains.drums || 0.7} onChange={(v) => onGainChange('drums', v)} color="bg-gradient-to-t from-sky-600 to-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]" />
                        <MixerChannel label="Bass" icon={Music} value={gains.bass || 0.7} onChange={(v) => onGainChange('bass', v)} color="bg-gradient-to-t from-purple-600 to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
                    </>
                ) : (
                    <MixerChannel label="Track" icon={Music} value={gains.music} onChange={(v) => onGainChange('music', v)} color="bg-gradient-to-t from-sky-600 to-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]" />
                )}
                
                <div className="w-px h-24 bg-white/5 mx-2" />
                
                <MixerChannel label="My Mic" icon={Mic} value={gains.mic} onChange={(v) => onGainChange('mic', v)} color="bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                <MixerChannel label="Beat" icon={Timer} value={gains.metro} onChange={(v) => onGainChange('metro', v)} color="bg-gradient-to-t from-pink-600 to-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]" />
            </div>
        </div>
    );
};
