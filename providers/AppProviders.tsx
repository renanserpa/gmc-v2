import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext.tsx';
import { GamificationProvider } from '../contexts/GamificationEventContext.tsx';
import { TuningProvider } from '../contexts/TuningContext.tsx';
import { AccessibilityProvider } from '../contexts/AccessibilityContext.tsx';
import { ThemeProvider } from '../contexts/ThemeContext.tsx'; // Importado
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from '../components/ErrorBoundary.tsx';
import { TooltipProvider } from '../components/ui/Tooltip.tsx';
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

export const AppProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ThemeProvider> {/* Novo Provider */}
                <AccessibilityProvider>
                  <GamificationProvider>
                      <TuningProvider>
                          {children}
                          <ToastContainer 
                              position="bottom-right"
                              theme="dark"
                              toastClassName="bg-slate-800 text-slate-100 border border-slate-700"
                          />
                      </TuningProvider>
                  </GamificationProvider>
                </AccessibilityProvider>
            </ThemeProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};