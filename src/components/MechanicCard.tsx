
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, Star } from 'lucide-react';
import { UserProfile } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface MechanicCardProps {
  mechanic: UserProfile & { distance?: string };
}

const MechanicCard: React.FC<MechanicCardProps> = ({ mechanic }) => {
  const initials = mechanic.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="bb-mechanic-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10 bg-bb-blue text-white">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium truncate">{mechanic.name}</CardTitle>
            <div className="flex items-center">
              {mechanic.rating && (
                <div className="flex items-center mr-2">
                  <Star className="h-4 w-4 fill-bb-orange text-bb-orange mr-1" />
                  <span className="text-sm font-medium">{mechanic.rating.toFixed(1)}</span>
                </div>
              )}
              {mechanic.distance && (
                <Badge variant="outline" className="ml-2">
                  {mechanic.distance} km away
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {mechanic.services && mechanic.services.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {mechanic.services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {mechanic.services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mechanic.services.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {mechanic.location?.address && (
          <div className="flex items-start my-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 mr-2" />
            <span className="text-sm text-muted-foreground">{mechanic.location.address}</span>
          </div>
        )}
        
        {mechanic.availability && (
          <div className="flex items-center my-2">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">{mechanic.availability}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Link to={`/mechanic/${mechanic.id}`}>
          <Button variant="outline" size="sm">View Profile</Button>
        </Link>
        <Button variant="secondary" size="sm" className="bg-bb-orange hover:bg-bb-orange-dark text-white">
          <Phone className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MechanicCard;
