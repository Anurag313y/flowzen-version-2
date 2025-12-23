import { useNavigate, useParams } from 'react-router-dom';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Pause,
  Play,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Hotel,
  UtensilsCrossed,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ClientViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, suspendClient, resumeClient } = useSuperAdminStore();
  
  const client = clients.find(c => c.id === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Client not found</p>
        <Button onClick={() => navigate('/super-admin/clients')}>Back to Clients</Button>
      </div>
    );
  }

  const today = new Date();
  const expiry = new Date(client.expiryDate);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleSuspend = () => {
    suspendClient(client.id);
    toast.success(`${client.businessName} has been suspended`);
  };

  const handleResume = () => {
    resumeClient(client.id);
    toast.success(`${client.businessName} has been resumed`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/30';
      case 'suspended': return 'bg-warning/10 text-warning border-warning/30';
      case 'expired': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getBusinessIcon = () => {
    switch (client.businessType) {
      case 'restaurant': return <UtensilsCrossed className="h-5 w-5" />;
      case 'hotel': return <Hotel className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/super-admin/clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{client.businessName}</h1>
              <Badge variant="outline" className={getStatusColor(client.status)}>
                {client.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">Client ID: {client.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {client.status === 'suspended' ? (
            <Button variant="outline" onClick={handleResume}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button variant="outline" onClick={handleSuspend}>
              <Pause className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          )}
          <Button onClick={() => navigate(`/super-admin/clients/${client.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getBusinessIcon()}
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="font-medium capitalize">{client.businessType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GST Number</p>
                <p className="font-medium">{client.gstNumber || '-'}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Services</p>
              <div className="flex gap-2">
                {client.services.includes('pos') && (
                  <Badge variant={client.posEnabled ? 'default' : 'outline'} className="gap-1">
                    <UtensilsCrossed className="h-3 w-3" />
                    POS {client.posEnabled ? '(Active)' : '(Disabled)'}
                  </Badge>
                )}
                {client.services.includes('pms') && (
                  <Badge variant={client.pmsEnabled ? 'default' : 'outline'} className="gap-1">
                    <Hotel className="h-3 w-3" />
                    PMS {client.pmsEnabled ? '(Active)' : '(Disabled)'}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{client.ownerName}</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.ownerEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.ownerPhone || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{client.address || '-'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{client.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium">{client.state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{client.country}</p>
              </div>
            </div>
            {(client.latitude && client.longitude) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="font-mono text-sm">{client.latitude}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="font-mono text-sm">{client.longitude}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{client.subscriptionPlan === '1_year' ? '1 Year' : '3 Years'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant="outline" className={client.paymentStatus === 'paid' ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}>
                  {client.paymentStatus}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Activation</p>
                  <p className="font-medium">{format(new Date(client.activationDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Expiry</p>
                  <p className="font-medium">{format(new Date(client.expiryDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <span className="text-sm">Days Remaining</span>
                <Badge variant="outline" className={
                  daysLeft <= 0 ? 'bg-destructive/10 text-destructive border-destructive/30' :
                  daysLeft <= 10 ? 'bg-warning/10 text-warning border-warning/30' :
                  'bg-success/10 text-success border-success/30'
                }>
                  {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
