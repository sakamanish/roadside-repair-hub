
import React from 'react';
import { Wrench, Star, User } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MechanicHeaderProps {
  name: string;
  rating?: number;
  rateCount?: number;
}

const MechanicHeader: React.FC<MechanicHeaderProps> = ({ name, rating, rateCount }) => {
  return (
    <CardHeader className="flex flex-row items-center gap-4 bg-gradient-to-r from-bb-blue-light to-bb-blue-dark text-white rounded-t-lg p-6">
      <div className="rounded-full bg-white/20 p-4 shadow-lg backdrop-blur-sm">
        <User className="h-8 w-8 text-white" />
      </div>
      <div>
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1 text-white/90">
          {rating ? (
            <>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span>({rateCount || 0} reviews)</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </CardDescription>
      </div>
    </CardHeader>
  );
};

export default MechanicHeader;
