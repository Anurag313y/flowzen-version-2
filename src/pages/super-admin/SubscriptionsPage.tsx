import { useState, useMemo } from 'react';
import { useSuperAdminStore, Client, Branch } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Calendar, 
  RefreshCw, 
  CreditCard, 
  Clock, 
  Building2, 
  ChevronDown, 
  Search, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  IndianRupee,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, addYears } from 'date-fns';

// Branch subscription interface extending base branch
interface BranchSubscription extends Branch {
  subscriptionPlan: '1_year' | '3_year';
  activationDate: string;
  expiryDate: string;
  paymentStatus: 'paid' | 'unpaid';
}

// Pricing configuration
const SUBSCRIPTION_PRICING = {
  '1_year': { price: 15000, label: '1 Year', months: 12 },
  '3_year': { price: 36000, label: '3 Years', months: 36, savings: 9000 },
};

export default function SubscriptionsPage() {
  const { clients, renewSubscription, addActivityLog, superAdminUser } = useSuperAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<Map<string, string[]>>(new Map());
  
  // Dialog states
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [bulkRenewDialogOpen, setBulkRenewDialogOpen] = useState(false);
  const [renewPlan, setRenewPlan] = useState<'1_year' | '3_year'>('1_year');
  const [currentRenewalClient, setCurrentRenewalClient] = useState<Client | null>(null);
  const [currentRenewalBranch, setCurrentRenewalBranch] = useState<Branch | null>(null);

  const today = new Date();

  // Calculate days left for a given expiry date
  const getDaysLeft = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), today);
  };

  // Get branch subscription status
  const getBranchStatus = (client: Client, branch: Branch) => {
    const daysLeft = getDaysLeft(client.expiryDate);
    if (daysLeft <= 0) return 'expired';
    if (daysLeft <= 30) return 'expiring';
    return 'active';
  };

  // Filter clients based on search and status
  const filteredClients = useMemo(() => {
    let result = clients.filter(c => c.status !== 'draft');
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.businessName.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        (c.branches || []).some(b => 
          b.name.toLowerCase().includes(query) ||
          b.city.toLowerCase().includes(query)
        )
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(c => {
        const daysLeft = getDaysLeft(c.expiryDate);
        switch (statusFilter) {
          case 'active': return daysLeft > 30;
          case 'expiring': return daysLeft > 0 && daysLeft <= 30;
          case 'expired': return daysLeft <= 0;
          default: return true;
        }
      });
    }
    
    return result;
  }, [clients, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const activeClients = clients.filter(c => c.status !== 'draft');
    const totalBranches = activeClients.reduce((sum, c) => sum + (c.branches?.length || 0), 0);
    const activeBranches = activeClients.filter(c => getDaysLeft(c.expiryDate) > 30).reduce((sum, c) => sum + (c.branches?.length || 0), 0);
    const expiringBranches = activeClients.filter(c => {
      const days = getDaysLeft(c.expiryDate);
      return days > 0 && days <= 30;
    }).reduce((sum, c) => sum + (c.branches?.length || 0), 0);
    const expiredBranches = activeClients.filter(c => getDaysLeft(c.expiryDate) <= 0).reduce((sum, c) => sum + (c.branches?.length || 0), 0);
    
    return {
      totalBranches,
      activeBranches,
      expiringBranches,
      expiredBranches,
      oneYearPlans: activeClients.filter(c => c.subscriptionPlan === '1_year').length,
      threeYearPlans: activeClients.filter(c => c.subscriptionPlan === '3_year').length,
    };
  }, [clients]);

  // Toggle client expansion
  const toggleClientExpand = (clientId: string) => {
    setExpandedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  // Handle branch selection for bulk operations
  const toggleBranchSelection = (clientId: string, branchId: string) => {
    setSelectedBranches(prev => {
      const newMap = new Map(prev);
      const clientBranches = newMap.get(clientId) || [];
      
      if (clientBranches.includes(branchId)) {
        const filtered = clientBranches.filter(id => id !== branchId);
        if (filtered.length === 0) {
          newMap.delete(clientId);
        } else {
          newMap.set(clientId, filtered);
        }
      } else {
        newMap.set(clientId, [...clientBranches, branchId]);
      }
      
      return newMap;
    });
  };

  // Select all branches for a client
  const toggleAllBranchesForClient = (client: Client) => {
    setSelectedBranches(prev => {
      const newMap = new Map(prev);
      const clientBranches = newMap.get(client.id) || [];
      const allBranchIds = (client.branches || []).map(b => b.id);
      
      if (clientBranches.length === allBranchIds.length) {
        newMap.delete(client.id);
      } else {
        newMap.set(client.id, allBranchIds);
      }
      
      return newMap;
    });
  };

  // Get total selected branches count
  const getTotalSelectedBranches = () => {
    let total = 0;
    selectedBranches.forEach(branches => {
      total += branches.length;
    });
    return total;
  };

  // Handle single branch renewal
  const handleSingleBranchRenew = (client: Client, branch: Branch) => {
    setCurrentRenewalClient(client);
    setCurrentRenewalBranch(branch);
    setRenewPlan('1_year');
    setRenewDialogOpen(true);
  };

  // Handle bulk renewal
  const handleBulkRenew = () => {
    if (getTotalSelectedBranches() === 0) {
      toast.error('Please select at least one branch to renew');
      return;
    }
    setRenewPlan('1_year');
    setBulkRenewDialogOpen(true);
  };

  // Confirm single branch renewal
  const confirmSingleRenewal = () => {
    if (!currentRenewalClient || !currentRenewalBranch) return;

    renewSubscription(currentRenewalClient.id, renewPlan);
    
    addActivityLog({
      action: `Renewed subscription for branch "${currentRenewalBranch.name}" (${SUBSCRIPTION_PRICING[renewPlan].label})`,
      targetType: 'client',
      targetId: currentRenewalClient.id,
      targetName: currentRenewalClient.businessName,
      performedBy: superAdminUser?.name || 'Super Admin',
      ipAddress: '192.168.1.100',
    });

    toast.success(`Subscription renewed for ${currentRenewalBranch.name}`, {
      description: `Plan: ${SUBSCRIPTION_PRICING[renewPlan].label} | Amount: ₹${SUBSCRIPTION_PRICING[renewPlan].price.toLocaleString()}`,
    });

    setRenewDialogOpen(false);
    setCurrentRenewalClient(null);
    setCurrentRenewalBranch(null);
  };

  // Confirm bulk renewal
  const confirmBulkRenewal = () => {
    const totalBranches = getTotalSelectedBranches();
    const totalAmount = totalBranches * SUBSCRIPTION_PRICING[renewPlan].price;

    selectedBranches.forEach((branchIds, clientId) => {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        renewSubscription(clientId, renewPlan);
        
        addActivityLog({
          action: `Bulk renewed ${branchIds.length} branch(es) (${SUBSCRIPTION_PRICING[renewPlan].label})`,
          targetType: 'client',
          targetId: clientId,
          targetName: client.businessName,
          performedBy: superAdminUser?.name || 'Super Admin',
          ipAddress: '192.168.1.100',
        });
      }
    });

    toast.success(`Renewed ${totalBranches} branch(es) successfully`, {
      description: `Total Amount: ₹${totalAmount.toLocaleString()}`,
    });

    setBulkRenewDialogOpen(false);
    setSelectedBranches(new Map());
  };

  // Get status badge styling
  const getStatusBadge = (daysLeft: number) => {
    if (daysLeft <= 0) {
      return {
        className: 'bg-destructive/10 text-destructive border-destructive/30',
        icon: XCircle,
        label: 'Expired',
      };
    }
    if (daysLeft <= 30) {
      return {
        className: 'bg-amber-100 text-amber-700 border-amber-300',
        icon: AlertTriangle,
        label: `${daysLeft} days left`,
      };
    }
    return {
      className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      icon: CheckCircle,
      label: `${daysLeft} days left`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Multi-Branch Subscriptions</h1>
          <p className="text-muted-foreground">Manage subscriptions for all client branches</p>
        </div>
        
        {getTotalSelectedBranches() > 0 && (
          <Button onClick={handleBulkRenew} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Renew Selected ({getTotalSelectedBranches()})
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Branches</p>
                <p className="text-2xl font-bold">{stats.totalBranches}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.activeBranches}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-amber-600">{stats.expiringBranches}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-destructive">{stats.expiredBranches}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, branch, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Client Subscriptions</CardTitle>
          <CardDescription>Click on a client to view and manage branch subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No clients found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredClients.map((client) => {
                const daysLeft = getDaysLeft(client.expiryDate);
                const statusBadge = getStatusBadge(daysLeft);
                const StatusIcon = statusBadge.icon;
                const branches = client.branches || [];
                const selectedClientBranches = selectedBranches.get(client.id) || [];
                const allSelected = branches.length > 0 && selectedClientBranches.length === branches.length;

                return (
                  <Collapsible
                    key={client.id}
                    open={expandedClients.includes(client.id)}
                    onOpenChange={() => toggleClientExpand(client.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-slate-100">
                            <Building2 className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{client.businessName}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.ownerName} • {client.city} • {branches.length} branch(es)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {client.subscriptionPlan === '1_year' ? '1 Year' : '3 Years'}
                          </Badge>
                          <Badge variant="outline" className={statusBadge.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusBadge.label}
                          </Badge>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedClients.includes(client.id) ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="bg-slate-50 p-4 border-t">
                        {/* Select All for this client */}
                        {branches.length > 1 && (
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={() => toggleAllBranchesForClient(client)}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              Select all {branches.length} branches
                            </span>
                          </div>
                        )}

                        {/* Branches Table */}
                        <div className="bg-white rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50">
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Branch Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Activation</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {branches.map((branch) => {
                                const branchDaysLeft = daysLeft; // Using client-level expiry for now
                                const branchStatus = getStatusBadge(branchDaysLeft);
                                const BranchStatusIcon = branchStatus.icon;
                                const isSelected = selectedClientBranches.includes(branch.id);

                                return (
                                  <TableRow key={branch.id}>
                                    <TableCell>
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleBranchSelection(client.id, branch.id)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{branch.name}</span>
                                        {branch.isMain && (
                                          <Badge className="text-xs bg-primary/10 text-primary border-0">Main</Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {branch.city}, {branch.state}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {client.subscriptionPlan === '1_year' ? '1 Year' : '3 Years'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {format(new Date(client.activationDate), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {format(new Date(client.expiryDate), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={branchStatus.className}>
                                        <BranchStatusIcon className="h-3 w-3 mr-1" />
                                        {branchStatus.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSingleBranchRenew(client, branch);
                                        }}
                                        className="gap-1"
                                      >
                                        <RefreshCw className="h-3 w-3" />
                                        Renew
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Quick Actions */}
                        {selectedClientBranches.length > 0 && (
                          <div className="mt-4 flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <span className="text-sm font-medium text-primary">
                              {selectedClientBranches.length} branch(es) selected
                            </span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentRenewalClient(client);
                                setRenewPlan('1_year');
                                setBulkRenewDialogOpen(true);
                              }}
                              className="gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Renew Selected
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Subscription Plans</CardTitle>
          <CardDescription>Available plans and pricing per branch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">1 Year Plan</h3>
                <Badge variant="outline">Standard</Badge>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <IndianRupee className="h-5 w-5" />
                <span className="text-2xl font-bold">15,000</span>
                <span className="text-muted-foreground">/branch/year</span>
              </div>
              <p className="text-sm text-muted-foreground">Ideal for new businesses or testing</p>
            </div>
            <div className="p-4 border rounded-lg border-primary bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">3 Year Plan</h3>
                <Badge className="bg-primary">Best Value</Badge>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <IndianRupee className="h-5 w-5" />
                <span className="text-2xl font-bold">36,000</span>
                <span className="text-muted-foreground">/branch/3 years</span>
              </div>
              <p className="text-sm text-emerald-600 font-medium">Save ₹9,000 per branch!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single Branch Renewal Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Branch Subscription</DialogTitle>
            <DialogDescription>
              Renew subscription for {currentRenewalBranch?.name} at {currentRenewalClient?.businessName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Client</span>
                <span className="font-medium">{currentRenewalClient?.businessName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Branch</span>
                <span className="font-medium">{currentRenewalBranch?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{currentRenewalBranch?.city}, {currentRenewalBranch?.state}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={renewPlan} onValueChange={(v: '1_year' | '3_year') => setRenewPlan(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_year">1 Year - ₹15,000</SelectItem>
                  <SelectItem value="3_year">3 Years - ₹36,000 (Save ₹9,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold text-primary">
                  ₹{SUBSCRIPTION_PRICING[renewPlan].price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSingleRenewal}>Confirm Renewal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Renewal Dialog */}
      <Dialog open={bulkRenewDialogOpen} onOpenChange={setBulkRenewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Subscription Renewal</DialogTitle>
            <DialogDescription>
              Renew subscriptions for {getTotalSelectedBranches()} selected branch(es)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Selected Branches Summary */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {Array.from(selectedBranches.entries()).map(([clientId, branchIds]) => {
                const client = clients.find(c => c.id === clientId);
                if (!client) return null;
                
                return (
                  <div key={clientId} className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-sm">{client.businessName}</p>
                    <p className="text-xs text-muted-foreground">
                      {branchIds.length} branch(es): {
                        branchIds.map(bid => 
                          (client.branches || []).find(b => b.id === bid)?.name
                        ).join(', ')
                      }
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan for All</label>
              <Select value={renewPlan} onValueChange={(v: '1_year' | '3_year') => setRenewPlan(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_year">1 Year - ₹15,000 per branch</SelectItem>
                  <SelectItem value="3_year">3 Years - ₹36,000 per branch (Save ₹9,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Branches</span>
                <span>{getTotalSelectedBranches()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per branch</span>
                <span>₹{SUBSCRIPTION_PRICING[renewPlan].price.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold text-primary">
                  ₹{(getTotalSelectedBranches() * SUBSCRIPTION_PRICING[renewPlan].price).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRenewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkRenewal}>Confirm Bulk Renewal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}