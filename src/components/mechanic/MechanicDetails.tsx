
import React from 'react';
import { MapPin, Phone, Calendar, CheckCircle } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
          <MapPin className="h-5 w-5 text-bb-blue shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-slate-800">Location</h3>
            <p className="text-slate-600">{address}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
          <Phone className="h-5 w-5 text-bb-blue shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-slate-800">Contact</h3>
            <p className="text-slate-600">{phoneNumber || "Contact information not provided"}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
          <Calendar className="h-5 w-5 text-bb-blue shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-slate-800">Availability</h3>
            <p className="text-slate-600">{availability || "Availability information not provided"}</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-medium text-lg mb-3">Services Offered</h3>
        <div className="flex flex-wrap gap-2">
          {servicesList && servicesList.length > 0 ? (
            servicesList.map((service: string, index: number) => (
              <div key={index} className="flex items-center gap-1.5 bg-bb-blue/10 px-3 py-1.5 rounded-full text-sm text-bb-blue border border-bb-blue/20">
                <CheckCircle className="h-3.5 w-3.5" />
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
