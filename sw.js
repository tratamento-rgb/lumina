// LUMINA · funciona sem internet
// Ao mudar qualquer arquivo do app, aumente o número da versão abaixo.
const VERSION = "lumina-v2";
const SHELL = ["./", "index.html", "styles.css", "icons.js", "books.js", "data.js", "app.js", "manifest.json",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("lumina-") && k !== VERSION && k !== "lumina-media").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // arquivos do app: tenta a internet (para pegar atualizações) e cai no que está guardado
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
    );
    return;
  }

  // fotos, fontes e capítulos da Bíblia: usa o guardado e só baixa se ainda não tiver
  if (/images\.unsplash\.com|fonts\.(googleapis|gstatic)\.com|bible-api\.com/.test(url.host)) {
    e.respondWith(
      caches.open("lumina-media").then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === "opaque") c.put(req, res.clone());
        return res;
      })))
    );
  }
});
