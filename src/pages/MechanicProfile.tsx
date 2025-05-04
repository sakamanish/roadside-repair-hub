
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMechanics } from '@/contexts/MechanicsContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, MapPin, Clock, Star, MessageCircle } from 'lucide-react';
import { UserProfile } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const MechanicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { mechanics } = useMechanics();
  const [mechanic, setMechanic] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const [messageText, setMessageText] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to get mechanic details
    setLoading(true);
    
    setTimeout(() => {
      const foundMechanic = mechanics.find(m => m.id === id);
      setMechanic(foundMechanic || null);
      setLoading(false);
    }, 1000);
  }, [id, mechanics]);

  const handleSendMessage = () => {
    // Simulate sending a message
    toast({
      title: "Message sent!",
      description: `Your message has been sent to ${mechanic?.name}.`
    });
    setMessageText('');
    setMessageDialogOpen(false);
  };

  const handleBookService = () => {
    // Simulate booking a service
    toast({
      title: "Booking request sent!",
      description: `Your booking request has been sent to ${mechanic?.name}.`
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="bg-white rounded-lg border p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!mechanic) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-2">Mechanic Not Found</h1>
            <p className="text-muted-foreground">
              The mechanic you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const initials = mechanic.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-6"
          >
            ← Back to Search
          </Button>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 bg-bb-blue text-white text-xl">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h1 className="text-2xl font-bold">{mechanic.name}</h1>
                    {mechanic.rating && (
                      <div className="flex items-center mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(mechanic.rating) 
                              ? 'fill-bb-orange text-bb-orange' 
                              : i < mechanic.rating 
                                ? 'fill-bb-orange text-bb-orange' 
                                : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{mechanic.rating.toFixed(1)} out of 5</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {user?.role === 'customer' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Message to {mechanic.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label htmlFor="message" className="mb-2 block">
                              Your Message
                            </Label>
                            <Textarea
                              id="message"
                              placeholder="Describe your vehicle issue or inquiry..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              className="min-h-[120px]"
                            />
                          </div>
                          <Button onClick={handleSendMessage}>Send Message</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button className="bg-bb-orange hover:bg-bb-orange-dark text-white" onClick={handleBookService}>
                      <Phone className="h-4 w-4 mr-2" />
                      Book Service
                    </Button>
                  </div>
                )}
              </div>
              
              {mechanic.services && mechanic.services.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-base font-medium mb-2">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {mechanic.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mechanic.location?.address && (
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 text-bb-blue mr-2" />
                      <h2 className="text-base font-medium">Location</h2>
                    </div>
                    <p className="text-muted-foreground">{mechanic.location.address}</p>
                  </div>
                )}
                
                {mechanic.availability && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-bb-blue mr-2" />
                      <h2 className="text-base font-medium">Availability</h2>
                    </div>
                    <p className="text-muted-foreground">{mechanic.availability}</p>
                  </div>
                )}
                
                {mechanic.phoneNumber && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-5 w-5 text-bb-blue mr-2" />
                      <h2 className="text-base font-medium">Contact</h2>
                    </div>
                    <p className="text-muted-foreground">{mechanic.phoneNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="reviews">
            <TabsList className="mb-4">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Reviews coming soon!</p>
                    <p className="text-sm mt-2">Be the first to leave a review for {mechanic.name}.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="gallery">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No photos have been added yet.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">FAQ section coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default MechanicProfile;
