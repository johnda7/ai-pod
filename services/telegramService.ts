
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