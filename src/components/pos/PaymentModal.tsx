import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Banknote,
  CreditCard,
  Smartphone,
  Check,
  X,
} from 'lucide-react';
import type { Order, PaymentMethod, Payment } from '@/types/pos';
import { cn } from '@/lib/utils';

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', type: 'cash', icon: 'banknote' },
  { id: 'card', name: 'Card', type: 'card', icon: 'credit-card' },
  { id: 'upi', name: 'UPI', type: 'upi', icon: 'smartphone' },
];

const quickAmounts = [100, 500, 1000, 2000];

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onPaymentComplete: (payments: Payment[]) => void;
}

export function PaymentModal({ open, onClose, order, onPaymentComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [amount, setAmount] = useState<string>('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reference, setReference] = useState<string>('');

  const balanceDue = order.grandTotal - order.paidAmount - payments.reduce((sum, p) => sum + p.amount, 0);
  const currentPaymentTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'cash':
        return Banknote;
      case 'card':
        return CreditCard;
      case 'upi':
        return Smartphone;
      default:
        return Banknote;
    }
  };

  const handleAddPayment = () => {
    const paymentAmount = parseFloat(amount) || balanceDue;
    if (paymentAmount <= 0) return;

    const method = paymentMethods.find(m => m.id === selectedMethod)!;
    const newPayment: Payment = {
      id: Date.now().toString(),
      orderId: order.id,
      method,
      amount: Math.min(paymentAmount, balanceDue),
      reference: reference || undefined,
      timestamp: new Date(),
    };

    setPayments([...payments, newPayment]);
    setAmount('');
    setReference('');
  };

  const handleRemovePayment = (paymentId: string) => {
    setPayments(payments.filter(p => p.id !== paymentId));
  };

  const handleComplete = () => {
    onPaymentComplete(payments);
    onClose();
    setPayments([]);
    setAmount('');
    setReference('');
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleExactAmount = () => {
    setAmount(balanceDue.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Total</span>
              <span className="font-mono">{formatPrice(order.grandTotal)}</span>
            </div>
            {order.paidAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Previously Paid</span>
                <span className="font-mono text-success">{formatPrice(order.paidAmount)}</span>
              </div>
            )}
            {currentPaymentTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Payments</span>
                <span className="font-mono text-success">{formatPrice(currentPaymentTotal)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Balance Due</span>
              <span className="amount-primary font-mono">
                {formatPrice(balanceDue)}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = getMethodIcon(method);
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" className="text-sm text-muted-foreground mb-2 block">
              Amount
            </Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder={balanceDue.toFixed(2)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono text-lg"
              />
              <Button variant="outline" onClick={handleExactAmount}>
                Exact
              </Button>
            </div>
            
            {/* Quick Amounts */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(qa)}
                  className="flex-1"
                >
                  {formatPrice(qa)}
                </Button>
              ))}
            </div>
          </div>

          {/* Reference (for card/upi) */}
          {selectedMethod !== 'cash' && (
            <div>
              <Label htmlFor="reference" className="text-sm text-muted-foreground mb-2 block">
                Reference / Transaction ID
              </Label>
              <Input
                id="reference"
                placeholder="Enter reference number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          )}

          {/* Add Payment Button */}
          <Button
            variant="secondary"
            onClick={handleAddPayment}
            disabled={balanceDue <= 0}
            className="w-full"
          >
            Add Payment
          </Button>

          {/* Current Payments */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Payments Added</Label>
              <div className="space-y-2">
                {payments.map((payment) => {
                  const Icon = getMethodIcon(payment.method);
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{payment.method.name}</span>
                          {payment.reference && (
                            <span className="text-xs text-muted-foreground ml-2">
                              Ref: {payment.reference}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono">{formatPrice(payment.amount)}</span>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => handleRemovePayment(payment.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Payment */}
          <Button
            variant="posSuccess"
            size="lg"
            onClick={handleComplete}
            disabled={balanceDue > 0 || payments.length === 0}
            className="w-full gap-2"
          >
            <Check className="h-5 w-5" />
            Complete Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
