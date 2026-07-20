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
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
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
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.email!);
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
          setStoreid(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (email: string) => {
    try {
      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      if (userData) {
        setProfile(userData);

        // Get user's role via staff_assignments
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
          .single();

        if (assignmentData?.roles) {
          const userRole = assignmentData.roles.rolename?.toLowerCase() as UserRole;
          setRole(userRole);

          // Get store they're associated with
          if (userRole === 'manager') {
            const { data: storeData } = await supabase
              .from('stores')
              .select('storeid')
              .eq('managerid', userData.userid)
              .single();
            
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
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setRole(null);
      setStoreid(null);
      setError(null);
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