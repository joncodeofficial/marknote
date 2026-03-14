import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { DimensionsProvider } from './context/GlobalContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DimensionsProvider>
      <App />
    </DimensionsProvider>
  </React.StrictMode>
);
