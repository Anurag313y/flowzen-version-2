import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePMSStore } from '@/store/pmsStore';
import { CheckInFlow, CheckOutFlow } from '@/components/pms/CheckInOutFlow';
import { format } from 'date-fns';
import { LogIn, LogOut, User, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Reservation } from '@/types/pms';

export default function PMSFrontDeskPage() {
  const { reservations, rooms, checkIn, checkOut } = usePMSStore();
  const [checkInRes, setCheckInRes] = React.useState<Reservation | null>(null);
  const [checkOutRes, setCheckOutRes] = React.useState<Reservation | null>(null);
  
  const arrivals = reservations.filter(r => r.status === 'confirmed');
  const inHouse = reservations.filter(r => r.status === 'checked_in');
  const departures = inHouse.filter(r => {
    const today = new Date();
    return r.checkOut.toDateString() === today.toDateString();
  });
  
  const handleCheckIn = (resId: string, roomId: string) => {
    checkIn(resId, roomId);
    toast({ title: 'Guest checked in successfully' });
  };
  
  const handleCheckOut = (resId: string) => {
    checkOut(resId);
    toast({ title: 'Guest checked out successfully' });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Front Desk</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-success" />
              Arrivals ({arrivals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {arrivals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No arrivals pending</p>
            ) : (
              arrivals.map(res => (
                <div key={res.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{res.guest.firstName} {res.guest.lastName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{res.roomType} • {res.nights} nights</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setCheckInRes(res)}>
                    Check In
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        {/* Departures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-warning" />
              Departures Today ({departures.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {departures.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No departures today</p>
            ) : (
              departures.map(res => (
                <div key={res.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Room {res.room?.number}</Badge>
                    <div>
                      <p className="font-medium">{res.guest.firstName} {res.guest.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        Balance: ${(res.totalAmount - res.paidAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setCheckOutRes(res)}>
                    Check Out
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* In-House Guests */}
      <Card>
        <CardHeader>
          <CardTitle>In-House Guests ({inHouse.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inHouse.map(res => (
              <div key={res.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge>Room {res.room?.number}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(res.checkOut, 'MMM d')}
                  </span>
                </div>
                <p className="font-medium">{res.guest.firstName} {res.guest.lastName}</p>
                <p className="text-sm text-muted-foreground">{res.confirmationNumber}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <CheckInFlow
        open={!!checkInRes}
        onClose={() => setCheckInRes(null)}
        reservation={checkInRes}
        availableRooms={rooms}
        onComplete={handleCheckIn}
      />
      
      <CheckOutFlow
        open={!!checkOutRes}
        onClose={() => setCheckOutRes(null)}
        reservation={checkOutRes}
        onComplete={handleCheckOut}
      />
    </div>
  );
}
