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
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
  setRoleOverride: (role: string | null) => void;
  getDashboardPath: (role: string | null) => string;
  // FIX: Adicionando devLogin ao contrato do contexto para suportar ferramentas de desenvolvimento
  devLogin: (userId: string, role: string) => Promise<void>;
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

  const internalSignOut = async (reason?: string) => {
    await supabase.auth.signOut();
    localStorage.clear();
    if (reason) notify.error(reason);
    window.location.href = '/login';
  };

  const syncProfile = async (currentUser: User) => {
    const rootEmails = ['serparenan@gmail.com', 'admin@oliemusic.dev'];
    
    if (rootEmails.includes(currentUser.email?.toLowerCase() || '')) {
      setRole('super_admin');
      setProfile({
          id: currentUser.id,
          email: currentUser.email!,
          full_name: "Master Root (Bypass)",
          role: 'super_admin',
          created_at: new Date().toISOString()
      } as Profile);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, schools(is_active)')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data) {
        // --- GOVERNANÇA: Kill Switch Check ---
        // Se o tenant estiver desativado, força logout imediato
        if (data.school_id && data.schools && data.schools.is_active === false) {
           await internalSignOut("Esta unidade escolar foi suspensa pelo Administrador Master.");
           return;
        }

        setProfile(data as Profile);
        setRole(data.role);
      } else {
        const metaRole = currentUser.user_metadata?.role || 'student';
        setRole(metaRole);
      }
    } catch (e) {
      logger.error("[Auth] Perfil não encontrado ou erro de RLS", e);
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
        setLoading(false);
      }
    });

    // --- REALTIME BROADCAST: Tenant Suspended (Kill Switch Listener) ---
    const channel = supabase.channel('maestro_global_control')
      .on('broadcast', { event: 'tenant_suspended' }, ({ payload }) => {
          if (profile?.school_id === payload.school_id && role !== 'super_admin') {
              internalSignOut("Sessão Encerrada: Sua unidade escolar acaba de ser suspensa por motivos administrativos.");
          }
      })
      .subscribe();

    return () => {
        subscription.unsubscribe();
        supabase.removeChannel(channel);
    };
  }, [profile?.school_id, role]);

  const value = {
    session, user, profile, role, loading, getDashboardPath,
    setRoleOverride: (newRole: string | null) => setRole(newRole),
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
    // FIX: Implementação do devLogin para simular estados de autenticação e facilitar o desenvolvimento
    devLogin: async (userId: string, targetRole: string) => {
      localStorage.setItem('oliemusic_dev_user_id', userId);
      localStorage.setItem('oliemusic_dev_role', targetRole);
      setRole(targetRole);
      // Simula um usuário autenticado localmente para o sistema de rotas e guards
      // FIX: Use unknown as intermediate cast to satisfy strict Supabase User type requirements
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