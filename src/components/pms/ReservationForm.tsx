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
import { CalendarIcon, User, Minus, Plus, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import type { Reservation, RoomType, Guest } from '@/types/pms';

const reservationSchema = z.object({
  guestFirstName: z.string().min(1, 'First name required'),
  guestLastName: z.string().min(1, 'Last name required'),
  guestEmail: z.string().email('Valid email required').or(z.literal('')),
  guestPhone: z.string().min(1, 'Phone required'),
  guestAddress: z.string().optional(),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  roomType: z.enum(['standard', 'deluxe', 'suite', 'executive', 'presidential']),
  checkIn: z.date(),
  checkOut: z.date(),
  adults: z.number().min(1).max(10),
  children: z.number().min(0).max(10),
  source: z.enum(['direct', 'booking', 'expedia', 'airbnb', 'phone', 'walk-in', 'makemytrip', 'goibibo']),
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
  { value: 'standard', label: 'Standard Room', baseRate: 1500 },
  { value: 'deluxe', label: 'Deluxe Room', baseRate: 2500 },
  { value: 'suite', label: 'Suite', baseRate: 4000 },
  { value: 'executive', label: 'Executive Suite', baseRate: 6000 },
  { value: 'presidential', label: 'Presidential Suite', baseRate: 10000 },
];

const sources = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'direct', label: 'Direct (Website)' },
  { value: 'booking', label: 'Booking.com' },
  { value: 'makemytrip', label: 'MakeMyTrip' },
  { value: 'goibibo', label: 'Goibibo' },
  { value: 'expedia', label: 'Expedia' },
  { value: 'airbnb', label: 'Airbnb' },
];

const idTypes = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving', label: 'Driving License' },
  { value: 'voter', label: 'Voter ID' },
  { value: 'pan', label: 'PAN Card' },
];

export function ReservationForm({
  open,
  onClose,
  onSubmit,
  initialData,
  guests = [],
}: ReservationFormProps) {
  
  const defaultValues: Partial<ReservationFormData> = {
    guestFirstName: initialData?.guest?.firstName || '',
    guestLastName: initialData?.guest?.lastName || '',
    guestEmail: initialData?.guest?.email || '',
    guestPhone: initialData?.guest?.phone || '',
    guestAddress: initialData?.guest?.address || '',
    idType: initialData?.guest?.idType || '',
    idNumber: initialData?.guest?.idNumber || '',
    roomType: initialData?.roomType || 'deluxe',
    checkIn: initialData?.checkIn || new Date(),
    checkOut: initialData?.checkOut || addDays(new Date(), 1),
    adults: initialData?.adults || 2,
    children: initialData?.children || 0,
    source: initialData?.source || 'walk-in',
    ratePerNight: initialData?.ratePerNight || 2500,
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
      address: data.guestAddress,
      idType: data.idType as any,
      idNumber: data.idNumber,
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
    onClose();
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData?.id ? 'Edit Reservation' : 'New Reservation'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-2">
          {/* Guest Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">
              <User className="h-4 w-4" />
              Guest Information
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestFirstName">First Name *</Label>
                <Input
                  id="guestFirstName"
                  {...register('guestFirstName')}
                  placeholder="First name"
                />
                {errors.guestFirstName && (
                  <p className="text-destructive text-xs">{errors.guestFirstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guestLastName">Last Name *</Label>
                <Input
                  id="guestLastName"
                  {...register('guestLastName')}
                  placeholder="Last name"
                />
                {errors.guestLastName && (
                  <p className="text-destructive text-xs">{errors.guestLastName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Mobile *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guestPhone"
                    className="pl-9"
                    {...register('guestPhone')}
                    placeholder="+91 98765 43210"
                  />
                </div>
                {errors.guestPhone && (
                  <p className="text-destructive text-xs">{errors.guestPhone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guestEmail"
                    type="email"
                    className="pl-9"
                    {...register('guestEmail')}
                    placeholder="guest@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>ID Type</Label>
                <Select value={watch('idType')} onValueChange={v => setValue('idType', v)}>
                  <SelectTrigger>
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {idTypes.map(id => (
                      <SelectItem key={id.value} value={id.value}>{id.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  {...register('idNumber')}
                  placeholder="ID number"
                />
              </div>
              
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="guestAddress">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guestAddress"
                    className="pl-9"
                    {...register('guestAddress')}
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Stay Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">
              <CalendarIcon className="h-4 w-4" />
              Stay Details
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'dd MMM yyyy') : 'Select'}
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
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'dd MMM yyyy') : 'Select'}
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
                        {rt.label} (₹{rt.baseRate})
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
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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
                    className="h-9 w-9"
                    onClick={() => setValue('adults', Math.max(1, adults - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{adults}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
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
                    className="h-9 w-9"
                    onClick={() => setValue('children', Math.max(0, children - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{children}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setValue('children', Math.min(10, children + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ratePerNight">Rate/Night (₹)</Label>
                <Input
                  id="ratePerNight"
                  type="number"
                  {...register('ratePerNight', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
          
          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests / Notes</Label>
            <Textarea
              id="specialRequests"
              {...register('specialRequests')}
              placeholder="Any special requests..."
              rows={2}
            />
          </div>
          
          {/* Summary Card */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dates</span>
                <p className="font-semibold">{checkIn && format(checkIn, 'dd MMM')} - {checkOut && format(checkOut, 'dd MMM')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duration</span>
                <p className="font-semibold">{nights} night(s)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Guests</span>
                <p className="font-semibold">{adults} Adults, {children} Children</p>
              </div>
              <div>
                <span className="text-muted-foreground">Room</span>
                <p className="font-semibold capitalize">{roomType}</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-primary/20">
              <span className="font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData?.id ? 'Update Reservation' : 'Create Reservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
