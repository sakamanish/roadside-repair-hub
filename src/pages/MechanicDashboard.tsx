
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/contexts/AuthContext';
import { Star, User, Phone, MapPin, Clock, Calendar } from 'lucide-react';

const MechanicDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for editable profile fields
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location ? { ...user.location } : { address: '', lat: 0, lng: 0 },
    services: user?.services || [],
    availability: user?.availability || ''
  });
  
  const [servicesInput, setServicesInput] = useState(
    user?.services ? user.services.join(', ') : ''
  );
  
  // Redirect if user is not authenticated or is not a mechanic
  React.useEffect(() => {
    if (isAuthenticated && user?.role !== 'mechanic') {
      navigate('/');
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'address') {
      setFormData({
        ...formData,
        location: {
          ...formData.location!,
          address: value
        }
      });
    } else if (name === 'services') {
      setServicesInput(value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse services string to array
    const servicesArray = servicesInput
      .split(',')
      .map(service => service.trim())
      .filter(service => service !== '');
    
    const updatedData = {
      ...formData,
      services: servicesArray
    };
    
    // In a real app, this would be an API call to update the user profile
    console.log('Profile update data:', updatedData);
    
    // Show success toast
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.'
    });
    
    setIsEditing(false);
  };

  // Generate mechanic initials for avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
    : 'M';

  if (!user || user.role !== 'mechanic') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Mechanic Dashboard</h1>
            <p className="text-muted-foreground">Manage your profile and bookings</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 bg-bb-blue text-white text-2xl">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl mb-1">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    
                    {user.rating !== undefined && (
                      <div className="flex items-center justify-center mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(user.rating!) 
                                ? 'fill-bb-orange text-bb-orange' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{user.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{user.phoneNumber}</span>
                    </div>
                    
                    {user.location?.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm">{user.location.address}</span>
                      </div>
                    )}
                    
                    {user.availability && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{user.availability}</span>
                      </div>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-6"
                      onClick={() => setIsEditing(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Your Profile</CardTitle>
                    <CardDescription>
                      Update your profile information to attract more customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Service Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.location?.address}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="services">Services Offered</Label>
                          <Input
                            id="services"
                            name="services"
                            value={servicesInput}
                            onChange={handleInputChange}
                            placeholder="Engine Repair, Battery Replacement, etc."
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Separate services with commas
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="availability">Availability</Label>
                          <Input
                            id="availability"
                            name="availability"
                            value={formData.availability}
                            onChange={handleInputChange}
                            placeholder="Mon-Fri 9AM-5PM, 24/7 Emergency, etc."
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">About Your Services</Label>
                          <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe your experience, specializations, and the services you provide..."
                            className="min-h-[120px]"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button 
                          variant="outline" 
                          type="button"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Recent Bookings</CardTitle>
                          <CardDescription>
                            Manage your upcoming appointments
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No upcoming bookings</p>
                        <p className="text-sm mt-2 mb-4">When customers book your services, they'll appear here.</p>
                        <Button variant="outline" size="sm">Set Your Availability</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Statistics</CardTitle>
                      <CardDescription>
                        Your performance and customer feedback
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-muted-foreground text-sm mb-1">Total Jobs</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-muted-foreground text-sm mb-1">Completion Rate</p>
                          <p className="text-2xl font-bold">-</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-muted-foreground text-sm mb-1">Rating</p>
                          <div className="flex items-center justify-center">
                            <Star className="h-5 w-5 fill-bb-orange text-bb-orange mr-1" />
                            <p className="text-2xl font-bold">{user.rating?.toFixed(1) || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div className="text-center py-2">
                        <p className="text-muted-foreground">Start completing jobs to see your statistics!</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MechanicDashboard;
