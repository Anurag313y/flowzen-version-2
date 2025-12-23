import { create } from 'zustand';
import type { Order, OrderItem, MenuItem } from '@/types/pos';

// Shared helper to generate consistent order numbers
export const generateOrderNumber = () => {
  const date = new Date();
  const num = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `ORD-${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}-${num}`;
};

// Table types
export interface TableOrder {
  orderNumber: string;
  guests: number;
  amount: number;
  startTime: Date;
  items: { id: string; name: string; quantity: number; price: number }[];
  customerName?: string;
  customerMobile?: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: TableOrder;
}

// KOT types
export type ItemStatus = 'pending' | 'preparing' | 'ready';

export interface KOTItem {
  id: string;
  name: string;
  quantity: number;
  status: ItemStatus;
  notes?: string;
}

export interface KOTOrder {
  id: string;
  orderNumber: string;
  table: string;
  time: string;
  isRush: boolean;
  items: KOTItem[];
  customerName?: string;
  customerMobile?: string;
  createdAt: Date;
}

// Unified Order for Orders Page
export type OrderStatus = 'active' | 'kot-sent' | 'billed' | 'paid' | 'void';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface UnifiedOrder {
  id: string;
  orderNumber: string;
  table: string;
  type: OrderType;
  items: { id: string; name: string; quantity: number; price: number }[];
  amount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  server: string;
  customerName?: string;
  customerMobile?: string;
}

interface OrderStore {
  // Tables
  tables: Table[];
  setTables: (tables: Table[]) => void;
  updateTableStatus: (tableId: string, status: Table['status'], order?: TableOrder) => void;
  settleTableBill: (tableId: string) => void;
  assignOrderToTable: (tableNumber: string, order: TableOrder, serverName?: string) => void;
  
  // KOT Orders
  kotOrders: KOTOrder[];
  addKOTOrder: (order: KOTOrder) => void;
  updateKOTItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  completeKOTOrder: (orderId: string) => void;
  
