import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BranchSubscription {
  branchId: string;
  branchName: string;
  plan: '1_year' | '3_year';
  activationDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  amount: number;
}

export interface SubscriptionPayment {
  id: string;
  date: string;
  branchIds: string[];
  branchNames: string[];
  amount: number;
  plan: '1_year' | '3_year';
  paymentMode: 'online' | 'cash' | 'bank_transfer';
  invoiceRef: string;
  type: 'new' | 'renewal';
}

// Pricing configuration
export const SUBSCRIPTION_PRICING = {
  '1_year': 15000,
  '3_year': 36000,
};

interface SubscriptionStore {
  branchSubscriptions: BranchSubscription[];
  paymentHistory: SubscriptionPayment[];
  
  // Actions
  initializeBranchSubscription: (branchId: string, branchName: string, plan: '1_year' | '3_year') => void;
  renewBranchSubscription: (branchId: string, plan: '1_year' | '3_year') => void;
  renewMultipleBranches: (branchIds: string[], plan: '1_year' | '3_year') => void;
  removeBranchSubscription: (branchId: string) => void;
  addPayment: (payment: Omit<SubscriptionPayment, 'id'>) => void;
  getBranchSubscription: (branchId: string) => BranchSubscription | undefined;
  getTotalActiveSubscriptions: () => number;
  getExpiringSubscriptions: (daysThreshold: number) => BranchSubscription[];
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      branchSubscriptions: [
        // Demo data for admin panel
        {
          branchId: 'branch-1',
          branchName: 'Main Branch - Koramangala',
          plan: '1_year',
          activationDate: '2024-01-15',
          expiryDate: '2025-01-15',
          status: 'active',
          paymentStatus: 'paid',
          amount: 15000,
        },
        {
          branchId: 'branch-2',
          branchName: 'Indiranagar Outlet',
          plan: '1_year',
          activationDate: '2024-03-20',
          expiryDate: '2025-03-20',
          status: 'active',
          paymentStatus: 'paid',
          amount: 15000,
        },
        {
          branchId: 'branch-3',
          branchName: 'Whitefield Branch',
          plan: '1_year',
          activationDate: '2024-06-10',
          expiryDate: '2025-01-05',
          status: 'active',
          paymentStatus: 'paid',
          amount: 15000,
        },
      ],
      paymentHistory: [
        {
          id: 'PAY001',
          date: '2024-01-15',
          branchIds: ['branch-1'],
          branchNames: ['Main Branch - Koramangala'],
          amount: 15000,
          plan: '1_year',
          paymentMode: 'online',
          invoiceRef: 'INV-2024-001',
          type: 'new',
        },
        {
          id: 'PAY002',
          date: '2024-03-20',
          branchIds: ['branch-2'],
          branchNames: ['Indiranagar Outlet'],
          amount: 15000,
          plan: '1_year',
          paymentMode: 'bank_transfer',
          invoiceRef: 'INV-2024-015',
          type: 'new',
        },
        {
          id: 'PAY003',
          date: '2024-06-10',
          branchIds: ['branch-3'],
          branchNames: ['Whitefield Branch'],
          amount: 15000,
          plan: '1_year',
          paymentMode: 'online',
          invoiceRef: 'INV-2024-042',
          type: 'new',
        },
      ],

      initializeBranchSubscription: (branchId, branchName, plan) => {
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setFullYear(expiryDate.getFullYear() + (plan === '1_year' ? 1 : 3));

        const newSubscription: BranchSubscription = {
          branchId,
          branchName,
          plan,
          activationDate: today.toISOString().split('T')[0],
          expiryDate: expiryDate.toISOString().split('T')[0],
          status: 'active',
          paymentStatus: 'paid',
          amount: SUBSCRIPTION_PRICING[plan],
        };

        set((state) => ({
          branchSubscriptions: [...state.branchSubscriptions, newSubscription],
        }));
      },

      renewBranchSubscription: (branchId, plan) => {
        set((state) => ({
          branchSubscriptions: state.branchSubscriptions.map((sub) => {
            if (sub.branchId === branchId) {
              const currentExpiry = new Date(sub.expiryDate);
              const newExpiry = new Date(currentExpiry);
              newExpiry.setFullYear(newExpiry.getFullYear() + (plan === '1_year' ? 1 : 3));

              return {
                ...sub,
                plan,
                expiryDate: newExpiry.toISOString().split('T')[0],
                status: 'active' as const,
                paymentStatus: 'paid' as const,
                amount: SUBSCRIPTION_PRICING[plan],
              };
            }
            return sub;
          }),
        }));
      },

      renewMultipleBranches: (branchIds, plan) => {
        set((state) => ({
          branchSubscriptions: state.branchSubscriptions.map((sub) => {
            if (branchIds.includes(sub.branchId)) {
              const currentExpiry = new Date(sub.expiryDate);
              const newExpiry = new Date(currentExpiry);
              newExpiry.setFullYear(newExpiry.getFullYear() + (plan === '1_year' ? 1 : 3));

              return {
                ...sub,
                plan,
                expiryDate: newExpiry.toISOString().split('T')[0],
                status: 'active' as const,
                paymentStatus: 'paid' as const,
                amount: SUBSCRIPTION_PRICING[plan],
              };
            }
            return sub;
          }),
        }));
      },

      removeBranchSubscription: (branchId) => {
        set((state) => ({
          branchSubscriptions: state.branchSubscriptions.filter(
            (sub) => sub.branchId !== branchId
          ),
        }));
      },

      addPayment: (payment) => {
        const newPayment: SubscriptionPayment = {
          ...payment,
          id: `PAY${String(get().paymentHistory.length + 1).padStart(3, '0')}`,
        };
        set((state) => ({
          paymentHistory: [newPayment, ...state.paymentHistory],
        }));
      },

      getBranchSubscription: (branchId) => {
        return get().branchSubscriptions.find((sub) => sub.branchId === branchId);
      },

      getTotalActiveSubscriptions: () => {
        return get().branchSubscriptions.filter((sub) => sub.status === 'active').length;
      },

      getExpiringSubscriptions: (daysThreshold) => {
        const today = new Date();
        return get().branchSubscriptions.filter((sub) => {
          const expiry = new Date(sub.expiryDate);
          const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft > 0 && daysLeft <= daysThreshold && sub.status === 'active';
        });
      },
    }),
    {
      name: 'subscription-storage',
    }
  )
);
