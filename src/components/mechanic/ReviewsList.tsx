
import React from 'react';
import { MessageCircle, Star } from 'lucide-react';
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
    <Card className="max-w-3xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingReviews ? (
          <div className="text-center py-4">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{review.customer_name}</span>
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
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No reviews yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsList;
