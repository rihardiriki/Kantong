// Service worker Kantong: membuat aplikasi bisa dibuka cepat dan tetap tampil saat offline.
// Naikkan angka versi setiap kali Anda mengubah file aplikasi.
const VER = 'kantong-v1';
const SHELL = ['./', 'index.html', 'privacy.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'icons/logo.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // Hanya file milik aplikasi sendiri. Google (login & Drive), font, dan pustaka tidak disentuh.
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  // Halaman: coba jaringan dulu supaya selalu versi terbaru, jatuh ke cache bila offline.
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
    return;
  }
  // File lain: cache dulu, perbarui di latar belakang.
  e.respondWith(caches.match(r).then(m => {
    const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; }).catch(() => m);
    return m || net;
  }));
});
