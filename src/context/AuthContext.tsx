import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    console.log('Setting up onAuthStateChange listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('onAuthStateChange triggered:', event, 'User ID:', currentSession?.user?.id, 'Email:', currentSession?.user?.email);
        setSession(currentSession);

        if (event === 'SIGNED_IN') {
          console.log('Processing SIGNED_IN event');
          setIsLoading(true);
          try {
            if (currentSession?.user) {
              // Add a timeout to the profile fetch
              const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();

              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timed out after 5 seconds')), 5000);
              });

              const { data: profile, error: profileError } = await Promise.race([profilePromise, timeoutPromise]);

              if (profileError && profileError.code === 'PGRST116') {
                // Profile not found (PGRST116: single row not found), create a new profile
                console.log('No profile found, creating a new profile for user:', currentSession.user.id);
                const userMetadata = currentSession.user.user_metadata;
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: currentSession.user.id,
                    name: userMetadata.name || 'Unknown',
                    email: currentSession.user.email,
                    role: userMetadata.role || 'patient',
                  });

                if (insertError) {
                  console.error('Error creating profile on sign-in:', insertError.message);
                  setError('Failed to create user profile on sign-in: ' + insertError.message);
                  setUser(null);
                  return;
                }

                // Fetch the newly created profile
                const { data: newProfile, error: newProfileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentSession.user.id)
                  .single();

                if (newProfileError) {
                  console.error('Error fetching newly created profile:', newProfileError.message);
                  setError('Failed to fetch newly created profile');
                  setUser(null);
                } else {
                  console.log('New profile created:', newProfile);
                  setUser({
                    id: newProfile.id,
                    name: newProfile.name,
                    email: newProfile.email,
                    role: newProfile.role as UserRole,
                    avatar: newProfile.avatar,
                    department: newProfile.department,
                  });
                }
              } else if (profileError) {
                console.error('Error fetching user profile:', profileError.message);
                setError('Failed to fetch user profile: ' + profileError.message);
                setUser(null);
              } else {
                console.log('Profile fetched successfully:', profile);
                setUser({
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  role: profile.role as UserRole,
                  avatar: profile.avatar,
                  department: profile.department,
                });
              }
            } else {
              console.log('No user in session, setting user to null');
              setUser(null);
            }
          } catch (err: any) {
            console.error('Unexpected error in onAuthStateChange:', err.message);
            setError(err.message || 'An unexpected error occurred');
            setUser(null);
          } finally {
            console.log('onAuthStateChange: Resetting isLoading to false');
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT event: Setting user to null');
          setUser(null);
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          console.log('INITIAL_SESSION event: No action needed, handled by initializeAuth');
        }
      }
    );

    const initializeAuth = async () => {
      console.log('Initializing auth');
      setIsLoading(true);
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error fetching initial session:', sessionError.message);
          setError(sessionError.message);
          setUser(null);
          return;
        }

        console.log('Initial session:', initialSession?.user?.id, initialSession?.user?.email);
        setSession(initialSession);

        if (initialSession?.user) {
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timed out after 5 seconds')), 5000);
          });

          const { data: profile, error: profileError } = await Promise.race([profilePromise, timeoutPromise]);

          if (profileError) {
            console.error('Error fetching user profile in initializeAuth:', profileError.message);
            setError('Failed to fetch user profile: ' + profileError.message);
            setUser(null);
          } else if (profile) {
            console.log('Profile fetched in initializeAuth:', profile);
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,
              avatar: profile.avatar,
              department: profile.department,
            });
          } else {
            console.warn('No profile found for user in initializeAuth:', initialSession.user.id);
            setUser({
              id: initialSession.user.id,
              name: initialSession.user.email || 'Unknown',
              email: initialSession.user.email || '',
              role: 'patient' as UserRole, // Default role
            });
            setError('Profile not found. Using default user data.');
          }
        }
      } catch (err: any) {
        console.error('Error initializing auth:', err.message);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        console.log('initializeAuth: Resetting isLoading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('Unsubscribing from onAuthStateChange');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt for:', email);
    setIsLoading(true);
    setError(null);

    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out after 5 seconds')), 5000);
      });

      const { data, error: signInError } = await Promise.race([loginPromise, timeoutPromise]);

      if (signInError) {
        console.error('Login error:', signInError.message);
        setError(signInError.message);
        return false;
      }

      if (!data.user) {
        console.error('No user returned after login');
        setError('No user data returned after login');
        return false;
      }

      console.log('Login successful for:', email, 'User ID:', data.user.id);
      return true;
    } catch (err: any) {
      console.error('Unexpected login error:', err.message);
      setError(err.message || 'An unexpected error occurred during login');
      return false;
    } finally {
      console.log('login: Resetting isLoading to false');
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationData): Promise<boolean> => {
    console.log('Register attempt for:', data.email);
    setIsLoading(true);
    setError(null);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
        },
      });

      if (signUpError) {
        console.error('Registration error:', signUpError.message);
        setError(signUpError.message);
        return false;
      }

      // If email confirmation is disabled, sign in the user immediately
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        console.log('Email confirmation is likely enabled. User must confirm email before signing in.');
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account.",
        });
        return true;
      }

      if (!session) {
        console.error('No session returned after sign-in');
        setError('No session returned after sign-in');
        return false;
      }

      console.log('Sign-in after sign-up successful for:', data.email);
      toast({
        title: "Registration successful",
        description: "You are now signed in.",
      });

      return true;
    } catch (err: any) {
      console.error('Registration error:', err.message);
      setError(err.message || 'An unexpected error occurred during registration');
      return false;
    } finally {
      console.log('register: Resetting isLoading to false');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logout attempt');
    setIsLoading(true);
    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Logout error:', signOutError.message);
        throw new Error(signOutError.message);
      }
      setUser(null);
      setSession(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (err: any) {
      console.error('Logout error:', err.message);
      setError(err.message || 'An unexpected error occurred during logout');
      toast({
        title: "Error logging out",
        description: "There was a problem logging you out",
        variant: "destructive",
      });
    } finally {
      console.log('logout: Resetting isLoading to false');
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