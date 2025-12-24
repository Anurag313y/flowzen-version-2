import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePMSStore } from '@/store/pmsStore';
import { toast } from '@/hooks/use-toast';
import { 
  CalendarPlus, 
  UtensilsCrossed, 
  LogOut, 
  LogIn, 
  Receipt, 
  Sparkles,
  Phone,
  User,
  Search,
  Filter,
  BedDouble,
  Users,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room, Reservation, Guest } from '@/types/pms';

// Room status color mapping
const roomStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  available: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  occupied: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  reserved: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  maintenance: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  cleaning: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
};

const roomTypeLabels: Record<string, string> = {
  standard: 'STD',
  deluxe: 'DLX',
  suite: 'STE',
  executive: 'EXE',
  presidential: 'PRE',
};

interface RoomCardProps {
  room: Room;
  reservation?: Reservation;
  onAction: (action: string, room: Room, reservation?: Reservation) => void;
}

function RoomCard({ room, reservation, onAction }: RoomCardProps) {
  const colors = roomStatusColors[room.status] || roomStatusColors.available;
  const isOccupied = room.status === 'occupied' && reservation;
  const needsCleaning = room.housekeepingStatus === 'dirty';
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
      colors.bg,
      colors.border,
      "border-2"
    )}>
      <CardContent className="p-3">
        {/* Room Number & Type Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={cn("text-xl font-bold", colors.text)}>
              {room.number}
            </span>
            <Badge variant="outline" className={cn("text-xs font-medium", colors.text, colors.border)}>
              {roomTypeLabels[room.type] || room.type.toUpperCase()}
            </Badge>
          </div>
          {needsCleaning && (
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          )}
        </div>

        {/* Guest Info - Only show if occupied */}
        {isOccupied && reservation ? (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium truncate">
                {reservation.guest.firstName} {reservation.guest.lastName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{reservation.guest.phone}</span>
            </div>
          </div>
        ) : (
          <div className="h-12 flex items-center justify-center">
            <span className={cn("text-sm font-medium capitalize", colors.text)}>
              {room.status === 'cleaning' ? 'Being Cleaned' : room.status}
            </span>
          </div>
        )}

        {/* Action Icons Row */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-border/50">
          <ActionButton
            icon={<CalendarPlus className="h-4 w-4" />}
            label="Book"
            onClick={() => onAction('book', room, reservation)}
            disabled={room.status === 'maintenance'}
          />
          <ActionButton
            icon={<UtensilsCrossed className="h-4 w-4" />}
            label="KOT"
            onClick={() => onAction('kot', room, reservation)}
            disabled={!isOccupied}
          />
          <ActionButton
            icon={<LogIn className="h-4 w-4" />}
            label="In"
            onClick={() => onAction('checkin', room, reservation)}
            disabled={room.status !== 'reserved' && room.status !== 'available'}
          />
          <ActionButton
            icon={<LogOut className="h-4 w-4" />}
            label="Out"
            onClick={() => onAction('checkout', room, reservation)}
            disabled={!isOccupied}
          />
          <ActionButton
            icon={<Receipt className="h-4 w-4" />}
            label="Bill"
            onClick={() => onAction('bill', room, reservation)}
            disabled={!isOccupied}
          />
          <ActionButton
            icon={<Sparkles className="h-4 w-4" />}
            label="Clean"
            onClick={() => onAction('clean', room, reservation)}
            disabled={room.housekeepingStatus === 'clean'}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ icon, label, onClick, disabled }: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-0.5 p-1.5 rounded-md transition-colors",
        disabled 
          ? "opacity-30 cursor-not-allowed" 
          : "hover:bg-background/80 cursor-pointer active:scale-95"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </button>
  );
}

