import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Tag,
  Percent,
  IndianRupee,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Discount {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  applicableOn: 'all' | 'dine-in' | 'takeaway' | 'delivery';
  isActive: boolean;
}

const initialDiscounts: Discount[] = [
  { id: '1', code: 'WELCOME20', name: 'Welcome Discount', type: 'percentage', value: 20, minOrder: 500, maxDiscount: 200, validFrom: '2024-01-01', validTo: '2024-12-31', usageLimit: 1000, usedCount: 456, applicableOn: 'all', isActive: true },
  { id: '2', code: 'FLAT100', name: 'Flat ₹100 Off', type: 'fixed', value: 100, minOrder: 300, validFrom: '2024-01-01', validTo: '2024-06-30', usageLimit: 500, usedCount: 234, applicableOn: 'dine-in', isActive: true },
  { id: '3', code: 'TAKEAWAY15', name: 'Takeaway Special', type: 'percentage', value: 15, minOrder: 200, maxDiscount: 150, validFrom: '2024-01-01', validTo: '2024-12-31', usageLimit: 2000, usedCount: 890, applicableOn: 'takeaway', isActive: true },
  { id: '4', code: 'DELIVERY50', name: 'Free Delivery', type: 'fixed', value: 50, minOrder: 150, validFrom: '2024-02-01', validTo: '2024-03-31', usageLimit: 1000, usedCount: 1000, applicableOn: 'delivery', isActive: false },
  { id: '5', code: 'HAPPY10', name: 'Happy Hour', type: 'percentage', value: 10, minOrder: 0, validFrom: '2024-01-01', validTo: '2024-12-31', usageLimit: 0, usedCount: 2340, applicableOn: 'all', isActive: true },
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrder: '',
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    applicableOn: 'all' as 'all' | 'dine-in' | 'takeaway' | 'delivery',
  });

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && discount.isActive) ||
      (statusFilter === 'inactive' && !discount.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.isActive).length,
    totalRedemptions: discounts.reduce((sum, d) => sum + d.usedCount, 0),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddDiscount = () => {
    if (!newDiscount.code || !newDiscount.name || !newDiscount.value) {
      toast.error('Please fill all required fields');
      return;
    }
    const discount: Discount = {
      id: Date.now().toString(),
      code: newDiscount.code.toUpperCase(),
      name: newDiscount.name,
      type: newDiscount.type,
      value: parseFloat(newDiscount.value),
      minOrder: parseFloat(newDiscount.minOrder) || 0,
      maxDiscount: newDiscount.maxDiscount ? parseFloat(newDiscount.maxDiscount) : undefined,
      validFrom: newDiscount.validFrom || new Date().toISOString().split('T')[0],
      validTo: newDiscount.validTo || '2024-12-31',
      usageLimit: parseInt(newDiscount.usageLimit) || 0,
      usedCount: 0,
      applicableOn: newDiscount.applicableOn,
      isActive: true,
    };
    setDiscounts([...discounts, discount]);
    setNewDiscount({
      code: '',
      name: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      applicableOn: 'all',
    });
    setIsAddDialogOpen(false);
    toast.success('Discount created successfully');
  };

  const handleToggleStatus = (id: string) => {
    setDiscounts(discounts.map(d => 
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ));
    toast.success('Discount status updated');
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(discounts.filter(d => d.id !== id));
    toast.success('Discount deleted');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discounts & Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Manage promotional discounts and coupon codes
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>Add a new promotional discount or coupon code.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., SAVE20"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Discount Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Summer Sale"
                    value={newDiscount.name}
                    onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={newDiscount.type} onValueChange={(v: 'percentage' | 'fixed') => setNewDiscount({ ...newDiscount, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder={newDiscount.type === 'percentage' ? '20' : '100'}
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Min Order Value</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    placeholder="500"
                    value={newDiscount.minOrder}
                    onChange={(e) => setNewDiscount({ ...newDiscount, minOrder: e.target.value })}
                  />
                </div>
                {newDiscount.type === 'percentage' && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="200"
                      value={newDiscount.maxDiscount}
                      onChange={(e) => setNewDiscount({ ...newDiscount, maxDiscount: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={newDiscount.validFrom}
                    onChange={(e) => setNewDiscount({ ...newDiscount, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={newDiscount.validTo}
                    onChange={(e) => setNewDiscount({ ...newDiscount, validTo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit (0 = unlimited)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="1000"
                    value={newDiscount.usageLimit}
                    onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Applicable On</Label>
                  <Select value={newDiscount.applicableOn} onValueChange={(v: 'all' | 'dine-in' | 'takeaway' | 'delivery') => setNewDiscount({ ...newDiscount, applicableOn: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="dine-in">Dine-In Only</SelectItem>
                      <SelectItem value="takeaway">Takeaway Only</SelectItem>
                      <SelectItem value="delivery">Delivery Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDiscount}>Create Discount</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Discounts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Percent className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active Discounts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <IndianRupee className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalRedemptions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Redemptions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Discounts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Applicable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount) => (
                <TableRow key={discount.id} className={cn(!discount.isActive && 'opacity-60')}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {discount.code}
                      </code>
                      <Button variant="ghost" size="iconSm" onClick={() => handleCopyCode(discount.code)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{discount.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {discount.type === 'percentage' ? (
                        <>
                          <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono">{discount.value}%</span>
                        </>
                      ) : (
                        <>
                          <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono">{discount.value}</span>
                        </>
                      )}
                      {discount.maxDiscount && (
                        <span className="text-xs text-muted-foreground">(max {formatPrice(discount.maxDiscount)})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{formatPrice(discount.minOrder)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {discount.validFrom} - {discount.validTo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-mono">{discount.usedCount}</span>
                      {discount.usageLimit > 0 && (
                        <span className="text-muted-foreground">/{discount.usageLimit}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {discount.applicableOn === 'all' ? 'All' : discount.applicableOn}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={discount.isActive}
                      onCheckedChange={() => handleToggleStatus(discount.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="iconSm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyCode(discount.code)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteDiscount(discount.id)} className="text-destructive">
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
    </div>
  );
}
