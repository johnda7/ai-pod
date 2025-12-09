
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

// ==================== SOUND EFFECTS ====================
// Звуки для премиального ощущения приложения

// Кэш для звуков
const soundCache: Record<string, HTMLAudioElement> = {};

// Базовые звуки (короткие, не требуют загрузки)
const SOUNDS = {
  // Звуки через Web Audio API (мгновенные, без задержки)
  click: { frequency: 800, duration: 0.05, type: 'sine' as OscillatorType },
  success: { frequency: 880, duration: 0.15, type: 'sine' as OscillatorType },
  error: { frequency: 200, duration: 0.2, type: 'square' as OscillatorType },
  levelUp: { frequency: 523, duration: 0.3, type: 'sine' as OscillatorType },
  coin: { frequency: 1200, duration: 0.1, type: 'sine' as OscillatorType },
  xp: { frequency: 600, duration: 0.08, type: 'triangle' as OscillatorType },
  complete: { frequency: 700, duration: 0.2, type: 'sine' as OscillatorType },
  streak: { frequency: 1000, duration: 0.15, type: 'sine' as OscillatorType },
};

// Web Audio API контекст
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
};

/**
 * Воспроизведение звука через Web Audio API (мгновенно, без задержки)
 */
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    // Resume context if suspended (required by browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Плавное затухание для премиального звука
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {}
};

/**
 * 🎵 Звук клика - лёгкий, для обычных кнопок
 */
export const soundClick = () => {
  playTone(SOUNDS.click.frequency, SOUNDS.click.duration, SOUNDS.click.type, 0.1);
};

/**
 * 🎉 Звук успеха - для правильных ответов, завершения
 */
export const soundSuccess = () => {
  // Мелодия из двух нот
  playTone(523, 0.1, 'sine', 0.15); // C5
  setTimeout(() => playTone(659, 0.15, 'sine', 0.15), 100); // E5
};

/**
 * ❌ Звук ошибки - для неправильных ответов
 */
export const soundError = () => {
  playTone(200, 0.2, 'square', 0.1);
};

/**
 * 🆙 Звук Level Up - повышение уровня
 */
export const soundLevelUp = () => {
  // Восходящая мелодия
  playTone(523, 0.1, 'sine', 0.12); // C5
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80); // E5
  setTimeout(() => playTone(784, 0.15, 'sine', 0.15), 160); // G5
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.12), 250); // C6
};

/**
 * 🪙 Звук монеты - при получении монет
 */
export const soundCoin = () => {
  playTone(1200, 0.05, 'sine', 0.12);
  setTimeout(() => playTone(1400, 0.08, 'sine', 0.1), 50);
};

/**
 * ⚡ Звук XP - при получении опыта
 */
export const soundXP = () => {
  playTone(600, 0.08, 'triangle', 0.12);
};

/**
 * ✅ Звук завершения задачи
 */
export const soundComplete = () => {
  playTone(700, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.1), 80);
};

/**
 * 🔥 Звук streak
 */
export const soundStreak = () => {
  playTone(800, 0.08, 'sine', 0.12);
  setTimeout(() => playTone(1000, 0.1, 'sine', 0.12), 60);
  setTimeout(() => playTone(1200, 0.12, 'sine', 0.1), 120);
};

/**
 * 🎮 Звук начала таймера
 */
export const soundTimerStart = () => {
  playTone(440, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(550, 0.1, 'sine', 0.12), 100);
};

/**
 * ⏰ Звук завершения таймера
 */
export const soundTimerEnd = () => {
  playTone(880, 0.15, 'sine', 0.15);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.15), 200);
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.12), 400);
};

// ==================== PREMIUM FEEDBACK COMBOS ====================
// Комбинации haptic + звук для максимального эффекта

/**
 * 🎯 Premium Click - для всех кнопок
 */
export const premiumClick = () => {
  hapticLight();
  soundClick();
};

/**
 * ✅ Premium Success - урок пройден, привычка выполнена
 */
export const premiumSuccess = () => {
  hapticSuccess();
  soundSuccess();
};

/**
 * ❌ Premium Error - неправильный ответ
 */
export const premiumError = () => {
  hapticError();
  soundError();
};

/**
 * 🆙 Premium Level Up - повышение уровня
 */
export const premiumLevelUp = () => {
  hapticHeavy();
  soundLevelUp();
};

/**
 * 🪙 Premium Coin - получение монет
 */
export const premiumCoin = () => {
  hapticMedium();
  soundCoin();
};

/**
 * ⚡ Premium XP - получение опыта
 */
export const premiumXP = () => {
  hapticLight();
  soundXP();
};

/**
 * 🔥 Premium Streak - сохранение серии
 */
export const premiumStreak = () => {
  hapticSuccess();
  soundStreak();
};

/**
 * 📝 Premium Note - создание заметки
 */
export const premiumNote = () => {
  hapticMedium();
  soundComplete();
};

/**
 * 🎮 Premium Timer Start
 */
export const premiumTimerStart = () => {
  hapticMedium();
  soundTimerStart();
};

/**
 * ⏰ Premium Timer End
 */
export const premiumTimerEnd = () => {
  hapticHeavy();
  soundTimerEnd();
};