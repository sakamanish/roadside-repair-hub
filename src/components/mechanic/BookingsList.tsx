
import React from 'react';
import { Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Booking } from '@/types/booking';

interface BookingsListProps {
  bookings: Booking[];
  loadingBookings: boolean;
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings, loadingBookings }) => {
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="max-w-3xl mx-auto mt-6">
      <CardHeader className="bg-gradient-to-r from-bb-blue-light to-bb-blue-dark text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Booking History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loadingBookings ? (
          <div className="text-center py-8 px-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bb-blue mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Service</TableHead>
                  <TableHead className="font-semibold">Scheduled For</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(booking => (
                  <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{booking.service}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {formatDate(booking.scheduled_for)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={booking.location || 'No location specified'}>
                      {booking.location || 'No location specified'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-muted/10">
            <div className="rounded-full bg-muted/30 p-3 w-fit mx-auto">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-2 text-muted-foreground">No bookings found</p>
            <p className="text-sm text-muted-foreground">
              Book a service with this mechanic to see your appointments here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsList;
