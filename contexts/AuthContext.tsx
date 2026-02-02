import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';
import { logger } from '../lib/logger.ts';
import { notify } from '../lib/notification.ts';

interface AuthContextType {
  session: Session | null;
  user: User | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    await supabase.auth.signOut();
    localStorage.clear();
    if (reason) notify.error(reason);
    window.location.href = '/login';
  };

  const syncProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, schools(name, is_active)')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data) {
        // Bloqueio de Tenant Suspenso
        if (data.school_id && data.schools && data.schools.is_active === false && data.role !== 'super_admin') {
           await internalSignOut("Sessão Bloqueada: Esta unidade escolar está suspensa.");
           return;
        }

        setProfile(data as Profile);
        setRole(data.role);
        setSchoolId(data.school_id);
        
        // SPRINT 1.1 GODMODE LOG
        if (data.role === 'super_admin') {
            console.log(`%c[Maestro Kernel] Modo Godmode Ativo para: ${currentUser.email}`, 'color: #facc15; font-weight: bold; background: #422006; padding: 4px 8px; border-radius: 8px;');
        } else {
            console.log(`%c[Maestro Kernel] Contexto Ativo: ${data.schools?.name || 'Global'}`, 'color: #38bdf8; font-weight: bold; background: #0f172a; padding: 2px 5px; border-radius: 4px;');
        }
      } else {
        // Fallback: Usuário autenticado sem perfil na tabela profiles ainda
        const metaRole = currentUser.user_metadata?.role || 'student';
        setRole(metaRole);
        console.warn("[Maestro] Perfil pendente na tabela public.profiles.");
      }
    } catch (e) {
      logger.error("[Auth] Falha de sincronia RLS", e);
      setRole('student');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      const u = initSession?.user ?? null;
      setSession(initSession);
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
        setSchoolId(null);
        setLoading(false);
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const value = {
    session, user, profile, role, schoolId, loading, getDashboardPath,
    setRoleOverride: (newRole: string | null) => setRole(newRole),
    setSchoolOverride: (newSchoolId: string | null) => {
        setSchoolId(newSchoolId);
        if (profile) setProfile({...profile, school_id: newSchoolId});
    },
    signOut: () => internalSignOut(),
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
    devLogin: async (userId: string, targetRole: string) => {
      localStorage.setItem('oliemusic_dev_user_id', userId);
      localStorage.setItem('oliemusic_dev_role', targetRole);
      setRole(targetRole);
      setUser({ 
        id: userId, 
        email: `dev-${targetRole}@oliemusic.dev`,
        user_metadata: { role: targetRole, full_name: `Dev ${targetRole}` }
      } as unknown as User);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
