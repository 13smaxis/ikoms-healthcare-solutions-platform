"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'staff' | 'supervisor' | 'manager';

interface UserProfile {
  userid: string;
  name: string;
  email: string;
  usertype: string;
  status: string;
  role?: UserRole; // Current role from staff_assignments
  storeid?: string; // Store they manage/work for
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  storeid: string | null;
  loading: boolean;
  hydrating: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAdmin: boolean; // manager, staff, supervisor
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [storeid, setStoreid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authSyncCountRef = React.useRef(0);

  const beginHydration = () => {
    authSyncCountRef.current += 1;
    setHydrating(true);
  };

  const endHydration = () => {
    authSyncCountRef.current = Math.max(0, authSyncCountRef.current - 1);

    if (authSyncCountRef.current === 0) {
      setHydrating(false);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      beginHydration();

      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.email!);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      } finally {
        setLoading(false);
        endHydration();
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setRole(null);
          setStoreid(null);
          setError(null);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user && !user) {
          setUser(session.user);
          await fetchUserProfile(session.user.email!);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

const fetchUserProfile = async (email: string) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) throw userError;

      if (userData) {
        setProfile(userData);

        // Get user's role - handle case where it doesn't exist
        const { data: assignmentData } = await supabase
          .from('staff_assignments')
          .select(`
            roleid,
            roles (
              rolename
            )
          `)
          .eq('userid', userData.userid)
          .eq('status', 'active')
          .maybeSingle();

        const roleRecord = Array.isArray(assignmentData?.roles)
          ? assignmentData.roles[0]
          : assignmentData?.roles;

        if (roleRecord) {
          const userRole = roleRecord.rolename?.toLowerCase() as UserRole;
          setRole(userRole);

        if (userRole === 'manager') {
          const { data: storeData } = await supabase
            .from('stores')
            .select('storeid')
            .eq('managerid', userData.userid)
              .maybeSingle();
          
          if (storeData?.storeid) {
            setStoreid(storeData.storeid);
          }
        }
      }
    }
  } catch (err) {
    console.error('Profile fetch error:', err);
    setError(err instanceof Error ? err.message : 'Failed to fetch profile');
  }
};

  const login = async (email: string, password: string) => {
    beginHydration();

    try {
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        setUser(data.user);
        await fetchUserProfile(email);
        return { error: null };
      }

      return { error: 'Login failed' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return { error: message };
    } finally {
      endHydration();
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setProfile(null);
      setRole(null);
      setStoreid(null);
      setError(null);
      setHydrating(false);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    role,
    storeid,
    loading,
    hydrating,
    error,
    login,
    logout,
    isAdmin: role ? ['manager', 'staff', 'supervisor'].includes(role) : false,
    isManager: role === 'manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}