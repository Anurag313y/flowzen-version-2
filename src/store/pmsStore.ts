import { create } from 'zustand';
import type {
  Room,
  Guest,
  Reservation,
  Folio,
  FolioItem,
  HousekeepingTask,
  MaintenanceTicket,
  DashboardStats,
  ReservationStatus,
  RoomType,
  HousekeepingStatus,
  MaintenanceStatus,
} from '@/types/pms';
import { addDays, subDays, differenceInDays } from 'date-fns';

// Mock Data Generation
const generateMockRooms = (): Room[] => {
  const rooms: Room[] = [];
  const types: Room['type'][] = ['standard', 'deluxe', 'suite', 'executive'];
  const statuses: Room['status'][] = ['available', 'occupied', 'reserved', 'maintenance', 'cleaning'];
  
  for (let floor = 1; floor <= 4; floor++) {
    for (let num = 1; num <= 10; num++) {
      const roomNum = `${floor}${num.toString().padStart(2, '0')}`;
      rooms.push({
        id: `room-${roomNum}`,
        number: roomNum,
        floor,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        housekeepingStatus: ['clean', 'dirty', 'inspected'][Math.floor(Math.random() * 3)] as HousekeepingStatus,
        maxOccupancy: 2 + Math.floor(Math.random() * 3),
        baseRate: 100 + Math.floor(Math.random() * 200),
        amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'].slice(0, 2 + Math.floor(Math.random() * 3)),
      });
    }
  }
  return rooms;
};

