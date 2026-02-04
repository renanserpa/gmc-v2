
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { useAuth } from './AuthContext.tsx';
import { notify } from '../lib/notification.ts';
import { Sparkles } from 'lucide-react';

interface GamificationEventContextType {
  lastLevelUp: number | null;
  triggerLevelUp: (level: number) => void;
  clearLevelUp: () => void;
}

const GamificationEventContext = createContext<GamificationEventContextType | undefined>(undefined);

export const GamificationProvider = ({ children }: { children?: ReactNode }) => {
  const [lastLevelUp, setLastLevelUp] = useState<number | null>(null);
  const { profile } = useAuth();

  const triggerLevelUp = useCallback((level: number) => {
    setLastLevelUp(level);
  }, []);

  const clearLevelUp = useCallback(() => {
    setLastLevelUp(null);
  }, []);

  useEffect(() => {
    if (!profile?.professor_id) return;

    const channelName = `classroom_${profile.professor_id}`;
    const channel = supabase.channel(channelName);

    if (channel) {
        channel
          .on('broadcast', { event: 'level_up' }, ({ payload }) => {
            if (payload && payload.studentName && payload.studentName !== profile.full_name) {
              notify.info(`${payload.studentName} subiu para o Nível ${payload.level}! 🚀`, {
                 icon: () => <Sparkles className="text-yellow-400" />,
                 autoClose: 6000
              });
            }
          })
          .subscribe((status) => {
              if (status === 'CHANNEL_ERROR') {
                  console.warn("[Gamification] Erro de rádio da turma.");
              }
          });
    }

    return () => {
      if (channel) {
          try {
              supabase.removeChannel(channel);
          } catch (e) {}
      }
    };
  }, [profile?.professor_id, profile?.full_name]);

  return (
    <GamificationEventContext.Provider value={{ lastLevelUp, triggerLevelUp, clearLevelUp }}>
      {children}
    </GamificationEventContext.Provider>
  );
};

export const useGamificationEvents = () => {
  const context = useContext(GamificationEventContext);
  if (!context) {
    throw new Error('useGamificationEvents deve ser usado dentro de um GamificationProvider');
  }
  return context;
};
