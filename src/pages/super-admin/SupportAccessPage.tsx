import { useState, useMemo } from 'react';
import { Search, UserCog, User, Shield, ExternalLink, Clock, AlertTriangle, Building2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useSuperAdminStore, Branch } from '@/store/superAdminStore';
import { useSupportSessionStore } from '@/store/supportSessionStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';

type AccessRole = 'admin' | 'waiter';

export default function SupportAccessPage() {
  const { clients, addActivityLog, superAdminUser } = useSuperAdminStore();
  const { startSupportSession, activeSessions } = useSupportSessionStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AccessRole>('admin');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients.filter(c => c.status === 'active');
    const query = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.status === 'active' && (
        c.businessName.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.branches.some(b => 
          b.name.toLowerCase().includes(query) ||
          b.city.toLowerCase().includes(query)
        )
      )
    );
  }, [clients, searchQuery]);

  const selectedClientData = useMemo(() => 
    clients.find(c => c.id === selectedClient),
    [clients, selectedClient]
  );

  const selectedBranchData = useMemo(() => 
    selectedClientData?.branches.find(b => b.id === selectedBranch),
    [selectedClientData, selectedBranch]
  );

  const toggleClientExpand = (clientId: string) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectBranch = (clientId: string, branchId: string) => {
    setSelectedClient(clientId);
    setSelectedBranch(branchId);
  };

  const handleLoginAsClient = () => {
    if (!selectedClientData || !selectedBranchData) return;
    setShowConfirmDialog(true);
  };

  const confirmLogin = () => {
    if (!selectedClientData || !selectedBranchData) return;

    const session = startSupportSession({
      clientId: selectedClientData.id,
      clientName: `${selectedClientData.businessName} - ${selectedBranchData.name}`,
      role: selectedRole,
      superAdminId: superAdminUser?.id || 'unknown',
    });

    addActivityLog({
      action: `Support login as ${selectedRole === 'admin' ? 'Restaurant Admin' : 'Waiter'} (${selectedBranchData.name})`,
      targetType: 'client',
      targetId: selectedClientData.id,
      targetName: selectedClientData.businessName,
      performedBy: superAdminUser?.name || 'Super Admin',
      ipAddress: '192.168.1.100',
    });

    setShowConfirmDialog(false);

    const targetPath = selectedRole === 'admin' ? '/dashboard' : '/waiter';
    const url = `${window.location.origin}${targetPath}?support_session=${session.id}&branch=${selectedBranch}`;
    window.open(url, '_blank');

    toast.success(`Support session started for ${selectedBranchData.name}`, {
      description: `Session expires in 30 minutes`,
    });
  };

  const getBusinessTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      restaurant: 'bg-emerald-100 text-emerald-700',
      hotel: 'bg-blue-100 text-blue-700',
      both: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Support Access</h1>
        <p className="text-slate-500">Securely access client panels for support and troubleshooting</p>
      </div>

      {/* Warning Card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Important Security Notice</p>
            <p className="text-sm text-amber-700">
              All support access sessions are time-limited (30 minutes) and fully audited. 
              Actions performed in support mode are logged for compliance.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client & Branch Search */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Select Client & Branch</CardTitle>
            <CardDescription>Choose the specific branch you need to access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by business, branch, owner, city, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No active clients found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredClients.map((client) => (
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
                              <p className="font-medium text-slate-800">{client.businessName}</p>
                              <p className="text-sm text-slate-500">{client.ownerName} • {client.city}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getBusinessTypeBadge(client.businessType)}>
                              {client.businessType.charAt(0).toUpperCase() + client.businessType.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="text-slate-600">
                              {client.branches.filter(b => b.status === 'active').length} branches
                            </Badge>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedClients.includes(client.id) ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="bg-slate-50 px-4 pb-4">
                          <div className="grid gap-2">
                            {client.branches.filter(b => b.status === 'active').map((branch) => (
                              <div
                                key={branch.id}
                                onClick={() => handleSelectBranch(client.id, branch.id)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                  selectedClient === client.id && selectedBranch === branch.id
                                    ? 'bg-primary/10 border-2 border-primary'
                                    : 'bg-white border border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    selectedClient === client.id && selectedBranch === branch.id
                                      ? 'bg-primary'
                                      : 'border-2 border-slate-300'
                                  }`} />
                                  <div>
                                    <p className="font-medium text-slate-800 text-sm">
                                      {branch.name}
                                      {branch.isMain && (
                                        <Badge className="ml-2 text-xs bg-primary/10 text-primary">Main</Badge>
                                      )}
                                    </p>
                                    <p className="text-xs text-slate-500">{branch.city}, {branch.state}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-500">{branch.phone}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Access Configuration */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Access Configuration</CardTitle>
            <CardDescription>Configure support session settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedClientData && selectedBranchData ? (
              <>
                {/* Selected Branch Info */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-slate-700">Selected Branch</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">{selectedBranchData.name}</p>
                    <p className="text-sm text-slate-600">{selectedClientData.businessName}</p>
                    <p className="text-xs text-slate-500">{selectedBranchData.city}, {selectedBranchData.state}</p>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-slate-700">Access As</Label>
                  <RadioGroup 
                    value={selectedRole} 
                    onValueChange={(v) => setSelectedRole(v as AccessRole)}
                    className="space-y-2"
                  >
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRole === 'admin' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer flex-1">
                        <UserCog className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="font-medium text-slate-800">Restaurant Admin</p>
                          <p className="text-xs text-slate-500">Full admin panel access</p>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRole === 'waiter' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <RadioGroupItem value="waiter" id="waiter" />
                      <Label htmlFor="waiter" className="flex items-center gap-2 cursor-pointer flex-1">
                        <User className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="font-medium text-slate-800">Waiter</p>
                          <p className="text-xs text-slate-500">Waiter app access</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Session Info */}
                <div className="p-3 bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Session expires after 30 minutes</span>
                  </div>
                </div>

                {/* Login Button */}
                <Button 
                  className="w-full"
                  onClick={handleLoginAsClient}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Login to Branch
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Select a branch to configure access</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Active Support Sessions</CardTitle>
            <CardDescription>Currently active support access sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium text-slate-800">{session.clientName}</p>
                      <p className="text-sm text-slate-500">
                        {session.role === 'admin' ? 'Restaurant Admin' : 'Waiter'} • 
                        Started {new Date(session.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Expires {new Date(session.expiresAt).toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Support Access</DialogTitle>
            <DialogDescription>
              You are about to access the client panel in support mode. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Client</span>
                <span className="text-sm font-medium text-slate-800">{selectedClientData?.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Branch</span>
                <span className="text-sm font-medium text-slate-800">{selectedBranchData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Location</span>
                <span className="text-sm font-medium text-slate-800">{selectedBranchData?.city}, {selectedBranchData?.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Access Role</span>
                <span className="text-sm font-medium text-slate-800">
                  {selectedRole === 'admin' ? 'Restaurant Admin' : 'Waiter'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Session Duration</span>
                <span className="text-sm font-medium text-slate-800">30 minutes</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> All actions performed in support mode will be logged 
                for audit purposes. Avoid making changes unless necessary.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmLogin}>
              <Shield className="h-4 w-4 mr-2" />
              Confirm & Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
