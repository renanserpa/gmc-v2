
import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAdmin } from '../contexts/AdminContext.tsx';
import SaaSAdminDashboard from './admin/SaaSAdminDashboard.tsx';
import GodModeDashboard from './admin/GodModeDashboard.tsx';

/**
 * AdminDashboard Core: O ponto de entrada unificado.
 * Decide qual dashboard renderizar baseado no estado de 'God Mode' (Bypass) e permissões.
 */
export default function AdminDashboard() {
    const { user } = useAuth();
    const { isBypassActive } = useAdmin();

    // Se o bypass estiver ativo e for o root, mostra ferramentas de kernel
    if (user?.email === 'serparenan@gmail.com' && isBypassActive) {
        return <GodModeDashboard />;
    }

    // Caso contrário, mostra o dashboard de gestão de negócios SaaS
    return <SaaSAdminDashboard />;
}
