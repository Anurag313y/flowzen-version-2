import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Minus, Plus } from 'lucide-react';
import type { Reservation, RoomType, Guest } from '@/types/pms';

const reservationSchema = z.object({
  guestFirstName: z.string().min(1, 'First name required'),
  guestLastName: z.string().min(1, 'Last name required'),
  guestEmail: z.string().email('Valid email required'),
  guestPhone: z.string().min(1, 'Phone required'),
  roomType: z.enum(['standard', 'deluxe', 'suite', 'executive', 'presidential']),
  checkIn: z.date(),
  checkOut: z.date(),
  adults: z.number().min(1).max(10),
  children: z.number().min(0).max(10),
  source: z.enum(['direct', 'booking', 'expedia', 'airbnb', 'phone', 'walk-in']),
  ratePerNight: z.number().min(0),
  specialRequests: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Reservation>) => void;
  initialData?: Partial<Reservation>;
  guests?: Guest[];
}

const roomTypes: { value: RoomType; label: string; baseRate: number }[] = [
  { value: 'standard', label: 'Standard Room', baseRate: 120 },
  { value: 'deluxe', label: 'Deluxe Room', baseRate: 180 },
  { value: 'suite', label: 'Suite', baseRate: 280 },
  { value: 'executive', label: 'Executive Suite', baseRate: 380 },
  { value: 'presidential', label: 'Presidential Suite', baseRate: 580 },
];

const sources = [
  { value: 'direct', label: 'Direct Booking' },
  { value: 'booking', label: 'Booking.com' },
  { value: 'expedia', label: 'Expedia' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'phone', label: 'Phone' },
  { value: 'walk-in', label: 'Walk-in' },
];

export function ReservationForm({
  open,
  onClose,
  onSubmit,
  initialData,
  guests = [],
}: ReservationFormProps) {
  const [step, setStep] = React.useState(1);
  
  const defaultValues: Partial<ReservationFormData> = {
    guestFirstName: initialData?.guest?.firstName || '',
    guestLastName: initialData?.guest?.lastName || '',
    guestEmail: initialData?.guest?.email || '',
    guestPhone: initialData?.guest?.phone || '',
    roomType: initialData?.roomType || 'standard',
    checkIn: initialData?.checkIn || new Date(),
    checkOut: initialData?.checkOut || addDays(new Date(), 1),
    adults: initialData?.adults || 2,
    children: initialData?.children || 0,
    source: initialData?.source || 'direct',
    ratePerNight: initialData?.ratePerNight || 120,
    specialRequests: initialData?.specialRequests || '',
  };
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues,
  });
  
  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  const roomType = watch('roomType');
  const ratePerNight = watch('ratePerNight');
  const adults = watch('adults');
  const children = watch('children');
  
  const nights = checkIn && checkOut ? Math.max(1, differenceInDays(checkOut, checkIn)) : 1;
  const totalAmount = nights * (ratePerNight || 0);
  
  React.useEffect(() => {
    const room = roomTypes.find(r => r.value === roomType);
    if (room && !initialData?.ratePerNight) {
      setValue('ratePerNight', room.baseRate);
    }
  }, [roomType, setValue, initialData]);
  
  const handleFormSubmit = (data: ReservationFormData) => {
    const guest: Partial<Guest> = {
      firstName: data.guestFirstName,
      lastName: data.guestLastName,
      email: data.guestEmail,
      phone: data.guestPhone,
    };
    
    onSubmit({
      guest: guest as Guest,
      roomType: data.roomType,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights,
      adults: data.adults,
      children: data.children,
      source: data.source,
      ratePerNight: data.ratePerNight,
      totalAmount,
      specialRequests: data.specialRequests,
    });
    
    reset();
    setStep(1);
    onClose();
  };
  
  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Reservation' : 'New Reservation'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(s)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : step > s
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </button>
              {s < 3 && (
                <div className={cn("w-12 h-0.5", step > s ? "bg-primary" : "bg-muted")} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Step 1: Guest Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Guest Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestFirstName">First Name *</Label>
                  <Input
                    id="guestFirstName"
                    {...register('guestFirstName')}
                    placeholder="John"
                  />
                  {errors.guestFirstName && (
                    <p className="text-destructive text-sm">{errors.guestFirstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guestLastName">Last Name *</Label>
                  <Input
                    id="guestLastName"
                    {...register('guestLastName')}
                    placeholder="Smith"
                  />
                  {errors.guestLastName && (
                    <p className="text-destructive text-sm">{errors.guestLastName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    {...register('guestEmail')}
                    placeholder="john@example.com"
                  />
                  {errors.guestEmail && (
                    <p className="text-destructive text-sm">{errors.guestEmail.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Phone *</Label>
                  <Input
                    id="guestPhone"
                    {...register('guestPhone')}
                    placeholder="+1 555 0000"
                  />
                  {errors.guestPhone && (
                    <p className="text-destructive text-sm">{errors.guestPhone.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Stay Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Stay Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={d => d && setValue('checkIn', d)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={d => d && setValue('checkOut', d)}
                        disabled={d => d <= checkIn}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={roomType} onValueChange={v => setValue('roomType', v as RoomType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(rt => (
                        <SelectItem key={rt.value} value={rt.value}>
                          {rt.label} (${rt.baseRate}/night)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={watch('source')} onValueChange={v => setValue('source', v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setValue('adults', Math.max(1, adults - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{adults}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setValue('adults', Math.min(10, adults + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Children</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setValue('children', Math.max(0, children - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{children}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setValue('children', Math.min(10, children + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span className="font-medium">{nights} night(s)</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Rate & Notes */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Rate & Notes</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ratePerNight">Rate per Night ($)</Label>
                  <Input
                    id="ratePerNight"
                    type="number"
                    {...register('ratePerNight', { valueAsNumber: true })}
                  />
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg flex flex-col justify-center">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold text-primary">
                    ${totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  {...register('specialRequests')}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>
              
              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <div className="font-semibold mb-2">Reservation Summary</div>
                <div className="flex justify-between">
                  <span>Guest:</span>
                  <span>{watch('guestFirstName')} {watch('guestLastName')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>{checkIn && format(checkIn, 'MMM d')} - {checkOut && format(checkOut, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Type:</span>
                  <span className="capitalize">{roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{adults} adults, {children} children</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(s => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  {initialData?.id ? 'Update' : 'Create'} Reservation
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
