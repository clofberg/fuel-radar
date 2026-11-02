/* Fuel Radar service worker — offline shell + last-known prices */
const CACHE="fuelradar-v10";
const SHELL=["./"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  // app shell: cache-first (works offline with cached station data from localStorage)
  if(e.request.mode==="navigate"||url.origin===location.origin){
    e.respondWith(
      caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||
        fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r;})
      ));
    return;
  }
  // live data & tiles: network only (failures are handled by the app's own cache/fallback)
});
