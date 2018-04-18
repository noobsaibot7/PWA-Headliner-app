importScripts('/src/js/idb.js');
importScripts('/src/js/utils.js');

const STATIC_CACHE = 'head-static-v3';
const DYNAMIC_CACHE = 'head-dynamic';
const API_KEY = 'aa330a0050dd47848af943354d5744cd';
var URL = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=aa330a0050dd47848af943354d5744cd';
const STATIC_FILES = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/offline.html',
    '/src/js/idb.js',
    '/src/js/utils.js',    
    '/src/js/material.min.js',
    '/src/css/app.css',
    "/src/images/none.png",
     'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];



function isInArray(val, arr) {
    arr.forEach(item => {
        if (val === item) {
            return true;
        } else {
            return false;
        }
    })
}

function trimCache(cacheName, maxItem) {
    caches.open(cacheName)
        .then(cache => {
            return cache.keys().then(keys => {
                if (keys.length > maxItem) {
                    cache.delete(keys[0]).then(trimCache(cacheName, maxItem))
                }
            })
        })
}

self.addEventListener('install', event => {
    console.log('service worker installing');
    event.waitUntil(caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_FILES);
    })
    );
});



self.addEventListener('activate', event => {
    console.log('service worker activating', event);
    event.waitUntil(caches.keys().then(keyval => {
        return Promise.all(keyval.map(key => {
            if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
                caches.delete(key);
            }
        }))
    }))
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.url.indexOf(URL) > -1) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    var val = res.clone();
                    clearDataAll('feeds')
                    .then(()=>{
                       return val.json(); 
                    })
                    .then(data => {                      
                            dbPromise
                                .then(db=>{
                                    var tx = db.transaction('feeds', 'readwrite');
                                    var store = tx.objectStore('feeds');
                                    data.articles.forEach(mess=>{
                                store.put(mess);
                            });                                
                            });
                        })
                   
                     
                    return res;
                })
        );

    } else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    }
    else {
        event.respondWith(caches.match(event.request).then(resp => {
            if (resp) {
                return resp;
            } else {
                return fetch(event.request)
                    .then(res => {
                        return caches.open(DYNAMIC_CACHE).then(cache => {
                            trimCache(DYNAMIC_CACHE, 30);
                            cache.put(event.request.url, res.clone());
                            return res;
                        })
                    }).catch(err => {
                        return caches.open(STATIC_CACHE).then(cache => {
                            console.log(event.request);
                            if (event.request.headers.get('accept').includes('text/html')) {
                                return cache.match('/offline.html');
                            }
                        });
                    });
            }
        })
        );

    }
});


