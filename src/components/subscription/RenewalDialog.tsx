import { useState } from 'react';
import { CreditCard, Building2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BranchSubscription, SUBSCRIPTION_PRICING } from '@/store/subscriptionStore';

interface RenewalDialogProps {
  open: boolean;
  onClose: () => void;
  branches: BranchSubscription[];
  onConfirm: (branchIds: string[], plan: '1_year' | '3_year') => void;
}

export function RenewalDialog({ open, onClose, branches, onConfirm }: RenewalDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<'1_year' | '3_year'>('1_year');

  const totalAmount = branches.length * SUBSCRIPTION_PRICING[selectedPlan];
  const perBranchAmount = SUBSCRIPTION_PRICING[selectedPlan];

  const handleConfirm = () => {
    onConfirm(branches.map(b => b.branchId), selectedPlan);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Renew Subscription</DialogTitle>
          <DialogDescription>
            Renew subscription for {branches.length} {branches.length === 1 ? 'branch' : 'branches'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selected Branches */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Branches</Label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {branches.map((branch) => (
                <div key={branch.branchId} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{branch.branchName}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Plan</Label>
            <RadioGroup
              value={selectedPlan}
              onValueChange={(v) => setSelectedPlan(v as '1_year' | '3_year')}
              className="space-y-2"
            >
              <div 
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPlan === '1_year' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedPlan('1_year')}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="1_year" id="1_year" />
                  <div>
                    <p className="font-medium">1 Year Plan</p>
                    <p className="text-sm text-muted-foreground">₹15,000 per branch</p>
                  </div>
                </div>
                {selectedPlan === '1_year' && <Check className="h-5 w-5 text-primary" />}
              </div>
              <div 
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPlan === '3_year' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedPlan('3_year')}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="3_year" id="3_year" />
                  <div>
                    <p className="font-medium">3 Year Plan</p>
                    <p className="text-sm text-muted-foreground">₹36,000 per branch</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/10 text-success border-0">Save 20%</Badge>
                  {selectedPlan === '3_year' && <Check className="h-5 w-5 text-primary" />}
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Per Branch</span>
              <span>₹{perBranchAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of Branches</span>
              <span>× {branches.length}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ₹{totalAmount.toLocaleString()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
