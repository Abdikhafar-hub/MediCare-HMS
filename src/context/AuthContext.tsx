import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

// Define user roles
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'pharmacist' | 'lab_technician';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

// Define registration data type
export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegistrationData) => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const hasInitialized = useRef(false);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile for:', userId);
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, name: 'Unknown', email: '', role: 'patient' })
            .select()
            .single();
          if (insertError) throw insertError;
          return {
            id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            role: newProfile.role as UserRole,
            avatar: newProfile.avatar,
            department: newProfile.department,
          };
        }
        throw error;
      }
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar,
        department: profile.department,
      };
    } catch (err: any) {
      console.error('fetchProfile error:', err.message);
      setError(`Failed to fetch/create profile: ${err.message}`);
      return null;
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('Setting up auth listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('onAuthStateChange:', event, 'User ID:', currentSession?.user?.id);
      setSession(currentSession);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        setIsLoading(true);
        const profile = await fetchProfile(currentSession.user.id);
        setUser(profile);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null); // Clear error on sign-out
      }
    });

    const initializeAuth = async () => {
      console.log('Initializing auth');
      setIsLoading(true);
      setError(null); // Reset error on init
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.id);

        if (sessionError) {
          console.error('Session fetch error:', sessionError.message);
          setError(`Session fetch failed: ${sessionError.message}`);
          setUser(null);
          return;
        }

        setSession(session);
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('Init error:', err.message);
        setError(`Auth initialization failed: ${err.message}`);
        setUser(null);
      } finally {
        console.log('Init complete, isLoading:', false);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('Unsubscribing auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', email);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Login error:', error.message);
        setError(error.message);
        return false;
      }
      if (!data.user) {
        setError('No user data returned after login');
        return false;
      }
      console.log('Login successful:', data.user.id);
      return true;
    } catch (err: any) {
      console.error('Unexpected login error:', err.message);
      setError(err.message || 'Login failed unexpectedly');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationData): Promise<boolean> => {
    console.log('Register attempt:', data.email);
    setIsLoading(true);
    setError(null);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name, role: data.role } },
      });

      if (signUpError) {
        console.error('Register error:', signUpError.message);
        setError(signUpError.message);
        return false;
      }

      if (!signUpData.user) {
        console.log('Email confirmation required');
        toast({ title: 'Registration successful', description: 'Check your email to confirm.' });
        return true;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        console.error('Post-register sign-in error:', signInError.message);
        setError(signInError.message);
        return false;
      }

      toast({ title: 'Registration successful', description: 'You are now signed in.' });
      return true;
    } catch (err: any) {
      console.error('Unexpected register error:', err.message);
      setError(err.message || 'Registration failed unexpectedly');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logout attempt');
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        throw error;
      }
      setUser(null);
      setSession(null);
      toast({ title: 'Logged out', description: 'You have been successfully logged out' });
    } catch (err: any) {
      console.error('Unexpected logout error:', err.message);
      setError(err.message || 'Logout failed');
      toast({ title: 'Error logging out', description: 'Logout failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout, 
      register, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};