
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserProfile } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define the mechanic search model
export interface MechanicSearch {
  location?: string;
  service?: string;
  rating?: number;
  distance?: number;
}

interface MechanicsContextType {
  mechanics: UserProfile[];
  searchMechanics: (search: MechanicSearch) => Promise<UserProfile[]>;
  searchParams: MechanicSearch;
  setSearchParams: React.Dispatch<React.SetStateAction<MechanicSearch>>;
  searchResults: UserProfile[];
  loadingMechanics: boolean;
}

const MechanicsContext = createContext<MechanicsContextType | undefined>(undefined);

export const MechanicsProvider = ({ children }: { children: ReactNode }) => {
  const [mechanics, setMechanics] = useState<UserProfile[]>([]);
  const [searchParams, setSearchParams] = useState<MechanicSearch>({});
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState<boolean>(false);
  const { toast } = useToast();

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Load all mechanics on initial render
  useEffect(() => {
    const loadMechanics = async () => {
      setLoadingMechanics(true);
      
      try {
        // First get all profiles that are mechanics
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mechanic');
          
        if (profilesError) {
          throw profilesError;
        }
        
        if (!profilesData || profilesData.length === 0) {
          setMechanics([]);
          setSearchResults([]);
          setLoadingMechanics(false);
          return;
        }
        
        // Get mechanic profile details for each mechanic
        const mechanicProfiles: UserProfile[] = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: mechanicData, error: mechanicError } = await supabase
              .from('mechanic_profiles')
              .select('*')
              .eq('id', profile.id)
              .single();
              
            if (mechanicError) {
              console.error(`Error fetching mechanic details for ${profile.id}:`, mechanicError);
              return null;
            }
            
            return {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as 'mechanic',
              phoneNumber: profile.phone_number,
              services: mechanicData.services || [],
              location: {
                address: mechanicData.address,
                lat: mechanicData.latitude,
                lng: mechanicData.longitude
              },
              availability: mechanicData.availability,
              rating: mechanicData.rating
            };
          })
        );
        
        // Filter out any null results
        const validProfiles = mechanicProfiles.filter(
          (profile): profile is UserProfile => profile !== null
        );
        
        setMechanics(validProfiles);
        setSearchResults(validProfiles);
      } catch (error) {
        console.error('Error loading mechanics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load mechanics. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoadingMechanics(false);
      }
    };
    
    loadMechanics();
  }, [toast]);

  // Search mechanics based on criteria
  const searchMechanics = async (search: MechanicSearch): Promise<UserProfile[]> => {
    setLoadingMechanics(true);
    
    try {
      // Start with all mechanics
      let filteredResults = [...mechanics];
      
      // Filter by service
      if (search.service) {
        const serviceQuery = search.service.toLowerCase();
        filteredResults = filteredResults.filter(mechanic => 
          mechanic.services?.some(service => 
            service.toLowerCase().includes(serviceQuery)
          )
        );
      }
      
      // Filter by rating
      if (search.rating && search.rating > 0) {
        filteredResults = filteredResults.filter(mechanic => 
          (mechanic.rating || 0) >= search.rating!
        );
      }
      
      // Filter by distance if location is provided
      if (search.location && search.distance && search.distance > 0) {
        // For now, use mock geocoding
        const mockUserLocation = {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1
        };
        
        filteredResults = filteredResults.filter(mechanic => {
          if (!mechanic.location?.lat || !mechanic.location?.lng) return false;
          
          const distance = calculateDistance(
            mockUserLocation.lat,
            mockUserLocation.lng,
            mechanic.location.lat,
            mechanic.location.lng
          );
          
          // Add distance to mechanic object for display
          (mechanic as any).distance = distance.toFixed(1);
          
          return distance <= search.distance!;
        });
        
        // Sort by distance
        filteredResults.sort((a, b) => {
          return parseFloat((a as any).distance) - parseFloat((b as any).distance);
        });
      }
      
      setSearchResults(filteredResults);
      return filteredResults;
    } catch (error) {
      console.error('Error searching mechanics:', error);
      toast({
        title: 'Error',
        description: 'Failed to search mechanics. Please try again later.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoadingMechanics(false);
    }
  };

  return (
    <MechanicsContext.Provider
      value={{
        mechanics,
        searchMechanics,
        searchParams,
        setSearchParams,
        searchResults,
        loadingMechanics
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
