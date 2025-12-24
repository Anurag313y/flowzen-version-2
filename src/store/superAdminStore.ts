import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  isMain: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Client {
  id: string;
  businessType: 'restaurant' | 'hotel' | 'both';
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gstNumber?: string;
  latitude?: number;
  longitude?: number;
  services: ('pos' | 'pms')[];
  subscriptionPlan: '1_year' | '3_year';
  paymentStatus: 'paid' | 'unpaid';
  activationDate: string;
  expiryDate: string;
  status: 'active' | 'suspended' | 'expired' | 'draft';
  posEnabled: boolean;
  pmsEnabled: boolean;
  notes?: string;
  branches: Branch[];
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  clientId: string;
  clientName: string;
  category: 'pos' | 'pms' | 'billing' | 'other';
  priority: 'low' | 'medium' | 'high';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  internalNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PaymentHistory {
  id: string;
  clientId: string;
  date: string;
  amount: number;
  plan: '1_year' | '3_year';
  mode: 'manual' | 'online';
  invoiceRef?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  targetType: 'client' | 'complaint' | 'system';
  targetId?: string;
  targetName?: string;
  performedBy: string;
  timestamp: string;
  ipAddress?: string;
}

// Demo credentials
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@flozen.com',
  password: 'flozen@2024',
};

