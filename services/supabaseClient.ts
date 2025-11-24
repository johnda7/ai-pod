
import { createClient } from '@supabase/supabase-js';

// --- НАСТРОЙКИ ПОДКЛЮЧЕНИЯ SUPABASE ---

// 1. URL вашего проекта:
const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co'; 

// 2. Ваш публичный API ключ (anon key):
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHF5bHRqYmN3cXdibG5odWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc2OTQsImV4cCI6MjA3OTU0MzY5NH0.fmyt1OPdu15FUMxr3FrlWEstGMTMXlWcE9clqDOov5o'; 

// ----------------------------------------

export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const isSupabaseEnabled = !!supabase;

// Проверка в консоли для отладки
if (isSupabaseEnabled) {
  console.log('✅ Supabase успешно подключена:', SUPABASE_URL);
} else {
  console.log('⚠️ Supabase НЕ подключена (проверьте ключи)');
}
