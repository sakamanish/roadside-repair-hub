
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
    <CardHeader className="flex flex-row items-center gap-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
      <div className="rounded-full bg-gradient-to-r from-bb-orange to-bb-orange-dark p-4 shadow-md">
        <Wrench className="h-6 w-6 text-white" />
      </div>
      <div>
        <CardTitle className="text-2xl font-bold text-slate-800">{name}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          {rating ? (
            <>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({rateCount || 0} reviews)</span>
            </>
          ) : (
            <span className="text-muted-foreground">No ratings yet</span>
          )}
        </CardDescription>
      </div>
    </CardHeader>
  );
};

export default MechanicHeader;
