import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';
import { logger } from '../lib/logger.ts';
import { notify } from '../lib/notification.ts';

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  role: string | null;
  schoolId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
  setRoleOverride: (role: string | null) => void;
  setSchoolOverride: (schoolId: string | null) => void;
  getDashboardPath: (role: string | null) => string;
  devLogin: (userId: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Watchdog para evitar travamento infinito
  const watchdogRef = useRef<number | null>(null);

  const getDashboardPath = useCallback((userRole: string | null): string => {
    if (!userRole) return '/login';
    const r = userRole.toLowerCase();
    
    switch(r) {
      case 'super_admin': 
      case 'admin': return '/admin';
      case 'professor': return '/teacher/classes';
      case 'student': return '/student/arcade';
      case 'guardian': return '/guardian/insights';
      case 'school_manager': 
      case 'manager': return '/manager';
      default: return '/student/arcade';
    }
  }, []);

  const internalSignOut = async (reason?: string) => {
    setLoading(true);
    await (supabase.auth as any).signOut();
    localStorage.removeItem('supabase.auth.token'); // Limpa token específico
    setProfile(null);
    setUser(null);
    setRole(null);
    if (reason) notify.error(reason);
    setLoading(false);
    window.location.href = '/#/login';
  };

  const syncProfile = async (currentUser: any) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      console.debug(`[Maestro Kernel] Sincronizando perfil: ${currentUser.email}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*, schools(name, is_active)')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.school_id && data.schools && data.schools.is_active === false && data.role !== 'super_admin') {
           await internalSignOut("Sessão Bloqueada: Esta unidade escolar está suspensa.");
           return;
        }
        setProfile(data as Profile);
        setRole(data.role);
        setSchoolId(data.school_id);
      } else if (currentUser.email === 'serparenan@gmail.com') {
        // Auto-cura para o Root
        setRole('super_admin');
      } else {
        setRole(currentUser.user_metadata?.role || 'student');
      }
    } catch (e) {
      logger.error("[Auth] Falha na sincronia de perfil", e);
      setRole('student'); // Fallback para não travar
    } finally {
      setLoading(false);
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Ativa Watchdog: Se em 8 segundos não resolver, libera o loading
      watchdogRef.current = window.setTimeout(() => {
        if (mounted && loading) {
          console.warn("[Maestro Watchdog] O carregamento demorou demais. Forçando liberação da UI.");
          setLoading(false);
        }
      }, 8000);

      const { data: { session: initSession } } = await (supabase.auth as any).getSession();
      
      if (!mounted) return;

      if (initSession) {
        setSession(initSession);
        setUser(initSession.user);
        await syncProfile(initSession.user);
      } else {
        setLoading(false);
        if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      }
    };

    initAuth();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: any, currentSession: any) => {
      if (!mounted) return;
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await syncProfile(currentSession.user);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    };
  }, []);

  const value = {
    session, user, profile, role, schoolId, loading, getDashboardPath,
    setRoleOverride: (newRole: string | null) => setRole(newRole),
    setSchoolOverride: (newSchoolId: string | null) => setSchoolId(newSchoolId),
    signOut: () => internalSignOut(),
    signIn: async (email: string, password: string) => {
      const { data, error } = await (supabase.auth as any).signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    refreshProfile: async () => {
      if (user) {
        setLoading(true);
        await syncProfile(user);
      }
    },
    devLogin: async (userId: string, targetRole: string) => {
      setRole(targetRole);
      setUser({ id: userId, email: `dev-${targetRole}@oliemusic.dev` } as any);
      setLoading(false);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
