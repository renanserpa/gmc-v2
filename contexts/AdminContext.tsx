import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '../types.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';
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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children?: ReactNode }) => {
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [impersonatedStudentId, setImpersonatedStudentId] = useState<string | null>(null);
  const [isBypassActive, setBypassActiveState] = useState(false);
  const [activeFeatureOverrides, setActiveFeatureOverrides] = useState<Record<string, boolean>>({});

  const impersonate = (role: UserRole | null) => {
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
    setBypassActiveState(active);
    logSecurityAudit(active ? 'BYPASS_ENABLED' : 'BYPASS_DISABLED');
  };

  const toggleFeatureOverride = (featureId: string) => {
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
      toggleFeatureOverride
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
