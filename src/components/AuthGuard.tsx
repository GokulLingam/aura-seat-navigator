import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'GUEST';
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  showLogin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  fallback,
  showLogin = true,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasRole = (role: string) => user?.role === role;
  const hasPermission = (perm: string) => user?.permissions?.includes(perm);
  const hasAnyRole = (roles: string[]) => roles.includes(user?.role);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need {requiredRole} privileges to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {user?.role}
          </p>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required: {requiredPermissions.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required access
  return <>{children}</>;
};

export default AuthGuard; 