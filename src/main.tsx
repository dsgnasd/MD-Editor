import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './assets/styles.css';

const initTheme = () => {
  const saved = localStorage.getItem('md-editor-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
};

initTheme();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
