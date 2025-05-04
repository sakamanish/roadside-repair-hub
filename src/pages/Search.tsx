
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMechanics } from '@/contexts/MechanicsContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MechanicCard from '@/components/MechanicCard';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    searchMechanics, 
    searchResults, 
    searchParams, 
    setSearchParams,
    loadingMechanics
  } = useMechanics();
  
  const [locationInput, setLocationInput] = useState(searchParams.location || '');
  const [serviceInput, setServiceInput] = useState(searchParams.service || '');
  const [distanceInput, setDistanceInput] = useState<number[]>([searchParams.distance || 10]);
  const [ratingInput, setRatingInput] = useState<string>(searchParams.rating?.toString() || '');
  
  // Redirect if user is not authenticated or is a mechanic
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'customer') {
      navigate('/');
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSearch = () => {
    const params = {
      location: locationInput,
      service: serviceInput,
      distance: distanceInput[0],
      rating: ratingInput ? parseFloat(ratingInput) : undefined
    };
    
    setSearchParams(params);
    searchMechanics(params);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Find a Mechanic</h1>
          <p className="text-muted-foreground mb-6">
            Search for mechanics in your area who can help with your vehicle issues
          </p>
          
          <div className="bg-white rounded-lg border p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="location">Your Location</Label>
                <div className="mt-1.5 relative">
                  <Input
                    id="location"
                    placeholder="Enter your address or area"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="pr-10"
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="service">Service Needed</Label>
                <Input
                  id="service"
                  placeholder="E.g. Tire change, Battery, Engine..."
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filter Mechanics</SheetTitle>
                    <SheetDescription>
                      Refine your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <Label>Distance (km)</Label>
                      <div className="pt-4">
                        <Slider
                          value={distanceInput}
                          min={1}
                          max={50}
                          step={1}
                          onValueChange={setDistanceInput}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-muted-foreground">1km</span>
                          <span className="text-sm font-medium">{distanceInput[0]}km</span>
                          <span className="text-sm text-muted-foreground">50km</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="rating">Minimum Rating</Label>
                      <Select
                        value={ratingInput}
                        onValueChange={setRatingInput}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <Button onClick={handleSearch} className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button onClick={handleSearch} disabled={loadingMechanics}>
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            {loadingMechanics ? (
              <p className="text-muted-foreground">Searching for mechanics...</p>
            ) : searchResults.length > 0 ? (
              <p className="text-muted-foreground">Found {searchResults.length} mechanics</p>
            ) : (
              <p className="text-muted-foreground">No mechanics found. Try adjusting your search.</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingMechanics ? (
              // Loading skeletons
              Array(4).fill(null).map((_, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-9 w-[100px]" />
                    <Skeleton className="h-9 w-[100px]" />
                  </div>
                </Card>
              ))
            ) : (
              searchResults.map(mechanic => (
                <MechanicCard key={mechanic.id} mechanic={mechanic} />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const MapPin = (props: React.ComponentProps<typeof SearchIcon>) => {
  return <SearchIcon {...props} />;
};

export default Search;
