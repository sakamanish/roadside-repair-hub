
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Star, MapPin, Calendar, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import BookingForm from '@/components/BookingForm';
import { useAuth } from '@/contexts/AuthContext';

// Add a helper function to normalize services
const getServicesArray = (services?: string[] | string): string[] => {
  if (!services) return [];
  if (typeof services === 'string') return services.split(',').map(s => s.trim());
  return services;
};

const MechanicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [mechanic, setMechanic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchMechanicDetails = async () => {
      if (!id) return;
      
      try {
        // Get the profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }
        
        // Get the mechanic details
        const { data: mechanicData, error: mechanicError } = await supabase
          .from('mechanic_profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (mechanicError) {
          console.error('Error fetching mechanic details:', mechanicError);
          return;
        }
        
        // Combine the data
        const mechanicProfile = {
          ...profileData,
          ...mechanicData,
          // Format services for display
          services: getServicesArray(mechanicData.services)
        };
        
        setMechanic(mechanicProfile);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Could not load mechanic profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMechanicDetails();
  }, [id, toast]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to book a service",
        variant: "destructive"
      });
      return;
    }
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading mechanic profile...</p>
        </div>
      </Layout>
    );
  }

  if (!mechanic) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Mechanic not found or an error occurred.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-full bg-bb-orange p-3">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">{mechanic.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {mechanic.rating ? (
                  <>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{mechanic.rating.toFixed(1)} ({mechanic.rate_count || 0} reviews)</span>
                  </>
                ) : (
                  <span>No ratings yet</span>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-muted-foreground">{mechanic.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Contact</h3>
                <p className="text-muted-foreground">{mechanic.phone_number || "Contact information not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Availability</h3>
                <p className="text-muted-foreground">{mechanic.availability || "Availability information not provided"}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {mechanic.services && mechanic.services.length > 0 ? (
                  mechanic.services.map((service: string, index: number) => (
                    <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                      {service}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No services listed</p>
                )}
              </div>
            </div>
            
            <div className="pt-4">
              <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={handleBookNow}
                    className="w-full bg-bb-blue hover:bg-bb-blue-dark"
                  >
                    Book Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <BookingForm 
                    mechanicId={mechanic.id} 
                    mechanicName={mechanic.name} 
                    services={mechanic.services}
                    onComplete={() => setBookingOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MechanicProfile;
