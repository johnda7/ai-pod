
// Mock interface for Telegram WebApp
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  ThemeParams: any;
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
  if (isTelegramApp() && telegram?.initDataUnsafe?.user) {
    return telegram.initDataUnsafe.user;
  }
  return null;
};

export const initTelegramApp = () => {
  if (isTelegramApp()) {
    telegram?.ready();
    telegram?.expand();
    // Here you would set the app theme based on telegram.ThemeParams
  }
};
