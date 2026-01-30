
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
   * STAFF DIAGNOSTIC: Sincroniza o perfil garantindo que o RLS não bloqueie a leitura inicial.
   * Adicionado tratamento para erro 42501 (Permission Denied).
   */
  const syncProfile = async (currentUser: User) => {
    logger.info(`[Auth] Iniciando sincronia para UUID: ${currentUser.id}`);
    
    try {
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (pError) {
        if (pError.code === '42501') {
          logger.error("[Auth] Falha de RLS detectada. O usuário não tem permissão para ler o próprio perfil.", pError);
        }
        throw pError;
      }

      if (profileData) {
        logger.debug(`[Auth] Perfil localizado. Role: ${profileData.role}`);
        setProfile(profileData as Profile);
        setRole(profileData.role);
        return;
      }

      // Protocolo de Auto-Reparo: Criação de perfil on-the-fly se não existir
      logger.warn("[Auth] Perfil ausente no DB. Executando auto-reparo...");
      
      const metadataRole = currentUser.user_metadata?.role || 'student';
      const { data: repairedProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email!,
          full_name: currentUser.user_metadata?.full_name || 'Músico Maestro',
          role: metadataRole,
          school_id: currentUser.user_metadata?.school_id || null
        }, { onConflict: 'id' })
        .select()
        .single();

      if (upsertError) throw upsertError;

      if (repairedProfile) {
        setProfile(repairedProfile as Profile);
        setRole(repairedProfile.role);
      }
    } catch (e: any) {
      logger.error("[Auth] Falha crítica na sincronia do Kernel de Identidade.", e);
    }
  };

  useEffect(() => {
    // Escuta mudanças de estado com Cleanup robusto
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      logger.info(`[Auth] Evento de Sessão: ${event}`);
      const u = currentSession?.user ?? null;
      
      setSession(currentSession);
      setUser(u);
      
      if (u) {
        setLoading(true);
        await syncProfile(u);
        setLoading(false);
      } else {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    // Carregamento inicial (Pre-boot)
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (initSession?.user) {
        syncProfile(initSession.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      logger.debug("[Auth] Encerrando subscrição de estado.");
      subscription.unsubscribe();
    };
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
