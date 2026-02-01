
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';
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
  setRoleOverride: (role: string | null) => void;
  getDashboardPath: (role: string | null) => string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getDashboardPath = useCallback((userRole: string | null): string => {
    if (!userRole) return '/login';
    const r = userRole.toLowerCase();
    
    switch(r) {
      case 'super_admin': 
      case 'admin': return '/admin/ecosystem';
      case 'professor': return '/teacher/classes';
      case 'student': return '/student/arcade';
      case 'guardian': return '/guardian/insights';
      case 'school_manager': 
      case 'manager': return '/manager';
      default: return '/student/arcade';
    }
  }, []);

  const syncProfile = async (currentUser: User) => {
    // 1. PRIORIDADE ABSOLUTA: HARD-CODED BYPASS
    const rootEmails = ['serparenan@gmail.com', 'adm@adm.com'];
    if (rootEmails.includes(currentUser.email?.toLowerCase() || '')) {
      const rootRole = 'super_admin';
      setRole(rootRole);
      setProfile({
          id: currentUser.id,
          email: currentUser.email!,
          full_name: "Mestre Supremo (Hardcoded)",
          role: rootRole,
          created_at: new Date().toISOString()
      } as Profile);
      setLoading(false);
      return;
    }

    // 2. BUSCA NORMAL NO BANCO
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        setRole(data.role);
      } else {
        // Se não existir perfil, tenta metadata ou assume student
        const metaRole = currentUser.user_metadata?.role || 'student';
        setRole(metaRole);
      }
    } catch (e) {
      logger.error("[Auth-Sync] Erro ao sincronizar perfil", e);
      setRole('student');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Boot inicial
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      const u = initSession?.user ?? null;
      setUser(u);
      if (u) syncProfile(u);
      else setLoading(false);
    });

    // Escuta mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      const u = currentSession?.user ?? null;
      setSession(currentSession);
      setUser(u);
      
      if (u && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        setLoading(true);
        await syncProfile(u);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    profile,
    role,
    loading,
    getDashboardPath,
    setRoleOverride: (newRole: string | null) => {
      setRole(newRole);
    },
    signOut: async () => {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/login';
    },
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    refreshProfile: async () => {
      if (user) {
        setLoading(true);
        await syncProfile(user);
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
