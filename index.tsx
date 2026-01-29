import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './providers/AppProviders.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Elemento #root não encontrado.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
