

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Droplets, Baby, AlertTriangle, HelpCircle, 
  Play, Ear, RotateCcw, X, Volume2 
} from 'lucide-react';
import { classroomService } from '../../services/classroomService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { haptics } from '../../lib/haptics';

interface PECSCard {
  id: string;
  label: string;
  phrase: string;
  icon: any;
  color: string;
  category: 'needs' | 'sensory' | 'musical';
}

const CARDS: PECSCard[] = [
  { id: 'water', label: 'Água', phrase: 'Quero água, por favor.', icon: Droplets, color: 'bg-blue-500', category: 'needs' },
  { id: 'bathroom', label: 'Banheiro', phrase: 'Preciso ir ao banheiro.', icon: Baby, color: 'bg-yellow-500', category: 'needs' },
  { id: 'help', label: 'Ajuda', phrase: 'Pode me ajudar?', icon: HelpCircle, color: 'bg-purple-500', category: 'needs' },
  { id: 'too_loud', label: 'Muito Alto', phrase: 'O som está muito alto para mim.', icon: Volume2, color: 'bg-red-500', category: 'sensory' },
  { id: 'break', label: 'Pausa', phrase: 'Preciso de uma pequena pausa.', icon: AlertTriangle, color: 'bg-orange-500', category: 'sensory' },
  { id: 'play', label: 'Tocar', phrase: 'Agora eu quero tocar!', icon: Play, color: 'bg-green-500', category: 'musical' },
  { id: 'listen', label: 'Ouvir', phrase: 'Agora eu quero ouvir.', icon: Ear, color: 'bg-sky-500', category: 'musical' },
  { id: 'repeat', label: 'Repetir', phrase: 'Pode repetir o exercício?', icon: RotateCcw, color: 'bg-indigo-500', category: 'musical' },
];

export const PECSBoard: React.FC<{ classId?: string }> = ({ classId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();

  const handleSpeak = (card: PECSCard) => {
    haptics.heavy();
    const utterance = new SpeechSynthesisUtterance(card.phrase);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);

    if (classId && user) {
      classroomService.sendCommand(classId, {
        type: 'PECS_MESSAGE',
        studentId: user.id,
        studentName: profile?.full_name || 'Aluno',
        messageId: card.id,
        label: card.label
      });
    }

    if (card.id === 'too_loud') {
       // Baixa volume local se disponível na engine
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-slate-900/95 backdrop-blur-xl border-4 border-sky-500/30 rounded-[48px] p-6 shadow-2xl w-[320px] md:w-[450px]"
          >
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Comunicador</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {CARDS.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleSpeak(card)}
                  className="flex flex-col items-center gap-2 p-3 rounded-3xl bg-slate-950 border-2 border-white/5 hover:border-white/20 active:scale-95 transition-all group"
                >
                  <div className={cn("p-4 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110", card.color)}>
                    <card.icon size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{card.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all border-4",
          isOpen ? "bg-slate-800 border-sky-500 text-sky-400" : "bg-sky-600 border-white text-white"
        )}
      >
        <MessageSquare size={32} />
      </motion.button>
    </div>
  );
};