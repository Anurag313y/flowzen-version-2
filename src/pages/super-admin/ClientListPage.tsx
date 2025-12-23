import { useState } from 'react';
import { useSuperAdminStore, Client } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
  Hotel,
  UtensilsCrossed,
  Building2,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ClientListPage() {
  const navigate = useNavigate();
  const { clients, suspendClient, resumeClient, deleteClient, toggleClientService } = useSuperAdminStore();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const today = new Date();

  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/30';
      case 'suspended':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'expired':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      default:
        return '';
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.businessName.toLowerCase().includes(search.toLowerCase()) ||
      client.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      client.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      client.ownerPhone.includes(search) ||
      client.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.businessType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSuspend = (client: Client) => {
    suspendClient(client.id);
    toast.success(`${client.businessName} has been suspended`);
  };

  const handleResume = (client: Client) => {
    resumeClient(client.id);
    toast.success(`${client.businessName} has been resumed`);
  };

  const handleDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      toast.success(`${clientToDelete.businessName} has been deleted`);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleToggleService = (clientId: string, service: 'pos' | 'pms', enabled: boolean) => {
    toggleClientService(clientId, service, enabled);
    toast.success(`Service ${enabled ? 'enabled' : 'disabled'}`);
  };

  const getBusinessIcon = (type: Client['businessType']) => {
    switch (type) {
      case 'restaurant':
        return <UtensilsCrossed className="h-4 w-4" />;
      case 'hotel':
        return <Hotel className="h-4 w-4" />;
      case 'both':
        return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client List</h1>
          <p className="text-muted-foreground">Manage all registered clients</p>
        </div>
        <Button onClick={() => navigate('/super-admin/clients/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-center">POS</TableHead>
                  <TableHead className="text-center">PMS</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No clients found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const daysLeft = getDaysLeft(client.expiryDate);
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-mono text-sm">{client.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.businessName}</p>
                            <p className="text-sm text-muted-foreground">{client.ownerName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getBusinessIcon(client.businessType)}
                            <span className="capitalize">{client.businessType}</span>
                          </div>
                        </TableCell>
                        <TableCell>{client.city}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {client.services.includes('pos') && (
                              <Badge variant="outline" className="text-xs">POS</Badge>
                            )}
                            {client.services.includes('pms') && (
                              <Badge variant="outline" className="text-xs">PMS</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                        </TableCell>
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
                        <TableCell className="text-center">
                          <Switch
                            checked={client.posEnabled}
                            onCheckedChange={(checked) => handleToggleService(client.id, 'pos', checked)}
                            disabled={!client.services.includes('pos') || client.status === 'suspended'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={client.pmsEnabled}
                            onCheckedChange={(checked) => handleToggleService(client.id, 'pms', checked)}
                            disabled={!client.services.includes('pms') || client.status === 'suspended'}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`/super-admin/clients/${client.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/super-admin/clients/${client.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {client.status === 'suspended' ? (
                                <DropdownMenuItem onClick={() => handleResume(client)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleSuspend(client)}>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setClientToDelete(client);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{clientToDelete?.businessName}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
