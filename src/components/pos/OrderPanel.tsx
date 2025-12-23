import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Minus, Plus, X, Utensils, ShoppingBag, Truck } from 'lucide-react';
import type { Order, OrderItem } from '@/types/pos';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface OrderPanelProps {
  order: Order;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOrderTypeChange: (type: Order['orderType']) => void;
  onTableChange: (table: string) => void;
}

const tables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];

export function OrderPanel({
  order,
  onUpdateQuantity,
  onRemoveItem,
  onOrderTypeChange,
  onTableChange,
}: OrderPanelProps) {
  const formatPrice = (price: number) => `₹${price}`;

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Order Type Tabs - Compact */}
      <div className="flex border-b border-border">
        {([
          { type: 'dine-in', label: 'Dine In', icon: Utensils },
          { type: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
          { type: 'delivery', label: 'Delivery', icon: Truck },
        ] as const).map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onOrderTypeChange(type)}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1",
              order.orderType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Order Details - Compact */}
      <div className="p-2 border-b border-border space-y-2">
        <div className="flex gap-2">
          {order.orderType === 'dine-in' && (
            <Select value={order.tableNumber || ''} onValueChange={onTableChange}>
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table} value={table} className="text-xs">
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {order.orderType === 'dine-in' && (
            <Select>
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue placeholder="Covers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <SelectItem key={n} value={n.toString()} className="text-xs">
                    {n} Pax
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {order.orderType === 'delivery' && (
            <Input placeholder="Customer Phone" className="h-7 text-xs" />
          )}
        </div>
        {order.orderType === 'delivery' && (
          <div className="flex gap-2">
            <Input placeholder="Customer Name" className="h-7 text-xs flex-1" />
            <Input placeholder="Address" className="h-7 text-xs flex-1" />
          </div>
        )}
      </div>

      {/* Items Header */}
      <div className="grid grid-cols-12 gap-1 px-2 py-1.5 bg-muted/50 text-[10px] font-medium text-muted-foreground uppercase">
        <div className="col-span-1"></div>
        <div className="col-span-5">Item</div>
        <div className="col-span-3 text-center">Qty</div>
        <div className="col-span-3 text-right">Price</div>
      </div>

      {/* Order Items - Compact List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {order.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Utensils className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">No items added</p>
            </div>
          ) : (
            order.items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
                formatPrice={formatPrice}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-2 border-t border-border flex gap-1.5 flex-wrap">
        <Badge variant="outline" className="cursor-pointer hover:bg-accent text-[10px] py-0.5">
          Add Note
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-accent text-[10px] py-0.5">
          Item Discount
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-accent text-[10px] py-0.5">
          Hold
        </Badge>
      </div>
    </div>
  );
}

interface OrderItemRowProps {
  item: OrderItem;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number) => string;
}

function OrderItemRow({ item, onUpdateQuantity, onRemove, formatPrice }: OrderItemRowProps) {
  return (
    <div className="grid grid-cols-12 gap-1 px-2 py-1.5 items-center hover:bg-accent/30 group">
      {/* Remove Button */}
      <div className="col-span-1">
        <button
          onClick={() => onRemove(item.id)}
          className="p-0.5 rounded text-destructive hover:bg-destructive/10 opacity-60 group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Item Name */}
      <div className="col-span-5">
        <span className="text-xs font-medium line-clamp-1">{item.menuItem.name}</span>
        {item.modifiers.length > 0 && (
          <span className="text-[10px] text-muted-foreground block">
            {item.modifiers.map(m => m.name).join(', ')}
          </span>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="col-span-3 flex items-center justify-center gap-0.5">
        <button
          onClick={() => onUpdateQuantity(item.id, -1)}
          className="h-5 w-5 flex items-center justify-center rounded border hover:bg-muted"
        >
          <Minus className="h-2.5 w-2.5" />
        </button>
        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="h-5 w-5 flex items-center justify-center rounded border hover:bg-muted"
        >
          <Plus className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Price */}
      <div className="col-span-3 text-right">
        <span className="text-xs font-mono font-medium">{formatPrice(item.subtotal)}</span>
      </div>
    </div>
  );
}
