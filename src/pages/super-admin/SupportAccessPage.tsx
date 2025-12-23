import { useState, useMemo } from 'react';
import { Search, UserCog, User, Shield, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useSuperAdminStore } from '@/store/superAdminStore';
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
import { toast } from 'sonner';

type AccessRole = 'admin' | 'waiter';

export default function SupportAccessPage() {
  const { clients, addActivityLog, superAdminUser } = useSuperAdminStore();
  const { startSupportSession, activeSessions } = useSupportSessionStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AccessRole>('admin');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients.filter(c => c.status === 'active');
    const query = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.status === 'active' && (
        c.businessName.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      )
    );
  }, [clients, searchQuery]);

  const selectedClientData = useMemo(() => 
    clients.find(c => c.id === selectedClient),
    [clients, selectedClient]
  );

  const handleLoginAsClient = () => {
    if (!selectedClientData) return;
    setShowConfirmDialog(true);
  };

  const confirmLogin = () => {
    if (!selectedClientData) return;

    // Generate session
    const session = startSupportSession({
      clientId: selectedClientData.id,
      clientName: selectedClientData.businessName,
      role: selectedRole,
      superAdminId: superAdminUser?.id || 'unknown',
    });

    // Log the access
    addActivityLog({
      action: `Support login as ${selectedRole === 'admin' ? 'Restaurant Admin' : 'Waiter'}`,
      targetType: 'client',
      targetId: selectedClientData.id,
      targetName: selectedClientData.businessName,
      performedBy: superAdminUser?.name || 'Super Admin',
      ipAddress: '192.168.1.100',
    });

    setShowConfirmDialog(false);

    // Open in new tab with session token
    const targetPath = selectedRole === 'admin' ? '/dashboard' : '/waiter';
    const url = `${window.location.origin}${targetPath}?support_session=${session.id}`;
    window.open(url, '_blank');

    toast.success(`Support session started for ${selectedClientData.businessName}`, {
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
        {/* Client Search */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Search Client</CardTitle>
            <CardDescription>Find the client you need to access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by business name, owner, city, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Services</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No active clients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow 
                        key={client.id}
                        className={`cursor-pointer transition-colors ${
                          selectedClient === client.id 
                            ? 'bg-primary/5 border-l-2 border-l-primary' 
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedClient(client.id)}
                      >
                        <TableCell>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedClient === client.id 
                              ? 'border-primary bg-primary' 
                              : 'border-slate-300'
                          }`}>
                            {selectedClient === client.id && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800">{client.businessName}</p>
                            <p className="text-sm text-slate-500">{client.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBusinessTypeBadge(client.businessType)}>
                            {client.businessType.charAt(0).toUpperCase() + client.businessType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {client.city}, {client.state}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {client.posEnabled && (
                              <Badge variant="outline" className="text-xs">POS</Badge>
                            )}
                            {client.pmsEnabled && (
                              <Badge variant="outline" className="text-xs">PMS</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
            {selectedClientData ? (
              <>
                {/* Selected Client Info */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-slate-700">Selected Client</span>
                  </div>
                  <p className="font-semibold text-slate-800">{selectedClientData.businessName}</p>
                  <p className="text-sm text-slate-500">{selectedClientData.ownerName}</p>
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
                  Login as Client
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <UserCog className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Select a client to configure access</p>
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
