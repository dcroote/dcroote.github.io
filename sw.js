// Minimal Service Worker for Animal Sounds Game PWA
// This enables the app to be installed on Android home screen
// No offline caching - always fetches from network

self.addEventListener("install", () => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  // Take control immediately
  return self.clients.claim();
});
