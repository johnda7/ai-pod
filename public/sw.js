/**
 * 🚀 AI Pod Service Worker
 * Кэширует изображения и статические ресурсы для мгновенной загрузки
 */

const CACHE_NAME = 'ai-pod-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней

// Ресурсы для предзагрузки
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Паттерны для кэширования
const CACHE_PATTERNS = {
  images: /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i,
  unsplash: /images\.unsplash\.com/i,
  fonts: /\.(woff|woff2|ttf|eot)$/i,
  static: /\.(css|js)$/i,
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Precaching core resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация - очистка старых кэшей
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('🗑️ Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия кэширования
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') return;
  
  // Пропускаем API запросы и YouTube
  if (url.hostname.includes('supabase') || 
      url.hostname.includes('youtube') ||
      url.hostname.includes('googleapis')) {
    return;
  }

  // Стратегия для изображений: Cache First
  if (CACHE_PATTERNS.images.test(url.pathname) || 
      CACHE_PATTERNS.unsplash.test(url.href)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Стратегия для статики: Stale While Revalidate
  if (CACHE_PATTERNS.static.test(url.pathname) ||
      CACHE_PATTERNS.fonts.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Для остального: Network First
  event.respondWith(networkFirst(event.request));
});

/**
 * Cache First - сначала кэш, потом сеть
 * Идеально для изображений
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Проверяем возраст кэша
    const cacheDate = cachedResponse.headers.get('sw-cache-date');
    if (cacheDate) {
      const age = Date.now() - parseInt(cacheDate);
      if (age < CACHE_DURATION) {
        return cachedResponse;
      }
    } else {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Клонируем и добавляем дату кэширования
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', Date.now().toString());
      
      const body = await responseToCache.blob();
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    return networkResponse;
  } catch (error) {
    // Если сеть недоступна, возвращаем из кэша (даже устаревший)
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

/**
 * Stale While Revalidate - возвращаем кэш и обновляем в фоне
 * Идеально для CSS/JS
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

/**
 * Network First - сначала сеть, потом кэш
 * Для HTML и динамического контента
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

// Сообщения от клиента
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('🗑️ Cache cleared');
    });
  }
});

