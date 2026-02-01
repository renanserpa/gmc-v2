
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

  const normalizedRole = role?.toLowerCase() || '';

  // ROOT ADMIN BYPASS: Soberania total sobre as rotas
  if (normalizedRole === 'super_admin' || normalizedRole === 'admin' || user.email === 'serparenan@gmail.com') {
    return children ? <>{children}</> : <Outlet />;
  }

  // Verificação de Roles Permitidas para usuários comuns
  const hasAccess = allowedRoles.some(r => {
    const req = r.toLowerCase();
    if (req === normalizedRole) return true;
    // Compatibilidade de nomes para gestores
    if (req === 'manager' && normalizedRole === 'school_manager') return true;
    if (req === 'school_manager' && normalizedRole === 'manager') return true;
    return false;
  });

  if (!hasAccess) {
    console.warn(`[Security] Acesso negado. User: ${user.email}, Role: ${role}. Permitidos: ${allowedRoles.join(',')}`);
    return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
