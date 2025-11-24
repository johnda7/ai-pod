
import { createClient } from '@supabase/supabase-js';

// --- ВАЖНО: ВСТАВЬТЕ ВАШИ ДАННЫЕ НИЖЕ ---

// 1. URL вашего проекта (Я ЕГО УЖЕ ВПИСАЛ):
const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co'; 

// 2. Теперь найдите КЛЮЧ.
//    Посмотрите на ваш скриншот:
//    - В таблице справа есть ключ с именем "web".
//    - Или чуть ниже есть поле "Publishable key".
//    Скопируйте этот длинный ключ (начинается на sb_publishable... или eyJ...)
//    И вставьте его внутрь кавычек ниже:
const SUPABASE_KEY = ''; 

// ----------------------------------------

export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const isSupabaseEnabled = !!supabase;

// Проверка в консоли для отладки
if (isSupabaseEnabled) {
  console.log('✅ Supabase подключена:', SUPABASE_URL);
} else {
  console.log('⚠️ Supabase НЕ подключена (отсутствует SUPABASE_KEY в services/supabaseClient.ts)');
}
