
import React from 'react';
import * as RRD from 'react-router-dom';
const { Navigate, useLocation, Outlet } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, allowedRoles } = props;
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; 
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalização de Roles para comparação
  const normalizedRole = role?.toLowerCase() || '';
  
  // SUPER ADMIN BYPASS: Ele entra em qualquer lugar
  if (normalizedRole === 'super_admin' || normalizedRole === 'admin') {
    return children ? <>{children}</> : <Outlet />;
  }

  // Verificação de Roles Permitidas
  const hasAccess = allowedRoles.some(r => {
    const req = r.toLowerCase();
    if (req === normalizedRole) return true;
    if (req === 'manager' && normalizedRole === 'school_manager') return true;
    if (req === 'school_manager' && normalizedRole === 'manager') return true;
    return false;
  });

  if (!hasAccess) {
    console.warn(`[Security] Acesso negado para ${user.email}. Role: ${role}. Necessário: ${allowedRoles.join(',')}`);
    return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
