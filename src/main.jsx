import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const API_BASE = 'https://support-base-production.up.railway.app/api/v1';

// Convert URL-safe base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe to web push notifications
async function subscribeToPush() {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Check if push is supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Get VAPID public key from backend
      const vapidRes = await fetch(`${API_BASE}/push/vapid-key`);
      const { publicKey } = await vapidRes.json();

      if (!publicKey) {
        console.log('No VAPID key available');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      // Subscribe
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log('Push subscription created');
    }

    // Send subscription to backend
    await fetch(`${API_BASE}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription }),
    });

    console.log('Push subscription saved to backend');
  } catch (err) {
    console.error('Push subscription error:', err);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Register service worker and subscribe to push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');

      // Subscribe to push after a short delay (let the app load first)
      setTimeout(() => subscribeToPush(), 2000);
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  });
}

// Re-subscribe when user logs in (listen for storage changes)
window.addEventListener('storage', (e) => {
  if (e.key === 'auth_token' && e.newValue) {
    setTimeout(() => subscribeToPush(), 1000);
  }
});
