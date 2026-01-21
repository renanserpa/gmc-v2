import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
// IMPORTANTE: Caminho relativo
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
  devLogin: (userId: string, role: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
  devLogin: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: User) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data as Profile);
      setRole(data?.role || null);
      return data;
    } catch (e) {
      console.warn("Could not fetch profile", e);
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const user = session?.user ?? null;
      setUser(user);
      if (user) {
        await fetchProfile(user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const user = session?.user ?? null;
      setUser(user);
      if (user) {
        setLoading(true);
        await fetchProfile(user);
        setLoading(false);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('oliemusic_dev_user_id');
    localStorage.removeItem('oliemusic_dev_role');
    setProfile(null);
    setRole(null);
  };

  const signIn = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };
  
  const devLogin = async (userId: string, roleTarget: string) => {
    localStorage.setItem('oliemusic_dev_user_id', userId);
    localStorage.setItem('oliemusic_dev_role', roleTarget);
    
    const devUser: User = { 
        id: userId, 
        app_metadata: {}, 
        user_metadata: { email: `${roleTarget}@oliemusic.dev`, full_name: `Dev ${roleTarget}` }, 
        aud: 'authenticated', 
        created_at: new Date().toISOString() 
    };

    const devProfile: Profile = {
        id: userId,
        email: `${roleTarget}@oliemusic.dev`,
        full_name: `Dev ${roleTarget}`,
        role: roleTarget,
        avatar_url: null,
        created_at: new Date().toISOString(),
    };
    
    setUser(devUser);
    setProfile(devProfile);
    setRole(roleTarget);
    setSession({} as Session); // mock session
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
        await fetchProfile(user);
    }
  };

  const value = { session, user, profile, role, loading, signOut, signIn, devLogin, refreshProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);