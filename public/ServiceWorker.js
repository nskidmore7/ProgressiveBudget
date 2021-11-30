const FILES_TO_CACHE = [
    '/',
    '/index.html',
    'styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/db.js',
    'index.js'
];

const CACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((cache => 
          cache.addAll(FILES_TO_CACHE))
          .then(self.skipWaiting())
        ));
  });
  
  self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
                if (key !== PRECACHE && key !== RUNTIME) {
                console.log('deleting cache');
                return caches.delete(keyList);
                }
            }));
      })
    );
  });
  
  self.addEventListener('fetch', function (e) {
    if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches.open(RUNTIME).then(cache => {
        return fetch(e.request)
        .then(response => {
          if (response.status === 200) {
            cache.put(e.request.url, response.clone());
        }
        return response;
        })
        .catch(err => {
          return cache.match(e.request);
        });
      })
      .catch(err => console.log(err))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request)
    })
  )
  });