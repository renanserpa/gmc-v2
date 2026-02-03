
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';
import { logger } from '../lib/logger.ts';

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  role: string | null;
  actingRole: string | null; // Papel visual ativo
  schoolId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  setActingRole: (role: string | null) => void;
  getDashboardPath: (role: string | null) => string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [actingRole, setActingRoleState] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getDashboardPath = useCallback((userRole: string | null): string => {
    if (!userRole) return '/login';
    const r = userRole.toLowerCase();
    
    switch(r) {
      case 'god_mode': return '/system/console';
      case 'saas_admin_global': return '/admin/business';
      case 'professor': 
      case 'teacher_owner': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      case 'guardian': return '/guardian/dashboard';
      case 'school_manager': 
      case 'manager': return '/manager/dashboard';
      default: return '/student/dashboard';
    }
  }, []);

  const setActingRole = (newRole: string | null) => {
    setActingRoleState(newRole);
    if (newRole) localStorage.setItem('maestro_acting_role', newRole);
    else localStorage.removeItem('maestro_acting_role');
  };

  const syncProfile = async (currentUser: any) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
        setRole(data.role);
        setSchoolId(data.school_id);
        
        const savedActing = localStorage.getItem('maestro_acting_role');
        setActingRoleState(savedActing || data.role);
      } else if (currentUser.email === 'serparenan@gmail.com') {
        setRole('god_mode');
        const savedActing = localStorage.getItem('maestro_acting_role');
        setActingRoleState(savedActing || 'god_mode');
      } else {
        setRole('student');
        setActingRoleState('student');
      }
    } catch (e) {
      logger.error("[Auth] Falha na sincronia", e);
      // Fallback para evitar travamento
      setRole('student');
      setActingRoleState('student');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listener de estado global para detectar login/logout instantaneamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setLoading(true);
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await syncProfile(currentUser);
      } else {
        setProfile(null);
        setRole(null);
        setActingRoleState(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session, user, profile, role, actingRole, schoolId, loading, getDashboardPath,
    setActingRole,
    signOut: async () => {
        localStorage.removeItem('maestro_acting_role');
        await (supabase.auth as any).signOut();
        window.location.href = '/#/login';
    },
    signIn: async (email: string, password: string) => {
      return await (supabase.auth as any).signInWithPassword({ email, password });
    },
    refreshProfile: async () => {
      if (user) await syncProfile(user);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
