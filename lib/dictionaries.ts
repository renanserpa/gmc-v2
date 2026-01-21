import { CheckCircle, AlertCircle, Clock, XCircle, Calendar } from 'lucide-react';

// --- Mission Status Configuration ---

export const MISSION_STATUS_MAP = {
    'done': {
        label: 'Concluída',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        icon: CheckCircle,
        lineThrough: true
    },
    'pending': {
        label: 'Pendente',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: AlertCircle,
        lineThrough: false
    },
    'expired': {
        label: 'Expirada',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: XCircle,
        lineThrough: false
    }
};

// --- Lesson Status Configuration ---

export const LESSON_STATUS_MAP = {
    'scheduled': {
        label: 'Agendada',
        color: 'text-slate-400',
        bg: 'bg-slate-800',
        border: 'border-slate-700'
    },
    'completed': {
        label: 'Concluída',
        color: 'text-green-400',
        bg: 'bg-green-900/20',
        border: 'border-green-900/30'
    },
    'canceled': {
        label: 'Cancelada',
        color: 'text-red-400',
        bg: 'bg-red-900/20',
        border: 'border-red-900/30'
    }
};