"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'staff' | 'supervisor' | 'manager';

const ADMIN_ROLES: UserRole[] = ['manager', 'staff', 'supervisor'];

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
    console.log(`Auth hydration start (#${authSyncCountRef.current})`);
    setHydrating(true);
  };

  const endHydration = () => {
    authSyncCountRef.current = Math.max(0, authSyncCountRef.current - 1);
    console.log(`Auth hydration end (#${authSyncCountRef.current})`);

    if (authSyncCountRef.current === 0) {
      setHydrating(false);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('Auth init start');
      beginHydration();

      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Auth init session:', {
          hasSession: Boolean(session),
          userEmail: session?.user?.email,
          userId: session?.user?.id,
        });
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.email!);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      } finally {
        setLoading(false);
        console.log('Auth init complete, loading false');
        endHydration();
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth state change:', {
          event,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          currentUser: user?.email,
          loading,
          hydrating,
        });

        if (event === 'SIGNED_OUT') {
          console.log('Auth state change SIGNED_OUT - clearing auth state');
          setUser(null);
          setProfile(null);
          setRole(null);
          setStoreid(null);
          setError(null);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user && !user) {
          console.log('Auth state change SIGNED_IN - fetching profile for', session.user.email);
          setUser(session.user);
          await fetchUserProfile(session.user.email!);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

const fetchUserProfile = async (email: string) => {
  console.log('fetchUserProfile start', { email });
  try {
    const { data: userData, error: userError } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    const userRecord = userData as Partial<UserProfile> | null;

    console.log('fetchUserProfile userData:', {
      email: userRecord?.email,
      userid: userRecord?.userid,
      usertype: userRecord?.usertype,
    });

    if (userRecord) {
      setProfile(userRecord as UserProfile);

      // Get user's role - handle case where it doesn't exist
      const { data: assignmentData } = await (supabase as any)
        .from('staff_assignments')
        .select(`
          roleid,
          roles (
            rolename
          )
        `)
        .eq('userid', userRecord.userid)
        .eq('status', 'active')
        .maybeSingle();

      const roleRecord = Array.isArray(assignmentData?.roles)
        ? (assignmentData.roles[0] as { rolename?: string } | undefined)
        : (assignmentData?.roles as { rolename?: string } | undefined);

      const assignedRole = roleRecord?.rolename?.toLowerCase() as UserRole | undefined;
      const profileRole = userRecord.usertype?.toLowerCase() as UserRole | undefined;
      const userRole = assignedRole && ADMIN_ROLES.includes(assignedRole)
        ? assignedRole
        : profileRole && ADMIN_ROLES.includes(profileRole)
          ? profileRole
          : null;

      setRole(userRole);

      if (userRole) {
        setRole(userRole);
        console.log('fetchUserProfile role resolved:', userRole);

        if (userRole === 'manager') {
          const { data: storeData } = await (supabase as any)
            .from('stores')
            .select('storeid')
            .eq('managerid', userRecord.userid)
            .maybeSingle();
          console.log('fetchUserProfile storeData:', storeData);
          
          if (storeData?.storeid) {
            setStoreid(storeData.storeid);
          }
        }
      }
    }
    console.log('fetchUserProfile complete', { email });
  } catch (err) {
    console.error('Profile fetch error:', err);
    setError(err instanceof Error ? err.message : 'Failed to fetch profile');
  }
};

  const login = async (email: string, password: string) => {
    console.log('Auth login start', { email });
    beginHydration();

    try {
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        console.log('Auth login succeeded', { email, userId: data.user.id });
        setUser(data.user);
        await fetchUserProfile(email);
        return { error: null };
      }

      console.warn('Auth login completed without user', { email });
      return { error: 'Login failed' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      console.error('Auth login error:', message);
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
    isAdmin: role ? ADMIN_ROLES.includes(role) : false,
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