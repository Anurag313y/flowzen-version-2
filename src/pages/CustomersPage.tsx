import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Phone,
  Mail,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: Date;
  loyaltyPoints: number;
  isVip: boolean;
  notes: string;
}

const initialCustomers: Customer[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '+91 98765 43210', totalOrders: 45, totalSpent: 28500, lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), loyaltyPoints: 2850, isVip: true, notes: 'Prefers table by window' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+91 98765 43211', totalOrders: 28, totalSpent: 15200, lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), loyaltyPoints: 1520, isVip: false, notes: '' },
  { id: '3', name: 'Mike Chen', email: 'mike.chen@email.com', phone: '+91 98765 43212', totalOrders: 62, totalSpent: 42000, lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), loyaltyPoints: 4200, isVip: true, notes: 'Allergic to nuts' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '+91 98765 43213', totalOrders: 12, totalSpent: 6800, lastVisit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), loyaltyPoints: 680, isVip: false, notes: '' },
  { id: '5', name: 'Robert Wilson', email: 'r.wilson@email.com', phone: '+91 98765 43214', totalOrders: 35, totalSpent: 22400, lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), loyaltyPoints: 2240, isVip: true, notes: 'Corporate account' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+91 98765 43215', totalOrders: 8, totalSpent: 4200, lastVisit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), loyaltyPoints: 420, isVip: false, notes: '' },
  { id: '7', name: 'David Brown', email: 'david.b@email.com', phone: '+91 98765 43216', totalOrders: 52, totalSpent: 35600, lastVisit: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), loyaltyPoints: 3560, isVip: true, notes: 'Birthday: Dec 15' },
  { id: '8', name: 'Jennifer Taylor', email: 'jen.t@email.com', phone: '+91 98765 43217', totalOrders: 19, totalSpent: 11200, lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), loyaltyPoints: 1120, isVip: false, notes: '' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '', email: '', phone: '', notes: ''
  });

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.phone.includes(term);
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.isVip).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0)),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      totalOrders: 0,
      totalSpent: 0,
      lastVisit: new Date(),
      loyaltyPoints: 0,
      isVip: false,
      notes: newCustomer.notes,
    };
    setCustomers([customer, ...customers]);
    setNewCustomer({ name: '', email: '', phone: '', notes: '' });
    setIsAddDialogOpen(false);
    toast.success(`Customer "${newCustomer.name}" added`);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success('Customer deleted');
  };

  const handleToggleVip = (id: string) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, isVip: !c.isVip } : c
    ));
    toast.success('VIP status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your customer database and loyalty program
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Add a new customer to your database</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="Preferences, allergies, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.vip}</div>
            <div className="text-sm text-muted-foreground">VIP Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</div>
            <div className="text-sm text-muted-foreground">Avg Order Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customer.name}</span>
                          {customer.isVip && (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              VIP
                            </Badge>
                          )}
                        </div>
                        {customer.notes && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{customer.notes}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      {customer.totalOrders}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{formatPrice(customer.totalSpent)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.loyaltyPoints} pts</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(customer.lastVisit)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="iconSm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleVip(customer.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {customer.isVip ? 'Remove VIP' : 'Make VIP'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedCustomer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                  {selectedCustomer.isVip && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      VIP Member
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedCustomer.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Orders</Label>
                  <p className="font-medium">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Spent</Label>
                  <p className="font-medium">{formatPrice(selectedCustomer.totalSpent)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Loyalty Points</Label>
                  <p className="font-medium">{selectedCustomer.loyaltyPoints} pts</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Visit</Label>
                  <p className="font-medium">{formatDate(selectedCustomer.lastVisit)}</p>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
