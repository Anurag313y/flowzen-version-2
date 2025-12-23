import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  User,
  Calendar,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
}

interface Reservation {
  id: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  source: 'direct' | 'ota' | 'corporate';
  adults: number;
  children: number;
  notes: string;
}

const rooms: Room[] = [
  { id: '1', number: '101', type: 'Standard', floor: 1 },
  { id: '2', number: '102', type: 'Standard', floor: 1 },
  { id: '3', number: '103', type: 'Deluxe', floor: 1 },
  { id: '4', number: '201', type: 'Standard', floor: 2 },
  { id: '5', number: '202', type: 'Deluxe', floor: 2 },
  { id: '6', number: '203', type: 'Suite', floor: 2 },
  { id: '7', number: '301', type: 'Standard', floor: 3 },
  { id: '8', number: '302', type: 'Deluxe', floor: 3 },
  { id: '9', number: '303', type: 'Suite', floor: 3 },
  { id: '10', number: '304', type: 'Premium Suite', floor: 3 },
];

const today = new Date();

const statusColors = {
  'confirmed': 'bg-primary/80 border-primary',
  'checked-in': 'bg-success/80 border-success',
  'checked-out': 'bg-muted border-muted-foreground',
  'cancelled': 'bg-destructive/20 border-destructive',
};

const sourceColors = {
  'direct': 'bg-primary',
  'ota': 'bg-warning',
  'corporate': 'bg-secondary',
};