// Demo data
const generateDemoClients = (): Client[] => {
  return [
    {
      id: 'CLT001',
      businessType: 'restaurant',
      businessName: 'Spice Garden Restaurant',
      ownerName: 'Rahul Verma',
      ownerEmail: 'rahul@spicegarden.com',
      ownerPhone: '+91 98765 43210',
      address: '123 MG Road, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      gstNumber: '29ABCDE1234F1Z5',
      services: ['pos'],
      subscriptionPlan: '1_year',
      paymentStatus: 'paid',
      activationDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active',
      posEnabled: true,
      pmsEnabled: false,
      branches: [
        {
          id: 'BR001-1',
          name: 'Koramangala Main',
          address: '123 MG Road, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          phone: '+91 98765 43210',
          email: 'koramangala@spicegarden.com',
          isMain: true,
          status: 'active',
          createdAt: '2024-01-15',
        },
        {
          id: 'BR001-2',
          name: 'Indiranagar Outlet',
          address: '456 12th Main, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          phone: '+91 98765 43211',
          email: 'indiranagar@spicegarden.com',
          isMain: false,
          status: 'active',
          createdAt: '2024-03-20',
        },
        {
          id: 'BR001-3',
          name: 'Whitefield Branch',
          address: '789 ITPL Main Road',
          city: 'Bangalore',
          state: 'Karnataka',
          phone: '+91 98765 43212',
          email: 'whitefield@spicegarden.com',
          isMain: false,
          status: 'active',
          createdAt: '2024-06-10',
        },
      ],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
    },
    {
      id: 'CLT002',
      businessType: 'hotel',
      businessName: 'Grand Palace Hotel',
      ownerName: 'Meera Kapoor',
      ownerEmail: 'meera@grandpalace.in',
      ownerPhone: '+91 87654 32109',
      address: '456 Lake View Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      gstNumber: '27XYZAB5678G2H3',
      services: ['pms'],
      subscriptionPlan: '3_year',
      paymentStatus: 'paid',
      activationDate: '2023-06-01',
      expiryDate: '2026-06-01',
      status: 'active',
      posEnabled: false,
      pmsEnabled: true,
      branches: [
        {
          id: 'BR002-1',
          name: 'Mumbai Central',
          address: '456 Lake View Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          phone: '+91 87654 32109',
          email: 'mumbai@grandpalace.in',
          isMain: true,
          status: 'active',
          createdAt: '2023-06-01',
        },
        {
          id: 'BR002-2',
          name: 'Pune Branch',
          address: '123 FC Road, Shivajinagar',
          city: 'Pune',
          state: 'Maharashtra',
          phone: '+91 87654 32110',
          email: 'pune@grandpalace.in',
          isMain: false,
          status: 'active',
          createdAt: '2024-02-15',
        },
      ],
      createdAt: '2023-05-20',
      updatedAt: '2023-06-01',
    },
    {
      id: 'CLT003',
      businessType: 'both',
      businessName: 'Coastal Breeze Resort',
      ownerName: 'Arjun Nair',
      ownerEmail: 'arjun@coastalbreeze.com',
      ownerPhone: '+91 76543 21098',
      address: '789 Beach Road, Kovalam',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      country: 'India',
      services: ['pos', 'pms'],
      subscriptionPlan: '1_year',
      paymentStatus: 'paid',
      activationDate: '2024-06-20',
      expiryDate: '2025-01-02',
      status: 'active',
      posEnabled: true,
      pmsEnabled: true,
      notes: 'Premium client - priority support',
      branches: [
        {
          id: 'BR003-1',
          name: 'Kovalam Resort',
          address: '789 Beach Road, Kovalam',
          city: 'Thiruvananthapuram',
          state: 'Kerala',
          phone: '+91 76543 21098',
          email: 'kovalam@coastalbreeze.com',
          isMain: true,
          status: 'active',
          createdAt: '2024-06-20',
        },
      ],
      createdAt: '2024-06-15',
      updatedAt: '2024-06-20',
    },
    {
      id: 'CLT004',
      businessType: 'restaurant',
      businessName: 'Dragon Wok Chinese',
      ownerName: 'Chen Wei',
      ownerEmail: 'chen@dragonwok.in',
      ownerPhone: '+91 65432 10987',
      address: '321 Food Street, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      services: ['pos'],
      subscriptionPlan: '1_year',
      paymentStatus: 'unpaid',
      activationDate: '2024-03-01',
      expiryDate: '2024-12-28',
      status: 'active',
      posEnabled: true,
      pmsEnabled: false,
      branches: [
        {
          id: 'BR004-1',
          name: 'Indiranagar Main',
          address: '321 Food Street, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          phone: '+91 65432 10987',
          email: 'main@dragonwok.in',
          isMain: true,
          status: 'active',
          createdAt: '2024-03-01',
        },
        {
          id: 'BR004-2',
          name: 'HSR Layout',
          address: '567 Sector 2, HSR Layout',
          city: 'Bangalore',
          state: 'Karnataka',
          phone: '+91 65432 10988',
          email: 'hsr@dragonwok.in',
          isMain: false,
          status: 'active',
          createdAt: '2024-07-15',
        },
      ],
      createdAt: '2024-02-25',
      updatedAt: '2024-03-01',
    },
    {
      id: 'CLT005',
      businessType: 'hotel',
      businessName: 'Mountain View Inn',
      ownerName: 'Sanjay Thakur',
      ownerEmail: 'sanjay@mountainview.in',
      ownerPhone: '+91 54321 09876',
      address: '555 Hill Station Road',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      country: 'India',
      services: ['pms'],
      subscriptionPlan: '1_year',
      paymentStatus: 'paid',
      activationDate: '2023-12-01',
      expiryDate: '2024-12-01',
      status: 'expired',
      posEnabled: false,
      pmsEnabled: false,
      branches: [
        {
          id: 'BR005-1',
          name: 'Shimla Main',
          address: '555 Hill Station Road',
          city: 'Shimla',
          state: 'Himachal Pradesh',
          phone: '+91 54321 09876',
          email: 'shimla@mountainview.in',
          isMain: true,
          status: 'inactive',
          createdAt: '2023-12-01',
        },
      ],
      createdAt: '2023-11-20',
      updatedAt: '2024-12-01',
    },
    {
      id: 'CLT006',
      businessType: 'restaurant',
      businessName: 'Cafe Italiano',
      ownerName: 'Priya Mehta',
      ownerEmail: 'priya@cafeitaliano.com',
      ownerPhone: '+91 43210 98765',
      address: '888 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      services: ['pos'],
      subscriptionPlan: '1_year',
      paymentStatus: 'unpaid',
      activationDate: '2024-02-15',
      expiryDate: '2025-02-15',
      status: 'suspended',
      posEnabled: false,
      pmsEnabled: false,
      notes: 'Suspended due to non-payment',
      branches: [
        {
          id: 'BR006-1',
          name: 'Connaught Place',
          address: '888 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          phone: '+91 43210 98765',
          email: 'cp@cafeitaliano.com',
          isMain: true,
          status: 'inactive',
          createdAt: '2024-02-15',
        },
        {
          id: 'BR006-2',
          name: 'Hauz Khas',
          address: '456 Village Complex',
          city: 'Delhi',
          state: 'Delhi',
          phone: '+91 43210 98766',
          email: 'hauzkhas@cafeitaliano.com',
          isMain: false,
          status: 'inactive',
          createdAt: '2024-05-01',
        },
        {
          id: 'BR006-3',
          name: 'Gurgaon',
          address: '789 Cyber Hub',
          city: 'Gurgaon',
          state: 'Haryana',
          phone: '+91 43210 98767',
          email: 'gurgaon@cafeitaliano.com',
          isMain: false,
          status: 'inactive',
          createdAt: '2024-08-20',
        },
      ],
      createdAt: '2024-02-10',
      updatedAt: '2024-11-01',
    },
  ];
};

