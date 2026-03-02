import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerSW({
  onNeedRefresh() {
    console.log('New content available. Refresh the app.');
  },
  onOfflineReady() {
    console.log('ElecTech is ready for offline use.');
  },
});
