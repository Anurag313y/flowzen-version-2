import { useSuperAdminStore } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  UserPlus, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const { clients, complaints, activityLogs } = useSuperAdminStore();

  const today = new Date();

  // Expiring clients (within 10 days)
  const expiringClients = clients.filter(c => {
    const expiry = new Date(c.expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 10 && c.status === 'active';
  });

  // Recently expired
  const expiredClients = clients.filter(c => c.status === 'expired');

  // Open complaints
  const openComplaints = complaints.filter(c => c.status === 'open');

  // Recent activity (last 5)
  const recentActivity = activityLogs.slice(0, 5);

  // Generate notifications
  const notifications = [
    ...expiringClients.map(c => ({
      id: `expiring-${c.id}`,
      type: 'warning' as const,
      title: 'Subscription Expiring Soon',
      message: `${c.businessName} subscription expires on ${format(new Date(c.expiryDate), 'MMM dd, yyyy')}`,
      time: 'Expiring soon',
      icon: Clock,
    })),
    ...expiredClients.map(c => ({
      id: `expired-${c.id}`,
      type: 'error' as const,
      title: 'Subscription Expired',
      message: `${c.businessName} subscription has expired`,
      time: format(new Date(c.expiryDate), 'MMM dd, yyyy'),
      icon: XCircle,
    })),
    ...openComplaints.map(c => ({
      id: `complaint-${c.id}`,
      type: 'error' as const,
      title: 'New Support Ticket',
      message: `${c.clientName}: ${c.description.slice(0, 50)}...`,
      time: format(new Date(c.createdAt), 'MMM dd, HH:mm'),
      icon: AlertCircle,
    })),
    ...recentActivity.map(log => ({
      id: `activity-${log.id}`,
      type: 'info' as const,
      title: log.action,
      message: log.targetName ? `Target: ${log.targetName}` : 'System action',
      time: format(new Date(log.timestamp), 'MMM dd, HH:mm'),
      icon: CheckCircle,
    })),
  ];

  const getTypeStyles = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'warning':
        return 'border-l-warning bg-warning/5';
      case 'error':
        return 'border-l-destructive bg-destructive/5';
      case 'info':
        return 'border-l-primary bg-primary/5';
    }
  };

  const getIconColor = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      case 'info': return 'text-primary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">System alerts and updates</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Bell className="h-3 w-3" />
          {notifications.length} notifications
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-warning">{expiringClients.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-destructive">{expiredClients.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold text-destructive">{openComplaints.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold">{recentActivity.length}</p>
              </div>
              <Bell className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Recent alerts and system updates</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getTypeStyles(notification.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full bg-background ${getIconColor(notification.type)}`}>
                      <notification.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{notification.title}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
