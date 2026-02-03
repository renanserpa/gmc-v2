
import React from 'react';
import { Gamepad2, Rocket } from 'lucide-react';
import { DevPageHeader, FeatureList, TechnicalNotes } from '../../../components/dev/DevUI.tsx';
import { NoteInvaders } from '../../../components/games/NoteInvaders.tsx';

export default function ArcadeDev() {
    return (
        <div className="animate-in fade-in duration-500">
            <DevPageHeader 
                icon={Gamepad2} 
                title="Maestro Arcade" 
                description="Gamificação de percepção musical e agilidade no instrumento."
                status="proto"
            />

            <div className="grid grid-cols-1 gap-10">
                <div className="bg-slate-900 p-4 rounded-[48px] border border-purple-500/20 shadow-2xl">
                    <NoteInvaders onExit={() => {}} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FeatureList features={[
                        'Reconhecimento de Pitch (FFT)',
                        'Mecânica de destruição por nota correta',
                        'Aumento progressivo de velocidade',
                        'Ranking local de pontuação',
                        'Suporte a microfones externos'
                    ]} />
                    
                    <TechnicalNotes notes="O motor de jogo utiliza o usePitchDetector para mapear frequências de áudio em notas MIDI. Latência alvo: <20ms para jogabilidade fluida." />
                </div>
            </div>
        </div>
    );
}
