
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useMechanics } from '@/contexts/MechanicsContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Search as SearchIcon, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Search = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    searchResults, 
    searchParams, 
    setSearchParams, 
    loadingMechanics,
    searchMechanics
  } = useMechanics();
  const [location, setLocation] = useState(searchParams.location);
  const [service, setService] = useState(searchParams.service);
  const [distance, setDistance] = useState(searchParams.distance);
  const [rating, setRating] = useState(searchParams.rating.toString());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update search parameters in context
    const updatedParams = {
      location,
      service,
      distance,
      rating: parseInt(rating)
    };
    
    setSearchParams(updatedParams);
    searchMechanics(updatedParams);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Find a Mechanic</h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City, Address"
                      className="pl-9"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service">Service Needed</Label>
                  <Input
                    id="service"
                    placeholder="E.g. Battery Replacement, Tire Change"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (up to {distance} miles)</Label>
                  <Slider
                    id="distance"
                    min={1}
                    max={50}
                    step={1}
                    value={[distance]}
                    onValueChange={(values) => setDistance(values[0])}
                    className="py-4"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rating">Minimum Rating</Label>
                  <Select 
                    value={rating} 
                    onValueChange={setRating}
                  >
                    <SelectTrigger id="rating">
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button type="submit" className="w-full md:w-auto">
                <SearchIcon className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {loadingMechanics ? 'Searching...' : 
             searchResults.length > 0 ? `Found ${searchResults.length} mechanics` : 
             'No mechanics found'}
          </h2>
          
          {loadingMechanics ? (
            <div className="text-center py-8">Loading...</div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((mechanic) => (
                <Card key={mechanic.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{mechanic.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">
                            {mechanic.rating ? mechanic.rating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{mechanic.location?.address || 'Address not provided'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mechanic.services && (typeof mechanic.services === 'string' ? 
                          mechanic.services.split(',').map((service, idx) => (
                            <span key={idx} className="bg-muted px-2 py-1 rounded-full text-xs">
                              {service.trim()}
                            </span>
                          )) : 
                          Array.isArray(mechanic.services) && mechanic.services.map((service, idx) => (
                            <span key={idx} className="bg-muted px-2 py-1 rounded-full text-xs">
                              {service}
                            </span>
                          ))
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/mechanic/${mechanic.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No mechanics found matching your criteria.</p>
              <p className="text-muted-foreground">Try adjusting your search parameters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
