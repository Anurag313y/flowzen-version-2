import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  CheckCircle,
  Bell,
  RefreshCw,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrderStore, type KOTOrder, type ItemStatus } from '@/store/orderStore';
import { toast } from 'sonner';

const statusConfig = {
  pending: { 
    label: 'pending', 
    icon: Clock, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  preparing: { 
    label: 'preparing', 
    icon: RefreshCw, 
    color: 'text-sky-600', 
    bg: 'bg-sky-50',
    border: 'border-sky-200'
  },
  ready: { 
    label: 'ready', 
    icon: CheckCircle, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
};

function KOTCard({ order, onComplete }: { order: KOTOrder; onComplete: () => void }) {
  return (
    <Card className={cn(
      "border-0 shadow-sm overflow-hidden",
      order.isRush && "ring-2 ring-destructive/50 bg-red-50/50"
    )}>
      <CardContent className="p-3 space-y-2">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{order.orderNumber}</span>
            {order.isRush && (
              <Badge className="bg-destructive text-destructive-foreground gap-1 text-xs px-1.5 py-0">
                <Timer className="h-2.5 w-2.5" />
                RUSH
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {order.table}
          </Badge>
        </div>

        {/* Time & Customer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{order.time}</span>
          </div>
          {order.customerName && (
            <span className="truncate max-w-[100px]">{order.customerName}</span>
          )}
        </div>

        {/* Items - Compact */}
        <div className="space-y-1">
          {order.items.slice(0, 3).map((item) => {
            const status = statusConfig[item.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={item.id}
                className={cn(
                  "px-2 py-1.5 rounded border text-xs",
                  status.bg,
                  status.border
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">
                      {item.quantity}x {item.name}
                    </span>
                    {item.notes && (
                      <p className="text-muted-foreground flex items-center gap-1 truncate">
                        <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className={cn("flex items-center gap-1 ml-2", status.color)}>
                    <StatusIcon className="h-3 w-3" />
                  </div>
                </div>
              </div>
            );
          })}
          {order.items.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{order.items.length - 3} more items
            </p>
          )}
        </div>

        {/* Actions - Compact */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
            Start All
          </Button>
          <Button variant="posSuccess" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={onComplete}>
            <CheckCircle className="h-3 w-3" />
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KitchenPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { kotOrders, completeKOTOrder } = useOrderStore();

  const handleComplete = (orderId: string) => {
    completeKOTOrder(orderId);
    toast.success('Order completed');
  };

  const filters = [
    { id: 'all', label: 'All', count: kotOrders.length },
    { id: 'pending', label: 'Pending', count: kotOrders.filter(o => o.items.some(i => i.status === 'pending')).length },
    { id: 'preparing', label: 'Preparing', count: kotOrders.filter(o => o.items.some(i => i.status === 'preparing')).length },
    { id: 'ready', label: 'Ready', count: kotOrders.filter(o => o.items.every(i => i.status === 'ready')).length },
  ];

  const filteredOrders = kotOrders.filter((order) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return order.items.some(i => i.status === 'pending');
    if (activeFilter === 'preparing') return order.items.some(i => i.status === 'preparing');
    if (activeFilter === 'ready') return order.items.every(i => i.status === 'ready');
    return true;
  });

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold">Kitchen Display</h1>
          <p className="text-xs text-muted-foreground">
            {kotOrders.length} active orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Bell className="h-3.5 w-3.5" />
            Alerts
          </Button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>Auto</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 shrink-0">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              "category-tab flex items-center gap-1.5 text-sm",
              activeFilter === filter.id && "active"
            )}
          >
            {filter.label}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              activeFilter === filter.id 
                ? "bg-primary-foreground/20 text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Scrollable Orders Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pr-4">
          {filteredOrders.map((order) => (
            <KOTCard key={order.id} order={order} onComplete={() => handleComplete(order.id)} />
          ))}
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            No orders in kitchen
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
