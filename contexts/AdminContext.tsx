import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { UserRole } from '../types.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';
import { useAuth } from './AuthContext.tsx';
import { logSecurityAudit } from '../services/dataService.ts';

interface GhostSession {
  targetUserId: string;
  targetName: string;
  targetRole: UserRole;
  originalGodId: string;
}

interface AdminContextType {
  impersonatedRole: UserRole | null;
  impersonate: (role: UserRole | null) => void;
  ghostSession: GhostSession | null;
  startGhosting: (userId: string, name: string, role: UserRole) => void;
  stopGhosting: () => void;
  isBypassActive: boolean;
  setBypassActive: (active: boolean) => void;
  isVerifiablyAdmin: boolean;
  // FIX: Added missing properties used in hooks and components to satisfy AdminContextType
  impersonatedStudentId: string | null;
  mirrorStudent: (studentId: string | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children?: ReactNode }) => {
  const { user, role } = useAuth();
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  // FIX: Added impersonatedStudentId state to track student context mirroring
  const [impersonatedStudentId, setImpersonatedStudentId] = useState<string | null>(null);
  const [ghostSession, setGhostSession] = useState<GhostSession | null>(() => {
    const saved = sessionStorage.getItem('maestro_ghost_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [isBypassActive, setBypassActiveState] = useState(() => localStorage.getItem('maestro_god_bypass') === 'true');

  const isVerifiablyAdmin = useMemo(() => {
    if (!user) return false;
    const rootEmails = ['serparenan@gmail.com', 'admin@oliemusic.com.br'];
    const isRoot = rootEmails.includes(user.email || '');
    return isRoot || role === 'god_mode' || role === 'super_admin';
  }, [user, role]);

  const impersonate = (targetRole: UserRole | null) => {
    if (!isVerifiablyAdmin) return;
    haptics.heavy();
    setImpersonatedRole(targetRole);
    if (targetRole) {
      notify.warning(`Contexto Alterado: Visualizando como ${targetRole.toUpperCase()}`);
    }
  };

  // FIX: Added mirrorStudent function to set the current student being mirrored in Admin UI
  const mirrorStudent = (studentId: string | null) => {
    if (!isVerifiablyAdmin) return;
    haptics.heavy();
    setImpersonatedStudentId(studentId);
    if (studentId) {
      notify.warning(`Espelhamento Ativo: Sincronizando com Estudante ${studentId}`);
    }
  };

  const startGhosting = (userId: string, name: string, targetRole: UserRole) => {
    if (!isVerifiablyAdmin || !user) return;
    haptics.fever();
    
    const session: GhostSession = {
      targetUserId: userId,
      targetName: name,
      targetRole: targetRole,
      originalGodId: user.id
    };

    sessionStorage.setItem('maestro_ghost_session', JSON.stringify(session));
    setGhostSession(session);
    
    notify.error(`INFILTRAÇÃO ATIVA: Entrando como ${name}`);
    logSecurityAudit('GHOST_MODE_ENGAGED', { target: userId, target_role: targetRole });
    
    // Força recarregamento para injetar o novo contexto nos hooks
    setTimeout(() => window.location.reload(), 500);
  };

  const stopGhosting = () => {
    sessionStorage.removeItem('maestro_ghost_session');
    setGhostSession(null);
    haptics.heavy();
    notify.success("Infiltração encerrada. Voltando ao Soberano.");
    logSecurityAudit('GHOST_MODE_DISENGAGED');
    setTimeout(() => window.location.reload(), 500);
  };

  const setBypassActive = (active: boolean) => {
    if (!isVerifiablyAdmin) return;
    setBypassActiveState(active);
    localStorage.setItem('maestro_god_bypass', String(active));
  };

  return (
    <AdminContext.Provider value={{ 
      impersonatedRole, 
      impersonate, 
      ghostSession,
      startGhosting,
      stopGhosting,
      isBypassActive, 
      setBypassActive,
      isVerifiablyAdmin,
      // FIX: Added missing context values to the provider value
      impersonatedStudentId,
      mirrorStudent
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  return context;
};