import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'manager' | 'waiter';

export interface User {
  id: string;
  name: string;
  email?: string;
  pin?: string;
  role: UserRole;
  avatar?: string;
}

// Dummy users for testing
export const DUMMY_USERS: User[] = [
  {
    id: 'mgr-001',
    name: 'Raj Kumar',
    email: 'manager@restaurant.com',
    role: 'manager',
    avatar: 'RK',
  },
  {
    id: 'wtr-001',
    name: 'Amit Singh',
    pin: '1234',
    role: 'waiter',
    avatar: 'AS',
  },
  {
    id: 'wtr-002',
    name: 'Priya Sharma',
    pin: '5678',
    role: 'waiter',
    avatar: 'PS',
  },
  {
    id: 'wtr-003',
    name: 'Vikram Patel',
    pin: '9012',
    role: 'waiter',
    avatar: 'VP',
  },
];

// Dummy credentials
export const DUMMY_CREDENTIALS = {
  manager: {
    email: 'manager@restaurant.com',
    password: 'manager123',
  },
  waiters: [
    { name: 'Amit Singh', pin: '1234' },
    { name: 'Priya Sharma', pin: '5678' },
    { name: 'Vikram Patel', pin: '9012' },
  ],
};

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email?: string; password?: string; pin?: string }) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (credentials) => {
        // Manager login with email/password
        if (credentials.email && credentials.password) {
          if (
            credentials.email === DUMMY_CREDENTIALS.manager.email &&
            credentials.password === DUMMY_CREDENTIALS.manager.password
          ) {
            const manager = DUMMY_USERS.find((u) => u.role === 'manager');
            if (manager) {
              set({ user: manager, isAuthenticated: true });
              return { success: true };
            }
          }
          return { success: false, error: 'Invalid email or password' };
        }

        // Waiter login with PIN
        if (credentials.pin) {
          const waiter = DUMMY_USERS.find(
            (u) => u.role === 'waiter' && u.pin === credentials.pin
          );
          if (waiter) {
            set({ user: waiter, isAuthenticated: true });
            return { success: true };
          }
          return { success: false, error: 'Invalid PIN' };
        }

        return { success: false, error: 'Please provide credentials' };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
