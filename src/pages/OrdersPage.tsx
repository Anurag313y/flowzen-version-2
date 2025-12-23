import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Search,
  Eye,
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrderStore, type UnifiedOrder, type OrderStatus } from '@/store/orderStore';

const statusConfig = {
  'active': { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Active' },
  'kot-sent': { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'KOT Sent' },
  'billed': { icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Billed' },
  'paid': { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Paid' },
  'void': { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Void' },
};

const paymentStatusConfig = {
  'unpaid': { color: 'text-muted-foreground', border: 'border-border' },
  'partial': { color: 'text-warning', border: 'border-warning/30' },
  'paid': { color: 'text-success', border: 'border-success/30' },
};

export default function OrdersPage() {
  const { orders } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all orders ({orders.length} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
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
                <SelectItem value="kot-sent">KOT Sent</SelectItem>
                <SelectItem value="billed">Billed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dine-in">Dine In</SelectItem>
                <SelectItem value="takeaway">Takeaway</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Table/Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Server</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  const paymentStatus = paymentStatusConfig[order.paymentStatus];

                  return (
                    <TableRow key={order.id} className={cn(order.status === 'void' && 'opacity-60')}>
                      <TableCell className="font-mono font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.table}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {order.type.replace('-', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell className="font-mono">{formatPrice(order.amount)}</TableCell>
                      <TableCell>
                        <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium", status.bg)}>
                          <StatusIcon className={cn("h-3.5 w-3.5", status.color)} />
                          <span className={status.color}>{status.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", paymentStatus.color, paymentStatus.border)}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatTime(order.createdAt)}</TableCell>
                      <TableCell>{order.server}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="iconSm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="iconSm">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}