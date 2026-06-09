// main.js — Entry point for the travel planner app

// Import CSS (Vite handles this)
import './style.css';

// Import and initialize the app
import { init } from './app.js';

// ---- PWA Service Worker via vite-plugin-pwa ----
// registerType: 'autoUpdate' with skipWaiting + clientsClaim
// means new SW takes over immediately without page refresh
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Auto-update: new content available, update immediately
    updateSW(true);
    console.log('PWA: New content available, updating...');
  },
  onOfflineReady() {
    console.log('PWA: Ready for offline use');
  },
  onRegistered(registration) {
    console.log('PWA: SW registered:', registration?.scope);
  },
  onRegisterError(error) {
    console.warn('PWA: SW registration failed:', error);
  }
});

// ---- Offline detection ----
function updateOnlineStatus() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  if (!navigator.onLine) {
    banner.hidden = false;
    banner.textContent = '当前离线，仅可查看已缓存的计划内容。';
    banner.className = 'offline-banner show';
  } else {
    banner.hidden = true;
    banner.className = 'offline-banner';
  }
}

// Insert offline banner into DOM before the main container
function createOfflineBanner() {
  const banner = document.createElement('div');
  banner.id = 'offlineBanner';
  banner.className = 'offline-banner';
  banner.hidden = true;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  // Insert as first child of body
  document.body.insertBefore(banner, document.body.firstChild);
}

// Show a toast-style notification for offline state changes in the app area
function showOfflineToast() {
  const main = document.querySelector('main.container');
  if (!main) return;

  // Remove existing toast if any
  const existing = document.getElementById('offlineToast');
  if (existing) existing.remove();

  if (!navigator.onLine) {
    const toast = document.createElement('div');
    toast.id = 'offlineToast';
    toast.className = 'offline-toast';
    toast.textContent = '📡 当前离线，仅可查看已缓存的计划内容。';
    toast.setAttribute('role', 'alert');
    main.insertBefore(toast, main.firstChild);
  }
}

// Initialize app when DOM is ready
// ES modules are deferred, so DOM is already parsed
window.addEventListener('DOMContentLoaded', () => {
  createOfflineBanner();
  window.addEventListener('online', () => {
    updateOnlineStatus();
    showOfflineToast();
  });
  window.addEventListener('offline', () => {
    updateOnlineStatus();
    showOfflineToast();
  });
  // Initial check
  updateOnlineStatus();
  if (!navigator.onLine) showOfflineToast();
});

// Initialize app
init();

// Handle Capacitor platform
if (window.Capacitor) {
  console.log('Running in Capacitor environment');
  if (window.Capacitor.Plugins?.StatusBar) {
    window.Capacitor.Plugins.StatusBar.setStyle({ style: 'DARK' });
  }
}
