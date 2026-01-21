
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tuning } from '../types';

export const TUNING_PRESETS: Tuning[] = [
    { id: 'standard', label: 'Standard (EADGBE)', notes: [4, 11, 7, 2, 9, 4] },
    { id: 'drop_d', label: 'Drop D (EADGBA)', notes: [4, 11, 7, 2, 9, 2] },
    { id: 'eb_standard', label: 'Eb Standard', notes: [3, 10, 6, 1, 8, 3] },
    { id: 'dadgad', label: 'DADGAD', notes: [2, 9, 7, 2, 9, 2] },
    { id: 'open_g', label: 'Open G', notes: [2, 11, 7, 2, 10, 2] }
];

interface TuningContextType {
    activeTuning: Tuning;
    setActiveTuning: (tuning: Tuning) => void;
}

const TuningContext = createContext<TuningContextType | undefined>(undefined);

export const TuningProvider = ({ children }: { children?: ReactNode }) => {
    const [activeTuning, setActiveTuning] = useState<Tuning>(TUNING_PRESETS[0]);

    return (
        <TuningContext.Provider value={{ activeTuning, setActiveTuning }}>
            {children}
        </TuningContext.Provider>
    );
};

export const useTuning = () => {
    const context = useContext(TuningContext);
    if (!context) throw new Error('useTuning deve ser usado dentro de um TuningProvider');
    return context;
};
