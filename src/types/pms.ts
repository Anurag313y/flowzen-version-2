// Hotel PMS Types

export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'executive' | 'presidential';
export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type HousekeepingStatus = 'clean' | 'dirty' | 'inspected' | 'out_of_order';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'deferred';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type FolioItemType = 'room' | 'food' | 'beverage' | 'service' | 'tax' | 'discount' | 'payment';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  housekeepingStatus: HousekeepingStatus;
  maxOccupancy: number;
  baseRate: number;
  amenities: string[];
  notes?: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  idType?: string;
  idNumber?: string;
  vipLevel?: number;
  notes?: string;
  totalStays: number;
  totalSpent: number;
  createdAt: Date;
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  guestId: string;
  guest: Guest;
  roomId?: string;
  room?: Room;
  roomType: RoomType;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  source: 'direct' | 'booking' | 'expedia' | 'airbnb' | 'phone' | 'walk-in' | 'makemytrip' | 'goibibo';
  ratePerNight: number;
  totalAmount: number;
  paidAmount: number;
  specialRequests?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolioItem {
  id: string;
  reservationId: string;
  type: FolioItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  date: Date;
  postedBy?: string;
  refundedAmount?: number;
}

export interface Folio {
  id: string;
  reservationId: string;
  items: FolioItem[];
  totalCharges: number;
  totalPayments: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  room: Room;
  status: HousekeepingStatus;
  priority: 'normal' | 'rush' | 'vip';
  assignedTo?: string;
  notes?: string;
  checkoutTime?: Date;
  completedAt?: Date;
  inspectedBy?: string;
}

export interface MaintenanceTicket {
  id: string;
  roomId?: string;
  room?: Room;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'furniture' | 'appliance' | 'other';
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo?: string;
  reportedBy: string;
  createdAt: Date;
  resolvedAt?: Date;
  cost?: number;
}

export interface RoomRateCalendar {
  roomType: RoomType;
  date: Date;
  rate: number;
  available: number;
  minStay: number;
  closed: boolean;
}

export interface RoomBlock {
  id: string;
  name: string;
  roomType: RoomType;
  startDate: Date;
  endDate: Date;
  roomCount: number;
  pickedUp: number;
  cutoffDate: Date;
  rate: number;
  notes?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'ota' | 'gds' | 'direct' | 'corporate';
  connected: boolean;
  lastSync?: Date;
  commission: number;
}

export interface DashboardStats {
  occupancyRate: number;
  arrivals: number;
  departures: number;
  stayovers: number;
  availableRooms: number;
  outOfOrder: number;
  revpar: number;
  adr: number;
  revenue: {
    rooms: number;
    fb: number;
    other: number;
    total: number;
  };
}

// API Query Types
export interface ReservationFilters {
  from?: Date;
  to?: Date;
  status?: ReservationStatus;
  roomType?: RoomType;
  source?: string;
  search?: string;
}

export interface AvailabilityQuery {
  from: Date;
  to: Date;
  roomType?: RoomType;
}

export interface AvailabilityResult {
  date: Date;
  roomType: RoomType;
  available: number;
  rate: number;
  minStay: number;
}
