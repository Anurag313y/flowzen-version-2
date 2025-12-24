import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { CheckCircle, Circle, AlertCircle, User, Bed, Clock } from 'lucide-react';
import type { Reservation, Room } from '@/types/pms';

interface CheckInFlowProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  availableRooms: Room[];
  onComplete: (reservationId: string, roomId: string) => void;
}

interface CheckOutFlowProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onComplete: (reservationId: string) => void;
}

// Check-in Flow Component
export function CheckInFlow({
  open,
  onClose,
  reservation,
  availableRooms,
  onComplete,
}: CheckInFlowProps) {
  const [step, setStep] = React.useState(1);
  const [selectedRoom, setSelectedRoom] = React.useState<string>('');
  const [verifications, setVerifications] = React.useState({
    idVerified: false,
    paymentVerified: false,
    guestSigned: false,
  });
  
  const filteredRooms = availableRooms.filter(
    r => r.type === reservation?.roomType && r.status === 'available' && r.housekeepingStatus === 'clean'
  );
  
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedRoom('');
      setVerifications({ idVerified: false, paymentVerified: false, guestSigned: false });
    }
  }, [open]);
  
  const canProceed = () => {
    switch (step) {
      case 1:
        return verifications.idVerified;
      case 2:
        return verifications.paymentVerified;
      case 3:
        return selectedRoom !== '';
      case 4:
        return verifications.guestSigned;
      default:
        return false;
    }
  };
  
  const handleComplete = () => {
    if (reservation && selectedRoom) {
      onComplete(reservation.id, selectedRoom);
      onClose();
    }
  };
  
  if (!reservation) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Check-in: {reservation.guest.firstName} {reservation.guest.lastName}</DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {['ID', 'Payment', 'Room', 'Keys'].map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  step > idx + 1
                    ? "bg-success text-success-foreground"
                    : step === idx + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {step > idx + 1 ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{idx + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-1">{label}</span>
              </div>
              {idx < 3 && (
                <div className={cn(
                  "w-8 h-0.5 mb-6",
                  step > idx + 1 ? "bg-success" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="space-y-4 py-4">
          {/* Step 1: ID Verification */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Guest Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    {reservation.guest.firstName} {reservation.guest.lastName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    {reservation.guest.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{' '}
                    {reservation.guest.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confirmation:</span>{' '}
                    {reservation.confirmationNumber}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="idVerified"
                  checked={verifications.idVerified}
                  onCheckedChange={checked => 
                    setVerifications(v => ({ ...v, idVerified: checked as boolean }))
                  }
                />
                <label htmlFor="idVerified" className="text-sm font-medium">
                  I have verified the guest's ID matches the reservation
                </label>
              </div>
            </div>
          )}
          
          {/* Step 2: Payment Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Room ({reservation.nights} nights × ${reservation.ratePerNight})</span>
                    <span>${reservation.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>Paid</span>
                    <span>-${reservation.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Balance Due</span>
                    <span className={reservation.totalAmount - reservation.paidAmount > 0 ? 'text-destructive' : ''}>
                      ${(reservation.totalAmount - reservation.paidAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paymentVerified"
                  checked={verifications.paymentVerified}
                  onCheckedChange={checked => 
                    setVerifications(v => ({ ...v, paymentVerified: checked as boolean }))
                  }
                />
                <label htmlFor="paymentVerified" className="text-sm font-medium">
                  Payment has been collected or credit card is on file
                </label>
              </div>
            </div>
          )}
          
          {/* Step 3: Room Assignment */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                <span>Requested: {reservation.roomType} room</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Room</label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a room..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRooms.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No clean rooms available for this type
                      </div>
                    ) : (
                      filteredRooms.map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.number} - {room.type} (Floor {room.floor})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {filteredRooms.length === 0 && (
                <div className="p-3 bg-warning/10 text-warning rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Consider upgrading guest to available room type</span>
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Key Assignment */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                <h4 className="font-semibold">Ready for Check-in</h4>
                <p className="text-sm text-muted-foreground">
                  Room {availableRooms.find(r => r.id === selectedRoom)?.number}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="guestSigned"
                  checked={verifications.guestSigned}
                  onCheckedChange={checked => 
                    setVerifications(v => ({ ...v, guestSigned: checked as boolean }))
                  }
                />
                <label htmlFor="guestSigned" className="text-sm font-medium">
                  Guest has signed registration card and received room keys
                </label>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed()}>
              Complete Check-in
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Check-out Flow Component
export function CheckOutFlow({
  open,
  onClose,
  reservation,
  onComplete,
}: CheckOutFlowProps) {
  const [verifications, setVerifications] = React.useState({
    folioReviewed: false,
    paymentSettled: false,
    keysReturned: false,
  });
  
  React.useEffect(() => {
    if (open) {
      setVerifications({ folioReviewed: false, paymentSettled: false, keysReturned: false });
    }
  }, [open]);
  
  const allVerified = Object.values(verifications).every(Boolean);
  
  const handleComplete = () => {
    if (reservation) {
      onComplete(reservation.id);
      onClose();
    }
  };
  
  if (!reservation) return null;
  
  const balance = reservation.totalAmount - reservation.paidAmount;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Check-out: Room {reservation.room?.number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Guest Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {reservation.guest.firstName} {reservation.guest.lastName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {reservation.confirmationNumber}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {reservation.nights} night(s)
                </div>
                <p className="text-sm">
                  {format(reservation.checkIn, 'MMM d')} - {format(reservation.checkOut, 'MMM d')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Balance */}
          <div className={cn(
            "p-4 rounded-lg",
            balance > 0 ? "bg-destructive/10" : "bg-success/10"
          )}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Balance Due</span>
              <span className={cn(
                "text-2xl font-bold",
                balance > 0 ? "text-destructive" : "text-success"
              )}>
                ${balance.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="folioReviewed"
                checked={verifications.folioReviewed}
                onCheckedChange={checked => 
                  setVerifications(v => ({ ...v, folioReviewed: checked as boolean }))
                }
              />
              <label htmlFor="folioReviewed" className="text-sm">
                Folio has been reviewed with guest
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentSettled"
                checked={verifications.paymentSettled}
                onCheckedChange={checked => 
                  setVerifications(v => ({ ...v, paymentSettled: checked as boolean }))
                }
              />
              <label htmlFor="paymentSettled" className="text-sm">
                {balance > 0 
                  ? 'Outstanding balance has been settled'
                  : 'No balance due - payment complete'}
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keysReturned"
                checked={verifications.keysReturned}
                onCheckedChange={checked => 
                  setVerifications(v => ({ ...v, keysReturned: checked as boolean }))
                }
              />
              <label htmlFor="keysReturned" className="text-sm">
                Room keys have been returned
              </label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={!allVerified}>
            Complete Check-out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
