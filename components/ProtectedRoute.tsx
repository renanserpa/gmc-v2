
import React from 'react';
import * as RRD from 'react-router-dom';
const { Navigate, useLocation, Outlet } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';
import { notify } from '../lib/notification.ts';
import { logger } from '../lib/logger.ts';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: string[];
  requireRoot?: boolean;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, allowedRoles, requireRoot = false } = props;
  const { user, actingRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; 

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const normalizedRole = actingRole?.toLowerCase() || '';
    const isRoot = user.email === 'serparenan@gmail.com';

    // Blindagem Root
    if (requireRoot && !isRoot) {
      logger.warn(`Acesso negado para ${user.email} em área Root.`);
      notify.error("Acesso Negado: Soberania Mestre exigida.");
      return <Navigate to="/" replace />;
    }

    if (isRoot) {
      return children ? <>{children}</> : <Outlet />;
    }

    const hasAccess = allowedRoles.some(r => r.toLowerCase() === normalizedRole);

    if (!hasAccess) {
      logger.warn(`Permissão insuficiente: ${user.email} (${actingRole})`);
      return <Navigate to="/" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
  } catch (e) {
    logger.error("Crash crítico na camada de proteção de rotas", e);
    return <Navigate to="/login" replace />;
  }
}
