
import React from 'react';
import * as RRD from 'react-router-dom';
const { Navigate, useLocation, Outlet } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';
import { notify } from '../lib/notification.ts';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: string[];
  requireRoot?: boolean;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, allowedRoles, requireRoot = false } = props;
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; 

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = role?.toLowerCase() || '';
  const isRoot = user.email === 'serparenan@gmail.com';

  // Blindagem Root: Rotas de sistema (/system) EXIGEM o e-mail root
  if (requireRoot && !isRoot) {
    console.error(`[Security Violation] Usuário ${user.email} tentou acessar rota ROOT.`);
    notify.error("Acesso Negado: Esta área exige soberania Root.");
    return <Navigate to="/" replace />;
  }

  // Bypass para o Root em qualquer outra rota protegida
  if (isRoot) {
    return children ? <>{children}</> : <Outlet />;
  }

  const hasAccess = allowedRoles.some(r => {
    const req = r.toLowerCase();
    if (req === normalizedRole) return true;
    if (req === 'manager' && normalizedRole === 'school_manager') return true;
    if (req === 'school_manager' && normalizedRole === 'manager') return true;
    return false;
  });

  if (!hasAccess) {
    console.warn(`[Security] Acesso Negado: ${user.email} (${role})`);
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
