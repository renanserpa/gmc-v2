
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './providers/AppProviders.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error("Não foi possível encontrar o elemento root. Verifique seu index.html");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
