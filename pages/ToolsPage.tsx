
import React, { useState } from 'react';
import { Sketchpad } from '../components/tools/Sketchpad';
import { CircleOfFifths } from '../components/tools/CircleOfFifths';
import { EarTrainer } from '../components/tools/EarTrainer';
import { Metronome } from '../components/tools/Metronome';
import { VisualTheory } from '../components/tools/VisualTheory';
import { Tuner } from '../components/tools/Tuner';
import { ChordProAssistant } from '../components/tools/ChordProAssistant';
import { ReverseChordFinder } from '../components/theory/ReverseChordFinder';
import { HarmonicFieldExplorer } from '../components/theory/HarmonicFieldExplorer';
import { ChordSubstitutor } from '../components/theory/ChordSubstitutor';
import { TechniqueGym } from '../components/tools/TechniqueGym';
import { DrumMachine } from '../components/tools/DrumMachine';
import { BrainCircuit, Music, Hammer, Zap, Timer, Eye, Volume2, Type, Brain, Scale, Search, Globe, Replace, Settings2, Dumbbell, Drum } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { haptics } from '../lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTuning, TUNING_PRESETS } from '../contexts/TuningContext';

const PRACTICE_TOOLS = [
    { id: 'rhythm', label: 'Metrônomo', icon: Timer, color: 'text-pink-400' },
    { id: 'drum_machine', label: 'Groovebox', icon: Drum, color: 'text-amber-400' },
    { id: 'tuner', label: 'Afinador', icon: Volume2, color: 'text-sky-400' },
    { id: 'technique', label: 'Technique Gym', icon: Dumbbell, color: 'text-emerald-400' },
    { id: 'creation', label: 'Sketchpad', icon: Hammer, color: 'text-amber-400' },
];

const STUDY_TOOLS = [
    { id: 'theory', label: 'Bússola Modal', icon: Music, color: 'text-purple-400' },
    { id: 'visual', label: 'Geometria', icon: Eye, color: 'text-indigo-400' },
    { id: 'training', label: 'Ouvido', icon: BrainCircuit, color: 'text-emerald-400' },
];

const ADVANCED_TOOLS = [
    { id: 'reharmonizer', label: 'Reharmonizer', icon: Replace, color: 'text-amber-500' },
    { id: 'chord_finder', label: 'Chord Finder', icon: Search, color: 'text-sky-500' },
    { id: 'harmonic_field', label: 'Campo Harmônico', icon: Globe, color: 'text-purple-500' },
    { id: 'editor', label: 'ChordPro', icon: Type, color: 'text-slate-400' },
];

interface ToolButtonProps {
    tool: any;
    activeTab: string;
    onSelect: (id: string) => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, activeTab, onSelect }) => (
    <button 
        onClick={() => { onSelect(tool.id); haptics.medium(); }}
        className={cn(
            "flex-1 md:flex-none px-6 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 border-2",
            activeTab === tool.id 
                ? "bg-slate-800 border-sky-500 text-white shadow-lg" 
                : "bg-slate-900/40 border-transparent text-slate-500 hover:text-slate-100 hover:bg-slate-800"
        )}
    >
        <tool.icon size={20} className={activeTab === tool.id ? tool.color : ""} /> 
        <span>{tool.label}</span>
    </button>
);

export default function ToolsPage() {
    usePageTitle("Arsenal Maestro");
    const [activeTab, setActiveTab] = useState('rhythm');
    const { activeTuning, setActiveTuning } = useTuning();

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Arsenal Maestro</h1>
                    <p className="text-slate-500 font-medium">Equipamento de elite para instrumentistas pro.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                    <Settings2 size={16} className="text-slate-500 ml-2" />
                    <select 
                        value={activeTuning.id}
                        onChange={(e) => setActiveTuning(TUNING_PRESETS.find(p => p.id === e.target.value)!)}
                        className="bg-transparent text-white font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer pr-4"
                    >
                        {TUNING_PRESETS.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.label}</option>)}
                    </select>
                </div>
            </header>

            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2">
                        <Zap size={14} className="text-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Cinturão de Prática</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {PRACTICE_TOOLS.map(t => <ToolButton key={t.id} tool={t} activeTab={activeTab} onSelect={setActiveTab} />)}
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center gap-3 px-2">
                        <BrainCircuit size={14} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Cinturão de Estudo</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {STUDY_TOOLS.map(t => <ToolButton key={t.id} tool={t} activeTab={activeTab} onSelect={setActiveTab} />)}
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center gap-3 px-2">
                        <Scale size={14} className="text-sky-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Teoria Avançada</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ADVANCED_TOOLS.map(t => <ToolButton key={t.id} tool={t} activeTab={activeTab} onSelect={setActiveTab} />)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <main className="lg:col-span-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {activeTab === 'creation' && <Sketchpad />}
                            {activeTab === 'editor' && <ChordProAssistant />}
                            {activeTab === 'rhythm' && <Metronome />}
                            {activeTab === 'drum_machine' && <DrumMachine />}
                            {activeTab === 'theory' && <CircleOfFifths />}
                            {activeTab === 'visual' && <VisualTheory />}
                            {activeTab === 'training' && <EarTrainer />}
                            {activeTab === 'tuner' && <Tuner />}
                            {activeTab === 'technique' && <TechniqueGym />}
                            {activeTab === 'chord_finder' && <ReverseChordFinder />}
                            {activeTab === 'harmonic_field' && <HarmonicFieldExplorer />}
                            {activeTab === 'reharmonizer' && <ChordSubstitutor />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
