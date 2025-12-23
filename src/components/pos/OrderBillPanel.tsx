import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Minus, 
  Plus, 
  X, 
  Utensils, 
  ShoppingBag, 
  Truck, 
  ChefHat, 
  Printer,
  CreditCard,
  User,
  Phone,
} from 'lucide-react';
import type { Order, OrderItem } from '@/types/pos';
import { cn } from '@/lib/utils';

interface OrderBillPanelProps {
  order: Order;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOrderTypeChange: (type: Order['orderType']) => void;
  onTableChange: (table: string) => void;
  onPrintSaveKOT: () => void;
  onSettleBill: () => void;
  customerName: string;
  customerMobile: string;
  onCustomerNameChange: (name: string) => void;
  onCustomerMobileChange: (mobile: string) => void;
}

const tables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];

export function OrderBillPanel({
  order,
  onUpdateQuantity,
  onRemoveItem,
  onOrderTypeChange,
  onTableChange,
  onPrintSaveKOT,
  onSettleBill,
  customerName,
  customerMobile,
  onCustomerNameChange,
  onCustomerMobileChange,
}: OrderBillPanelProps) {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  
  const isLocked = order.status === 'settled' || order.status === 'void';
  const canSettle = order.items.length > 0 && order.paymentStatus !== 'paid';

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Order Type Tabs */}
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
              "flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
              order.orderType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Customer & Order Details */}
      <div className="p-3 border-b border-border space-y-2">
        {/* Customer Info */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="h-8 text-xs pl-8"
            />
          </div>
          <div className="flex-1 relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Mobile Number"
              value={customerMobile}
              onChange={(e) => onCustomerMobileChange(e.target.value)}
              className="h-8 text-xs pl-8"
            />
          </div>
        </div>

        {/* Table Selection for Dine-in */}
        {order.orderType === 'dine-in' && (
          <div className="flex gap-2">
            <Select value={order.tableNumber || ''} onValueChange={onTableChange}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table} value={table} className="text-xs">
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-8 text-xs flex-1">
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
          </div>
        )}

        {/* Delivery Address */}
        {order.orderType === 'delivery' && (
          <Input placeholder="Delivery Address" className="h-8 text-xs" />
        )}
      </div>

      {/* Items Header */}
      <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-muted/50 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        <div className="col-span-1"></div>
        <div className="col-span-5">Item</div>
        <div className="col-span-3 text-center">Qty</div>
        <div className="col-span-3 text-right">Amount</div>
      </div>

      {/* Order Items */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="divide-y divide-border">
          {order.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Utensils className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No items added</p>
              <p className="text-xs opacity-60">Select items from menu</p>
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

      {/* Bill Summary */}
      <div className="border-t border-border p-3 space-y-1.5 bg-muted/30">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono">{formatPrice(order.subtotal)}</span>
        </div>

        {order.serviceCharge > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Service (5%)</span>
            <span className="font-mono">{formatPrice(order.serviceCharge)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Tax (5%)</span>
          <span className="font-mono">{formatPrice(order.tax)}</span>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">Grand Total</span>
          <span className="text-xl font-bold font-mono text-primary">
            {formatPrice(order.grandTotal)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-t border-border space-y-2">
        <Button
          onClick={onPrintSaveKOT}
          disabled={order.items.length === 0 || isLocked}
          className="w-full h-11 text-sm gap-2 bg-amber-500 hover:bg-amber-600 text-white"
        >
          <ChefHat className="h-4 w-4" />
          <Printer className="h-4 w-4" />
          Print & Save KOT
        </Button>
        
        <Button
          onClick={onSettleBill}
          disabled={!canSettle}
          className="w-full h-11 text-sm gap-2 bg-primary hover:bg-primary/90"
        >
          <CreditCard className="h-4 w-4" />
          Settle Bill
        </Button>
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
    <div className="grid grid-cols-12 gap-1 px-3 py-2 items-center hover:bg-accent/30 group">
      {/* Remove Button */}
      <div className="col-span-1">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 rounded text-destructive hover:bg-destructive/10 opacity-60 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Item Name */}
      <div className="col-span-5">
        <span className="text-sm font-medium line-clamp-1">
          {item.menuItem.name}
          {item.selectedVariant && (
            <span className="text-muted-foreground text-xs ml-1">({item.selectedVariant.label})</span>
          )}
        </span>
        {item.modifiers.length > 0 && (
          <span className="text-[10px] text-muted-foreground block">
            {item.modifiers.map(m => m.name).join(', ')}
          </span>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="col-span-3 flex items-center justify-center gap-1">
        <button
          onClick={() => onUpdateQuantity(item.id, -1)}
          className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Price */}
      <div className="col-span-3 text-right">
        <span className="text-sm font-mono font-semibold">{formatPrice(item.subtotal)}</span>
      </div>
    </div>
  );
}
