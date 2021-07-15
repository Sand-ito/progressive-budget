const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/db.js",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== DATA_CACHE_NAME && key !== CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", (e) => {
    if (e.req.url.includes("/api/")) {
      e.respondWith(
        caches
          .open(DATA_CACHE_NAME).then((cache) => {
            return fetch(e.req)
              .then((res) => {
                if (res.status === 200) {
                  cache.put(e.req, res.clone());
                }
  
                return res;
              })
              .catch(() => {
                return cache.match(e.req);
              });
          })
          .catch((err) => console.log(err))
      );
      return;
    }

    e.respondWith(
      caches.match(e.req).then((res) => {
        return res || fetch(e.req);
      })
    );
});
