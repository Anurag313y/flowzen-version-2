import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, type UserRole } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on role
    if (user.role === 'waiter') {
      return <Navigate to="/waiter" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
