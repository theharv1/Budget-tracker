//constant representing files to cache
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/manifest.webmanifest",
    "/db.js"
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";
  //add event listener to install service worker
  self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("files pre-cache successful");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  //add event listener to activate service worker
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("delete cached data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  //add event listener to fetch service worker
  self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
          //network request successful
            .then(response => {
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch(e => {
              // network request failed; get file from cache 
              return cache.match(evt.request);
            });
        }).catch(e => console.log(e))
      );
      return;
    }
    //return cache reponse if exist in cache
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  }); 