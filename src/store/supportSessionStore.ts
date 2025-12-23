import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SupportSession {
  id: string;
  clientId: string;
  clientName: string;
  role: 'admin' | 'waiter';
  superAdminId: string;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
}

interface SupportSessionStore {
  activeSessions: SupportSession[];
  currentSession: SupportSession | null;
  
  startSupportSession: (params: {
    clientId: string;
    clientName: string;
    role: 'admin' | 'waiter';
    superAdminId: string;
  }) => SupportSession;
  
  getSupportSession: (sessionId: string) => SupportSession | null;
  endSupportSession: (sessionId: string) => void;
  clearExpiredSessions: () => void;
  setCurrentSession: (session: SupportSession | null) => void;
}

const SESSION_DURATION_MINUTES = 30;

const generateSessionId = () => {
  return `SUPPORT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const useSupportSessionStore = create<SupportSessionStore>()(
  persist(
    (set, get) => ({
      activeSessions: [],
      currentSession: null,
      
      startSupportSession: ({ clientId, clientName, role, superAdminId }) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
        
        const session: SupportSession = {
          id: generateSessionId(),
          clientId,
          clientName,
          role,
          superAdminId,
          startedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          isActive: true,
        };
        
        set((state) => ({
          activeSessions: [...state.activeSessions, session],
        }));
        
        return session;
      },
      
      getSupportSession: (sessionId) => {
        const sessions = get().activeSessions;
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session) return null;
        
        // Check if expired
        if (new Date(session.expiresAt) < new Date()) {
          get().endSupportSession(sessionId);
          return null;
        }
        
        return session;
      },
      
      endSupportSession: (sessionId) => {
        set((state) => ({
          activeSessions: state.activeSessions.filter(s => s.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        }));
      },
      
      clearExpiredSessions: () => {
        const now = new Date();
        set((state) => ({
          activeSessions: state.activeSessions.filter(
            s => new Date(s.expiresAt) > now
          ),
        }));
      },
      
      setCurrentSession: (session) => {
        set({ currentSession: session });
      },
    }),
    {
      name: 'support-session-storage',
    }
  )
);
