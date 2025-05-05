
export interface Booking {
  id: string;
  mechanic_id: string;
  customer_id: string;
  service: string;
  location: string;
  description?: string;
  scheduled_for?: string;
  completed_at?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  created_at: string;
  latitude?: number;
  longitude?: number;
}
