export interface PriceVariant {
  id: string;
  name: 'full' | 'half' | 'quarter';
  label: string;
  price: number;
  takeawayPrice?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  takeawayPrice?: number;
  categoryId: string;
  isAvailable: boolean;
  hasModifiers: boolean;
  image?: string;
  isVeg?: boolean;
  isFavorite?: boolean;
  // Portion pricing
  hasVariants?: boolean;
  priceVariants?: PriceVariant[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
  isMandatory: boolean;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  modifiers: Modifier[];
  notes?: string;
  subtotal: number;
  // Variant selection
  selectedVariant?: PriceVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  serviceCharge: number;
  tax: number;
  taxInclusive: boolean;
  rounding: number;
  grandTotal: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  status: 'active' | 'kot-sent' | 'billed' | 'settled' | 'void';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'upi' | 'other';
  icon: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  timestamp: Date;
}

export interface ShiftInfo {
  id: string;
  shiftNumber: number;
  openedAt: Date;
  openedBy: string;
  openingCash: number;
  status: 'open' | 'closed';
  closedAt?: Date;
  closingCash?: number;
  variance?: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingCount: number;
  isSyncing: boolean;
}

export type UserRole = 'cashier' | 'manager' | 'admin' | 'kitchen' | 'owner';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Outlet {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel';
  address?: string;
}
