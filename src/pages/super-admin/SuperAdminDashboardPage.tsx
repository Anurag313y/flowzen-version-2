import { useSuperAdminStore } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Hotel,
  UtensilsCrossed,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { clients, complaints } = useSuperAdminStore();

  const today = new Date();
  
  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const expiredClients = clients.filter(c => c.status === 'expired').length;
  const suspendedClients = clients.filter(c => c.status === 'suspended').length;
  const restaurantsOnly = clients.filter(c => c.businessType === 'restaurant').length;
  const hotelsOnly = clients.filter(c => c.businessType === 'hotel').length;
  const posUsers = clients.filter(c => c.services.includes('pos')).length;
  const pmsUsers = clients.filter(c => c.services.includes('pms')).length;
  
  // Expiring in 10 days
  const expiringClients = clients.filter(c => {
    const expiry = new Date(c.expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 10 && c.status === 'active';
  });
  
  // Open complaints
  const openComplaints = complaints.filter(c => c.status === 'open');
  const inProgressComplaints = complaints.filter(c => c.status === 'in_progress');

  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const stats = [
    { label: 'Total Clients', value: totalClients, icon: Building2, bgColor: 'bg-slate-700', iconColor: 'text-primary' },
    { label: 'Active Clients', value: activeClients, icon: CheckCircle, bgColor: 'bg-slate-700', iconColor: 'text-success' },
    { label: 'Expired', value: expiredClients, icon: XCircle, bgColor: 'bg-slate-700', iconColor: 'text-destructive' },
    { label: 'Suspended', value: suspendedClients, icon: AlertTriangle, bgColor: 'bg-slate-700', iconColor: 'text-warning' },
    { label: 'Restaurants', value: restaurantsOnly, icon: UtensilsCrossed, bgColor: 'bg-slate-700', iconColor: 'text-orange-500' },
    { label: 'Hotels', value: hotelsOnly, icon: Hotel, bgColor: 'bg-slate-700', iconColor: 'text-blue-500' },
    { label: 'POS Users', value: posUsers, icon: TrendingUp, bgColor: 'bg-slate-700', iconColor: 'text-emerald-500' },
    { label: 'PMS Users', value: pmsUsers, icon: Users, bgColor: 'bg-slate-700', iconColor: 'text-violet-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Overview of all Flozen clients and services</p>
      </div>

      {/* Stats Grid - White cards on light background */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 text-slate-800">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Expiring Soon - White card */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg text-slate-800">Expiring Soon</CardTitle>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {expiringClients.length} clients
              </Badge>
            </div>
            <CardDescription className="text-slate-500">Subscriptions expiring in next 10 days</CardDescription>
          </CardHeader>
          <CardContent>
            {expiringClients.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No expiring subscriptions</p>
            ) : (
              <div className="space-y-3">
                {expiringClients.map((client) => {
                  const daysLeft = getDaysLeft(client.expiryDate);
                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/super-admin/clients/${client.id}`)}
                    >
                      <div>
                        <p className="font-medium text-slate-800">{client.businessName}</p>
                        <p className="text-sm text-slate-500">{client.city}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          daysLeft <= 3
                            ? 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-warning/10 text-warning border-warning/30'
                        }
                      >
                        {daysLeft} days left
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4 border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => navigate('/super-admin/subscriptions')}
            >
              View All Subscriptions
            </Button>
          </CardContent>
        </Card>

        {/* Open Complaints - White card with red accent */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg text-slate-800">Support Tickets</CardTitle>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {openComplaints.length + inProgressComplaints.length} open
              </Badge>
            </div>
            <CardDescription className="text-slate-500">Pending client issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {openComplaints.length === 0 && inProgressComplaints.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No open tickets</p>
            ) : (
              <div className="space-y-3">
                {[...openComplaints, ...inProgressComplaints].slice(0, 4).map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/super-admin/complaints')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate text-slate-800">{complaint.clientName}</p>
                        <Badge
                          variant="outline"
                          className={
                            complaint.priority === 'high'
                              ? 'bg-destructive/10 text-destructive border-destructive/30 text-xs'
                              : complaint.priority === 'medium'
                              ? 'bg-warning/10 text-warning border-warning/30 text-xs'
                              : 'text-xs'
                          }
                        >
                          {complaint.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{complaint.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        complaint.status === 'open'
                          ? 'bg-destructive/10 text-destructive border-destructive/30 ml-2'
                          : 'bg-warning/10 text-warning border-warning/30 ml-2'
                      }
                    >
                      {complaint.status === 'open' ? 'Open' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4 border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => navigate('/super-admin/complaints')}
            >
              View All Tickets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients - White card */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800">Recent Clients</CardTitle>
              <CardDescription className="text-slate-500">Latest client registrations</CardDescription>
            </div>
            <Button onClick={() => navigate('/super-admin/clients/new')}>
              Add New Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {clients.slice(0, 5).map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                onClick={() => navigate('/super-admin/clients')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {client.businessType === 'hotel' ? (
                      <Hotel className="h-5 w-5 text-primary" />
                    ) : (
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{client.businessName}</p>
                    <p className="text-sm text-slate-500">{client.city}, {client.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">{client.ownerName}</p>
                    <p className="text-xs text-slate-400">{client.ownerEmail}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      client.status === 'active'
                        ? 'bg-success/10 text-success border-success/30'
                        : client.status === 'suspended'
                        ? 'bg-warning/10 text-warning border-warning/30'
                        : 'bg-destructive/10 text-destructive border-destructive/30'
                    }
                  >
                    {client.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => navigate('/super-admin/clients')}
          >
            View All Clients
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
