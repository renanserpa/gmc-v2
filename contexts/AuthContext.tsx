
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

  const resolveVirtualRole = (email: string): string => {
    if (email.startsWith('adm@') || email.startsWith('a@')) return 'admin';
    if (email.startsWith('p@')) return 'professor';
    if (email.startsWith('r@')) return 'guardian';
    if (email.startsWith('g@')) return 'manager';
    return 'student';
  };

  const syncProfile = async (currentUser: User) => {
    logger.info(`[Auth-Sync] Resolvendo identidade para: ${currentUser.email}`);
    
    try {
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
        setRole(profileData.role);
      } else if (currentUser.email?.endsWith('@adm.com')) {
        // VIRTUAL IDENTITY PROXY: Permite acesso mesmo sem registro no DB
        const virtualRole = resolveVirtualRole(currentUser.email);
        logger.warn(`[Auth-Virtual] Usuário de teste detectado. Injetando role: ${virtualRole}`);
        setRole(virtualRole);
        setProfile({
          id: currentUser.id,
          email: currentUser.email,
          full_name: `Test User (${virtualRole.toUpperCase()})`,
          role: virtualRole,
          created_at: new Date().toISOString()
        } as Profile);
      } else {
        const metadataRole = currentUser.user_metadata?.role || 'student';
        setRole(metadataRole);
      }
    } catch (e: any) {
      logger.error("[Auth-Fatal] Erro ao sincronizar perfil", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
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
