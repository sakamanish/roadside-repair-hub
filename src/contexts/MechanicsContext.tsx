import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/contexts/AuthContext';

interface MechanicsContextType {
  mechanics: UserProfile[];
  filteredMechanics: UserProfile[];
  loading: boolean;
  fetchMechanics: () => Promise<void>;
  searchMechanics: (query: string) => Promise<void>;
}

const MechanicsContext = createContext<MechanicsContextType | undefined>(undefined);

export const MechanicsProvider = ({ children }: { children: ReactNode }) => {
  const [mechanics, setMechanics] = useState<UserProfile[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch mechanics from Supabase
  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mechanic');

      if (error) {
        console.error('Error fetching mechanics:', error);
        toast({
          title: "Fetch failed",
          description: "Could not fetch mechanics. Please try again.",
          variant: "destructive"
        });
        setMechanics([]);
        setFilteredMechanics([]);
        return;
      }

      // Fetch additional data from mechanic_profiles
      const mechanicsWithDetails = await Promise.all(
        data.map(async (mechanic: any) => {
          const { data: mechanicData, error: mechanicError } = await supabase
            .from('mechanic_profiles')
            .select('*')
            .eq('id', mechanic.id)
            .single();

          if (mechanicError) {
            console.error('Error fetching mechanic profile:', mechanicError);
            return {
              id: mechanic.id,
              name: mechanic.name,
              email: mechanic.email,
              role: mechanic.role,
              phoneNumber: mechanic.phone_number
            };
          }

          return {
            id: mechanic.id,
            name: mechanic.name,
            email: mechanic.email,
            role: mechanic.role,
            phoneNumber: mechanic.phone_number,
            services: mechanicData?.services,
            location: {
              address: mechanicData?.address,
              lat: mechanicData?.latitude,
              lng: mechanicData?.longitude
            },
            availability: mechanicData?.availability,
            rating: mechanicData?.rating
          };
        })
      );

      setMechanics(mechanicsWithDetails as UserProfile[]);
      setFilteredMechanics(mechanicsWithDetails as UserProfile[]);
    } catch (error) {
      console.error('Error in fetchMechanics:', error);
      toast({
        title: "Fetch failed",
        description: "Could not fetch mechanics. Please try again.",
        variant: "destructive"
      });
      setMechanics([]);
      setFilteredMechanics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  // Add a helper function at the top of the file to normalize services
const getServicesArray = (services?: string[] | string): string[] => {
  if (!services) return [];
  if (typeof services === 'string') return services.split(',').map(s => s.trim());
  return services;
};

// Use this helper function in searchMechanics or any other method that accesses services
const searchMechanics = async (query: string) => {
  setLoading(true);
  try {
    const mechanicsData = await fetchMechanics();
    
    if (!query.trim()) {
      setFilteredMechanics(mechanicsData);
      return;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    const filtered = mechanicsData.filter(mechanic => {
      // Check if mechanic name contains search query
      if (mechanic.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check if any service contains search query
      const servicesArray = getServicesArray(mechanic.services);
      if (servicesArray.some(service => service.toLowerCase().includes(normalizedQuery))) {
        return true;
      }
      
      // Check if address contains search query
      if (mechanic.location?.address?.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      return false;
    });
    
    setFilteredMechanics(filtered);
  } catch (error) {
    console.error('Error searching mechanics:', error);
    toast({
      title: "Search failed",
      description: "Could not search mechanics. Please try again.",
      variant: "destructive"
    });
    setFilteredMechanics([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <MechanicsContext.Provider value={{ mechanics, filteredMechanics, loading, fetchMechanics, searchMechanics }}>
      {children}
    </MechanicsContext.Provider>
  );
};

export const useMechanics = () => {
  const context = useContext(MechanicsContext);
  if (context === undefined) {
    throw new Error('useMechanics must be used within a MechanicsProvider');
  }
  return context;
};
