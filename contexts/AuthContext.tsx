import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient.ts';
import { Profile } from '../types.ts';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = async (currentUser: User) => {
    try {
      // 1. Tentar buscar Perfil Principal
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
        setRole(profileData.role);
        return;
      }

      // 2. Fallback: Tentar buscar na tabela de Estudantes (Vínculo alternativo)
      const { data: studentData } = await supabase
        .from('students')
        .select('name, instrument, professor_id')
        .eq('auth_user_id', currentUser.id)
        .maybeSingle();

      // 3. Auto-Reparo: Upsert Profiling
      const defaultName = studentData?.name || currentUser.user_metadata?.full_name || 'Usuário Maestro';
      const defaultRole = currentUser.user_metadata?.role || 'student';

      const { data: newProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email!,
          full_name: defaultName,
          role: defaultRole,
          school_id: '00000000-0000-0000-0000-000000000000'
        }, { onConflict: 'id' })
        .select()
        .single();

      if (newProfile) {
        setProfile(newProfile as Profile);
        setRole(newProfile.role);
      }
    } catch (e) {
      console.error("[Kernel Sync Failed]:", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) syncProfile(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        setLoading(true);
        await syncProfile(u);
        setLoading(false);
      } else {
        setProfile(null);
        setRole(null);
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
    signOut: async () => { await supabase.auth.signOut(); },
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    refreshProfile: async () => { if (user) await syncProfile(user); }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
