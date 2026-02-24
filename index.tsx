import React from 'react';
import { createRoot } from 'react-dom/client';

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Root element not found');
}

function Test() {
  return (
    <div style={{ padding: 20, color: 'white', fontSize: 24 }}>
      ✅ React render OK
    </div>
  );
}

createRoot(rootEl).render(
  <React.StrictMode>
    <Test />
  </React.StrictMode>
);
