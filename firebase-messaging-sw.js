// The 25th · reminders (D-05Nov-1, app v142c).
// Shows the daily reminder the server sends through Firebase Cloud Messaging, and opens the app
// on Add (morning: yesterday) or on the review list when the reminder is tapped.
// The server sends data only ({title, body, slot, kind, rid, url}); no amounts or names ever.
// This file must sit next to index.html on GitHub.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let p = {};
  try { p = event.data ? event.data.json() : {}; } catch (e) { p = {}; }
  const d = p.data || p || {};
  const title = d.title || 'The 25th';
  const body = d.body || "Today's spends, sorted in 15 sec.";
  const url = d.url || (self.registration.scope + '?rem=' + (d.slot || 'evening') + '&kind=' + (d.kind || 'log'));
  // tell an open app that it arrived (the Settings test checks this)
  const tellApp = self.clients.matchAll({type: 'window', includeUncontrolled: true})
    .then(list => list.forEach(c => c.postMessage({type: 'rem-push', rid: d.rid || ''}))).catch(() => {});
  event.waitUntil(Promise.all([tellApp, self.registration.showNotification(title, {
    body,
    icon: 'icon-192.png',
    badge: 'badge-rupee.png',
    tag: 'the25th-reminder',          // a newer reminder replaces an older one
    renotify: true,
    data: {url, slot: d.slot || '', kind: d.kind || 'log', rid: d.rid || ''}
  })]));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const d = event.notification.data || {};
  const target = new URL(d.url || self.registration.scope, self.registration.scope);
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    const mine = all.find(c => c.url.startsWith(self.registration.scope));
    if (mine) {
      // the app is already open: bring it forward and tell it where to go
      mine.postMessage({type: 'rem-open', slot: d.slot, kind: d.kind, rid: d.rid});
      return mine.focus();
    }
    return self.clients.openWindow(target.href);
  })());
});
