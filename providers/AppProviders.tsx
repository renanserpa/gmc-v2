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
import { useSchoolTheme } from '../hooks/useSchoolTheme.ts';
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

const ThemeSynchronizer = () => {
    useSchoolTheme();
    return null;
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
                            <ThemeSynchronizer />
                            {children}
                            <ToastContainer 
                                position="bottom-right"
                                theme="dark"
                                autoClose={3000}
                                toastClassName="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl"
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