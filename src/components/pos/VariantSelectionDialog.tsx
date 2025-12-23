import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MenuItem, PriceVariant } from '@/types/pos';

interface VariantSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onSelect: (menuItem: MenuItem, variant: PriceVariant) => void;
  isTakeaway?: boolean;
}

// Default variants if item doesn't have custom ones
const defaultVariants: PriceVariant[] = [
  { id: 'full', name: 'full', label: 'Full', price: 0 },
  { id: 'half', name: 'half', label: 'Half', price: 0 },
  { id: 'quarter', name: 'quarter', label: 'Quarter', price: 0 },
];

export function VariantSelectionDialog({
  open,
  onClose,
  menuItem,
  onSelect,
  isTakeaway = false,
}: VariantSelectionDialogProps) {
  const [selectedVariant, setSelectedVariant] = useState<PriceVariant | null>(null);

  if (!menuItem) return null;

  // Get variants - use item's variants or generate from base price
  const variants: PriceVariant[] = menuItem.priceVariants?.length
    ? menuItem.priceVariants
    : [
        {
          id: 'full',
          name: 'full',
          label: 'Full',
          price: menuItem.price,
          takeawayPrice: menuItem.takeawayPrice,
        },
        {
          id: 'half',
          name: 'half',
          label: 'Half',
          price: Math.round(menuItem.price * 0.6),
          takeawayPrice: menuItem.takeawayPrice ? Math.round(menuItem.takeawayPrice * 0.6) : undefined,
        },
        {
          id: 'quarter',
          name: 'quarter',
          label: 'Quarter',
          price: Math.round(menuItem.price * 0.35),
          takeawayPrice: menuItem.takeawayPrice ? Math.round(menuItem.takeawayPrice * 0.35) : undefined,
        },
      ];

  const getPrice = (variant: PriceVariant) => {
    if (isTakeaway && variant.takeawayPrice) {
      return variant.takeawayPrice;
    }
    return variant.price;
  };

  const handleSelect = () => {
    if (selectedVariant) {
      onSelect(menuItem, selectedVariant);
      setSelectedVariant(null);
      onClose();
    }
  };

  const handleVariantClick = (variant: PriceVariant) => {
    // Quick select - immediately add to order
    onSelect(menuItem, variant);
    setSelectedVariant(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => { setSelectedVariant(null); onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">{menuItem.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">Select portion size:</p>
          
          <div className="grid grid-cols-3 gap-2">
            {variants.map((variant) => {
              const price = getPrice(variant);
              const isSelected = selectedVariant?.id === variant.id;
              
              return (
                <button
                  key={variant.id}
                  onClick={() => handleVariantClick(variant)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  )}
                >
                  <span className="text-sm font-semibold mb-1">{variant.label}</span>
                  <span className="text-lg font-bold text-primary">₹{price}</span>
                  {variant.name === 'full' && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      Popular
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
