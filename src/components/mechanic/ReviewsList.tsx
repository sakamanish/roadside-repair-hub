
import React from 'react';
import { MessageCircle, Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Review {
  id: string;
  customer_id: string;
  mechanic_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  customer_name?: string;
}

interface ReviewsListProps {
  reviews: Review[];
  loadingReviews: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, loadingReviews }) => {
  return (
    <Card className="max-w-3xl mx-auto mb-6 overflow-hidden border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Customer Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loadingReviews ? (
          <div className="text-center py-8 px-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bb-blue mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="divide-y">
            {reviews.map(review => (
              <div key={review.id} className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-slate-100 p-1.5">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="font-medium">{review.customer_name}</span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 mt-2 pl-8">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground mt-3 pl-8">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-muted/10">
            <div className="rounded-full bg-muted/30 p-3 w-fit mx-auto">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-2 font-medium">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to leave a review for this mechanic
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsList;
