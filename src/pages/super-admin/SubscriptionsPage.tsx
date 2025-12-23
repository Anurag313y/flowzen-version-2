import { useSuperAdminStore } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, RefreshCw, CreditCard, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SubscriptionsPage() {
  const { clients, renewSubscription } = useSuperAdminStore();
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [renewPlan, setRenewPlan] = useState<'1_year' | '3_year'>('1_year');

  const today = new Date();

  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const activeClients = clients.filter(c => c.status !== 'draft');

  const handleRenew = () => {
    if (selectedClient) {
      renewSubscription(selectedClient, renewPlan);
      toast.success('Subscription renewed successfully');
      setRenewDialogOpen(false);
      setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground">Manage client subscription plans and renewals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">1 Year Plans</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.subscriptionPlan === '1_year').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">3 Year Plans</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.subscriptionPlan === '3_year').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-warning">
                  {clients.filter(c => {
                    const days = getDaysLeft(c.expiryDate);
                    return days > 0 && days <= 10 && c.status === 'active';
                  }).length}
                </p>
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
                <p className="text-2xl font-bold text-destructive">
                  {clients.filter(c => c.status === 'expired').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>View and manage subscription details</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Activation</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeClients.map((client) => {
                  const daysLeft = getDaysLeft(client.expiryDate);
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.businessName}</p>
                          <p className="text-sm text-muted-foreground">{client.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {client.subscriptionPlan === '1_year' ? '1 Year' : '3 Years'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(client.activationDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(client.expiryDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            daysLeft <= 0
                              ? 'bg-destructive/10 text-destructive border-destructive/30'
                              : daysLeft <= 10
                              ? 'bg-warning/10 text-warning border-warning/30'
                              : 'bg-success/10 text-success border-success/30'
                          }
                        >
                          {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            client.paymentStatus === 'paid'
                              ? 'bg-success/10 text-success border-success/30'
                              : 'bg-destructive/10 text-destructive border-destructive/30'
                          }
                        >
                          {client.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClient(client.id);
                            setRenewDialogOpen(true);
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Renew Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>
              Extend the subscription for{' '}
              {clients.find(c => c.id === selectedClient)?.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={renewPlan} onValueChange={(v: '1_year' | '3_year') => setRenewPlan(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_year">1 Year - ₹15,000</SelectItem>
                  <SelectItem value="3_year">3 Years - ₹36,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenew}>Confirm Renewal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
