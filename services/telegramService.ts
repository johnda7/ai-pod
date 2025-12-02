
// Interface for Telegram WebApp
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  ThemeParams: any;
  enableClosingConfirmation: () => void;
  isExpanded: boolean;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const telegram = window.Telegram?.WebApp;

export const isTelegramApp = (): boolean => {
  return !!telegram?.initData;
};

export const getTelegramUser = () => {
  console.log("TG Service: Checking for user...");

  // 1. Try Native WebApp
  if (telegram?.initDataUnsafe?.user) {
    console.log("TG Service: Found User (Native):", telegram.initDataUnsafe.user);
    return telegram.initDataUnsafe.user;
  }
  
  // 2. Try parsing URL Params (Good for dev/testing links outside of Telegram client)
  try {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user');
      const tgWebAppData = urlParams.get('tgWebAppData');
      
      if (userParam) {
          const parsedUser = JSON.parse(userParam);
          console.log("TG Service: Found User (URL Param):", parsedUser);
          return parsedUser;
      }

      // Sometimes tgWebAppData contains the JSON
      if (tgWebAppData) {
          // Decoding logic would go here, but usually initDataUnsafe handles this automatically if script is loaded
          console.log("TG Service: tgWebAppData present but not parsed by WebApp?");
      }
  } catch (e) {
      console.error("TG Service: Error parsing URL params", e);
  }

  console.log("TG Service: No user found. Running in Guest Mode?");
  return null;
};

export const initTelegramApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    console.log("TG Service: Initializing WebApp");
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    try {
        window.Telegram.WebApp.enableClosingConfirmation();
    } catch(e) {}
  }
};

// ==================== HAPTIC FEEDBACK ====================
// Вибрация телефона при нажатии - создаёт premium ощущение!

/**
 * Лёгкая вибрация - для обычных нажатий кнопок
 */
export const hapticLight = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  } catch (e) {}
};

/**
 * Средняя вибрация - для важных действий (выбор урока)
 */
export const hapticMedium = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
  } catch (e) {}
};

/**
 * Сильная вибрация - для очень важных действий (завершение урока)
 */
export const hapticHeavy = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
  } catch (e) {}
};

/**
 * Успех - зелёная галочка, урок пройден!
 */
export const hapticSuccess = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
  } catch (e) {}
};

/**
 * Ошибка - неправильный ответ
 */
export const hapticError = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
  } catch (e) {}
};

/**
 * Предупреждение - streak заканчивается
 */
export const hapticWarning = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
  } catch (e) {}
};

/**
 * Выбор изменён - для свайпов и переключателей
 */
export const hapticSelection = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  } catch (e) {}
};