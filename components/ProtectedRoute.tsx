
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
  const isRootAdmin = user.email === 'admin@oliemusic.dev' || isTestUser || role === 'super_admin';

  // Se for Admin Global, ele entra em qualquer rota que exija 'admin' ou 'super_admin'
  if (isRootAdmin && (location.pathname.startsWith('/admin') || allowedRoles.includes('admin') || allowedRoles.includes('super_admin'))) {
    return children ? <>{children}</> : <Outlet />;
  }
  
  // Se o perfil/role não carregou (Sync Issue), mas o usuário está autenticado
  if (!role) {
     if (location.pathname !== '/app') {
        return <Navigate to="/app" replace />;
     }
  }

  // Validação de Role regular
  // Comparamos com normalização (ex: manager vs school_manager)
  const hasAccess = allowedRoles.includes(role || '') || 
                    (role === 'super_admin' && allowedRoles.includes('admin')) ||
                    (role === 'school_manager' && allowedRoles.includes('manager')) ||
                    (role === 'manager' && allowedRoles.includes('school_manager'));

  if (!hasAccess) {
    console.warn(`[Security-Guard] Acesso bloqueado para ${user.email}. Role: ${role}. Necessário: ${allowedRoles.join(',')}`);
    
    // Se o usuário tentar acessar algo proibido, envia para o dashboard dele
    if (role) {
        // Obter caminho via AuthContext (seria melhor via hook, mas fazemos manual aqui para evitar circularity)
        let dashboard = '/app';
        if (['admin', 'super_admin'].includes(role)) dashboard = '/admin';
        else if (['manager', 'school_manager'].includes(role)) dashboard = '/manager';
        else dashboard = `/${role}`;

        if (location.pathname === dashboard) return children ? <>{children}</> : <Outlet />;
        return <Navigate to={dashboard} replace />;
    }
    
    return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
