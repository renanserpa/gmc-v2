
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types.ts';
import { notify } from '../lib/notification.ts';
import { haptics } from '../lib/haptics.ts';

interface AdminContextType {
  impersonatedRole: UserRole | null;
  impersonate: (role: UserRole | null) => void;
  isBypassActive: boolean;
  setBypassActive: (active: boolean) => void;
  activeFeatureOverrides: Record<string, boolean>;
  toggleFeatureOverride: (featureId: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// FIX: Make children optional to resolve "Property 'children' is missing" errors in AppProviders
export const AdminProvider = ({ children }: { children?: ReactNode }) => {
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [isBypassActive, setBypassActive] = useState(false);
  const [activeFeatureOverrides, setActiveFeatureOverrides] = useState<Record<string, boolean>>({});

  const impersonate = (role: UserRole | null) => {
    haptics.heavy();
    setImpersonatedRole(role);
    if (role) {
      notify.warning(`MODO ADMIN: Simulando visão de ${role.toUpperCase()}`);
    } else {
      notify.info("MODO ADMIN: Retornando à visão Root.");
    }
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
