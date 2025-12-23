import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Eye,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnlineOrder {
  id: string;
  orderNumber: string;
  platform: 'zomato' | 'swiggy' | 'direct' | 'uber-eats';
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'new' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'cod';
  placedAt: Date;
  estimatedDelivery: Date;
  notes: string;
}

const initialOrders: OnlineOrder[] = [
  {
    id: '1', orderNumber: 'ZOM-001', platform: 'zomato',
    customer: { name: 'Rahul Sharma', phone: '+91 98765 43210', address: '123 MG Road, Sector 15, Bangalore - 560001' },
    items: [
      { name: 'Butter Chicken', quantity: 2, price: 420 },
      { name: 'Garlic Naan', quantity: 4, price: 80 },
      { name: 'Jeera Rice', quantity: 2, price: 180 }
    ],
    subtotal: 1340, deliveryFee: 40, total: 1380,
    status: 'new', paymentStatus: 'paid', placedAt: new Date(Date.now() - 5 * 60000), estimatedDelivery: new Date(Date.now() + 35 * 60000), notes: 'Extra spicy'
  },
  {
    id: '2', orderNumber: 'SWI-002', platform: 'swiggy',
    customer: { name: 'Priya Patel', phone: '+91 98765 43211', address: '45 Park Street, Whitefield, Bangalore - 560066' },
    items: [
      { name: 'Chicken Biryani', quantity: 1, price: 380 },
      { name: 'Raita', quantity: 1, price: 60 }
    ],
    subtotal: 440, deliveryFee: 30, total: 470,
    status: 'confirmed', paymentStatus: 'cod', placedAt: new Date(Date.now() - 12 * 60000), estimatedDelivery: new Date(Date.now() + 28 * 60000), notes: ''
  },
  {
    id: '3', orderNumber: 'DIR-003', platform: 'direct',
    customer: { name: 'Amit Kumar', phone: '+91 98765 43212', address: '789 Indiranagar, 12th Main, Bangalore - 560038' },
    items: [
      { name: 'Paneer Tikka', quantity: 1, price: 320 },
      { name: 'Dal Makhani', quantity: 1, price: 280 },
      { name: 'Butter Naan', quantity: 3, price: 60 }
    ],
    subtotal: 780, deliveryFee: 50, total: 830,
    status: 'preparing', paymentStatus: 'paid', placedAt: new Date(Date.now() - 20 * 60000), estimatedDelivery: new Date(Date.now() + 20 * 60000), notes: 'No onion, no garlic'
  },
  {
    id: '4', orderNumber: 'ZOM-004', platform: 'zomato',
    customer: { name: 'Sneha Reddy', phone: '+91 98765 43213', address: '321 HSR Layout, 27th Main, Bangalore - 560102' },
    items: [
      { name: 'Veg Biryani', quantity: 2, price: 280 },
      { name: 'Paneer Butter Masala', quantity: 1, price: 340 }
    ],
    subtotal: 900, deliveryFee: 35, total: 935,
    status: 'ready', paymentStatus: 'paid', placedAt: new Date(Date.now() - 30 * 60000), estimatedDelivery: new Date(Date.now() + 10 * 60000), notes: ''
  },
  {
    id: '5', orderNumber: 'SWI-005', platform: 'swiggy',
    customer: { name: 'Vikram Singh', phone: '+91 98765 43214', address: '567 Koramangala, 5th Block, Bangalore - 560095' },
    items: [
      { name: 'Mutton Biryani', quantity: 1, price: 480 },
      { name: 'Chicken 65', quantity: 1, price: 280 }
    ],
    subtotal: 760, deliveryFee: 40, total: 800,
    status: 'picked-up', paymentStatus: 'paid', placedAt: new Date(Date.now() - 45 * 60000), estimatedDelivery: new Date(Date.now() + 5 * 60000), notes: ''
  },
  {
    id: '6', orderNumber: 'UBE-006', platform: 'uber-eats',
    customer: { name: 'Ananya Gupta', phone: '+91 98765 43215', address: '890 Electronic City, Phase 1, Bangalore - 560100' },
    items: [
      { name: 'Fish Fry', quantity: 2, price: 350 },
      { name: 'Lemon Rice', quantity: 1, price: 160 }
    ],
    subtotal: 860, deliveryFee: 60, total: 920,
    status: 'delivered', paymentStatus: 'paid', placedAt: new Date(Date.now() - 90 * 60000), estimatedDelivery: new Date(Date.now() - 50 * 60000), notes: ''
  },
];

const platformConfig = {
  'zomato': { color: 'bg-red-500', label: 'Zomato' },
  'swiggy': { color: 'bg-orange-500', label: 'Swiggy' },
  'direct': { color: 'bg-primary', label: 'Direct' },
  'uber-eats': { color: 'bg-green-600', label: 'Uber Eats' },
};

