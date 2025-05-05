
import React from 'react';
import { MapPin, Phone, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MechanicDetailsProps {
  address: string;
  phoneNumber?: string;
  availability?: string;
  services?: string[] | string;
}

// Helper function to normalize services
const getServicesArray = (services?: string[] | string): string[] => {
  if (!services) return [];
  if (typeof services === 'string') return services.split(',').map(s => s.trim());
  return services;
};

const MechanicDetails: React.FC<MechanicDetailsProps> = ({ 
  address, 
  phoneNumber, 
  availability, 
  services 
}) => {
  const servicesList = getServicesArray(services);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Location</h3>
          <p className="text-muted-foreground">{address}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Contact</h3>
          <p className="text-muted-foreground">{phoneNumber || "Contact information not provided"}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Availability</h3>
          <p className="text-muted-foreground">{availability || "Availability information not provided"}</p>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-medium mb-2">Services Offered</h3>
        <div className="flex flex-wrap gap-2">
          {servicesList && servicesList.length > 0 ? (
            servicesList.map((service: string, index: number) => (
              <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                {service}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No services listed</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MechanicDetails;
