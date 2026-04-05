import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CraftProvider } from '@kuboxx/craft-ui';
import '@kuboxx/craft-ui/styles.css';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CraftProvider vibe="scrapbook">
      <App />
    </CraftProvider>
  </StrictMode>,
);
