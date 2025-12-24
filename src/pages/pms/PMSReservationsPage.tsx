import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePMSStore } from '@/store/pmsStore';
import { format, isToday, isTomorrow, addDays, isWithinInterval, startOfDay } from 'date-fns';
import { 
  LogIn, 
  LogOut, 
  Search,
  Phone,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BedDouble,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Reservation } from '@/types/pms';
import { useNavigate } from 'react-router-dom';

export default function PMSReservationsPage() {
  const navigate = useNavigate();
  const { reservations, rooms, checkIn, checkOut } = usePMSStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'arrivals' | 'departures' | 'inhouse'>('arrivals');
  
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
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

  // Filter by search
  const filterBySearch = (items: Reservation[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(r => 
      r.guest.firstName.toLowerCase().includes(q) ||
      r.guest.lastName.toLowerCase().includes(q) ||
      r.guest.phone.includes(q) ||
      r.confirmationNumber?.toLowerCase().includes(q)
    );
  };

  const getRoom = (roomId: string) => rooms.find(r => r.id === roomId);

  const handleCheckIn = (reservation: Reservation) => {
    checkIn(reservation.id, reservation.roomId);
    toast({ title: 'Guest checked in', description: `${reservation.guest.firstName} checked into Room ${getRoom(reservation.roomId)?.number}` });
  };

  const handleCheckOut = (reservation: Reservation) => {
    checkOut(reservation.id);
    toast({ title: 'Guest checked out', description: `${reservation.guest.firstName} checked out` });
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const stats = {
    todayArrivals: categorized.arrivals.filter(r => isToday(r.checkIn)).length,
    todayDepartures: categorized.departures.filter(r => isToday(r.checkOut)).length,
    totalInhouse: categorized.inhouse.length,
  };

  const tabs = [
    { id: 'arrivals' as const, label: 'Arrivals', count: categorized.arrivals.length, icon: LogIn, color: 'text-emerald-600' },
    { id: 'departures' as const, label: 'Departures', count: categorized.departures.length, icon: LogOut, color: 'text-amber-600' },
    { id: 'inhouse' as const, label: 'In-House', count: categorized.inhouse.length, icon: BedDouble, color: 'text-sky-600' },
  ];

  const activeList = activeTab === 'arrivals' ? categorized.arrivals 
    : activeTab === 'departures' ? categorized.departures 
    : categorized.inhouse;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Guest Movement</h1>
        <Button size="sm" onClick={() => navigate('/pms/rooms')}>
          <BedDouble className="h-4 w-4 mr-2" />
          Room Dashboard
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <LogIn className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.todayArrivals}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">Today's Arrivals</p>
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
              <p className="text-xs text-amber-600 dark:text-amber-500">Today's Departures</p>
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
              <p className="text-xs text-sky-600 dark:text-sky-500">Currently In-House</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex items-center gap-3 flex-wrap">
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
              <span>{tab.label}</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-[250px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filterBySearch(activeList).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No {activeTab} found
          </div>
        ) : (
          filterBySearch(activeList).map(reservation => {
            const room = getRoom(reservation.roomId);
            const dateToShow = activeTab === 'departures' ? reservation.checkOut : reservation.checkIn;
            const isOverdue = activeTab === 'departures' && isToday(reservation.checkOut);
            
            return (
              <Card 
                key={reservation.id} 
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer",
                  isOverdue && "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
                )}
                onClick={() => navigate(`/pms/rooms`)}
              >
                <CardContent className="p-3 flex items-center gap-4">
                  {/* Date Badge */}
                  <div className={cn(
                    "text-center min-w-[60px] p-2 rounded-lg",
                    isToday(dateToShow) ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <p className="text-xs font-medium">{format(dateToShow, 'EEE')}</p>
                    <p className="text-lg font-bold">{format(dateToShow, 'd')}</p>
                    <p className="text-xs">{format(dateToShow, 'MMM')}</p>
                  </div>

                  {/* Guest Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold truncate">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </span>
                      {reservation.confirmationNumber && (
                        <Badge variant="outline" className="text-xs">
                          #{reservation.confirmationNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {reservation.guest.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-3 w-3" />
                        Room {room?.number || 'TBA'} • {reservation.roomType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reservation.nights} night{reservation.nights > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Due Today
                      </Badge>
                    )}
                    {activeTab === 'arrivals' && (
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckIn(reservation);
                        }}
                      >
                        <LogIn className="h-4 w-4 mr-1" />
                        Check In
                      </Button>
                    )}
                    {activeTab === 'departures' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckOut(reservation);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Check Out
                      </Button>
                    )}
                    {activeTab === 'inhouse' && (
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Checkout</p>
                        <p className="font-medium">{getDateLabel(reservation.checkOut)}</p>
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}