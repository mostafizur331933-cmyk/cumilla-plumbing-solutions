// ===== কুমিল্লা প্লাম্বিং সলিউশনস — Service Worker =====
// এটি সাইটটিকে অফলাইনেও (আংশিক) খোলার সুবিধা দেয় এবং দ্রুত লোড করায়।

const CACHE_NAME = "cps-cache-v1";
const CACHE_URLS = [
  "index.html",
  "gallery.html",
  "contact.html",
  "style.css",
  "script.js",
  "manifest.json",
  "logo.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// ইনস্টলের সময় মূল ফাইলগুলো ক্যাশে রাখুন
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS)),
  );
  self.skipWaiting();
});

// পুরোনো ক্যাশ পরিষ্কার করুন
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// নেটওয়ার্ক-প্রথম, ব্যর্থ হলে ক্যাশ থেকে দেখান
// (Firebase/Firestore রিকোয়েস্ট ক্যাশ করা হবে না, যাতে লাইভ ডেটা সবসময় আপডেটেড থাকে)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // শুধু নিজের origin-এর GET রিকোয়েস্ট handle করুন
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