const initialReservations: Reservation[] = [
  { id: '1', roomId: '1', guestName: 'John Smith', guestPhone: '+91 98765 43210', guestEmail: 'john@email.com', checkIn: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), checkOut: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), status: 'checked-in', source: 'direct', adults: 2, children: 0, notes: '' },
  { id: '2', roomId: '3', guestName: 'Sarah Johnson', guestPhone: '+91 98765 43211', guestEmail: 'sarah@email.com', checkIn: today, checkOut: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), status: 'confirmed', source: 'ota', adults: 2, children: 1, notes: 'Late check-in' },
  { id: '3', roomId: '5', guestName: 'Mike Chen', guestPhone: '+91 98765 43212', guestEmail: 'mike@email.com', checkIn: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), checkOut: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'checked-in', source: 'corporate', adults: 1, children: 0, notes: '' },
  { id: '4', roomId: '6', guestName: 'Emily Davis', guestPhone: '+91 98765 43213', guestEmail: 'emily@email.com', checkIn: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), checkOut: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), status: 'confirmed', source: 'direct', adults: 2, children: 2, notes: '' },
  { id: '5', roomId: '8', guestName: 'Robert Wilson', guestPhone: '+91 98765 43214', guestEmail: 'robert@email.com', checkIn: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), checkOut: today, status: 'checked-in', source: 'ota', adults: 2, children: 0, notes: '' },
  { id: '6', roomId: '10', guestName: 'Lisa Anderson', guestPhone: '+91 98765 43215', guestEmail: 'lisa@email.com', checkIn: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), status: 'confirmed', source: 'direct', adults: 2, children: 0, notes: 'Anniversary' },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [startDate, setStartDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    guestName: '', guestPhone: '', guestEmail: '', roomId: '1', checkIn: '', checkOut: '', source: 'direct' as Reservation['source'], adults: '2', children: '0', notes: ''
  });

  const handleAddReservation = () => {
    if (!newReservation.guestName || !newReservation.guestPhone || !newReservation.checkIn || !newReservation.checkOut) {
      toast.error('Please fill in required fields');
      return;
    }
    const reservation: Reservation = {
      id: Date.now().toString(),
      roomId: newReservation.roomId,
      guestName: newReservation.guestName,
      guestPhone: newReservation.guestPhone,
      guestEmail: newReservation.guestEmail,
      checkIn: new Date(newReservation.checkIn),
      checkOut: new Date(newReservation.checkOut),
      status: 'confirmed',
      source: newReservation.source,
      adults: parseInt(newReservation.adults),
      children: parseInt(newReservation.children),
      notes: newReservation.notes,
    };
    setReservations([...reservations, reservation]);
    setNewReservation({ guestName: '', guestPhone: '', guestEmail: '', roomId: '1', checkIn: '', checkOut: '', source: 'direct', adults: '2', children: '0', notes: '' });
    setIsNewDialogOpen(false);
    toast.success('Reservation created successfully');
  };

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getReservationForCell = (roomId: string, date: Date) => {
    return reservations.find(res => {
      if (res.roomId !== roomId) return false;
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const cellDate = new Date(date);
      cellDate.setHours(0, 0, 0, 0);
      return cellDate >= checkIn && cellDate < checkOut;
    });
  };

  const isStartOfReservation = (reservation: Reservation, date: Date) => {
    const checkIn = new Date(reservation.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    return checkIn.getTime() === cellDate.getTime();
  };

  const getReservationDays = (reservation: Reservation, startDate: Date) => {
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate visible days from the start of the visible range
    const visibleStart = new Date(Math.max(checkIn.getTime(), start.getTime()));
    const visibleEnd = new Date(checkOut);
    const visibleDays = Math.ceil((visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(visibleDays, 14);
  };

  const navigateDates = (direction: 'prev' | 'next') => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setStartDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tape Chart</h1>
          <p className="text-sm text-muted-foreground">
            Room reservations and availability
          </p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Reservation</DialogTitle>
              <DialogDescription>Create a new room reservation</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Guest Name *</Label>
                <Input value={newReservation.guestName} onChange={(e) => setNewReservation({ ...newReservation, guestName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Phone *</Label>
                  <Input value={newReservation.guestPhone} onChange={(e) => setNewReservation({ ...newReservation, guestPhone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={newReservation.guestEmail} onChange={(e) => setNewReservation({ ...newReservation, guestEmail: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Room</Label>
                <Select value={newReservation.roomId} onValueChange={(v) => setNewReservation({ ...newReservation, roomId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.number} - {r.type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Check-in *</Label>
                  <Input type="date" value={newReservation.checkIn} onChange={(e) => setNewReservation({ ...newReservation, checkIn: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Check-out *</Label>
                  <Input type="date" value={newReservation.checkOut} onChange={(e) => setNewReservation({ ...newReservation, checkOut: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Adults</Label>
                  <Input type="number" value={newReservation.adults} onChange={(e) => setNewReservation({ ...newReservation, adults: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Children</Label>
                  <Input type="number" value={newReservation.children} onChange={(e) => setNewReservation({ ...newReservation, children: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Source</Label>
                  <Select value={newReservation.source} onValueChange={(v) => setNewReservation({ ...newReservation, source: v as Reservation['source'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="ota">OTA</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Input value={newReservation.notes} onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })} placeholder="Special requests" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddReservation}>Create Reservation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guest or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDates('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setStartDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateDates('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-success/80" />
          <span>Checked In</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary/80" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-warning" />
          <span>OTA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-secondary" />
          <span>Corporate</span>
        </div>
      </div>

      {/* Tape Chart */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[1000px]">
              {/* Header Row - Dates */}
              <div className="flex border-b border-border">
                <div className="w-32 shrink-0 p-3 bg-muted/50 font-medium text-sm border-r border-border">
                  Room
                </div>
                {dates.map((date, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 min-w-[80px] p-2 text-center text-sm border-r border-border last:border-r-0",
                      isToday(date) && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "font-medium",
                      isToday(date) && "text-primary"
                    )}>
                      {formatDate(date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Room Rows */}
              {rooms.map((room) => (
                <div key={room.id} className="flex border-b border-border last:border-b-0 hover:bg-accent/30">
                  <div className="w-32 shrink-0 p-3 bg-muted/30 border-r border-border">
                    <div className="font-medium">{room.number}</div>
                    <div className="text-xs text-muted-foreground">{room.type}</div>
                  </div>
                  <div className="flex-1 flex relative">
                    {dates.map((date, i) => {
                      const reservation = getReservationForCell(room.id, date);
                      const isStart = reservation && isStartOfReservation(reservation, date);
                      
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 min-w-[80px] min-h-[60px] border-r border-border last:border-r-0 relative",
                            isToday(date) && "bg-primary/5"
                          )}
                        >
                          {isStart && reservation && (
                            <div
                              className={cn(
                                "absolute top-1 left-1 right-0 h-[calc(100%-8px)] rounded-l-md border-l-4 px-2 py-1 cursor-pointer",
                                "hover:shadow-md transition-shadow",
                                statusColors[reservation.status]
                              )}
                              style={{
                                width: `calc(${getReservationDays(reservation, startDate) * 100}% - 4px)`,
                                zIndex: 10,
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-primary-foreground" />
                                <span className="text-xs font-medium text-primary-foreground truncate">
                                  {reservation.guestName}
                                </span>
                              </div>
                              <div className={cn(
                                "absolute top-1 right-1 h-2 w-2 rounded-full",
                                sourceColors[reservation.source]
                              )} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">18</div>
            <div className="text-sm text-muted-foreground">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">4</div>
            <div className="text-sm text-muted-foreground">Arrivals Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">Departures Today</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
