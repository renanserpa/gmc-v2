
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';
import { logger } from '../lib/logger.ts';

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  role: string | null;
  actingRole: string | null; 
  schoolId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  setActingRole: (role: string | null) => void;
  setSchoolOverride: (id: string | null) => void;
  getDashboardPath: (role: string | null) => string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(undefined!);

const PILOT_SCHOOL_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

const MOCK_MASTER_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'serparenan@gmail.com',
  user_metadata: { full_name: 'Maestro Renan Serpa (Root)', role: 'god_mode' }
};

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
    if (r === 'god_mode' || r === 'professor' || r === 'teacher_owner' || r === 'admin') return '/teacher/dashboard';
    if (r === 'student') return '/student/dashboard';
    return '/';
  }, []);

  const syncProfile = async (currentUser: any) => {
    // FORCE BYPASS SPRINT 01 - LOGIN SEMPRE ATIVO COMO ROOT
    setUser(MOCK_MASTER_USER);
    setRole('god_mode');
    setActingRoleState('god_mode');
    setSchoolId(PILOT_SCHOOL_ID);
    setProfile({
        id: MOCK_MASTER_USER.id,
        email: MOCK_MASTER_USER.email,
        full_name: MOCK_MASTER_USER.user_metadata.full_name,
        role: 'god_mode',
        school_id: PILOT_SCHOOL_ID
    } as Profile);
    setLoading(false);
    return;
  };

  useEffect(() => {
    syncProfile(null);
  }, []);

  const value = {
    session, user, profile, role, actingRole, schoolId, loading, getDashboardPath,
    setActingRole: (r: string | null) => {
      setActingRoleState(r);
      if (r) localStorage.setItem('maestro_acting_role', r);
    },
    setSchoolOverride: (id: string | null) => {
        setSchoolId(id);
        if (id) localStorage.setItem('maestro_active_school', id);
    },
    signOut: async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('maestro_acting_role');
        localStorage.removeItem('maestro_active_school');
        window.location.reload();
    },
    signIn: async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    refreshProfile: async () => {
      await syncProfile(null);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
