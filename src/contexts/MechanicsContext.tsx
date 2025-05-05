
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/contexts/AuthContext';

interface SearchParams {
  location: string;
  service: string;
  distance: number;
  rating: number;
}

interface MechanicsContextType {
  mechanics: UserProfile[];
  loadingMechanics: boolean;
  searchMechanics: (params: SearchParams) => Promise<void>;
  searchResults: UserProfile[];
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
}

const MechanicsContext = createContext<MechanicsContextType | undefined>(undefined);

export const MechanicsProvider = ({ children }: { children: ReactNode }) => {
  const [mechanics, setMechanics] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    service: '',
    distance: 10,
    rating: 0
  });
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const { toast } = useToast();

  // Fetch all mechanics on initial load
  useEffect(() => {
    const fetchMechanics = async () => {
      setLoadingMechanics(true);
      try {
        // Get all profiles with role 'mechanic'
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mechanic');

        if (profilesError) {
          console.error('Error fetching mechanic profiles:', profilesError);
          toast({
            title: "Error",
            description: "Could not load mechanics",
            variant: "destructive"
          });
          setMechanics([]);
          setLoadingMechanics(false);
          return;
        }

        // Get mechanic-specific data
        const { data: mechanicsData, error: mechanicsError } = await supabase
          .from('mechanic_profiles')
          .select('*');

        if (mechanicsError) {
          console.error('Error fetching mechanic details:', mechanicsError);
          toast({
            title: "Error",
            description: "Could not load mechanics details",
            variant: "destructive"
          });
          setMechanics([]);
          setLoadingMechanics(false);
          return;
        }

        // Combine the data
        if (profilesData && mechanicsData) {
          const mechanicProfiles = profilesData.map(profile => {
            const mechanicDetails = mechanicsData.find(m => m.id === profile.id);
            return {
              ...profile,
              ...mechanicDetails,
              services: mechanicDetails?.services || []
            } as UserProfile;
          });

          setMechanics(mechanicProfiles);
        } else {
          setMechanics([]);
        }
      } catch (error) {
        console.error('Error in fetchMechanics:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
        setMechanics([]);
      } finally {
        setLoadingMechanics(false);
      }
    };

    fetchMechanics();
  }, [toast]);

  // Function to search for mechanics based on criteria
  const searchMechanics = async (params: SearchParams) => {
    setLoadingMechanics(true);
    try {
      // For now, client-side filtering based on available data
      // In a real app, this would be a server-side query with spatial search
      
      if (mechanics.length === 0) {
        setSearchResults([]);
        setLoadingMechanics(false);
        return;
      }

      let filtered = [...mechanics];

      // Filter by service
      if (params.service) {
        filtered = filtered.filter(mechanic => {
          // Check if services exists and is an array or string
          if (!mechanic.services) return false;
          
          if (typeof mechanic.services === 'string') {
            return mechanic.services.toLowerCase().includes(params.service.toLowerCase());
          }
          
          if (Array.isArray(mechanic.services)) {
            return mechanic.services.some(
              service => service.toLowerCase().includes(params.service.toLowerCase())
            );
          }
          
          return false;
        });
      }

      // Filter by rating
      if (params.rating > 0) {
        filtered = filtered.filter(mechanic => (mechanic.rating || 0) >= params.rating);
      }

      // For location, in a real app we'd use geocoding and distance calculation
      // For now, simple text match on address
      if (params.location) {
        filtered = filtered.filter(mechanic => {
          const address = mechanic.location?.address || '';
          return address.toLowerCase().includes(params.location.toLowerCase());
        });
      }

      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred during search",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setLoadingMechanics(false);
    }
  };

  return (
    <MechanicsContext.Provider
      value={{
        mechanics,
        loadingMechanics,
        searchMechanics,
        searchResults,
        searchParams,
        setSearchParams
      }}
    >
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
