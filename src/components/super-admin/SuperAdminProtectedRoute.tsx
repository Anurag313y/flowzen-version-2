import { Navigate } from 'react-router-dom';
import { useSuperAdminStore } from '@/store/superAdminStore';

interface SuperAdminProtectedRouteProps {
  children: React.ReactNode;
}

export function SuperAdminProtectedRoute({ children }: SuperAdminProtectedRouteProps) {
  const { isSuperAdminAuthenticated } = useSuperAdminStore();

  if (!isSuperAdminAuthenticated) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return <>{children}</>;
}
