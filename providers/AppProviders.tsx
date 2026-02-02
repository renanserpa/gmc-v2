import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext.tsx';
import { AdminProvider } from '../contexts/AdminContext.tsx';
import { GamificationProvider } from '../contexts/GamificationEventContext.tsx';
import { TuningProvider } from '../contexts/TuningContext.tsx';
import { AccessibilityProvider } from '../contexts/AccessibilityContext.tsx';
import { ThemeProvider } from '../contexts/ThemeContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.tsx';
import { TooltipProvider } from '../components/ui/Tooltip.tsx';
import { useSchoolBranding } from '../hooks/useSchoolBranding.ts';
import '../lib/i18n.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente Wrapper para injetar hooks que dependem de Contextos
const BrandingWrapper = ({ children }: { children: ReactNode }) => {
    useSchoolBranding(); // Injeta o CSS da escola ativa
    return <>{children}</>;
};

export const AppProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AdminProvider>
              <ThemeProvider>
                  <AccessibilityProvider>
                    <GamificationProvider>
                        <TuningProvider>
                            <BrandingWrapper>
                                {children}
                            </BrandingWrapper>
                            <ToastContainer 
                                position="bottom-right"
                                theme="dark"
                                toastClassName="bg-slate-800 text-slate-100 border border-slate-700"
                            />
                        </TuningProvider>
                    </GamificationProvider>
                  </AccessibilityProvider>
              </ThemeProvider>
            </AdminProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};