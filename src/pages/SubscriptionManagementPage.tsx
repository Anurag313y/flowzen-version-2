import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  CreditCard,
  Calendar,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { useSubscriptionStore, SUBSCRIPTION_PRICING } from '@/store/subscriptionStore';
import { BranchSubscriptionCard } from '@/components/subscription/BranchSubscriptionCard';
import { RenewalDialog } from '@/components/subscription/RenewalDialog';
import { RemoveBranchDialog } from '@/components/subscription/RemoveBranchDialog';

export default function SubscriptionManagementPage() {
  const {
    branchSubscriptions,
    paymentHistory,
    renewMultipleBranches,
    removeBranchSubscription,
    addPayment,
  } = useSubscriptionStore();

  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [removeBranchId, setRemoveBranchId] = useState<string | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const today = new Date();

  const stats = useMemo(() => {
    const active = branchSubscriptions.filter((s) => {
      const expiry = new Date(s.expiryDate);
      return expiry > today && s.status === 'active';
    }).length;

    const expiringSoon = branchSubscriptions.filter((s) => {
      const expiry = new Date(s.expiryDate);
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 10 && s.status === 'active';
    }).length;

    const expired = branchSubscriptions.filter((s) => {
      const expiry = new Date(s.expiryDate);
      return expiry <= today;
    }).length;

    const totalValue = branchSubscriptions.reduce((sum, s) => sum + s.amount, 0);

    return { active, expiringSoon, expired, totalValue };
  }, [branchSubscriptions]);

  const handleSelectBranch = (branchId: string, selected: boolean) => {
    setSelectedBranches((prev) =>
      selected ? [...prev, branchId] : prev.filter((id) => id !== branchId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedBranches(selected ? branchSubscriptions.map((s) => s.branchId) : []);
  };

  const handleRenewSelected = () => {
    if (selectedBranches.length === 0) {
      toast.error('Please select at least one branch');
      return;
    }
    setRenewDialogOpen(true);
  };

  const handleConfirmRenewal = (branchIds: string[], plan: '1_year' | '3_year') => {
    renewMultipleBranches(branchIds, plan);
    
    const branchNames = branchSubscriptions
      .filter((s) => branchIds.includes(s.branchId))
      .map((s) => s.branchName);

    addPayment({
      date: new Date().toISOString().split('T')[0],
      branchIds,
      branchNames,
      amount: branchIds.length * SUBSCRIPTION_PRICING[plan],
      plan,
      paymentMode: 'online',
      invoiceRef: `INV-${new Date().getFullYear()}-${String(paymentHistory.length + 1).padStart(3, '0')}`,
      type: 'renewal',
    });

    setSelectedBranches([]);
    toast.success(`Subscription renewed for ${branchIds.length} branch(es)`);
  };

  const handleRemoveBranch = () => {
    if (removeBranchId) {
      removeBranchSubscription(removeBranchId);
      toast.success('Branch removed from subscription');
      setRemoveBranchId(null);
    }
  };

  const selectedSubscriptions = branchSubscriptions.filter((s) =>
    selectedBranches.includes(s.branchId)
  );

  const branchToRemove = branchSubscriptions.find((s) => s.branchId === removeBranchId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage subscriptions for all your branches
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Branches</p>
                <p className="text-2xl font-bold text-success">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-warning">{stats.expiringSoon}</p>
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
                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning for expiring subscriptions */}
      {stats.expiringSoon > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning">Attention Required</p>
              <p className="text-sm text-muted-foreground">
                {stats.expiringSoon} branch subscription(s) expiring within 10 days. 
                Select them below to renew.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Branch Subscriptions</CardTitle>
              <CardDescription>
                Select branches to renew individually or together
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedBranches.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {selectedBranches.length} selected
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedBranches.length !== branchSubscriptions.length)}
              >
                {selectedBranches.length === branchSubscriptions.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                size="sm"
                onClick={handleRenewSelected}
                disabled={selectedBranches.length === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew Selected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {branchSubscriptions.map((subscription) => (
              <div key={subscription.branchId} className="relative">
                <BranchSubscriptionCard
                  subscription={subscription}
                  selected={selectedBranches.includes(subscription.branchId)}
                  onSelect={(selected) => handleSelectBranch(subscription.branchId, selected)}
                  showCheckbox
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                  onClick={() => setRemoveBranchId(subscription.branchId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <Collapsible open={showPaymentHistory} onOpenChange={setShowPaymentHistory}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-lg">Payment History</CardTitle>
                    <CardDescription>
                      {paymentHistory.length} transactions
                    </CardDescription>
                  </div>
                </div>
                {showPaymentHistory ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.invoiceRef}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {payment.branchNames.length <= 2 ? (
                              payment.branchNames.map((name, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {payment.branchNames.length} branches
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {payment.plan === '1_year' ? '1 Year' : '3 Years'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              payment.type === 'new'
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : 'bg-success/10 text-success border-success/30'
                            }
                          >
                            {payment.type === 'new' ? 'New' : 'Renewal'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{payment.paymentMode.replace('_', ' ')}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Pricing Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg">Subscription Plans</h3>
              <p className="text-sm text-muted-foreground">
                Pay individually or combine branches for bulk discount
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">₹15,000</p>
                <p className="text-sm text-muted-foreground">1 Year / Branch</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <p className="text-2xl font-bold">₹36,000</p>
                <p className="text-sm text-muted-foreground">3 Years / Branch</p>
                <Badge className="mt-1 bg-success/10 text-success border-0">Save 20%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RenewalDialog
        open={renewDialogOpen}
        onClose={() => setRenewDialogOpen(false)}
        branches={selectedSubscriptions}
        onConfirm={handleConfirmRenewal}
      />

      <RemoveBranchDialog
        open={!!removeBranchId}
        onClose={() => setRemoveBranchId(null)}
        branch={branchToRemove || null}
        onConfirm={handleRemoveBranch}
      />
    </div>
  );
}
