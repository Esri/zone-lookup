/*
 *   Copyright (c) 2022 Esri
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */


self.addEventListener('fetch', (event) => {
    event.respondWith(caches.open('cache').then((cache) => {
        return cache.match(event.request).then((response) => {
            console.log("cache request: " + event.request.url);
            var fetchPromise = fetch(event.request).then((networkResponse) => {
                // if we got a response from the cache, update the cache  
                console.log("fetch completed: " + event.request.url, networkResponse);
                if (networkResponse) {
                    console.debug("updated cached page: " + event.request.url, networkResponse);
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }, function (event) {
                // rejected promise - just ignore it, we're offline!   
                console.log("Error in fetch()", event);
                event.waitUntil(
                    // our 'cache' here is named *cache* in the caches.open()
                    caches.open('cache').then((cache) => {
                        return cache.addAll
                            ([
                                // cache.addAll(), takes a list of URLs, then fetches them from 
                                // the server and adds the response to the cache 
                                './index.html', // cache your index page
                                './styles/main.css', // cache app.main css
                                './assets/*', // cache all images
                                './manifest.json',
                                // external url fetch, twitter's as an example

                            ]);
                    }));
            });
            // respond from the cache, or the network
            return response || fetchPromise;
        });
    }));
});

// always updating i.e latest version available
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log("Latest version installed!");
});