export default function PMSRoomDashboardPage() {
  const { 
    rooms, 
    reservations, 
    checkIn, 
    checkOut, 
    updateHousekeepingStatus,
    createReservation,
    getFolio 
  } = usePMSStore();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [floorFilter, setFloorFilter] = React.useState<string>('all');
  
  // Dialogs
  const [bookingDialog, setBookingDialog] = React.useState<{ open: boolean; room?: Room }>({ open: false });
  const [kotDialog, setKotDialog] = React.useState<{ open: boolean; room?: Room; reservation?: Reservation }>({ open: false });
  const [billDialog, setBillDialog] = React.useState<{ open: boolean; room?: Room; reservation?: Reservation }>({ open: false });
  const [checkInDialog, setCheckInDialog] = React.useState<{ open: boolean; room?: Room }>({ open: false });
  
  // Booking form state
  const [bookingForm, setBookingForm] = React.useState({
    guestName: '',
    phone: '',
    nights: 1,
  });

  // Get reservation for a room
  const getReservationForRoom = (room: Room): Reservation | undefined => {
    return reservations.find(res => 
      res.roomId === room.id && 
      (res.status === 'checked_in' || res.status === 'confirmed')
    );
  };

  // Filter rooms
  const filteredRooms = React.useMemo(() => {
    return rooms.filter(room => {
      const reservation = getReservationForRoom(room);
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesRoom = room.number.toLowerCase().includes(query);
        const matchesGuest = reservation?.guest.firstName.toLowerCase().includes(query) ||
                            reservation?.guest.lastName.toLowerCase().includes(query) ||
                            reservation?.guest.phone.includes(query);
        if (!matchesRoom && !matchesGuest) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && room.status !== statusFilter) return false;
      
      // Floor filter
      if (floorFilter !== 'all' && room.floor.toString() !== floorFilter) return false;
      
      return true;
    });
  }, [rooms, reservations, searchQuery, statusFilter, floorFilter]);

  // Get unique floors
  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  // Handle room actions
  const handleAction = (action: string, room: Room, reservation?: Reservation) => {
    switch (action) {
      case 'book':
        setBookingDialog({ open: true, room });
        break;
      case 'kot':
        setKotDialog({ open: true, room, reservation });
        break;
      case 'checkin':
        setCheckInDialog({ open: true, room });
        break;
      case 'checkout':
        if (reservation) {
          checkOut(reservation.id);
          toast({ title: 'Guest checked out', description: `Room ${room.number} is now available for cleaning` });
        }
        break;
      case 'bill':
        setBillDialog({ open: true, room, reservation });
        break;
      case 'clean':
        updateHousekeepingStatus(room.id, 'clean');
        toast({ title: 'Room marked clean', description: `Room ${room.number} is now available` });
        break;
    }
  };

  // Handle booking submission
  const handleBooking = () => {
    if (!bookingDialog.room || !bookingForm.guestName) return;
    
    const [firstName, ...lastNameParts] = bookingForm.guestName.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    
    const guest: Guest = {
      id: `guest-${Date.now()}`,
      firstName,
      lastName,
      email: '',
      phone: bookingForm.phone,
      totalStays: 0,
      totalSpent: 0,
      createdAt: new Date(),
    };
    
    createReservation({
      guest,
      guestId: guest.id,
      roomId: bookingDialog.room.id,
      room: bookingDialog.room,
      roomType: bookingDialog.room.type,
      checkIn: new Date(),
      nights: bookingForm.nights,
      adults: 1,
      children: 0,
      ratePerNight: bookingDialog.room.baseRate,
      totalAmount: bookingDialog.room.baseRate * bookingForm.nights,
    });
    
    checkIn(`res-${Date.now()}`, bookingDialog.room.id);
    
    toast({ 
      title: 'Booking created', 
      description: `${firstName} ${lastName} checked into Room ${bookingDialog.room.number}` 
    });
    
    setBookingDialog({ open: false });
    setBookingForm({ guestName: '', phone: '', nights: 1 });
  };

  // Summary stats
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Room Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage all rooms in one place</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard icon={<BedDouble />} label="Total" value={stats.total} color="text-foreground" />
        <StatCard icon={<BedDouble />} label="Available" value={stats.available} color="text-emerald-600" />
        <StatCard icon={<Users />} label="Occupied" value={stats.occupied} color="text-blue-600" />
        <StatCard icon={<Sparkles />} label="Cleaning" value={stats.cleaning} color="text-purple-600" />
        <StatCard icon={<Wrench />} label="Maintenance" value={stats.maintenance} color="text-red-600" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search room or guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={floorFilter} onValueChange={setFloorFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors.map(floor => (
              <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredRooms.map(room => (
          <RoomCard 
            key={room.id} 
            room={room} 
            reservation={getReservationForRoom(room)}
            onAction={handleAction}
          />
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No rooms match your filters
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialog.open} onOpenChange={(open) => setBookingDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Booking - Room {bookingDialog.room?.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Guest Name</label>
              <Input
                placeholder="Enter guest name"
                value={bookingForm.guestName}
                onChange={(e) => setBookingForm(f => ({ ...f, guestName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="Enter phone number"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Nights</label>
              <Input
                type="number"
                min={1}
                value={bookingForm.nights}
                onChange={(e) => setBookingForm(f => ({ ...f, nights: parseInt(e.target.value) || 1 }))}
              />
            </div>
            {bookingDialog.room && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Rate per night:</span>
                  <span className="font-medium">₹{bookingDialog.room.baseRate}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold mt-1">
                  <span>Total:</span>
                  <span>₹{bookingDialog.room.baseRate * bookingForm.nights}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleBooking} disabled={!bookingForm.guestName}>Check In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KOT Dialog */}
      <Dialog open={kotDialog.open} onOpenChange={(open) => setKotDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kitchen Order - Room {kotDialog.room?.number}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>KOT functionality connects to POS system</p>
            <p className="text-sm mt-2">Guest: {kotDialog.reservation?.guest.firstName} {kotDialog.reservation?.guest.lastName}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              toast({ title: 'Opening POS', description: 'Redirecting to restaurant POS...' });
              setKotDialog({ open: false });
            }}>Open POS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog open={billDialog.open} onOpenChange={(open) => setBillDialog({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bill - Room {billDialog.room?.number}</DialogTitle>
          </DialogHeader>
          {billDialog.reservation && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guest:</span>
                <span className="font-medium">{billDialog.reservation.guest.firstName} {billDialog.reservation.guest.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Room Charges:</span>
                <span>₹{billDialog.reservation.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid:</span>
                <span className="text-emerald-600">₹{billDialog.reservation.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Balance Due:</span>
                <span className="text-primary">₹{(billDialog.reservation.totalAmount - billDialog.reservation.paidAmount).toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBillDialog({ open: false })}>Close</Button>
            <Button onClick={() => {
              toast({ title: 'Bill printed', description: 'Sending to printer...' });
            }}>Print Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={checkInDialog.open} onOpenChange={(open) => setCheckInDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In - Room {checkInDialog.room?.number}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <LogIn className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Use the "Book" button for walk-in guests</p>
            <p className="text-sm mt-2">Or select from pending reservations</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInDialog({ open: false })}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-muted", color)}>
          {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4' })}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
