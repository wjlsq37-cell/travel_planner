// main.js — Entry point for the travel planner app

// Import CSS (Vite handles this)
import './style.css';

// Import and initialize the app
import { init } from './app.js';

// ---- PWA Service Worker via vite-plugin-pwa ----
// registerType: 'prompt' — user clicks to update, no forced refresh
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // New SW waiting — show update prompt at bottom
    showUpdateBanner();
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

// ---- Update banner ----
function showUpdateBanner() {
  // Remove existing banner if any
  const existing = document.getElementById('updateBanner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.className = 'update-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <span class="update-banner-text">发现新版本可用</span>
    <button class="update-banner-btn" id="updateBannerBtn">点击更新</button>
  `;

  // Insert before the tabbar (last child of body)
  document.body.appendChild(banner);

  // Trigger slide-in animation
  requestAnimationFrame(() => {
    banner.classList.add('show');
  });

  // Click handler
  banner.querySelector('#updateBannerBtn').addEventListener('click', () => {
    banner.classList.remove('show');
    banner.addEventListener('transitionend', () => {
      banner.remove();
    }, { once: true });

    // Activate waiting SW and refresh the page
    updateSW(true);
  });
}

// ---- Offline detection ----
function updateOnlineStatus() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  if (!navigator.onLine) {
    banner.hidden = false;
    banner.textContent = '当前离线，无法生成新计划，可查看历史计划。';
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
  document.body.insertBefore(banner, document.body.firstChild);
}

// Show a toast-style notification for offline state
function showOfflineToast() {
  const main = document.querySelector('main.container');
  if (!main) return;

  const existing = document.getElementById('offlineToast');
  if (existing) existing.remove();

  if (!navigator.onLine) {
    const toast = document.createElement('div');
    toast.id = 'offlineToast';
    toast.className = 'offline-toast';
    toast.textContent = '📡 当前离线，无法生成新计划，可查看历史计划。';
    toast.setAttribute('role', 'alert');
    main.insertBefore(toast, main.firstChild);
  }
}

// ---- Init ----
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
