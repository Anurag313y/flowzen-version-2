import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePMSStore } from '@/store/pmsStore';
import {
  BedDouble,
  Users,
  CalendarCheck,
  CalendarX,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function PMSDashboardPage() {
  const navigate = useNavigate();
  const { dashboardStats, reservations, rooms, maintenanceTickets } = usePMSStore();
  
  const todayArrivals = reservations.filter(r => r.status === 'confirmed');
  const todayDepartures = reservations.filter(r => r.status === 'checked_in');
  const openMaintenance = maintenanceTickets.filter(t => t.status !== 'resolved');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Button onClick={() => navigate('/pms/reservations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy</p>
                <p className="text-3xl font-bold">{dashboardStats.occupancyRate}%</p>
              </div>
              <BedDouble className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Arrivals Today</p>
                <p className="text-3xl font-bold">{dashboardStats.arrivals}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Departures Today</p>
                <p className="text-3xl font-bold">{dashboardStats.departures}</p>
              </div>
              <CalendarX className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RevPAR</p>
                <p className="text-3xl font-bold">${dashboardStats.revpar}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Rooms</p>
                <p className="text-xl font-semibold">${dashboardStats.revenue.rooms.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">F&B</p>
                <p className="text-xl font-semibold">${dashboardStats.revenue.fb.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Other</p>
                <p className="text-xl font-semibold">${dashboardStats.revenue.other.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-primary">${dashboardStats.revenue.total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Available</span>
              <Badge variant="outline" className="bg-success/10">{dashboardStats.availableRooms}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Occupied</span>
              <Badge variant="outline">{rooms.filter(r => r.status === 'occupied').length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Out of Order</span>
              <Badge variant="outline" className="bg-destructive/10">{dashboardStats.outOfOrder}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pms/front-desk')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Front Desk</h3>
                <p className="text-sm text-muted-foreground">Check-in/out operations</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pms/room-rack')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Room Rack</h3>
                <p className="text-sm text-muted-foreground">Availability grid</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pms/housekeeping')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Housekeeping</h3>
                <p className="text-sm text-muted-foreground">{rooms.filter(r => r.housekeepingStatus === 'dirty').length} rooms need cleaning</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alerts */}
      {openMaintenance.length > 0 && (
        <Card className="border-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-warning" />
              Open Maintenance ({openMaintenance.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openMaintenance.slice(0, 3).map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">{ticket.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Room {ticket.room?.number}
                    </span>
                  </div>
                  <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {ticket.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
