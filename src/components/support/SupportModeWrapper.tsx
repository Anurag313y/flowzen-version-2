import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useSupportSessionStore } from '@/store/supportSessionStore';
import { useAuthStore } from '@/store/authStore';
import { SupportModeBanner } from './SupportModeBanner';

interface SupportModeWrapperProps {
  children: React.ReactNode;
  allowedRoles: ('manager' | 'waiter')[];
}

export function SupportModeWrapper({ children, allowedRoles }: SupportModeWrapperProps) {
  const [searchParams] = useSearchParams();
  const { getSupportSession, setCurrentSession, currentSession } = useSupportSessionStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const supportSessionId = searchParams.get('support_session');
    
    if (supportSessionId) {
      const session = getSupportSession(supportSessionId);
      if (session) {
        setCurrentSession(session);
        setIsChecking(false);
        return;
      }
    }
    
    setIsChecking(false);
  }, [searchParams, getSupportSession, setCurrentSession]);

  // If checking session, show loading
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Support session mode
  if (currentSession) {
    // Check if the role matches
    const expectedRole = currentSession.role === 'admin' ? 'manager' : 'waiter';
    if (!allowedRoles.includes(expectedRole)) {
      return <Navigate to="/" replace />;
    }

    return (
      <>
        <SupportModeBanner session={currentSession} />
        {children}
      </>
    );
  }

  // Normal authentication flow
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'waiter' ? '/waiter' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
