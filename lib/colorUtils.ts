
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import React from 'react';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface FeedbackToken {
    color: string;
    icon: React.ElementType;
    label: string;
    pattern?: string;
}

export const getFeedbackToken = (status: 'success' | 'error' | 'warning', mode: ColorBlindMode): FeedbackToken => {
    if (mode === 'none') {
        if (status === 'success') return { color: 'text-emerald-400', icon: CheckCircle2, label: 'Perfeito!' };
        if (status === 'error') return { color: 'text-red-500', icon: XCircle, label: 'Ops!' };
        return { color: 'text-amber-500', icon: AlertCircle, label: 'Cuidado' };
    }

    // Para daltônicos, focamos em ÍCONES e CONTRASTE, não apenas Hue.
    switch (status) {
        case 'success':
            return { 
                color: 'text-sky-400', // Azul é mais seguro para a maioria dos daltônicos
                icon: Sparkles, 
                label: 'CONCLUÍDO',
                pattern: 'stripe-bg' 
            };
        case 'error':
            return { 
                color: 'text-slate-100', 
                icon: XCircle, 
                label: 'TENTE NOVAMENTE' 
            };
        case 'warning':
            return { 
                color: 'text-yellow-400', 
                icon: AlertCircle, 
                label: 'ATENÇÃO' 
            };
    }
};
