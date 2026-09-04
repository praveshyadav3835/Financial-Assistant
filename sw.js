// Minimal service worker — its only job is to exist and handle fetch events,
// which is what Chrome actually checks for full "Install app" eligibility
// (as opposed to a plain bookmark/shortcut with the browser badge).
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through — always fetch from the network. No offline caching
  // is attempted here; this just satisfies Chrome's installability check.
  event.respondWith(fetch(event.request));
});