  // Unified Orders
  orders: UnifiedOrder[];
  addOrder: (order: UnifiedOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  
  // Helper
  getTableByNumber: (tableNumber: string) => Table | undefined;
}

const initialTables: Table[] = [
  { id: '1', number: 'T1', capacity: 2, section: 'Main Hall', status: 'available' },
  { id: '2', number: 'T2', capacity: 4, section: 'Main Hall', status: 'occupied', currentOrder: { orderNumber: 'ORD-001', guests: 3, amount: 1250, startTime: new Date(Date.now() - 45 * 60000), items: [{ id: '1', name: 'Butter Chicken', quantity: 2, price: 420 }, { id: '2', name: 'Naan', quantity: 4, price: 80 }, { id: '3', name: 'Dal Makhani', quantity: 1, price: 280 }] } },
  { id: '3', number: 'T3', capacity: 4, section: 'Main Hall', status: 'available' },
  { id: '4', number: 'T4', capacity: 6, section: 'Main Hall', status: 'reserved' },
  { id: '5', number: 'T5', capacity: 2, section: 'Main Hall', status: 'occupied', currentOrder: { orderNumber: 'ORD-002', guests: 2, amount: 680, startTime: new Date(Date.now() - 20 * 60000), items: [{ id: '1', name: 'Paneer Tikka', quantity: 1, price: 320 }, { id: '2', name: 'Lassi', quantity: 2, price: 180 }] } },
  { id: '6', number: 'T6', capacity: 8, section: 'Private', status: 'available' },
  { id: '7', number: 'T7', capacity: 4, section: 'Private', status: 'cleaning' },
  { id: '8', number: 'T8', capacity: 6, section: 'Outdoor', status: 'available' },
  { id: '9', number: 'T9', capacity: 4, section: 'Outdoor', status: 'occupied', currentOrder: { orderNumber: 'ORD-003', guests: 4, amount: 2100, startTime: new Date(Date.now() - 60 * 60000), items: [{ id: '1', name: 'Biryani', quantity: 2, price: 380 }, { id: '2', name: 'Kebab Platter', quantity: 1, price: 650 }, { id: '3', name: 'Raita', quantity: 2, price: 120 }, { id: '4', name: 'Cold Drinks', quantity: 4, price: 160 }] } },
  { id: '10', number: 'T10', capacity: 2, section: 'Outdoor', status: 'available' },
  { id: '11', number: 'T11', capacity: 4, section: 'Main Hall', status: 'available' },
  { id: '12', number: 'T12', capacity: 6, section: 'Main Hall', status: 'reserved' },
];

const initialKOTOrders: KOTOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    table: 'T2',
    time: '45 min ago',
    isRush: false,
    createdAt: new Date(Date.now() - 45 * 60000),
    items: [
      { id: '1', name: 'Butter Chicken', quantity: 2, status: 'preparing' },
      { id: '2', name: 'Naan', quantity: 4, status: 'pending' },
      { id: '3', name: 'Dal Makhani', quantity: 1, status: 'pending' },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    table: 'T5',
    time: '20 min ago',
    isRush: false,
    createdAt: new Date(Date.now() - 20 * 60000),
    items: [
      { id: '4', name: 'Paneer Tikka', quantity: 1, status: 'preparing' },
      { id: '5', name: 'Lassi', quantity: 2, status: 'ready' },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    table: 'T9',
    time: '60 min ago',
    isRush: true,
    createdAt: new Date(Date.now() - 60 * 60000),
    items: [
      { id: '6', name: 'Biryani', quantity: 2, status: 'ready' },
      { id: '7', name: 'Kebab Platter', quantity: 1, status: 'ready' },
      { id: '8', name: 'Raita', quantity: 2, status: 'ready' },
      { id: '9', name: 'Cold Drinks', quantity: 4, status: 'ready' },
    ],
  },
];

const initialOrders: UnifiedOrder[] = [
  { id: '1', orderNumber: 'ORD-001', table: 'T2', type: 'dine-in', items: [{ id: '1', name: 'Butter Chicken', quantity: 2, price: 420 }, { id: '2', name: 'Naan', quantity: 4, price: 80 }, { id: '3', name: 'Dal Makhani', quantity: 1, price: 280 }], amount: 1250, status: 'kot-sent', paymentStatus: 'unpaid', createdAt: new Date(Date.now() - 45 * 60000), server: 'Amit' },
  { id: '2', orderNumber: 'ORD-002', table: 'T5', type: 'dine-in', items: [{ id: '1', name: 'Paneer Tikka', quantity: 1, price: 320 }, { id: '2', name: 'Lassi', quantity: 2, price: 180 }], amount: 680, status: 'kot-sent', paymentStatus: 'unpaid', createdAt: new Date(Date.now() - 20 * 60000), server: 'Priya' },
  { id: '3', orderNumber: 'ORD-003', table: 'T9', type: 'dine-in', items: [{ id: '1', name: 'Biryani', quantity: 2, price: 380 }, { id: '2', name: 'Kebab Platter', quantity: 1, price: 650 }, { id: '3', name: 'Raita', quantity: 2, price: 120 }, { id: '4', name: 'Cold Drinks', quantity: 4, price: 160 }], amount: 2100, status: 'billed', paymentStatus: 'unpaid', createdAt: new Date(Date.now() - 60 * 60000), server: 'Vikram' },
];

export const useOrderStore = create<OrderStore>((set, get) => ({
  tables: initialTables,
  kotOrders: initialKOTOrders,
  orders: initialOrders,
  
  setTables: (tables) => set({ tables }),
  
  updateTableStatus: (tableId, status, order) => set((state) => ({
    tables: state.tables.map((t) =>
      t.id === tableId ? { ...t, status, currentOrder: order } : t
    ),
  })),
  
  settleTableBill: (tableId) => set((state) => {
    const table = state.tables.find(t => t.id === tableId);
    const orderNumber = table?.currentOrder?.orderNumber;
    
    return {
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'cleaning' as const, currentOrder: undefined } : t
      ),
      // Also update the order status when table is settled
      orders: orderNumber 
        ? state.orders.map(o => 
            o.orderNumber === orderNumber 
              ? { ...o, status: 'paid' as const, paymentStatus: 'paid' as const } 
              : o
          )
        : state.orders,
    };
  }),
  
  assignOrderToTable: (tableNumber, order, serverName?: string) => set((state) => {
    // Also add to unified orders if not exists
    const existingOrder = state.orders.find(o => o.orderNumber === order.orderNumber);
    const newOrder: UnifiedOrder = {
      id: Date.now().toString(),
      orderNumber: order.orderNumber,
      table: tableNumber,
      type: 'dine-in',
      items: order.items,
      amount: order.amount,
      status: 'kot-sent',
      paymentStatus: 'unpaid',
      createdAt: new Date(),
      server: serverName || 'Staff',
      customerName: order.customerName,
      customerMobile: order.customerMobile,
    };
    
    return {
      tables: state.tables.map((t) =>
        t.number === tableNumber ? { ...t, status: 'occupied' as const, currentOrder: order } : t
      ),
      orders: existingOrder ? state.orders : [...state.orders, newOrder],
    };
  }),
  
  getTableByNumber: (tableNumber) => get().tables.find((t) => t.number === tableNumber),
  
  addKOTOrder: (order) => set((state) => ({
    kotOrders: [{ ...order, createdAt: order.createdAt || new Date() }, ...state.kotOrders],
  })),
  
  updateKOTItemStatus: (orderId, itemId, status) => set((state) => ({
    kotOrders: state.kotOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            items: o.items.map((i) => (i.id === itemId ? { ...i, status } : i)),
          }
        : o
    ),
  })),
  
  completeKOTOrder: (orderId) => set((state) => ({
    kotOrders: state.kotOrders.filter((o) => o.id !== orderId),
  })),
  
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders],
  })),
  
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((o) =>
      o.id === orderId ? { ...o, status } : o
    ),
  })),
  
  updateOrderPaymentStatus: (orderId, paymentStatus) => set((state) => ({
    orders: state.orders.map((o) =>
      o.id === orderId ? { ...o, paymentStatus } : o
    ),
  })),
}));
