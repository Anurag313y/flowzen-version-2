import { useSuperAdminStore } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ToggleLeft, Power, Hotel, UtensilsCrossed, Building2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ServiceControlPage() {
  const { clients, toggleClientService, suspendClient, resumeClient } = useSuperAdminStore();
  const [search, setSearch] = useState('');

  const activeClients = clients.filter(c => c.status !== 'draft');

  const filteredClients = activeClients.filter((client) =>
    client.businessName.toLowerCase().includes(search.toLowerCase()) ||
    client.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    client.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleService = (clientId: string, service: 'pos' | 'pms', enabled: boolean) => {
    toggleClientService(clientId, service, enabled);
    toast.success(`${service.toUpperCase()} ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleToggleMaster = (clientId: string, currentlyActive: boolean) => {
    if (currentlyActive) {
      suspendClient(clientId);
      toast.success('Client suspended');
    } else {
      resumeClient(clientId);
      toast.success('Client resumed');
    }
  };

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return <UtensilsCrossed className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Service Control</h1>
        <p className="text-muted-foreground">Enable or disable services for each client</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold text-success">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Power className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-warning">
                  {clients.filter(c => c.status === 'suspended').length}
                </p>
              </div>
              <ToggleLeft className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">POS Active</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.posEnabled).length}
                </p>
              </div>
              <UtensilsCrossed className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">PMS Active</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.pmsEnabled).length}
                </p>
              </div>
              <Hotel className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Control Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Services</CardTitle>
          <CardDescription>Toggle services on/off for each client</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Master Switch</TableHead>
                  <TableHead className="text-center">POS</TableHead>
                  <TableHead className="text-center">PMS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.businessName}</p>
                          <p className="text-sm text-muted-foreground">{client.city}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBusinessIcon(client.businessType)}
                          <span className="capitalize">{client.businessType}</span>
                        </div>
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
                      <TableCell className="text-center">
                        <Switch
                          checked={client.status === 'active'}
                          onCheckedChange={() => handleToggleMaster(client.id, client.status === 'active')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={client.posEnabled}
                          onCheckedChange={(checked) => handleToggleService(client.id, 'pos', checked)}
                          disabled={!client.services.includes('pos') || client.status !== 'active'}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={client.pmsEnabled}
                          onCheckedChange={(checked) => handleToggleService(client.id, 'pms', checked)}
                          disabled={!client.services.includes('pms') || client.status !== 'active'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
