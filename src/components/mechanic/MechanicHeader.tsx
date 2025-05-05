
import React from 'react';
import { Wrench, Star } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MechanicHeaderProps {
  name: string;
  rating?: number;
  rateCount?: number;
}

const MechanicHeader: React.FC<MechanicHeaderProps> = ({ name, rating, rateCount }) => {
  return (
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="rounded-full bg-bb-orange p-3">
        <Wrench className="h-6 w-6 text-white" />
      </div>
      <div>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          {rating ? (
            <>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)} ({rateCount || 0} reviews)</span>
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
