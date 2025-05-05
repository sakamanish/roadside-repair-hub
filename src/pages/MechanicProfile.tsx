
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import BookingForm from '@/components/BookingForm';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/booking';

// Import refactored components
import MechanicHeader from '@/components/mechanic/MechanicHeader';
import MechanicDetails from '@/components/mechanic/MechanicDetails';
import ReviewsList from '@/components/mechanic/ReviewsList';
import BookingsList from '@/components/mechanic/BookingsList';

interface Review {
  id: string;
  customer_id: string;
  mechanic_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  customer_name?: string;
}

const MechanicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [mechanic, setMechanic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

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
        
        setMechanic({
          ...profileData,
          ...mechanicData
        });
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

  // Fetch reviews for the mechanic
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      setLoadingReviews(true);
      try {
        // Get reviews for this mechanic
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('mechanic_id', id)
          .order('created_at', { ascending: false });
        
        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          return;
        }
        
        if (reviewsData && reviewsData.length > 0) {
          // Get customer names for the reviews
          const customerIds = reviewsData.map(review => review.customer_id);
          const { data: customersData, error: customersError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', customerIds);
            
          if (customersError) {
            console.error('Error fetching customer profiles:', customersError);
          }
          
          // Add customer names to reviews
          const reviewsWithNames = reviewsData.map(review => {
            const customer = customersData?.find(c => c.id === review.customer_id);
            return {
              ...review,
              customer_name: customer?.name || 'Anonymous User'
            };
          });
          
          setReviews(reviewsWithNames);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [id]);

  // Fetch bookings for the mechanic or customer
  useEffect(() => {
    const fetchBookings = async () => {
      if (!id || !user) return;
      
      setLoadingBookings(true);
      try {
        let query = supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        
        // If viewing as customer, show bookings with this mechanic
        if (user.id !== id) {
          query = query
            .eq('mechanic_id', id)
            .eq('customer_id', user.id);
        } else {
          // If viewing as mechanic, show all bookings for this mechanic
          query = query.eq('mechanic_id', id);
        }
        
        const { data: bookingsData, error: bookingsError } = await query;
        
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          return;
        }
        
        if (bookingsData) {
          setBookings(bookingsData as Booking[]);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };
    
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [id, user, isAuthenticated]);

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
        <Card className="max-w-3xl mx-auto mb-6">
          <MechanicHeader 
            name={mechanic.name} 
            rating={mechanic.rating} 
            rateCount={mechanic.rate_count} 
          />
          
          <CardContent className="space-y-4">
            <MechanicDetails 
              address={mechanic.address}
              phoneNumber={mechanic.phone_number}
              availability={mechanic.availability}
              services={mechanic.services}
            />
            
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

        {/* Reviews Section */}
        <ReviewsList reviews={reviews} loadingReviews={loadingReviews} />

        {/* Bookings Section - Only show if user is logged in */}
        {isAuthenticated && (
          <BookingsList bookings={bookings} loadingBookings={loadingBookings} />
        )}
      </div>
    </Layout>
  );
};

export default MechanicProfile;
