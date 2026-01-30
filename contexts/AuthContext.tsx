
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
  getDashboardPath: (role: string | null) => string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mapeador central de Roles para Caminhos de URL
  const getDashboardPath = (userRole: string | null): string => {
    if (!userRole) return '/login';
    switch (userRole) {
      case 'super_admin':
      case 'admin':
        return '/admin';
      case 'school_manager':
      case 'manager':
        return '/manager';
      case 'professor':
        return '/professor';
      case 'student':
        return '/student';
      case 'guardian':
        return '/guardian';
      default:
        return '/app';
    }
  };

  const syncProfile = async (currentUser: User) => {
    try {
      logger.info(`[Auth-Sync] Sincronizando perfil: ${currentUser.email}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
        setRole(data.role);
      } else {
        const metaRole = currentUser.user_metadata?.role || 'student';
        setRole(metaRole);
        logger.warn("[Auth-Sync] Perfil DB ausente. Usando metadados.");
      }
    } catch (e) {
      logger.error("[Auth-Sync] Falha crítica", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      const u = initSession?.user ?? null;
      setUser(u);
      if (u) syncProfile(u);
      else setLoading(false);
    });

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
    },
    devLogin: async (id: string, r: string) => {
      setRole(r);
      window.location.reload();
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
