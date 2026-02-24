import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element (#root) not found');

// a vite.config.ts-ben define-oltuk, ezért itt string lesz (vagy üres)
const apiKey = (process.env as any)?.GEMINI_API_KEY as string;

function MissingKey() {
  return (
    <div style={{ padding: 20, color: 'white', fontFamily: 'system-ui' }}>
      <h2>Hiányzik a GEMINI_API_KEY</h2>
      <p>Az app UI-ja működik, de a Gemini hívásokhoz nincs beállítva API kulcs ezen a publikált oldalon.</p>
      <p>Ha demo módban is szeretnéd, szólj és csinálunk mock adatokat.</p>
    </div>
  );
}

createRoot(rootEl).render(
  <React.StrictMode>
    {apiKey ? <App /> : <MissingKey />}
  </React.StrictMode>
);
