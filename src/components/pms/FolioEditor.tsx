import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Plus, Minus, CreditCard, DollarSign, Receipt, Printer, Download } from 'lucide-react';
import type { Folio, FolioItem, FolioItemType } from '@/types/pms';

interface FolioEditorProps {
  folio: Folio;
  guestName: string;
  roomNumber?: string;
  onAddCharge: (item: Partial<FolioItem>) => void;
  onAddPayment: (amount: number, method: string) => void;
  onRefund?: (itemId: string, amount: number) => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  className?: string;
}

const chargeCategories: { value: FolioItemType; label: string }[] = [
  { value: 'room', label: 'Room Charge' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'beverage', label: 'Mini Bar' },
  { value: 'service', label: 'Service' },
  { value: 'tax', label: 'Tax' },
];

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit Card' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export function FolioEditor({
  folio,
  guestName,
  roomNumber,
  onAddCharge,
  onAddPayment,
  onRefund,
  onPrint,
  onExportPDF,
  className,
}: FolioEditorProps) {
  const [showAddCharge, setShowAddCharge] = React.useState(false);
  const [showAddPayment, setShowAddPayment] = React.useState(false);
  
  const [chargeType, setChargeType] = React.useState<FolioItemType>('service');
  const [chargeDescription, setChargeDescription] = React.useState('');
  const [chargeAmount, setChargeAmount] = React.useState('');
  const [chargeQuantity, setChargeQuantity] = React.useState(1);
  
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  
  const handleAddCharge = () => {
    if (!chargeDescription || !chargeAmount) return;
    
    onAddCharge({
      type: chargeType,
      description: chargeDescription,
      quantity: chargeQuantity,
      unitPrice: parseFloat(chargeAmount),
      amount: parseFloat(chargeAmount) * chargeQuantity,
      date: new Date(),
    });
    
    setChargeDescription('');
    setChargeAmount('');
    setChargeQuantity(1);
    setShowAddCharge(false);
  };
  
  const handleAddPayment = () => {
    if (!paymentAmount) return;
    
    onAddPayment(parseFloat(paymentAmount), paymentMethod);
    setPaymentAmount('');
    setShowAddPayment(false);
  };
  
  const charges = folio.items.filter(i => i.amount > 0);
  const payments = folio.items.filter(i => i.amount < 0);
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{guestName}</h2>
          {roomNumber && (
            <p className="text-muted-foreground">Room {roomNumber}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
      
      {/* Balance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Total Charges</div>
          <div className="text-2xl font-semibold text-foreground">
            ₹{folio.totalCharges.toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Payments</div>
          <div className="text-2xl font-semibold text-success">
            ₹{folio.totalPayments.toFixed(2)}
          </div>
        </div>
        <div className={cn(
          "p-4 rounded-lg",
          folio.balance > 0 ? "bg-destructive/10" : "bg-success/10"
        )}>
          <div className="text-sm text-muted-foreground">Balance Due</div>
          <div className={cn(
            "text-2xl font-semibold",
            folio.balance > 0 ? "text-destructive" : "text-success"
          )}>
            ₹{folio.balance.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Charges Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Charges
          </h3>
          <Button size="sm" onClick={() => setShowAddCharge(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Charge
          </Button>
        </div>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No charges yet
                  </TableCell>
                </TableRow>
              ) : (
                charges.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{format(item.date, 'MMM d, HH:mm')}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Payments Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </h3>
          <Button size="sm" variant="outline" onClick={() => setShowAddPayment(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No payments yet
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{format(item.date, 'MMM d, HH:mm')}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right font-medium text-success">
                      ₹{Math.abs(item.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Add Charge Dialog */}
      <Dialog open={showAddCharge} onOpenChange={setShowAddCharge}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Charge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={chargeType} onValueChange={v => setChargeType(v as FolioItemType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chargeCategories.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={chargeDescription}
                onChange={e => setChargeDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setChargeQuantity(q => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{chargeQuantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setChargeQuantity(q => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Price (₹)</label>
                <Input
                  type="number"
                  value={chargeAmount}
                  onChange={e => setChargeAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {chargeAmount && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-semibold">
                    ₹{(parseFloat(chargeAmount || '0') * chargeQuantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCharge(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCharge} disabled={!chargeDescription || !chargeAmount}>
              Add Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Payment Dialog */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span>₹{folio.balance.toFixed(2)}</span>
              </div>
              {paymentAmount && (
                <div className="flex justify-between font-semibold">
                  <span>New Balance:</span>
                  <span>₹{Math.max(0, folio.balance - parseFloat(paymentAmount || '0')).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPayment(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment} disabled={!paymentAmount}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
