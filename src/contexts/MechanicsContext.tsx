
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserProfile } from './AuthContext';

// Define the mechanic search model
export interface MechanicSearch {
  location?: string;
  service?: string;
  rating?: number;
  distance?: number;
}

// Random locations around a center point for mock data
const generateLocation = (centerLat: number, centerLng: number, radiusKm: number = 5) => {
  const earthRadius = 6371; // Earth's radius in km
  const randomDistance = Math.random() * radiusKm;
  const randomAngle = Math.random() * Math.PI * 2;
  
  const lat = centerLat + (randomDistance / earthRadius) * (180 / Math.PI);
  const lng = centerLng + (randomDistance / earthRadius) * (180 / Math.PI) / Math.cos(centerLat * Math.PI / 180);
  
  return { lat, lng };
};

// Create mock mechanics data around New York City
const generateMockMechanics = (count: number = 10): UserProfile[] => {
  const centerLat = 40.7128;
  const centerLng = -74.0060;
  
  const serviceOptions = [
    'Engine Repair', 'Battery Replacement', 'Tire Change', 'Towing',
    'Jump Start', 'Lockout Service', 'Oil Change', 'Brake Repair',
    'Transmission Service', 'AC Service', 'Diagnostic', 'Fluid Check'
  ];
  
  const availabilityOptions = [
    '24/7 Emergency Service',
    'Mon-Fri, 8am-6pm',
    'Mon-Sat, 7am-9pm',
    'Weekdays 9am-5pm, Weekends On-Call',
    'By Appointment Only'
  ];
  
  return Array(count).fill(null).map((_, index) => {
    const location = generateLocation(centerLat, centerLng, 15);
    const servicesCount = Math.floor(Math.random() * 5) + 1;
    const services = Array(servicesCount).fill(null).map(() => 
      serviceOptions[Math.floor(Math.random() * serviceOptions.length)]
    ).filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
    
    return {
      id: `mechanic-${index + 10}`,
      name: `Mechanic ${index + 1}`,
      email: `mechanic${index + 1}@example.com`,
      role: 'mechanic' as const,
      services,
      location: {
        address: `${Math.floor(Math.random() * 1000) + 100} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))} St, New York`,
        ...location
      },
      phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      availability: availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)],
      rating: Math.random() * 2 + 3 // Rating between 3 and 5
    };
  });
};

interface MechanicsContextType {
  mechanics: UserProfile[];
  searchMechanics: (search: MechanicSearch) => UserProfile[];
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

  // Load mock mechanics on initial render
  useEffect(() => {
    setLoadingMechanics(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const initialMechanics = generateMockMechanics(15);
      setMechanics(initialMechanics);
      setSearchResults(initialMechanics);
      setLoadingMechanics(false);
    }, 1000);
  }, []);

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

  // Search mechanics based on criteria
  const searchMechanics = (search: MechanicSearch): UserProfile[] => {
    setLoadingMechanics(true);
    
    // Generate a user location based on the search string (mock)
    // In a real app, we would use geocoding API here
    const userLocation = search.location
      ? generateLocation(40.7128, -74.0060, 5) // Mock location near NYC
      : null;

    const results = mechanics.filter(mechanic => {
      // Filter by service
      if (search.service && mechanic.services && 
          !mechanic.services.some(s => s.toLowerCase().includes(search.service!.toLowerCase()))) {
        return false;
      }

      // Filter by rating
      if (search.rating && mechanic.rating && mechanic.rating < search.rating) {
        return false;
      }

      // Filter by distance if we have both user location and mechanic location
      if (search.distance && search.distance > 0 && userLocation && mechanic.location) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mechanic.location.lat,
          mechanic.location.lng
        );
        if (distance > search.distance) {
          return false;
        }
        
        // Attach distance to mechanic object for display
        (mechanic as any).distance = distance.toFixed(1);
      }

      return true;
    });

    // Simulate API call delay
    setTimeout(() => {
      setSearchResults(results);
      setLoadingMechanics(false);
    }, 800);

    return results;
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
