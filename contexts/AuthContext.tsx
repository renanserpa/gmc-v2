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
   * Sincroniza o perfil do banco com a sessão de autenticação.
   * Se o perfil não existir, realiza um reparo atômico (Upsert).
   */
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

      // 2. Protocolo de Reparo: O usuário existe no Auth mas não no Public.Profiles
      console.warn("[Kernel] Perfil ausente. Iniciando Protocolo de Reparo...");
      
      const defaultRole = currentUser.email === 'adm@adm.com' ? 'admin' : (currentUser.user_metadata?.role || 'student');
      const defaultName = currentUser.user_metadata?.full_name || 'Usuário Maestro';

      const { data: repairedProfile, error: upsertError } = await supabase
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

      if (repairedProfile) {
        setProfile(repairedProfile as Profile);
        setRole(repairedProfile.role);
      }
    } catch (e) {
      console.error("[Kernel Sync Failed]:", e);
    }
  };

  useEffect(() => {
    // Carregamento inicial da sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setSession(session);
      setUser(u);
      if (u) syncProfile(u);
      setLoading(false);
    });

    // Escuta mudanças de estado (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setSession(session);
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

  const devLogin = async (userId: string, targetRole: string) => {
    localStorage.setItem('oliemusic_dev_user_id', userId);
    localStorage.setItem('oliemusic_dev_role', targetRole);
    setRole(targetRole);
    // Força recarregamento para limpar caches de hooks
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
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    refreshProfile: async () => { if (user) await syncProfile(user); },
    devLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);