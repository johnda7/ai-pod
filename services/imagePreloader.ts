/**
 * 🖼️ Image Preloader Service
 * Предзагружает изображения для мгновенного отображения
 */

// Кэш загруженных изображений
const loadedImages = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

/**
 * Предзагрузить одно изображение
 */
export const preloadImage = (src: string): Promise<void> => {
  // Уже загружено
  if (loadedImages.has(src)) {
    return Promise.resolve();
  }
  
  // Уже загружается
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }
  
  // Начинаем загрузку
  const promise = new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      loadedImages.add(src);
      loadingPromises.delete(src);
      resolve();
    };
    img.onerror = () => {
      loadingPromises.delete(src);
      resolve(); // Не падаем при ошибке
    };
    img.src = src;
  });
  
  loadingPromises.set(src, promise);
  return promise;
};

/**
 * Предзагрузить массив изображений
 */
export const preloadImages = async (srcs: string[]): Promise<void> => {
  await Promise.all(srcs.map(preloadImage));
};

/**
 * Предзагрузить изображения следующих уроков
 */
export const preloadNextLessons = (currentIndex: number, totalLessons: { image?: string }[]) => {
  // Предзагружаем следующие 3 урока
  const nextImages: string[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const nextLesson = totalLessons[currentIndex + i];
    if (nextLesson?.image) {
      nextImages.push(nextLesson.image);
    }
  }
  
  if (nextImages.length > 0) {
    // Загружаем с низким приоритетом
    requestIdleCallback(() => {
      preloadImages(nextImages);
    });
  }
};

/**
 * Предзагрузить критические изображения при старте
 */
export const preloadCriticalImages = () => {
  const criticalImages = [
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop', // Focus tree
    'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=400&h=400&fit=crop', // Trophy
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop', // Checklist
  ];
  
  // Используем requestIdleCallback для ненавязчивой загрузки
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadImages(criticalImages);
    });
  } else {
    setTimeout(() => {
      preloadImages(criticalImages);
    }, 1000);
  }
};

/**
 * Проверить загружено ли изображение
 */
export const isImageLoaded = (src: string): boolean => {
  return loadedImages.has(src);
};

// Автозагрузка критических изображений
if (typeof window !== 'undefined') {
  preloadCriticalImages();
}

