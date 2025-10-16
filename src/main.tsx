import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SkincareJazzProvider } from './jazz/JazzProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkincareJazzProvider>
      <App />
    </SkincareJazzProvider>
  </StrictMode>
);
