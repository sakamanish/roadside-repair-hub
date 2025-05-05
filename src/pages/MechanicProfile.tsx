
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Star, MapPin, Calendar, Phone, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import BookingForm from '@/components/BookingForm';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Booking } from '@/types/booking';

// Add a helper function to normalize services
const getServicesArray = (services?: string[] | string): string[] => {
  if (!services) return [];
  if (typeof services === 'string') return services.split(',').map(s => s.trim());
  return services;
};

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
          setBookings(bookingsData);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

        {/* Reviews Section */}
        <Card className="max-w-3xl mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingReviews ? (
              <div className="text-center py-4">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{review.customer_name}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No reviews yet</p>
            )}
          </CardContent>
        </Card>

        {/* Bookings Section - Only show if user is logged in */}
        {isAuthenticated && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="text-center py-4">Loading bookings...</div>
              ) : bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Scheduled For</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.service}</TableCell>
                          <TableCell>{formatDate(booking.scheduled_for)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No bookings found</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MechanicProfile;
