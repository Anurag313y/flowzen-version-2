import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  isMain: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface BranchStore {
  branches: Branch[];
  selectedBranchId: string | null;
  
  // Actions
  addBranch: (branch: Omit<Branch, 'id' | 'createdAt'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  selectBranch: (id: string) => void;
  getSelectedBranch: () => Branch | null;
}

// Demo branches
const demoBranches: Branch[] = [
  {
    id: 'BR001',
    name: 'Main Branch',
    city: 'Mumbai',
    address: '123 MG Road, Andheri West',
    phone: '+91 98765 43210',
    email: 'main@flowzen.com',
    isMain: true,
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: 'BR002',
    name: 'Downtown Outlet',
    city: 'Mumbai',
    address: '456 Link Road, Bandra',
    phone: '+91 98765 43211',
    email: 'downtown@flowzen.com',
    isMain: false,
    status: 'active',
    createdAt: '2024-03-15',
  },
  {
    id: 'BR003',
    name: 'Airport Branch',
    city: 'Mumbai',
    address: 'Terminal 2, CSIA',
    phone: '+91 98765 43212',
    email: 'airport@flowzen.com',
    isMain: false,
    status: 'active',
    createdAt: '2024-06-01',
  },
];

export const useBranchStore = create<BranchStore>()(
  persist(
    (set, get) => ({
      branches: demoBranches,
      selectedBranchId: 'BR001',
      
      addBranch: (branchData) => {
        const newBranch: Branch = {
          ...branchData,
          id: `BR${String(get().branches.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ branches: [...state.branches, newBranch] }));
      },
      
      updateBranch: (id, updates) => {
        set((state) => ({
          branches: state.branches.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },
      
      deleteBranch: (id) => {
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        }));
      },
      
      selectBranch: (id) => {
        set({ selectedBranchId: id });
      },
      
      getSelectedBranch: () => {
        const state = get();
        return state.branches.find((b) => b.id === state.selectedBranchId) || null;
      },
    }),
    {
      name: 'branch-storage',
    }
  )
);