const generateMockGuests = (): Guest[] => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `guest-${i + 1}`,
    firstName: firstNames[i % firstNames.length],
    lastName: lastNames[i % lastNames.length],
    email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@email.com`,
    phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
    country: ['USA', 'UK', 'Canada', 'Germany', 'France'][i % 5],
    vipLevel: i < 3 ? 3 - i : 0,
    totalStays: Math.floor(Math.random() * 10),
    totalSpent: Math.floor(Math.random() * 5000),
    createdAt: subDays(new Date(), Math.floor(Math.random() * 365)),
  }));
};

const generateMockReservations = (rooms: Room[], guests: Guest[]): Reservation[] => {
  const statuses: ReservationStatus[] = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
  const sources: Reservation['source'][] = ['direct', 'booking', 'expedia', 'phone', 'walk-in'];
  
  return Array.from({ length: 25 }, (_, i) => {
    const checkIn = addDays(new Date(), Math.floor(Math.random() * 30) - 10);
    const nights = 1 + Math.floor(Math.random() * 5);
    const guest = guests[i % guests.length];
    const room = rooms[i % rooms.length];
    const rate = room.baseRate;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `res-${i + 1}`,
      confirmationNumber: `CNF${String(100000 + i).slice(1)}`,
      guestId: guest.id,
      guest,
      roomId: status === 'checked_in' || status === 'checked_out' ? room.id : undefined,
      room: status === 'checked_in' || status === 'checked_out' ? room : undefined,
      roomType: room.type,
      checkIn,
      checkOut: addDays(checkIn, nights),
      nights,
      adults: 1 + Math.floor(Math.random() * 2),
      children: Math.floor(Math.random() * 2),
      status,
      paymentStatus: status === 'checked_out' ? 'paid' : status === 'checked_in' ? 'partial' : 'pending',
      source: sources[Math.floor(Math.random() * sources.length)],
      ratePerNight: rate,
      totalAmount: rate * nights,
      paidAmount: status === 'checked_out' ? rate * nights : status === 'checked_in' ? rate : 0,
      createdAt: subDays(checkIn, Math.floor(Math.random() * 30)),
      updatedAt: new Date(),
    };
  });
};

const generateMockHousekeeping = (rooms: Room[]): HousekeepingTask[] => {
  return rooms
    .filter(r => r.housekeepingStatus !== 'clean')
    .map((room, i) => ({
      id: `hk-${i + 1}`,
      roomId: room.id,
      room,
      status: room.housekeepingStatus,
      priority: ['normal', 'rush', 'vip'][Math.floor(Math.random() * 3)] as HousekeepingTask['priority'],
      assignedTo: ['Maria', 'Carlos', 'Ana', 'John'][Math.floor(Math.random() * 4)],
    }));
};

const generateMockMaintenance = (rooms: Room[]): MaintenanceTicket[] => {
  const categories: MaintenanceTicket['category'][] = ['plumbing', 'electrical', 'hvac', 'furniture', 'appliance'];
  const priorities: MaintenanceTicket['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const statuses: MaintenanceTicket['status'][] = ['open', 'in_progress', 'resolved'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `mt-${i + 1}`,
    roomId: rooms[i % rooms.length].id,
    room: rooms[i % rooms.length],
    title: ['Leaky faucet', 'AC not cooling', 'Light fixture broken', 'TV remote missing', 'Door lock issue'][i % 5],
    description: 'Guest reported issue requiring attention.',
    category: categories[i % categories.length],
    priority: priorities[i % priorities.length],
    status: statuses[i % statuses.length],
    assignedTo: i < 5 ? ['Mike', 'Steve', 'Tom'][i % 3] : undefined,
    reportedBy: 'Front Desk',
    createdAt: subDays(new Date(), Math.floor(Math.random() * 7)),
    resolvedAt: statuses[i % statuses.length] === 'resolved' ? new Date() : undefined,
  }));
};

interface PMSState {
  // Data
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  housekeepingTasks: HousekeepingTask[];
  maintenanceTickets: MaintenanceTicket[];
  
  // Dashboard stats
  dashboardStats: DashboardStats;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  loadData: () => void;
  
  // Reservations
  createReservation: (data: Partial<Reservation>) => Reservation;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  checkIn: (id: string, roomId: string) => void;
  checkOut: (id: string) => void;
  assignRoom: (reservationId: string, roomId: string) => void;
  
  // Rooms
  addRoom: (room: Omit<Room, 'id'>) => Room;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  updateRoomStatus: (id: string, status: Room['status']) => void;
  
  // Housekeeping
  updateHousekeepingStatus: (roomId: string, status: HousekeepingStatus) => void;
  assignHousekeeping: (taskId: string, assignee: string) => void;
  
  // Maintenance
  createMaintenanceTicket: (data: Partial<MaintenanceTicket>) => MaintenanceTicket;
  updateMaintenanceTicket: (id: string, data: Partial<MaintenanceTicket>) => void;
  resolveMaintenanceTicket: (id: string) => void;
  
  // Folio
  getFolio: (reservationId: string) => Folio;
  addFolioCharge: (reservationId: string, item: Partial<FolioItem>) => void;
  addFolioPayment: (reservationId: string, amount: number, method: string) => void;
}

export const usePMSStore = create<PMSState>((set, get) => {
  const rooms = generateMockRooms();
  const guests = generateMockGuests();
  const reservations = generateMockReservations(rooms, guests);
  const housekeepingTasks = generateMockHousekeeping(rooms);
  const maintenanceTickets = generateMockMaintenance(rooms);
  
  // Calculate dashboard stats
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const totalRooms = rooms.length;
  const todayArrivals = reservations.filter(r => 
    r.status === 'confirmed' && 
    differenceInDays(r.checkIn, new Date()) === 0
  ).length;
  const todayDepartures = reservations.filter(r => 
    r.status === 'checked_in' && 
    differenceInDays(r.checkOut, new Date()) === 0
  ).length;
  
  return {
    rooms,
    guests,
    reservations,
    housekeepingTasks,
    maintenanceTickets,
    isLoading: false,
    
    dashboardStats: {
      occupancyRate: Math.round((occupiedRooms / totalRooms) * 100),
      arrivals: todayArrivals,
      departures: todayDepartures,
      stayovers: occupiedRooms - todayDepartures,
      availableRooms: rooms.filter(r => r.status === 'available').length,
      outOfOrder: rooms.filter(r => r.status === 'maintenance').length,
      revpar: 145.50,
      adr: 175.00,
      revenue: {
        rooms: 12500,
        fb: 3200,
        other: 850,
        total: 16550,
      },
    },
    
    loadData: () => {
      set({ isLoading: false });
    },
    
    createReservation: (data) => {
      const newRes: Reservation = {
        id: `res-${Date.now()}`,
        confirmationNumber: `CNF${Date.now().toString().slice(-6)}`,
        guestId: data.guestId || '',
        guest: data.guest || guests[0],
        roomType: data.roomType || 'standard',
        checkIn: data.checkIn || new Date(),
        checkOut: data.checkOut || addDays(new Date(), 1),
        nights: data.nights || 1,
        adults: data.adults || 1,
        children: data.children || 0,
        status: 'confirmed',
        paymentStatus: 'pending',
        source: data.source || 'direct',
        ratePerNight: data.ratePerNight || 150,
        totalAmount: data.totalAmount || 150,
        paidAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      } as Reservation;
      
      set(state => ({ reservations: [...state.reservations, newRes] }));
      return newRes;
    },
    
    updateReservation: (id, data) => {
      set(state => ({
        reservations: state.reservations.map(r => 
          r.id === id ? { ...r, ...data, updatedAt: new Date() } : r
        ),
      }));
    },
    
    cancelReservation: (id) => {
      set(state => ({
        reservations: state.reservations.map(r => 
          r.id === id ? { ...r, status: 'cancelled', updatedAt: new Date() } : r
        ),
      }));
    },
    
    checkIn: (id, roomId) => {
      const room = get().rooms.find(r => r.id === roomId);
      set(state => ({
        reservations: state.reservations.map(r => 
          r.id === id ? { ...r, status: 'checked_in', roomId, room, updatedAt: new Date() } : r
        ),
        rooms: state.rooms.map(r => 
          r.id === roomId ? { ...r, status: 'occupied' } : r
        ),
      }));
    },
    
    checkOut: (id) => {
      const reservation = get().reservations.find(r => r.id === id);
      if (reservation?.roomId) {
        set(state => ({
          reservations: state.reservations.map(r => 
            r.id === id ? { ...r, status: 'checked_out', paymentStatus: 'paid', updatedAt: new Date() } : r
          ),
          rooms: state.rooms.map(r => 
            r.id === reservation.roomId ? { ...r, status: 'cleaning', housekeepingStatus: 'dirty' } : r
          ),
        }));
      }
    },
    
    assignRoom: (reservationId, roomId) => {
      const room = get().rooms.find(r => r.id === roomId);
      set(state => ({
        reservations: state.reservations.map(r => 
          r.id === reservationId ? { ...r, roomId, room, updatedAt: new Date() } : r
        ),
      }));
    },
    
    addRoom: (roomData) => {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        ...roomData,
      };
      set(state => ({ rooms: [...state.rooms, newRoom] }));
      return newRoom;
    },
    
    updateRoom: (id, data) => {
      set(state => ({
        rooms: state.rooms.map(r => r.id === id ? { ...r, ...data } : r),
      }));
    },
    
    deleteRoom: (id) => {
      set(state => ({
        rooms: state.rooms.filter(r => r.id !== id),
      }));
    },
    
    updateRoomStatus: (id, status) => {
      set(state => ({
        rooms: state.rooms.map(r => r.id === id ? { ...r, status } : r),
      }));
    },
    
    updateHousekeepingStatus: (roomId, status) => {
      set(state => ({
        rooms: state.rooms.map(r => 
          r.id === roomId ? { ...r, housekeepingStatus: status, status: status === 'clean' ? 'available' : r.status } : r
        ),
        housekeepingTasks: state.housekeepingTasks.map(t => 
          t.roomId === roomId ? { ...t, status, completedAt: status === 'clean' ? new Date() : undefined } : t
        ),
      }));
    },
    
    assignHousekeeping: (taskId, assignee) => {
      set(state => ({
        housekeepingTasks: state.housekeepingTasks.map(t => 
          t.id === taskId ? { ...t, assignedTo: assignee } : t
        ),
      }));
    },
    
    createMaintenanceTicket: (data) => {
      const newTicket: MaintenanceTicket = {
        id: `mt-${Date.now()}`,
        title: data.title || 'New Issue',
        description: data.description || '',
        category: data.category || 'other',
        priority: data.priority || 'medium',
        status: 'open',
        reportedBy: data.reportedBy || 'System',
        createdAt: new Date(),
        ...data,
      } as MaintenanceTicket;
      
      set(state => ({ maintenanceTickets: [...state.maintenanceTickets, newTicket] }));
      return newTicket;
    },
    
    updateMaintenanceTicket: (id, data) => {
      set(state => ({
        maintenanceTickets: state.maintenanceTickets.map(t => 
          t.id === id ? { ...t, ...data } : t
        ),
      }));
    },
    
    resolveMaintenanceTicket: (id) => {
      set(state => ({
        maintenanceTickets: state.maintenanceTickets.map(t => 
          t.id === id ? { ...t, status: 'resolved', resolvedAt: new Date() } : t
        ),
      }));
    },
    
    getFolio: (reservationId) => {
      const reservation = get().reservations.find(r => r.id === reservationId);
      if (!reservation) {
        return { id: '', reservationId, items: [], totalCharges: 0, totalPayments: 0, balance: 0, createdAt: new Date(), updatedAt: new Date() };
      }
      
      const items: FolioItem[] = [
        {
          id: `fi-${reservationId}-room`,
          reservationId,
          type: 'room',
          description: `Room Charge - ${reservation.nights} night(s)`,
          quantity: reservation.nights,
          unitPrice: reservation.ratePerNight,
          amount: reservation.totalAmount,
          date: reservation.checkIn,
        },
      ];
      
      if (reservation.paidAmount > 0) {
        items.push({
          id: `fi-${reservationId}-payment`,
          reservationId,
          type: 'payment',
          description: 'Payment Received',
          quantity: 1,
          unitPrice: -reservation.paidAmount,
          amount: -reservation.paidAmount,
          date: new Date(),
        });
      }
      
      const totalCharges = items.filter(i => i.amount > 0).reduce((sum, i) => sum + i.amount, 0);
      const totalPayments = Math.abs(items.filter(i => i.amount < 0).reduce((sum, i) => sum + i.amount, 0));
      
      return {
        id: `folio-${reservationId}`,
        reservationId,
        items,
        totalCharges,
        totalPayments,
        balance: totalCharges - totalPayments,
        createdAt: reservation.createdAt,
        updatedAt: new Date(),
      };
    },
    
    addFolioCharge: (reservationId, item) => {
      // In real app, this would add to a separate folio items table
      console.log('Adding folio charge', reservationId, item);
    },
    
    addFolioPayment: (reservationId, amount, method) => {
      set(state => ({
        reservations: state.reservations.map(r => 
          r.id === reservationId 
            ? { ...r, paidAmount: r.paidAmount + amount, paymentStatus: r.paidAmount + amount >= r.totalAmount ? 'paid' : 'partial' }
            : r
        ),
      }));
    },
  };
});
