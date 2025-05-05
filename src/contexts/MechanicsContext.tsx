
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
  getCurrentLocation: () => Promise<GeolocationPosition | null>;
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
              services: mechanicDetails?.services || [],
              location: {
                address: mechanicDetails?.address || '',
                lat: mechanicDetails?.latitude || 0,
                lng: mechanicDetails?.longitude || 0
              }
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

  // Get user's current location
  const getCurrentLocation = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast({
          title: "Location Error",
          description: "Geolocation is not supported by your browser",
          variant: "destructive"
        });
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        error => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Unable to retrieve your location",
            variant: "destructive"
          });
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  // Function to search for mechanics based on criteria
  const searchMechanics = async (params: SearchParams) => {
    setLoadingMechanics(true);
    try {
      // For now, client-side filtering based on available data
      
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

      // For location, try to use coordinates if available
      let userLocation: GeolocationPosition | null = null;
      
      // If location is specified, try to get user's current location
      if (params.location.toLowerCase() === 'current location') {
        userLocation = await getCurrentLocation();
      }
      
      if (userLocation) {
        const userLat = userLocation.coords.latitude;
        const userLon = userLocation.coords.longitude;
        
        // Filter by distance if user location is available
        filtered = filtered.filter(mechanic => {
          if (!mechanic.location?.lat || !mechanic.location?.lng) return false;
          
          const distance = calculateDistance(
            userLat,
            userLon,
            mechanic.location.lat,
            mechanic.location.lng
          );
          
          // Add distance to mechanic object for display
          (mechanic as any).distance = distance.toFixed(1);
          
          return distance <= params.distance;
        });
        
        // Sort by distance
        filtered.sort((a, b) => {
          return ((a as any).distance || 0) - ((b as any).distance || 0);
        });
      } else if (params.location && params.location.toLowerCase() !== 'current location') {
        // Text match on address if coordinates aren't available
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
        setSearchParams,
        getCurrentLocation
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
