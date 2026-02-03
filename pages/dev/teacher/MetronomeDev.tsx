
import React from 'react';
import { Music2, Timer } from 'lucide-react';
import { DevPageHeader, FeatureList, TechnicalNotes } from '../../../components/dev/DevUI.tsx';
import { Metronome } from '../../../components/tools/Metronome.tsx';

export default function MetronomeDev() {
    return (
        <div className="animate-in fade-in duration-500">
            <DevPageHeader 
                icon={Music2} 
                title="Metrônomo Maestro" 
                description="Ferramenta de sincronia rítmica para condução de aulas em tempo real."
                status="beta"
            />

            <div className="grid grid-cols-1 gap-10">
                <div className="bg-slate-900/50 p-1 rounded-[48px] border border-amber-500/20 shadow-2xl">
                    <Metronome />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FeatureList features={[
                        'Ajuste de BPM dinâmico (40-240)',
                        'Subdivisões rítmicas (1/4 até 1/16)',
                        'Múltiplos timbres (Digital, Madeira, Snare)',
                        'Feedback visual por pulso',
                        'Sincronia via Web Audio Scheduler'
                    ]} />
                    
                    <TechnicalNotes notes="Implementado com AudioContext Scheduler para garantir precisão rítmica independente da carga da CPU. Utiliza GainNodes para controle de volume independente por timbre." />
                </div>
            </div>
        </div>
    );
}
