import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { usePMSStore } from '@/store/pmsStore';
import { format, isToday, isTomorrow, addDays, startOfDay, isWithinInterval } from 'date-fns';
import { 
  LogIn, 
  LogOut, 
  Search,
  Phone,
  User,
  Clock,
  BedDouble,
  Plus,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  X,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Reservation, Room } from '@/types/pms';

// Quick Check-in Modal - Single Step
interface QuickCheckInProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  availableRooms: Room[];
  onComplete: (reservationId: string, roomId: string) => void;
}

function QuickCheckIn({ open, onClose, reservation, availableRooms, onComplete }: QuickCheckInProps) {
  const [selectedRoom, setSelectedRoom] = React.useState<string>('');
  
  const filteredRooms = availableRooms.filter(
    r => r.type === reservation?.roomType && r.status === 'available' && r.housekeepingStatus === 'clean'
  );
  
  // Auto-select first available room
  React.useEffect(() => {
    if (open && filteredRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(filteredRooms[0].id);
    }
    if (!open) {
      setSelectedRoom('');
    }
  }, [open, filteredRooms]);
  
  const handleComplete = () => {
    if (reservation && selectedRoom) {
      onComplete(reservation.id, selectedRoom);
      onClose();
    }
  };
  
  if (!reservation) return null;
  
  const balance = reservation.totalAmount - reservation.paidAmount;
  const selectedRoomData = availableRooms.find(r => r.id === selectedRoom);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-emerald-600" />
            Quick Check-in
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Guest Summary */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{reservation.guest.firstName} {reservation.guest.lastName}</p>
              <p className="text-sm text-muted-foreground">{reservation.guest.phone}</p>
            </div>
            <Badge variant="outline">{reservation.nights} nights</Badge>
          </div>
          
          {/* Room Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign Room</label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue placeholder="Select room..." />
              </SelectTrigger>
              <SelectContent>
                {filteredRooms.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No clean {reservation.roomType} rooms available
                  </div>
                ) : (
                  filteredRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        <span>Room {room.number}</span>
                        <span className="text-muted-foreground">• Floor {room.floor}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Payment Status */}
          <div className={cn(
            "p-3 rounded-lg flex items-center justify-between",
            balance > 0 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
          )}>
            <div className="flex items-center gap-2">
              <CreditCard className={cn("h-4 w-4", balance > 0 ? "text-amber-600" : "text-emerald-600")} />
              <span className="text-sm font-medium">Payment Status</span>
            </div>
            <div className="text-right">
              {balance > 0 ? (
                <span className="text-amber-600 font-semibold">₹{balance.toFixed(0)} due</span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Paid
                </span>
              )}
            </div>
          </div>
          
          {/* Summary */}
          {selectedRoomData && (
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Assigning to</p>
              <p className="text-2xl font-bold text-primary">Room {selectedRoomData.number}</p>
              <p className="text-sm text-muted-foreground capitalize">{selectedRoomData.type} • Floor {selectedRoomData.floor}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleComplete} 
            disabled={!selectedRoom}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Complete Check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick Check-out Modal - Single Step
interface QuickCheckOutProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onComplete: (reservationId: string) => void;
  onViewFolio: (reservation: Reservation) => void;
}

function QuickCheckOut({ open, onClose, reservation, onComplete, onViewFolio }: QuickCheckOutProps) {
  if (!reservation) return null;
  
  const balance = reservation.totalAmount - reservation.paidAmount;
  
  const handleComplete = () => {
    onComplete(reservation.id);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-amber-600" />
            Quick Check-out
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Guest & Room */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Badge className="text-lg px-3 py-1">Room {reservation.room?.number}</Badge>
            <div className="flex-1">
              <p className="font-semibold">{reservation.guest.firstName} {reservation.guest.lastName}</p>
              <p className="text-sm text-muted-foreground">
                {format(reservation.checkIn, 'MMM d')} - {format(reservation.checkOut, 'MMM d')} • {reservation.nights} nights
              </p>
            </div>
          </div>
          
          {/* Balance */}
          <div className={cn(
            "p-4 rounded-lg text-center",
            balance > 0 ? "bg-destructive/10" : "bg-emerald-50 dark:bg-emerald-950/30"
          )}>
            <p className="text-sm text-muted-foreground mb-1">Final Balance</p>
            <p className={cn(
              "text-3xl font-bold",
              balance > 0 ? "text-destructive" : "text-emerald-600"
            )}>
              ₹{Math.abs(balance).toFixed(0)}
              {balance < 0 && <span className="text-sm font-normal ml-1">refund</span>}
            </p>
            {balance === 0 && (
              <p className="text-emerald-600 text-sm mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Fully Settled
              </p>
            )}
          </div>
          
          {balance > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Outstanding balance - collect before checkout</span>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onViewFolio(reservation)}>
            <Receipt className="h-4 w-4 mr-2" />
            View Folio
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleComplete}
              variant={balance > 0 ? "destructive" : "default"}
              className={balance <= 0 ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {balance > 0 ? 'Checkout Anyway' : 'Complete Checkout'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Walk-in Booking Quick Form
interface WalkInFormProps {
  open: boolean;
  onClose: () => void;
  availableRooms: Room[];
  onComplete: (data: Partial<Reservation>) => void;
}

function WalkInForm({ open, onClose, availableRooms, onComplete }: WalkInFormProps) {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    roomId: '',
    nights: 1,
  });
  
  const cleanRooms = availableRooms.filter(r => r.status === 'available' && r.housekeepingStatus === 'clean');
  const selectedRoom = cleanRooms.find(r => r.id === formData.roomId);
  
  const roomPrices: Record<string, number> = {
    standard: 1500,
    deluxe: 2500,
    suite: 4000,
    executive: 5500,
  };
  
  const totalAmount = selectedRoom ? (roomPrices[selectedRoom.type] || 1500) * formData.nights : 0;
  
  React.useEffect(() => {
    if (!open) {
      setFormData({ firstName: '', lastName: '', phone: '', roomId: '', nights: 1 });
    }
  }, [open]);
  
  const handleSubmit = () => {
    if (!formData.firstName || !formData.phone || !formData.roomId) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    const today = new Date();
    const checkOut = addDays(today, formData.nights);
    
    onComplete({
      guest: {
        id: crypto.randomUUID(),
        firstName: formData.firstName,
        lastName: formData.lastName || '',
        email: '',
        phone: formData.phone,
        idType: 'other',
        idNumber: '',
        address: '',
        city: '',
        country: 'India',
        totalStays: 1,
        totalSpent: totalAmount,
        createdAt: new Date(),
      },
      roomId: formData.roomId,
      room: selectedRoom,
      roomType: selectedRoom?.type || 'standard',
      checkIn: today,
      checkOut,
      nights: formData.nights,
      adults: 1,
      children: 0,
      ratePerNight: roomPrices[selectedRoom?.type || 'standard'] || 1500,
      totalAmount,
      paidAmount: 0,
      status: 'checked_in',
      source: 'walk-in',
      specialRequests: '',
    });
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Walk-in Booking
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Guest Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData(d => ({ ...d, firstName: e.target.value }))}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData(d => ({ ...d, lastName: e.target.value }))}
                placeholder="Last name"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Phone *</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(d => ({ ...d, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>
          
          {/* Room Selection */}
          <div>
            <label className="text-sm font-medium">Select Room *</label>
            <Select value={formData.roomId} onValueChange={(v) => setFormData(d => ({ ...d, roomId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a room..." />
              </SelectTrigger>
              <SelectContent>
                {cleanRooms.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">No rooms available</div>
                ) : (
                  cleanRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>Room {room.number} • {room.type}</span>
                        <span className="text-muted-foreground">₹{roomPrices[room.type] || 1500}/night</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Nights */}
          <div>
            <label className="text-sm font-medium">Number of Nights</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData(d => ({ ...d, nights: Math.max(1, d.nights - 1) }))}
              >
                -
              </Button>
              <span className="w-12 text-center text-lg font-semibold">{formData.nights}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData(d => ({ ...d, nights: d.nights + 1 }))}
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                Checkout: {format(addDays(new Date(), formData.nights), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          {/* Total */}
          {selectedRoom && (
            <div className="p-3 bg-primary/5 rounded-lg flex items-center justify-between">
              <span className="font-medium">Total Amount</span>
              <span className="text-xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.firstName || !formData.phone || !formData.roomId}>
            <Plus className="h-4 w-4 mr-2" />
            Book & Check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Front Desk Page
export default function PMSFrontDeskPage() {
  const { 
    reservations, 
    rooms, 
    checkIn, 
    checkOut,
    createReservation,
    getFolio,
  } = usePMSStore();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'arrivals' | 'departures' | 'inhouse'>('arrivals');
  const [checkInRes, setCheckInRes] = React.useState<Reservation | null>(null);
  const [checkOutRes, setCheckOutRes] = React.useState<Reservation | null>(null);
  const [showWalkIn, setShowWalkIn] = React.useState(false);
  
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);
  
  // Categorize reservations
  const categorized = React.useMemo(() => {
    const arrivals = reservations.filter(r => 
      r.status === 'confirmed' && 
      isWithinInterval(startOfDay(r.checkIn), { start: today, end: nextWeek })
    ).sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
    
    const departures = reservations.filter(r => 
      r.status === 'checked_in' && 
      isWithinInterval(startOfDay(r.checkOut), { start: today, end: nextWeek })
    ).sort((a, b) => a.checkOut.getTime() - b.checkOut.getTime());
    
    const inhouse = reservations.filter(r => r.status === 'checked_in')
      .sort((a, b) => a.checkOut.getTime() - b.checkOut.getTime());
    
    return { arrivals, departures, inhouse };
  }, [reservations, today, nextWeek]);
  
  // Search filter
  const filterBySearch = (items: Reservation[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(r => 
      r.guest.firstName.toLowerCase().includes(q) ||
      r.guest.lastName.toLowerCase().includes(q) ||
      r.guest.phone.includes(q) ||
      r.confirmationNumber?.toLowerCase().includes(q) ||
      r.room?.number?.toString().includes(q)
    );
  };
  
  // Stats
  const stats = {
    todayArrivals: categorized.arrivals.filter(r => isToday(r.checkIn)).length,
    todayDepartures: categorized.departures.filter(r => isToday(r.checkOut)).length,
    totalInhouse: categorized.inhouse.length,
    availableRooms: rooms.filter(r => r.status === 'available' && r.housekeepingStatus === 'clean').length,
  };
  
  const handleCheckIn = (resId: string, roomId: string) => {
    checkIn(resId, roomId);
    toast({ title: 'Guest checked in successfully' });
  };
  
  const handleCheckOut = (resId: string) => {
    checkOut(resId);
    toast({ title: 'Guest checked out successfully' });
  };
  
  const handleWalkIn = (data: Partial<Reservation>) => {
    createReservation(data);
    toast({ title: 'Walk-in guest checked in', description: `${data.guest?.firstName} assigned to Room ${data.room?.number}` });
  };
  
  const handleViewFolio = (reservation: Reservation) => {
    // Could navigate to billing page or open folio modal
    toast({ title: 'Folio', description: `Viewing folio for ${reservation.confirmationNumber}` });
  };
  
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };
  
  const tabs = [
    { id: 'arrivals' as const, label: 'Arrivals', count: categorized.arrivals.length, icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-600' },
    { id: 'departures' as const, label: 'Departures', count: categorized.departures.length, icon: LogOut, color: 'text-amber-600', bg: 'bg-amber-600' },
    { id: 'inhouse' as const, label: 'In-House', count: categorized.inhouse.length, icon: BedDouble, color: 'text-sky-600', bg: 'bg-sky-600' },
  ];
  
  const activeList = activeTab === 'arrivals' ? categorized.arrivals 
    : activeTab === 'departures' ? categorized.departures 
    : categorized.inhouse;
  
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Front Desk</h1>
        <Button onClick={() => setShowWalkIn(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Walk-in
        </Button>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <LogIn className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.todayArrivals}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">Arrivals Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <LogOut className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.todayDepartures}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Departures Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-sky-500 rounded-lg">
              <BedDouble className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">{stats.totalInhouse}</p>
              <p className="text-xs text-sky-600 dark:text-sky-500">In-House</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-violet-500 rounded-lg">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">{stats.availableRooms}</p>
              <p className="text-xs text-violet-600 dark:text-violet-500">Rooms Ready</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search & Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guest, phone, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex bg-muted rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "bg-background shadow-sm" 
                  : "hover:bg-background/50"
              )}
            >
              <tab.icon className={cn("h-4 w-4", activeTab === tab.id && tab.color)} />
              <span className="hidden sm:inline">{tab.label}</span>
              <Badge variant={activeTab === tab.id ? "default" : "secondary"} className={cn("h-5 px-1.5", activeTab === tab.id && tab.bg)}>
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>
      
      {/* Guest List */}
      <div className="space-y-2">
        {filterBySearch(activeList).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BedDouble className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No {activeTab === 'inhouse' ? 'in-house guests' : activeTab} found</p>
          </div>
        ) : (
          filterBySearch(activeList).map(reservation => {
            const dateToShow = activeTab === 'departures' || activeTab === 'inhouse' 
              ? reservation.checkOut 
              : reservation.checkIn;
            const isDueToday = isToday(dateToShow);
            const balance = reservation.totalAmount - reservation.paidAmount;
            
            return (
              <Card 
                key={reservation.id}
                className={cn(
                  "hover:shadow-md transition-all",
                  activeTab === 'departures' && isDueToday && "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
                )}
              >
                <CardContent className="p-3 flex items-center gap-4">
                  {/* Date Badge */}
                  <div className={cn(
                    "text-center min-w-[56px] p-2 rounded-lg",
                    isDueToday ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <p className="text-xs font-medium">{format(dateToShow, 'EEE')}</p>
                    <p className="text-lg font-bold">{format(dateToShow, 'd')}</p>
                    <p className="text-xs">{format(dateToShow, 'MMM')}</p>
                  </div>
                  
                  {/* Guest Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </span>
                      {reservation.room && (
                        <Badge variant="outline">Room {reservation.room.number}</Badge>
                      )}
                      {balance > 0 && (
                        <Badge variant="destructive" className="text-xs">₹{balance.toFixed(0)} due</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {reservation.guest.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reservation.nights} night{reservation.nights !== 1 ? 's' : ''}
                      </span>
                      <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded">
                        {reservation.roomType}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {activeTab === 'arrivals' && (
                      <Button 
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setCheckInRes(reservation)}
                      >
                        <LogIn className="h-4 w-4 mr-1" />
                        Check In
                      </Button>
                    )}
                    {activeTab === 'departures' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setCheckOutRes(reservation)}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Check Out
                      </Button>
                    )}
                    {activeTab === 'inhouse' && (
                      <>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewFolio(reservation)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        {isDueToday && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setCheckOutRes(reservation)}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Check Out
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Modals */}
      <QuickCheckIn
        open={!!checkInRes}
        onClose={() => setCheckInRes(null)}
        reservation={checkInRes}
        availableRooms={rooms}
        onComplete={handleCheckIn}
      />
      
      <QuickCheckOut
        open={!!checkOutRes}
        onClose={() => setCheckOutRes(null)}
        reservation={checkOutRes}
        onComplete={handleCheckOut}
        onViewFolio={handleViewFolio}
      />
      
      <WalkInForm
        open={showWalkIn}
        onClose={() => setShowWalkIn(false)}
        availableRooms={rooms}
        onComplete={handleWalkIn}
      />
    </div>
  );
}
