import { useState, useEffect, useCallback } from 'react';
import { syncToolsDataToSupabase, loadToolsDataFromSupabase } from '../services/db';
import { getTelegramUser } from '../services/telegramService';

interface UseSyncToolOptions {
  storageKey: string;
  debounceMs?: number;
}

interface UseSyncToolReturn<T> {
  data: T;
  setData: (newData: T | ((prev: T) => T)) => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  isLoading: boolean;
  forceSync: () => Promise<void>;
}

/**
 * 🔄 Универсальный hook для синхронизации данных инструментов
 * 
 * Автоматически:
 * - Загружает данные из localStorage
 * - Загружает свежие данные из Supabase (если доступно)
 * - Синхронизирует изменения с Supabase (с debounce)
 * - Показывает статус синхронизации
 */
export function useSyncTool<T>(
  initialData: T,
  options: UseSyncToolOptions
): UseSyncToolReturn<T> {
  const { storageKey, debounceMs = 1000 } = options;
  
  const [data, setDataInternal] = useState<T>(initialData);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 📥 Загрузка данных при монтировании
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // 1. Сначала из localStorage (мгновенно)
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setDataInternal(parsed);
        }
      } catch (e) {
        console.error('❌ Error loading from localStorage:', e);
      }
      
      // 2. Потом из Supabase (если есть пользователь)
      const tgUser = getTelegramUser();
      if (tgUser?.id) {
        try {
          const loaded = await loadToolsDataFromSupabase(tgUser.id.toString());
          if (loaded) {
            const fresh = localStorage.getItem(storageKey);
            if (fresh) {
              setDataInternal(JSON.parse(fresh));
            }
          }
        } catch (e) {
          console.error('❌ Error loading from Supabase:', e);
        }
      }
      
      setIsLoading(false);
      setHasInitialized(true);
    };
    
    loadData();
  }, [storageKey]);

  // 📤 Сохранение и синхронизация при изменении данных
  useEffect(() => {
    if (!hasInitialized) return;
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('❌ Error saving to localStorage:', e);
    }
    
    // Debounced синхронизация с Supabase
    const syncToCloud = async () => {
      const tgUser = getTelegramUser();
      if (!tgUser?.id) return;
      
      setSyncStatus('syncing');
      try {
        const success = await syncToolsDataToSupabase(tgUser.id.toString());
        setSyncStatus(success ? 'synced' : 'error');
        if (success) {
          setTimeout(() => setSyncStatus('idle'), 2000);
        }
      } catch (e) {
        console.error('❌ Sync error:', e);
        setSyncStatus('error');
      }
    };
    
    const timeoutId = setTimeout(syncToCloud, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [data, storageKey, debounceMs, hasInitialized]);

  // 🔄 Принудительная синхронизация
  const forceSync = useCallback(async () => {
    const tgUser = getTelegramUser();
    if (!tgUser?.id) return;
    
    setSyncStatus('syncing');
    try {
      const success = await syncToolsDataToSupabase(tgUser.id.toString());
      setSyncStatus(success ? 'synced' : 'error');
      if (success) {
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    } catch (e) {
      setSyncStatus('error');
    }
  }, []);

  // 📝 Обёртка для setData
  const setData = useCallback((newData: T | ((prev: T) => T)) => {
    setDataInternal(prev => 
      typeof newData === 'function' 
        ? (newData as (prev: T) => T)(prev) 
        : newData
    );
  }, []);

  return {
    data,
    setData,
    syncStatus,
    isLoading,
    forceSync,
  };
}

/**
 * 🔔 Компонент индикатора синхронизации (для переиспользования)
 */
export { SyncIndicator } from '../components/SyncIndicator';

