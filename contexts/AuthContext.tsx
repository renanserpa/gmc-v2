
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient.ts';
import { Profile } from '../types.ts';
import { logger } from '../lib/logger.ts';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
  devLogin: (userId: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * EMERGENCY RECOVERY: Sincroniza o perfil garantindo que o estado não trave.
   */
  const syncProfile = async (currentUser: User) => {
    logger.info(`[Auth-Recovery] Tentando sincronia para: ${currentUser.email}`);
    
    try {
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (pError) {
        logger.error("[Auth-Critical] Erro de RLS ou Banco de Dados detectado.", pError);
        // Não lançamos erro aqui para não travar o setLoading(false)
      }

      // Log diagnóstico de school_id (Staff Request)
      if (profileData) {
        if (!profileData.school_id) {
          console.warn(`[Auth-Telemetry] ALERTA: Usuário ${currentUser.email} está com school_id UNDEFINED/NULL.`);
        }
        setProfile(profileData as Profile);
        setRole(profileData.role);
      } else {
        // Fallback: Tenta usar metadata do JWT se o registro no DB falhar (Lockdown Bypass)
        const metadataRole = currentUser.user_metadata?.role || 'student';
        logger.warn(`[Auth-Fallback] Perfil não encontrado no DB. Usando metadata: ${metadataRole}`);
        setRole(metadataRole);
      }
    } catch (e: any) {
      logger.error("[Auth-Fatal] Falha catastrófica no motor de identidade.", e);
    } finally {
      // GARANTIA STAFF: Nunca deixe o loading como true se houver um usuário presente
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listener de estado com auto-liberação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      logger.debug(`[Auth-Event] Transição detectada: ${event}`);
      const u = currentSession?.user ?? null;
      
      setSession(currentSession);
      setUser(u);
      
      if (u) {
        setLoading(true);
        await syncProfile(u);
      } else {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    // Boot inicial
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (initSession?.user) {
        syncProfile(initSession.user);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  const devLogin = async (userId: string, targetRole: string) => {
    localStorage.setItem('oliemusic_dev_user_id', userId);
    localStorage.setItem('oliemusic_dev_role', targetRole);
    setRole(targetRole);
    window.location.reload();
  };

  const value = {
    session,
    user,
    profile,
    role,
    loading,
    signOut: async () => { 
        localStorage.removeItem('oliemusic_dev_role');
        localStorage.removeItem('oliemusic_dev_user_id');
        await supabase.auth.signOut(); 
    },
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    refreshProfile: async () => { if (user) await syncProfile(user); },
    devLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
