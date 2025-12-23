import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Printer,
  FileText,
  CreditCard,
  Split,
  Merge,
  RotateCcw,
  Ban,
  ChefHat,
  Gift,
  Wallet,
  Banknote,
  Smartphone,
  Save,
} from 'lucide-react';
import type { Order } from '@/types/pos';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface BillSummaryPanelProps {
  order: Order;
  onGenerateKOT: () => void;
  onPrintBill: () => void;
  onReprint: () => void;
  onMergeBills: () => void;
  onSplitBill: () => void;
  onNCBill: () => void;
  onVoidBill: () => void;
  onPayment: () => void;
}

export function BillSummaryPanel({
  order,
  onGenerateKOT,
  onPrintBill,
  onMergeBills,
  onSplitBill,
  onNCBill,
  onVoidBill,
  onPayment,
}: BillSummaryPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isPaid, setIsPaid] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const isLocked = order.status === 'settled' || order.status === 'void';
  const canPayment = order.items.length > 0 && order.paymentStatus !== 'paid';

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Bill Breakdown - Compact */}
      <div className="p-3 space-y-1.5 border-b border-border">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono">{formatPrice(order.subtotal)}</span>
        </div>

        {order.discount > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-mono text-success">
              -{formatPrice(order.discountType === 'percentage' 
                ? (order.subtotal * order.discount / 100) 
                : order.discount)}
            </span>
          </div>
        )}

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
          <span className="font-semibold text-sm">Total</span>
          <span className="text-lg font-bold font-mono text-primary">
            {formatPrice(order.grandTotal)}
          </span>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-3 gap-1 p-2 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onSplitBill}
          disabled={order.items.length < 2 || isLocked}
          className="h-7 text-[10px] gap-1"
        >
          <Split className="h-3 w-3" />
          Split
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onMergeBills}
          disabled={isLocked}
          className="h-7 text-[10px] gap-1"
        >
          <Merge className="h-3 w-3" />
          Merge
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLocked}
          className="h-7 text-[10px] gap-1"
        >
          <Gift className="h-3 w-3" />
          BOGO
        </Button>
      </div>

      {/* Payment Methods */}
      <div className="p-2 border-b border-border">
        <div className="flex gap-1 flex-wrap">
          {[
            { id: 'cash', label: 'Cash', icon: Banknote },
            { id: 'card', label: 'Card', icon: CreditCard },
            { id: 'upi', label: 'UPI', icon: Smartphone },
            { id: 'due', label: 'Due', icon: Wallet },
            { id: 'part', label: 'Part', icon: Split },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPaymentMethod(id)}
              className={cn(
                "flex-1 min-w-[50px] py-1.5 rounded text-[10px] font-medium flex items-center justify-center gap-1 border transition-colors",
                paymentMethod === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="p-2 border-b border-border flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="paid"
            checked={isPaid}
            onCheckedChange={(v) => setIsPaid(!!v)}
            className="h-3.5 w-3.5"
          />
          <Label htmlFor="paid" className="text-[10px] cursor-pointer">It's Paid</Label>
        </div>
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="loyalty"
            checked={useLoyalty}
            onCheckedChange={(v) => setUseLoyalty(!!v)}
            className="h-3.5 w-3.5"
          />
          <Label htmlFor="loyalty" className="text-[10px] cursor-pointer text-primary">Loyalty</Label>
        </div>
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="sms"
            checked={sendSMS}
            onCheckedChange={(v) => setSendSMS(!!v)}
            className="h-3.5 w-3.5"
          />
          <Label htmlFor="sms" className="text-[10px] cursor-pointer text-primary">Feedback SMS</Label>
        </div>
      </div>

      {/* NC & Void */}
      <div className="grid grid-cols-2 gap-1 p-2 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onNCBill}
          disabled={isLocked}
          className="h-7 text-[10px] gap-1 text-amber-600 hover:text-amber-700"
        >
          <RotateCcw className="h-3 w-3" />
          NC Bill
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onVoidBill}
          disabled={isLocked || order.paymentStatus === 'paid'}
          className="h-7 text-[10px] gap-1 text-destructive hover:text-destructive"
        >
          <Ban className="h-3 w-3" />
          Void
        </Button>
      </div>

      {/* Main Action Buttons */}
      <div className="p-2 mt-auto space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            onClick={onGenerateKOT}
            disabled={order.items.length === 0 || isLocked}
            className="h-9 text-xs gap-1.5"
          >
            <ChefHat className="h-4 w-4" />
            KOT
          </Button>
          <Button
            variant="outline"
            onClick={onPrintBill}
            disabled={order.items.length === 0}
            className="h-9 text-xs gap-1.5"
          >
            <FileText className="h-4 w-4" />
            Print
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <Button
            className="h-9 text-xs gap-1 bg-muted text-foreground hover:bg-muted/80"
            disabled={order.items.length === 0}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button
            className="h-9 text-xs gap-1 bg-amber-500 text-white hover:bg-amber-600"
            disabled={order.items.length === 0}
          >
            <Printer className="h-3.5 w-3.5" />
            Save & Print
          </Button>
          <Button
            onClick={onPayment}
            disabled={!canPayment}
            className="h-9 text-xs gap-1 bg-success text-success-foreground hover:bg-success/90"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
