
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define user types
export type UserRole = 'mechanic' | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // For mechanics
  services?: string[];
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  availability?: string;
  rating?: number;
  // For customers
  savedMechanics?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<UserProfile>, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development purposes
const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    name: 'John Mechanic',
    email: 'john@example.com',
    role: 'mechanic',
    services: ['Engine Repair', 'Battery Replacement', 'Tire Change'],
    location: {
      address: '123 Repair St, Fixville',
      lat: 40.7128,
      lng: -74.0060
    },
    phoneNumber: '(555) 123-4567',
    availability: 'Mon-Fri, 8am-6pm',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Sarah Mechanic',
    email: 'sarah@example.com',
    role: 'mechanic',
    services: ['Towing', 'Jump Start', 'Lockout Service'],
    location: {
      address: '456 Tow Ave, Rescuetown',
      lat: 40.7282,
      lng: -73.9942
    },
    phoneNumber: '(555) 987-6543',
    availability: '24/7 Emergency Service',
    rating: 4.5
  },
  {
    id: '3',
    name: 'Michael Customer',
    email: 'michael@example.com',
    role: 'customer',
    savedMechanics: ['1']
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('bb-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('bb-user');
      }
    }
    setLoading(false);
  }, []);

  // Login function - simulates authentication
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Find user in our mock data
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        // In a real app, we would verify password here
        setUser(foundUser);
        localStorage.setItem('bb-user', JSON.stringify(foundUser));
        toast({
          title: "Login successful!",
          description: `Welcome back, ${foundUser.name}!`,
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function - simulates user creation
  const register = async (userData: Partial<UserProfile>, password: string, role: UserRole) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email.toLowerCase() === userData.email?.toLowerCase())) {
        throw new Error('Email already in use');
      }
      
      // Create new user (in a real app, this would be an API call)
      const newUser: UserProfile = {
        id: `mock-${Date.now()}`,
        name: userData.name || 'New User',
        email: userData.email || '',
        role,
        ...(role === 'mechanic' ? {
          services: userData.services || [],
          location: userData.location,
          phoneNumber: userData.phoneNumber,
          availability: userData.availability,
          rating: 0
        } : {
          savedMechanics: []
        })
      };
      
      // Save user (in a real app, this would happen server-side)
      MOCK_USERS.push(newUser);
      
      // Log the user in
      setUser(newUser);
      localStorage.setItem('bb-user', JSON.stringify(newUser));
      
      toast({
        title: "Registration successful!",
        description: `Welcome to Breakdown Buddy, ${newUser.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different information.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bb-user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
