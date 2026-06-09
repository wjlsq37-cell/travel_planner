// main.js — Entry point for the travel planner app

// Import CSS (Vite handles this)
import './style.css';

// Import and initialize the app
import { init } from './app.js';

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err));
  });
}

// Initialize app when DOM is ready
// ES modules are deferred, so DOM is already parsed
init();

// Handle Capacitor platform
if (window.Capacitor) {
  console.log('Running in Capacitor environment');
  // Status bar style for Android
  if (window.Capacitor.Plugins?.StatusBar) {
    window.Capacitor.Plugins.StatusBar.setStyle({ style: 'DARK' });
  }
}
