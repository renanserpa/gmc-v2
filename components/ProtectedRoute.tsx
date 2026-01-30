
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
    return null; // AppLoader já está cobrindo a tela
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // EMERGENCY BYPASS (GOD MODE)
  // Se o usuário for o admin root, ele tem passe livre para qualquer rota administrativa
  const isRootAdmin = user.email === 'admin@oliemusic.dev';
  if (isRootAdmin && location.pathname.startsWith('/admin')) {
    return children ? <>{children}</> : <Outlet />;
  }
  
  // Se o perfil/role não carregou (Sync Issue), mas o usuário está autenticado
  if (!role) {
     const onboardingPaths = ['/student/link', '/guardian/setup', '/student/onboarding'];
     if (onboardingPaths.some(path => location.pathname.startsWith(path))) {
         return children ? <>{children}</> : <Outlet />;
     }
     
     // Redireciona para o seletor de perfil como último recurso
     if (location.pathname !== '/app') {
        return <Navigate to="/app" replace />;
     }
  }

  // Validação de Role regular
  if (role && !allowedRoles.includes(role)) {
    console.warn(`[Security-Guard] Acesso bloqueado: Role ${role} tentou acessar ${location.pathname}. Requisitado: ${allowedRoles.join(',')}`);
    
    // Evita loop infinito se já estiver no destino correto
    const targetPath = role === 'manager' ? '/manager' : `/${role}`;
    if (location.pathname === targetPath) return children ? <>{children}</> : <Outlet />;
    
    return <Navigate to={targetPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
