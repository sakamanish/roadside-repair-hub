
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// Add a helper function to normalize services
const getServicesString = (services?: string[] | string): string => {
  if (!services) return '';
  if (typeof services === 'string') return services;
  return services.join(', ');
};

const MechanicDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mechanicProfile, setMechanicProfile] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [services, setServices] = useState('');
  const [availability, setAvailability] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated or not a mechanic
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.role !== 'mechanic') {
      navigate('/');
      return;
    }

    // Load mechanic profile data
    const fetchMechanicProfile = async () => {
      if (!user) return;
      
      try {
        // Get the mechanic profile data
        const { data: mechanicData, error: mechanicError } = await supabase
          .from('mechanic_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (mechanicError) {
          console.error('Error fetching mechanic profile:', mechanicError);
          // If we can't load the profile data, we'll still initialize with user data
        } else {
          setMechanicProfile(mechanicData);
          setAddress(mechanicData.address || '');
          setServices(getServicesString(mechanicData.services) || '');
          setAvailability(mechanicData.availability || '');
        }
        
        // Always set the user data we have
        setName(user.name || '');
        setPhoneNumber(user.phoneNumber || '');
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Could not load your profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMechanicProfile();
  }, [user, isAuthenticated, navigate, toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // Parse services from comma-separated string to array
      const servicesArray = services.split(',').map(item => item.trim()).filter(item => item);
      
      // Update the basic profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          phone_number: phoneNumber
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      // Update the mechanic-specific data
      const { error: mechanicError } = await supabase
        .from('mechanic_profiles')
        .update({
          address,
          services: servicesArray,
          availability
        })
        .eq('id', user.id);
        
      if (mechanicError) {
        throw mechanicError;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your profile",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Mechanic Profile</CardTitle>
            <CardDescription>Update your profile information and services</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Service Address</Label>
                <Input 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="services">Services Offered</Label>
                <Input 
                  id="services" 
                  value={services} 
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="Engine Repair, Battery Replacement, etc."
                  required 
                />
                <p className="text-xs text-muted-foreground">Separate services with commas</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input 
                  id="availability" 
                  value={availability} 
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="Mon-Fri 9AM-5PM, 24/7 Emergency, etc."
                  required 
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-bb-blue hover:bg-bb-blue-dark"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default MechanicDashboard;