const statusConfig = {
  'new': { icon: Clock, color: 'text-warning bg-warning/10', label: 'New', next: 'confirmed' },
  'confirmed': { icon: CheckCircle, color: 'text-primary bg-primary/10', label: 'Confirmed', next: 'preparing' },
  'preparing': { icon: Package, color: 'text-sky-600 bg-sky-100', label: 'Preparing', next: 'ready' },
  'ready': { icon: Package, color: 'text-success bg-success/10', label: 'Ready', next: 'picked-up' },
  'picked-up': { icon: Truck, color: 'text-purple-600 bg-purple-100', label: 'Picked Up', next: 'delivered' },
  'delivered': { icon: CheckCircle, color: 'text-success bg-success/10', label: 'Delivered', next: null },
  'cancelled': { icon: XCircle, color: 'text-destructive bg-destructive/10', label: 'Cancelled', next: null },
};

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<OnlineOrder[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || order.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const stats = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    todayTotal: orders.reduce((sum, o) => sum + o.total, 0),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTimeSince = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const handleUpdateStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
  };

  const handlePrintBill = (order: OnlineOrder) => {
    toast.success(`Bill printed for ${order.orderNumber}`);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl font-bold">Online Orders</h1>
          <p className="text-xs text-muted-foreground">
            {orders.length} orders today
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats - Compact */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        <Card className={cn("p-2", stats.new > 0 && "ring-2 ring-warning")}>
          <div className="text-lg font-bold text-warning">{stats.new}</div>
          <div className="text-xs text-muted-foreground">New</div>
        </Card>
        <Card className="p-2">
          <div className="text-lg font-bold text-sky-600">{stats.preparing}</div>
          <div className="text-xs text-muted-foreground">Preparing</div>
        </Card>
        <Card className="p-2">
          <div className="text-lg font-bold text-success">{stats.ready}</div>
          <div className="text-xs text-muted-foreground">Ready</div>
        </Card>
        <Card className="p-2">
          <div className="text-lg font-bold">{formatPrice(stats.todayTotal)}</div>
          <div className="text-xs text-muted-foreground">Revenue</div>
        </Card>
      </div>

      {/* Filters - Compact */}
      <Card className="p-2 shrink-0">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[110px] h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[110px] h-8 text-sm">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="zomato">Zomato</SelectItem>
              <SelectItem value="swiggy">Swiggy</SelectItem>
              <SelectItem value="uber-eats">Uber Eats</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Scrollable Orders Grid - Compact Cards */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pr-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const platform = platformConfig[order.platform];
            
            return (
              <Card key={order.id} className={cn(
                "transition-all hover:shadow-md",
                order.status === 'new' && "ring-2 ring-warning"
              )}>
                <CardContent className="p-2.5 space-y-2">
                  {/* Header - Compact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge className={cn("text-white text-[10px] px-1.5 py-0", platform.color)}>
                        {platform.label}
                      </Badge>
                      <span className="font-mono text-xs font-medium">{order.orderNumber}</span>
                    </div>
                    <Badge variant="outline" className={cn("gap-0.5 text-[10px] px-1 py-0", status.color)}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Customer - Compact */}
                  <div className="space-y-0.5">
                    <p className="font-medium text-xs truncate">{order.customer.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{getTimeSince(order.placedAt)}</span>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="text-[10px] text-muted-foreground border-t pt-1.5">
                    {order.items.length} items • {formatPrice(order.total)}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-warning/10 text-warning text-[10px] p-1 rounded truncate">
                      {order.notes}
                    </div>
                  )}

                  {/* Actions - Compact */}
                  <div className="flex gap-1 pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-6 text-[10px] gap-1"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-2.5 w-2.5" />
                      View
                    </Button>
                    {status.next && (
                      <Button 
                        size="sm"
                        className="flex-1 h-6 text-[10px]"
                        onClick={() => handleUpdateStatus(order.id, status.next as OnlineOrder['status'])}
                      >
                        {status.next === 'confirmed' ? 'Accept' : 
                         status.next === 'preparing' ? 'Start' :
                         status.next === 'ready' ? 'Ready' :
                         status.next === 'picked-up' ? 'Picked' : 'Done'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            No orders found
          </div>
        )}
      </ScrollArea>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details
              {selectedOrder && (
                <Badge className={cn("text-white text-xs", platformConfig[selectedOrder.platform].color)}>
                  {platformConfig[selectedOrder.platform].label}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="font-mono">
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Customer Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Customer</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedOrder.customer.phone}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{selectedOrder.customer.address}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Items</h4>
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between p-2 text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-mono">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Bill Summary</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment</span>
                  <Badge variant="outline" className={cn(
                    selectedOrder.paymentStatus === 'paid' ? "text-success border-success/30" : "text-warning border-warning/30"
                  )}>
                    {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'COD'}
                  </Badge>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-warning/10 text-warning text-sm p-3 rounded-lg">
                    <strong>Note:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => selectedOrder && handlePrintBill(selectedOrder)} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Bill
            </Button>
            {selectedOrder && statusConfig[selectedOrder.status].next && (
              <Button onClick={() => {
                handleUpdateStatus(selectedOrder.id, statusConfig[selectedOrder.status].next as OnlineOrder['status']);
                setSelectedOrder(null);
              }}>
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
