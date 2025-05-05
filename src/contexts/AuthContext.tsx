
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Define user types
export type UserRole = 'mechanic' | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  // For mechanics
  services?: string[] | string; // Allow both string array and string for flexibility during registration
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  availability?: string;
  rating?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<UserProfile>, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user profile from Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      if (!data) return null;

      // Ensure role is of type UserRole
      const role = data.role as UserRole;
      
      // If the user is a mechanic, fetch additional mechanic details
      if (role === 'mechanic') {
        const { data: mechanicData, error: mechanicError } = await supabase
          .from('mechanic_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (mechanicError) {
          console.error('Error loading mechanic profile:', mechanicError);
        } else if (mechanicData) {
          // Format the user profile with mechanic-specific data
          const userProfile: UserProfile = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: role,
            phoneNumber: data.phone_number,
            services: mechanicData.services,
            location: {
              address: mechanicData.address,
              lat: mechanicData.latitude,
              lng: mechanicData.longitude
            },
            availability: mechanicData.availability,
            rating: mechanicData.rating
          };
          return userProfile;
        }
      }

      // Return basic user profile
      const userProfile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: role,
        phoneNumber: data.phone_number
      };
      
      return userProfile;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  // Initialize the auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          setSession(currentSession);
          
          if (currentSession?.user) {
            // Use setTimeout to avoid potential Supabase SDK deadlocks
            setTimeout(async () => {
              const profile = await loadUserProfile(currentSession.user.id);
              setUser(profile);
            }, 0);
          } else {
            setUser(null);
          }
        }
      );
      
      // Check for existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        const profile = await loadUserProfile(currentSession.user.id);
        setUser(profile);
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Login successful!",
        description: `Welcome back!`,
      });
      
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: Partial<UserProfile>, password: string, role: UserRole) => {
    setLoading(true);
    
    try {
      // Format services correctly for the database
      // Ensure services is properly formatted whether it's a string or array
      let serviceData: string[] | undefined;
      
      if (role === 'mechanic' && userData.services) {
        // Handle services based on type
        if (typeof userData.services === 'string') {
          // Split by comma and trim each service, remove empty strings
          serviceData = userData.services.split(',')
            .map(s => s.trim())
            .filter(s => s !== '');
        } else if (Array.isArray(userData.services)) {
          serviceData = userData.services;
        }
      }
      
      console.log('Registering with data:', {
        email: userData.email,
        role,
        serviceData
      });
      
      // Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password,
        options: {
          data: {
            name: userData.name,
            role: role,
            phoneNumber: userData.phoneNumber,
            // If mechanic, add additional data
            ...(role === 'mechanic' && {
              services: serviceData,
              address: userData.location?.address,
              availability: userData.availability
            })
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Registration successful!",
        description: `Welcome to Breakdown Buddy, ${userData.name}!`,
      });
      
      return;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setUser(null);
      setSession(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session,
        login,
        register,
        logout,
        loading
      }}
    >
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
