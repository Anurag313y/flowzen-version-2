import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePMSStore } from '@/store/pmsStore';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInDays } from 'date-fns';
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
  Wrench,
  CalendarIcon,
  Mail,
  MapPin,
  CreditCard,
  Minus,
  Plus,
  Settings2,
  Pencil,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room, Reservation, Guest } from '@/types/pms';

// Room status color mapping - Strong distinct colors
const roomStatusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  available: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600', dot: 'bg-emerald-500' },
  occupied: { bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-600', dot: 'bg-sky-500' },
  reserved: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600', dot: 'bg-amber-500' },
  maintenance: { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600', dot: 'bg-rose-500' },
  cleaning: { bg: 'bg-violet-500', text: 'text-white', border: 'border-violet-600', dot: 'bg-violet-500' },
};

const roomTypeLabels: Record<string, string> = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  suite: 'Suite',
  executive: 'Executive',
  presidential: 'Presidential',
};

// Color legend component
function StatusLegend() {
  const statuses = [
    { key: 'available', label: 'Available' },
    { key: 'occupied', label: 'Occupied' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'cleaning', label: 'Cleaning' },
    { key: 'maintenance', label: 'Maintenance' },
  ];
  
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {statuses.map(s => (
        <div key={s.key} className="flex items-center gap-1.5">
          <div className={cn("w-3 h-3 rounded-full", roomStatusColors[s.key].dot)} />
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// Room price based on type
const roomPrices: Record<string, number> = {
  standard: 1500,
  deluxe: 2500,
  suite: 4000,
  executive: 5500,
  presidential: 10000,
};

interface RoomCardProps {
  room: Room;
  reservation?: Reservation;
  onAction: (action: string, room: Room, reservation?: Reservation) => void;
}

function RoomCard({ room, reservation, onAction }: RoomCardProps) {
  const colors = roomStatusColors[room.status] || roomStatusColors.available;
  const isOccupied = room.status === 'occupied' && reservation;
  const price = room.baseRate || roomPrices[room.type] || 1500;
  
  return (
    <Card className={cn(
      "relative transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
      colors.bg,
      "border-0"
    )}>
      <CardContent className="p-2">
        {/* Row 1: Room Number | Status | Price */}
        <div className="flex items-center justify-between mb-1">
          <span className={cn("text-base font-bold", colors.text)}>
            {room.number}
          </span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-white/20 text-white border-0 capitalize">
            {room.status}
          </Badge>
          <span className="text-[10px] font-semibold text-white/90">
            ₹{price.toLocaleString()}
          </span>
        </div>

        {/* Row 2: Guest Name | Phone | Room Type - Only if occupied */}
        {isOccupied && reservation ? (
          <div className="flex items-center justify-between mb-1.5 text-[10px]">
            <span className="text-white font-medium truncate max-w-[60px]" title={`${reservation.guest.firstName} ${reservation.guest.lastName}`}>
              {reservation.guest.firstName}
            </span>
            <span className="text-white/80 truncate">
              {reservation.guest.phone.slice(-4)}
            </span>
            <span className="text-white/90 font-medium">
              {roomTypeLabels[room.type]}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center mb-1.5">
            <span className="text-[10px] text-white/80 font-medium">
              {roomTypeLabels[room.type]}
            </span>
          </div>
        )}

        {/* Row 3 & 4: Action Icons */}
        <div className="border-t border-white/20 pt-1">
          <div className="grid grid-cols-3 gap-0.5">
            <ActionButton
              icon={<CalendarPlus className="h-3.5 w-3.5" />}
              label="Book"
              onClick={() => onAction('book', room, reservation)}
              disabled={room.status === 'maintenance'}
            />
            <ActionButton
              icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
              label="KOT"
              onClick={() => onAction('kot', room, reservation)}
              disabled={!isOccupied}
            />
            <ActionButton
              icon={<LogIn className="h-3.5 w-3.5" />}
              label="In"
              onClick={() => onAction('checkin', room, reservation)}
              disabled={room.status !== 'reserved' && room.status !== 'available'}
            />
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            <ActionButton
              icon={<LogOut className="h-3.5 w-3.5" />}
              label="Out"
              onClick={() => onAction('checkout', room, reservation)}
              disabled={!isOccupied}
            />
            <ActionButton
              icon={<Receipt className="h-3.5 w-3.5" />}
              label="Bill"
              onClick={() => onAction('bill', room, reservation)}
              disabled={!isOccupied}
            />
            <ActionButton
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Clean"
              onClick={() => onAction('clean', room, reservation)}
              disabled={room.housekeepingStatus === 'clean'}
            />
          </div>
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
        "flex flex-col items-center gap-0.5 py-1.5 rounded transition-colors",
        disabled 
          ? "opacity-30 cursor-not-allowed" 
          : "hover:bg-white/20 cursor-pointer active:scale-95"
      )}
    >
      <span className="text-white">{icon}</span>
      <span className="text-[9px] font-medium text-white/90">{label}</span>
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
    getFolio,
    addRoom,
    updateRoom,
    deleteRoom
  } = usePMSStore();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [floorFilter, setFloorFilter] = React.useState<string>('all');
  
  // Dialogs
  const [bookingDialog, setBookingDialog] = React.useState<{ open: boolean; room?: Room }>({ open: false });
  const [kotDialog, setKotDialog] = React.useState<{ open: boolean; room?: Room; reservation?: Reservation }>({ open: false });
  const [billDialog, setBillDialog] = React.useState<{ open: boolean; room?: Room; reservation?: Reservation }>({ open: false });
  const [checkInDialog, setCheckInDialog] = React.useState<{ open: boolean; room?: Room }>({ open: false });
  
  // Room management dialogs
  const [manageRoomsDialog, setManageRoomsDialog] = React.useState(false);
  const [roomFormDialog, setRoomFormDialog] = React.useState<{ open: boolean; room?: Room }>({ open: false });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = React.useState<{ open: boolean; room?: Room }>({ open: false });
  
  // Room form state
  const [roomForm, setRoomForm] = React.useState({
    number: '',
    floor: 1,
    type: 'standard' as Room['type'],
    status: 'available' as Room['status'],
    housekeepingStatus: 'clean' as Room['housekeepingStatus'],
    maxOccupancy: 2,
    baseRate: 100,
    amenities: ['WiFi', 'TV', 'AC'],
  });
  
  // Booking form state
  const [bookingForm, setBookingForm] = React.useState({
    guestName: '',
    phone: '',
    email: '',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000),
    adults: 2,
    children: 0,
    source: 'walk-in',
    idType: '',
    idNumber: '',
    address: '',
    specialRequests: '',
  });

  // Open room form for editing
  const openEditRoom = (room: Room) => {
    setRoomForm({
      number: room.number,
      floor: room.floor,
      type: room.type,
      status: room.status,
      housekeepingStatus: room.housekeepingStatus,
      maxOccupancy: room.maxOccupancy,
      baseRate: room.baseRate,
      amenities: room.amenities,
    });
    setRoomFormDialog({ open: true, room });
  };

  // Open room form for new room
  const openNewRoom = () => {
    setRoomForm({
      number: '',
      floor: 1,
      type: 'standard',
      status: 'available',
      housekeepingStatus: 'clean',
      maxOccupancy: 2,
      baseRate: 100,
      amenities: ['WiFi', 'TV', 'AC'],
    });
    setRoomFormDialog({ open: true });
  };

  // Save room (add or update)
  const handleSaveRoom = () => {
    if (!roomForm.number) {
      toast({ title: 'Error', description: 'Room number is required', variant: 'destructive' });
      return;
    }
    
    if (roomFormDialog.room) {
      // Update existing room
      updateRoom(roomFormDialog.room.id, roomForm);
      toast({ title: 'Room Updated', description: `Room ${roomForm.number} has been updated` });
    } else {
      // Check if room number already exists
      if (rooms.some(r => r.number === roomForm.number)) {
        toast({ title: 'Error', description: 'Room number already exists', variant: 'destructive' });
        return;
      }
      // Add new room
      addRoom(roomForm);
      toast({ title: 'Room Added', description: `Room ${roomForm.number} has been added` });
    }
    setRoomFormDialog({ open: false });
  };

  // Delete room
  const handleDeleteRoom = () => {
    if (deleteConfirmDialog.room) {
      deleteRoom(deleteConfirmDialog.room.id);
      toast({ title: 'Room Deleted', description: `Room ${deleteConfirmDialog.room.number} has been deleted` });
      setDeleteConfirmDialog({ open: false });
    }
  };

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

  // Calculate nights from dates
  const nights = Math.max(1, differenceInDays(bookingForm.checkOut, bookingForm.checkIn));

  // Handle booking submission
  const handleBooking = () => {
    if (!bookingDialog.room || !bookingForm.guestName || !bookingForm.phone) return;
    
    const [firstName, ...lastNameParts] = bookingForm.guestName.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    
    const guest: Guest = {
      id: `guest-${Date.now()}`,
      firstName,
      lastName,
      email: bookingForm.email,
      phone: bookingForm.phone,
      address: bookingForm.address,
      idType: bookingForm.idType as any,
      idNumber: bookingForm.idNumber,
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
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      nights,
      adults: bookingForm.adults,
      children: bookingForm.children,
      source: bookingForm.source as any,
      ratePerNight: bookingDialog.room.baseRate,
      totalAmount: bookingDialog.room.baseRate * nights,
      specialRequests: bookingForm.specialRequests,
    });
    
    checkIn(`res-${Date.now()}`, bookingDialog.room.id);
    
    toast({ 
      title: 'Booking created', 
      description: `${firstName} ${lastName} checked into Room ${bookingDialog.room.number}` 
    });
    
    setBookingDialog({ open: false });
    setBookingForm({
      guestName: '',
      phone: '',
      email: '',
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000),
      adults: 2,
      children: 0,
      source: 'walk-in',
      idType: '',
      idNumber: '',
      address: '',
      specialRequests: '',
    });
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
    <div className="space-y-3 pb-6">
      {/* Header with Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">Room Dashboard</h1>
        <StatusLegend />
      </div>

      {/* Filters - Compact */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-[250px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search room/guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-9">
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
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors.map(floor => (
              <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">
            {stats.available}/{stats.total} available
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setManageRoomsDialog(true)}
            className="h-9"
          >
            <Settings2 className="h-4 w-4 mr-1" />
            Manage Rooms
          </Button>
        </div>
      </div>

      {/* Room Grid - More compact */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
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

      {/* Booking Dialog - Single Step */}
      <Dialog open={bookingDialog.open} onOpenChange={(open) => setBookingDialog({ open })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              New Booking - Room {bookingDialog.room?.number} 
              <Badge variant="outline" className="ml-2 capitalize">{bookingDialog.room?.type}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <User className="h-4 w-4" /> Guest Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Guest full name"
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm(f => ({ ...f, guestName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="+91 98765 43210"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="email"
                      placeholder="guest@email.com"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="City, State"
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm(f => ({ ...f, address: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ID Type</Label>
                  <Select value={bookingForm.idType} onValueChange={(v) => setBookingForm(f => ({ ...f, idType: v }))}>
                    <SelectTrigger>
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving">Driving License</SelectItem>
                      <SelectItem value="voter">Voter ID</SelectItem>
                      <SelectItem value="pan">PAN Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input
                    placeholder="ID number"
                    value={bookingForm.idNumber}
                    onChange={(e) => setBookingForm(f => ({ ...f, idNumber: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <CalendarIcon className="h-4 w-4" /> Stay Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(bookingForm.checkIn, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={bookingForm.checkIn}
                        onSelect={(d) => d && setBookingForm(f => ({ ...f, checkIn: d }))}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(bookingForm.checkOut, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={bookingForm.checkOut}
                        onSelect={(d) => d && setBookingForm(f => ({ ...f, checkOut: d }))}
                        disabled={(d) => d <= bookingForm.checkIn}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setBookingForm(f => ({ ...f, adults: Math.max(1, f.adults - 1) }))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{bookingForm.adults}</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setBookingForm(f => ({ ...f, adults: Math.min(10, f.adults + 1) }))}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Children</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setBookingForm(f => ({ ...f, children: Math.max(0, f.children - 1) }))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{bookingForm.children}</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setBookingForm(f => ({ ...f, children: Math.min(10, f.children + 1) }))}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Booking Source</Label>
                  <Select value={bookingForm.source} onValueChange={(v) => setBookingForm(f => ({ ...f, source: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="direct">Direct (Website)</SelectItem>
                      <SelectItem value="booking">Booking.com</SelectItem>
                      <SelectItem value="makemytrip">MakeMyTrip</SelectItem>
                      <SelectItem value="goibibo">Goibibo</SelectItem>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <Label>Special Requests / Notes</Label>
              <Textarea
                placeholder="Any special requests..."
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm(f => ({ ...f, specialRequests: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Summary Card */}
            {bookingDialog.room && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Room</span>
                    <p className="font-semibold">{bookingDialog.room.number} ({bookingDialog.room.type})</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-semibold">{nights} night(s)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rate/Night</span>
                    <p className="font-semibold">₹{bookingDialog.room.baseRate}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-primary/20">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{(bookingDialog.room.baseRate * nights).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleBooking} disabled={!bookingForm.guestName || !bookingForm.phone}>
              <LogIn className="h-4 w-4 mr-2" />
              Check In Guest
            </Button>
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

      {/* Manage Rooms Dialog */}
      <Dialog open={manageRoomsDialog} onOpenChange={setManageRoomsDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Manage Rooms
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Total {rooms.length} rooms configured
              </p>
              <Button onClick={openNewRoom} size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Room
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Room #</th>
                    <th className="text-left p-3 font-medium">Floor</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Rate</th>
                    <th className="text-left p-3 font-medium">Capacity</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rooms.map(room => (
                    <tr key={room.id} className="hover:bg-muted/50">
                      <td className="p-3 font-semibold">{room.number}</td>
                      <td className="p-3">{room.floor}</td>
                      <td className="p-3 capitalize">{roomTypeLabels[room.type] || room.type}</td>
                      <td className="p-3">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "capitalize text-xs",
                            room.status === 'available' && "border-emerald-500 text-emerald-600",
                            room.status === 'occupied' && "border-sky-500 text-sky-600",
                            room.status === 'reserved' && "border-amber-500 text-amber-600",
                            room.status === 'maintenance' && "border-rose-500 text-rose-600",
                            room.status === 'cleaning' && "border-violet-500 text-violet-600",
                          )}
                        >
                          {room.status}
                        </Badge>
                      </td>
                      <td className="p-3">₹{room.baseRate}</td>
                      <td className="p-3">{room.maxOccupancy}</td>
                      <td className="p-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEditRoom(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirmDialog({ open: true, room })}
                          disabled={room.status === 'occupied'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageRoomsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Room Form Dialog */}
      <Dialog open={roomFormDialog.open} onOpenChange={(open) => setRoomFormDialog({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {roomFormDialog.room ? `Edit Room ${roomFormDialog.room.number}` : 'Add New Room'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Number *</Label>
                <Input
                  placeholder="e.g., 101"
                  value={roomForm.number}
                  onChange={(e) => setRoomForm(f => ({ ...f, number: e.target.value }))}
                  disabled={!!roomFormDialog.room}
                />
              </div>
              <div className="space-y-2">
                <Label>Floor</Label>
                <Select 
                  value={roomForm.floor.toString()} 
                  onValueChange={(v) => setRoomForm(f => ({ ...f, floor: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(f => (
                      <SelectItem key={f} value={f.toString()}>Floor {f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select 
                  value={roomForm.type} 
                  onValueChange={(v: Room['type']) => setRoomForm(f => ({ ...f, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="presidential">Presidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={roomForm.status} 
                  onValueChange={(v: Room['status']) => setRoomForm(f => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Rate (₹)</Label>
                <Input
                  type="number"
                  value={roomForm.baseRate}
                  onChange={(e) => setRoomForm(f => ({ ...f, baseRate: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Occupancy</Label>
                <Input
                  type="number"
                  value={roomForm.maxOccupancy}
                  onChange={(e) => setRoomForm(f => ({ ...f, maxOccupancy: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomFormDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSaveRoom}>
              {roomFormDialog.room ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => setDeleteConfirmDialog({ open })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete Room <strong>{deleteConfirmDialog.room?.number}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>Delete</Button>
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