const generateDemoComplaints = (): Complaint[] => [
  {
    id: 'TKT001',
    clientId: 'CLT001',
    clientName: 'Spice Garden Restaurant',
    category: 'pos',
    priority: 'high',
    description: 'POS system crashing during peak hours. Unable to process orders.',
    status: 'in_progress',
    internalNotes: 'Engineering team investigating. Possible memory leak.',
    createdAt: '2024-12-20T10:30:00',
  },
  {
    id: 'TKT002',
    clientId: 'CLT002',
    clientName: 'Grand Palace Hotel',
    category: 'billing',
    priority: 'medium',
    description: 'Invoice discrepancy for last quarter subscription.',
    status: 'open',
    createdAt: '2024-12-22T14:15:00',
  },
  {
    id: 'TKT003',
    clientId: 'CLT003',
    clientName: 'Coastal Breeze Resort',
    category: 'pms',
    priority: 'low',
    description: 'Request for custom report format for housekeeping module.',
    status: 'resolved',
    internalNotes: 'Custom report delivered via email.',
    createdAt: '2024-12-18T09:00:00',
    resolvedAt: '2024-12-19T16:30:00',
  },
];

const generateDemoActivityLogs = (): ActivityLog[] => [
  {
    id: 'LOG001',
    action: 'Client suspended',
    targetType: 'client',
    targetId: 'CLT006',
    targetName: 'Cafe Italiano',
    performedBy: 'Super Admin',
    timestamp: '2024-11-01T10:00:00',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'LOG002',
    action: 'Subscription renewed',
    targetType: 'client',
    targetId: 'CLT001',
    targetName: 'Spice Garden Restaurant',
    performedBy: 'Super Admin',
    timestamp: '2024-12-15T14:30:00',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'LOG003',
    action: 'New client added',
    targetType: 'client',
    targetId: 'CLT003',
    targetName: 'Coastal Breeze Resort',
    performedBy: 'Super Admin',
    timestamp: '2024-06-15T11:00:00',
    ipAddress: '192.168.1.100',
  },
];

interface SuperAdminStore {
  superAdminUser: SuperAdminUser | null;
  isSuperAdminAuthenticated: boolean;
  clients: Client[];
  complaints: Complaint[];
  activityLogs: ActivityLog[];
  paymentHistory: PaymentHistory[];
  
  // Auth actions
  loginSuperAdmin: (email: string, password: string) => { success: boolean; error?: string };
  logoutSuperAdmin: () => void;
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  suspendClient: (id: string) => void;
  resumeClient: (id: string) => void;
  toggleClientService: (id: string, service: 'pos' | 'pms', enabled: boolean) => void;
  renewSubscription: (id: string, plan: '1_year' | '3_year') => void;
  
  // Branch actions
  addBranch: (clientId: string, branch: Omit<Branch, 'id' | 'createdAt'>) => void;
  updateBranch: (clientId: string, branchId: string, updates: Partial<Branch>) => void;
  deleteBranch: (clientId: string, branchId: string) => void;
  
  // Complaint actions
  updateComplaintStatus: (id: string, status: Complaint['status'], notes?: string) => void;
  
