import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Users,
  Clock,
  MoreHorizontal,
  Trash2,
  CreditCard,
  IndianRupee,
  Printer,
  Receipt,
  Wallet,
  Smartphone,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useOrderStore, type Table } from '@/store/orderStore';

const sections = ['All', 'Main Hall', 'Private', 'Outdoor'];

const statusConfig = {
  available: { color: 'bg-success/10 text-success border-success/30', label: 'Available' },
  occupied: { color: 'bg-primary/10 text-primary border-primary/30', label: 'Occupied' },
  reserved: { color: 'bg-warning/10 text-warning border-warning/30', label: 'Reserved' },
  cleaning: { color: 'bg-muted text-muted-foreground border-border', label: 'Cleaning' },
};

export default function TablesPage() {
  const { tables, updateTableStatus, settleTableBill, setTables } = useOrderStore();
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [newTable, setNewTable] = useState({ number: '', capacity: '4', section: 'Main Hall' });

  const filteredTables = tables.filter((table) => {
    const matchesSection = sectionFilter === 'All' || table.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    return matchesSection && matchesStatus;
  });

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  const formatDuration = (startTime: Date) => {
    const diff = Date.now() - new Date(startTime).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddTable = () => {
    if (!newTable.number.trim()) {
      toast.error('Please enter a table number');
      return;
    }
    const table: Table = {
      id: Date.now().toString(),
      number: newTable.number,
      capacity: parseInt(newTable.capacity),
      section: newTable.section,
      status: 'available',
    };
    setTables([...tables, table]);
    setNewTable({ number: '', capacity: '4', section: 'Main Hall' });
    setIsAddDialogOpen(false);
    toast.success(`Table ${newTable.number} added successfully`);
  };

  const handleStatusChange = (tableId: string, newStatus: Table['status']) => {
    updateTableStatus(tableId, newStatus, newStatus === 'available' ? undefined : undefined);
    toast.success('Table status updated');
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
    toast.success('Table deleted');
  };

  const openSettlement = (table: Table) => {
    setSelectedTable(table);
    setIsSettlementOpen(true);
    setDiscountAmount('');
    setPaymentMethod('cash');
  };

  const calculateBill = () => {
    if (!selectedTable?.currentOrder) return { subtotal: 0, discount: 0, tax: 0, total: 0 };
    
    const subtotal = selectedTable.currentOrder.amount;
    let discount = 0;
    
    if (discountAmount) {
      if (discountType === 'percentage') {
        discount = (subtotal * parseFloat(discountAmount)) / 100;
      } else {
        discount = parseFloat(discountAmount);
      }
    }
    
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * 0.05; // 5% GST
    const total = afterDiscount + tax;
    
    return { subtotal, discount, tax, total: Math.round(total) };
  };

  const handleSettlement = () => {
    if (!selectedTable) return;
    
    const bill = calculateBill();
    settleTableBill(selectedTable.id);
    setIsSettlementOpen(false);
    setSelectedTable(null);
    toast.success(`Payment of ${formatPrice(bill.total)} received via ${paymentMethod.toUpperCase()}`);
  };

  const handlePrintBill = () => {
    toast.success('Bill sent to printer');
  };

  const bill = calculateBill();

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold">Table Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage restaurant floor and table assignments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
              <DialogDescription>Create a new table for your restaurant floor.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="number">Table Number</Label>
                <Input
                  id="number"
                  placeholder="e.g., T13"
                  value={newTable.number}
                  onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Select value={newTable.capacity} onValueChange={(v) => setNewTable({ ...newTable, capacity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 6, 8, 10, 12].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} seats</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="section">Section</Label>
                <Select value={newTable.section} onValueChange={(v) => setNewTable({ ...newTable, section: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.filter(s => s !== 'All').map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTable}>Add Table</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats - Compact */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        <Card className="p-2">
          <div className="text-lg font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </Card>
        <Card className="p-2">
          <div className="text-lg font-bold text-success">{stats.available}</div>
          <div className="text-xs text-muted-foreground">Available</div>
        </Card>
        <Card className="p-2">
          <div className="text-lg font-bold text-primary">{stats.occupied}</div>
          <div className="text-xs text-muted-foreground">Occupied</div>
        </Card>
        <Card className="p-2">
          <div className="text-lg font-bold text-warning">{stats.reserved}</div>
          <div className="text-xs text-muted-foreground">Reserved</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-2 shrink-0">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {sections.map((section) => (
              <Button
                key={section}
                variant={sectionFilter === section ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSectionFilter(section)}
              >
                {section}
              </Button>
            ))}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-7 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Scrollable Table Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 pr-4">
          {filteredTables.map((table) => {
            const status = statusConfig[table.status];
            return (
              <Card key={table.id} className={cn(
                "relative overflow-hidden transition-all hover:shadow-md",
                table.status === 'occupied' && "ring-2 ring-primary/30"
              )}>
                <CardContent className="p-2.5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm">{table.number}</h3>
                      <p className="text-[10px] text-muted-foreground">{table.section}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="iconSm" className="h-5 w-5">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(table.id, 'available')}>
                          Set Available
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(table.id, 'reserved')}>
                          Set Reserved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(table.id, 'cleaning')}>
                          Set Cleaning
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTable(table.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-1 mb-2 text-[10px] text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{table.capacity}</span>
                  </div>

                  <Badge variant="outline" className={cn("w-full justify-center text-[10px] py-0", status.color)}>
                    {status.label}
                  </Badge>

                  {table.currentOrder && (
                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Order:</span>
                        <span className="font-mono">{table.currentOrder.orderNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-mono font-semibold">{formatPrice(table.currentOrder.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                        <span>{formatDuration(table.currentOrder.startTime)}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-1 gap-1 h-6 text-[10px]"
                        onClick={() => openSettlement(table)}
                      >
                        <CreditCard className="h-2.5 w-2.5" />
                        Settle
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Settlement Dialog */}
      <Dialog open={isSettlementOpen} onOpenChange={setIsSettlementOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Bill Settlement - {selectedTable?.number}
            </DialogTitle>
            <DialogDescription>
              Order #{selectedTable?.currentOrder?.orderNumber}
              {selectedTable?.currentOrder?.customerName && (
                <span className="ml-2">• {selectedTable.currentOrder.customerName}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTable?.currentOrder && (
            <div className="space-y-4">
              {/* Order Items */}
              <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {selectedTable.currentOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-mono">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Discount */}
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v: 'fixed' | 'percentage') => setDiscountType(v)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">₹ Fixed</SelectItem>
                    <SelectItem value="percentage">% Off</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Discount"
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>

              {/* Bill Summary */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(bill.subtotal)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span className="font-mono">-{formatPrice(bill.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (5%)</span>
                  <span className="font-mono">{formatPrice(bill.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="font-mono">{formatPrice(bill.total)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: 'Cash', icon: IndianRupee },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI', icon: Smartphone },
                  { id: 'wallet', label: 'Wallet', icon: Wallet },
                ].map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={paymentMethod === id ? 'default' : 'outline'}
                    className="flex-col h-16 gap-1"
                    onClick={() => setPaymentMethod(id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handlePrintBill} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleSettlement} className="gap-2">
              <CreditCard className="h-4 w-4" />
              Settle {formatPrice(bill.total)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
