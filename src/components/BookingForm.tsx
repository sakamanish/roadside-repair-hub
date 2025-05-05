
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  mechanicId: string;
  mechanicName: string;
  services: string[] | string;
  onComplete?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  mechanicId,
  mechanicName,
  services,
  onComplete
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Convert services to array if it's a string
  const serviceOptions = typeof services === 'string'
    ? services.split(',').map(s => s.trim())
    : Array.isArray(services) ? services : [];

  // Form state
  const [selectedService, setSelectedService] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to make a booking",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (!selectedService || !location) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the booking in Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          mechanic_id: mechanicId,
          customer_id: user.id,
          service: selectedService,
          location,
          description: description || null,
          scheduled_for: date ? date.toISOString() : null,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) {
        console.error('Booking error:', error);
        throw error;
      }
      
      toast({
        title: "Booking Created",
        description: `Your booking with ${mechanicName} has been created successfully.`
      });
      
      // Reset form
      setSelectedService('');
      setLocation('');
      setDescription('');
      setDate(undefined);
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Could not create your booking",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Service with {mechanicName}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Service Required</Label>
            <Select 
              value={selectedService} 
              onValueChange={setSelectedService}
              required
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((service, index) => (
                  <SelectItem key={index} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Your Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Full address where service is needed"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Problem Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your vehicle issue in detail..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Preferred Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-bb-blue hover:bg-bb-blue-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Book Now'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
