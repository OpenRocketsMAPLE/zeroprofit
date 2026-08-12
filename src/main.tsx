// ZeroProfit app entry — fonts are self-hosted via @fontsource (no runtime CDN).

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/ubuntu/300.css';
import '@fontsource/ubuntu/400.css';
import '@fontsource/ubuntu/500.css';
import '@fontsource/ubuntu/700.css';
import '@fontsource/ubuntu-condensed/400.css';
import '@fontsource/oswald/300.css';
import '@fontsource/oswald/500.css';
import '@fontsource/anton/400.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/marketing.css';
import './styles/app.css';

import { App } from './App';
import { ToastProvider } from './components/ui/Toast';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
