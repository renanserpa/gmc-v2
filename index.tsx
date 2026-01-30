import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Certifique-se de que este arquivo existe ou remova esta linha

const container = document.getElementById('root');

if (!container) {
  throw new Error("Não foi possível encontrar o elemento root. Verifique seu index.html");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);