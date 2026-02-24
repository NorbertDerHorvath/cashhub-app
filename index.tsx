import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Root element not found');
}

const apiKey = (process.env as any)?.GEMINI_API_KEY as string;

function MissingKey() {
  return (
    <div style={{ padding: 20, color: 'white', fontFamily: 'system-ui' }}>
      <h2>Hiányzó GEMINI_API_KEY</h2>
      <p>Az app UI-ja működik, de a Gemini hívásokhoz nincs beállítva API kulcs ezen a publikált oldalon.</p>
      <p>Ha demo módban is menjen kulcs nélkül, szólj és csinálunk mock adatokat az App.tsx-ben.</p>
    </div>
  );
}

createRoot(rootEl).render(
  <React.StrictMode>
    {apiKey ? <App /> : <MissingKey />}
  </React.StrictMode>
);
