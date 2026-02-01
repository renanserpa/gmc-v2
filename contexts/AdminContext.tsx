import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { UserRole } from '../types.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';
import { useAuth } from './AuthContext.tsx';
import { logSecurityAudit } from '../services/dataService.ts';

interface AdminContextType {
  impersonatedRole: UserRole | null;
  impersonate: (role: UserRole | null) => void;
  impersonatedStudentId: string | null;
  mirrorStudent: (studentId: string | null) => void;
  isBypassActive: boolean;
  setBypassActive: (active: boolean) => void;
  activeFeatureOverrides: Record<string, boolean>;
  toggleFeatureOverride: (featureId: string) => void;
  isVerifiablyAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children?: ReactNode }) => {
  const { user, role } = useAuth();
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [impersonatedStudentId, setImpersonatedStudentId] = useState<string | null>(null);
  const [isBypassActive, setBypassActiveState] = useState(false);
  const [activeFeatureOverrides, setActiveFeatureOverrides] = useState<Record<string, boolean>>({});

  // SEGURANÇA: Validação de metadados no JWT para evitar escalação de privilégios via DB roles apenas
  const isVerifiablyAdmin = useMemo(() => {
      if (!user) return false;
      const metaAdmin = user.user_metadata?.is_admin === true || user.user_metadata?.role === 'super_admin';
      const rootEmails = ['serparenan@gmail.com', 'admin@oliemusic.com.br'];
      const isRoot = rootEmails.includes(user.email || '');
      const hasCorrectRole = role === 'admin' || role === 'super_admin';
      
      return (isRoot || metaAdmin) && hasCorrectRole;
  }, [user, role]);

  const impersonate = (role: UserRole | null) => {
    if (!isVerifiablyAdmin) {
        notify.error("Acesso Negado: Privilégios insuficientes.");
        return;
    }
    haptics.heavy();
    setImpersonatedRole(role);
    if (role) {
      notify.warning(`MODO ADMIN: Simulando visão de ${role.toUpperCase()}`);
      logSecurityAudit('IMPERSONATION_START', { role });
    } else {
      notify.info("MODO ADMIN: Retornando à visão Root.");
      logSecurityAudit('IMPERSONATION_END');
    }
  };

  const mirrorStudent = (studentId: string | null) => {
    if (!isVerifiablyAdmin) return;
    haptics.heavy();
    setImpersonatedStudentId(studentId);
    if (studentId) {
      notify.warning(`SESSION MIRRORING: Visualizando cockpit do aluno ${studentId}`);
      logSecurityAudit('MIRRORING_START', { studentId });
    } else {
      setImpersonatedStudentId(null);
      logSecurityAudit('MIRRORING_END');
    }
  };

  const setBypassActive = (active: boolean) => {
    if (!isVerifiablyAdmin) return;
    setBypassActiveState(active);
    logSecurityAudit(active ? 'BYPASS_ENABLED' : 'BYPASS_DISABLED');
  };

  const toggleFeatureOverride = (featureId: string) => {
    if (!isVerifiablyAdmin) return;
    setActiveFeatureOverrides(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  return (
    <AdminContext.Provider value={{ 
      impersonatedRole, 
      impersonate, 
      impersonatedStudentId,
      mirrorStudent,
      isBypassActive, 
      setBypassActive,
      activeFeatureOverrides,
      toggleFeatureOverride,
      isVerifiablyAdmin
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