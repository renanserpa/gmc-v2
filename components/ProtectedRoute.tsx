
import React from 'react';
import * as RRD from 'react-router-dom';
const { Navigate, useLocation, Outlet } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole } from '../types.ts';

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

  // EMERGENCY BYPASS (GOD MODE)
  // Admite admin@oliemusic.dev OU qualquer usuário do domínio @adm.com como autoridade de teste
  const isTestUser = user.email?.endsWith('@adm.com');
  const isRootAdmin = user.email === 'admin@oliemusic.dev' || isTestUser;

  if (isRootAdmin && location.pathname.startsWith('/admin')) {
    return children ? <>{children}</> : <Outlet />;
  }
  
  // Se o perfil/role não carregou (Sync Issue), mas o usuário está autenticado
  if (!role) {
     const onboardingPaths = ['/student/link', '/guardian/setup', '/student/onboarding'];
     if (onboardingPaths.some(path => location.pathname.startsWith(path))) {
         return children ? <>{children}</> : <Outlet />;
     }
     
     if (location.pathname !== '/app') {
        return <Navigate to="/app" replace />;
     }
  }

  // Validação de Role regular
  if (role && !allowedRoles.includes(role)) {
    // Admins de teste podem ver tudo
    if (isTestUser && role === 'admin') return children ? <>{children}</> : <Outlet />;

    console.warn(`[Security-Guard] Acesso bloqueado para ${user.email}`);
    const targetPath = role === 'manager' ? '/manager' : `/${role}`;
    if (location.pathname === targetPath) return children ? <>{children}</> : <Outlet />;
    return <Navigate to={targetPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