  // Activity log
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const useSuperAdminStore = create<SuperAdminStore>()(
  persist(
    (set, get) => ({
      superAdminUser: null,
      isSuperAdminAuthenticated: false,
      clients: generateDemoClients(),
      complaints: generateDemoComplaints(),
      activityLogs: generateDemoActivityLogs(),
      paymentHistory: [],
      
      loginSuperAdmin: (email, password) => {
        if (email === SUPER_ADMIN_CREDENTIALS.email && password === SUPER_ADMIN_CREDENTIALS.password) {
          const user: SuperAdminUser = {
            id: 'sa-001',
            name: 'Flozen Admin',
            email: SUPER_ADMIN_CREDENTIALS.email,
            role: 'super_admin',
          };
          set({ superAdminUser: user, isSuperAdminAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
      },
      
      logoutSuperAdmin: () => {
        set({ superAdminUser: null, isSuperAdminAuthenticated: false });
      },
      
      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: `CLT${String(get().clients.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ clients: [...state.clients, newClient] }));
        get().addActivityLog({
          action: 'New client added',
          targetType: 'client',
          targetId: newClient.id,
          targetName: newClient.businessName,
          performedBy: get().superAdminUser?.name || 'Super Admin',
        });
      },
      
      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c
          ),
        }));
      },
      
      deleteClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }));
        if (client) {
          get().addActivityLog({
            action: 'Client deleted',
            targetType: 'client',
            targetId: id,
            targetName: client.businessName,
            performedBy: get().superAdminUser?.name || 'Super Admin',
          });
        }
      },
      
      suspendClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { 
              ...c, 
              status: 'suspended', 
              posEnabled: false, 
              pmsEnabled: false, 
              branches: c.branches.map(b => ({ ...b, status: 'inactive' as const })),
              updatedAt: new Date().toISOString().split('T')[0] 
            } : c
          ),
        }));
        if (client) {
          get().addActivityLog({
            action: 'Client suspended',
            targetType: 'client',
            targetId: id,
            targetName: client.businessName,
            performedBy: get().superAdminUser?.name || 'Super Admin',
          });
        }
      },
      
      resumeClient: (id) => {
        const client = get().clients.find((c) => c.id === id);
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'active',
                  posEnabled: c.services.includes('pos'),
                  pmsEnabled: c.services.includes('pms'),
                  branches: c.branches.map(b => ({ ...b, status: 'active' as const })),
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
        if (client) {
          get().addActivityLog({
            action: 'Client resumed',
            targetType: 'client',
            targetId: id,
            targetName: client.businessName,
            performedBy: get().superAdminUser?.name || 'Super Admin',
          });
        }
      },
      
      toggleClientService: (id, service, enabled) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? {
                  ...c,
                  [service === 'pos' ? 'posEnabled' : 'pmsEnabled']: enabled,
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
      },
      
      renewSubscription: (id, plan) => {
        const client = get().clients.find((c) => c.id === id);
        if (!client) return;
        
        const currentExpiry = new Date(client.expiryDate);
        const newExpiry = new Date(currentExpiry);
        newExpiry.setFullYear(newExpiry.getFullYear() + (plan === '1_year' ? 1 : 3));
        
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? {
                  ...c,
                  subscriptionPlan: plan,
                  expiryDate: newExpiry.toISOString().split('T')[0],
                  status: 'active',
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
        
        get().addActivityLog({
          action: `Subscription renewed (${plan === '1_year' ? '1 Year' : '3 Years'})`,
          targetType: 'client',
          targetId: id,
          targetName: client.businessName,
          performedBy: get().superAdminUser?.name || 'Super Admin',
        });
      },
      
      addBranch: (clientId, branchData) => {
        const client = get().clients.find(c => c.id === clientId);
        if (!client) return;
        
        const newBranch: Branch = {
          ...branchData,
          id: `BR${clientId.replace('CLT', '')}-${client.branches.length + 1}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? { ...c, branches: [...c.branches, newBranch], updatedAt: new Date().toISOString().split('T')[0] }
              : c
          ),
        }));
        
        get().addActivityLog({
          action: `Branch added: ${newBranch.name}`,
          targetType: 'client',
          targetId: clientId,
          targetName: client.businessName,
          performedBy: get().superAdminUser?.name || 'Super Admin',
        });
      },
      
      updateBranch: (clientId, branchId, updates) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  branches: c.branches.map(b => b.id === branchId ? { ...b, ...updates } : b),
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
      },
      
      deleteBranch: (clientId, branchId) => {
        const client = get().clients.find(c => c.id === clientId);
        const branch = client?.branches.find(b => b.id === branchId);
        
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  branches: c.branches.filter(b => b.id !== branchId),
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));
        
        if (client && branch) {
          get().addActivityLog({
            action: `Branch deleted: ${branch.name}`,
            targetType: 'client',
            targetId: clientId,
            targetName: client.businessName,
            performedBy: get().superAdminUser?.name || 'Super Admin',
          });
        }
      },
      
      updateComplaintStatus: (id, status, notes) => {
        set((state) => ({
          complaints: state.complaints.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status,
                  internalNotes: notes || c.internalNotes,
                  resolvedAt: status === 'resolved' ? new Date().toISOString() : c.resolvedAt,
                }
              : c
          ),
        }));
      },
      
      addActivityLog: (log) => {
        const newLog: ActivityLog = {
          ...log,
          id: `LOG${String(get().activityLogs.length + 1).padStart(3, '0')}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ activityLogs: [newLog, ...state.activityLogs] }));
      },
    }),
    {
      name: 'super-admin-storage',
    }
  )
);
