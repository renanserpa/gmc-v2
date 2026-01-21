
import React from 'react';
import { InstrumentType } from '../../types';
import { Fretboard } from '../tools/Fretboard';
import { PianoKeys } from './PianoKeys';
import { DrumMachine } from '../tools/DrumMachine';
import { VocalMonitor } from './VocalMonitor';
import { Music } from 'lucide-react';

interface InstrumentFactoryProps {
    type: InstrumentType;
    data: {
        activeNotes: number[];
        rootKey?: string;
        detectedNoteIdx?: number | null;
    };
}

export const InstrumentFactory: React.FC<InstrumentFactoryProps> = ({ type, data }) => {
    switch (type) {
        case InstrumentType.Guitar:
        case InstrumentType.Ukulele:
            return (
                <Fretboard 
                    rootKey={data.rootKey || 'C'} 
                    detectedNoteIdx={data.detectedNoteIdx} 
                />
            );

        case InstrumentType.Piano:
            return <PianoKeys activeNotes={data.activeNotes} />;

        case InstrumentType.Drums:
            return (
                <div className="w-full">
                    <DrumMachine />
                </div>
            );

        case InstrumentType.Vocals:
            return (
                <div className="w-full">
                    <VocalMonitor />
                </div>
            );

        default:
            return (
                <div className="p-10 bg-red-900/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center gap-4">
                    <Music />
                    <p className="font-bold">Instrumento não suportado nesta versão.</p>
                </div>
            );
    }
};
