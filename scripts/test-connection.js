/**
 * Простой тест подключения к Supabase
 * Запуск: node scripts/test-connection.js
 */

// Используем ключи из supabaseClient.ts
const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHF5bHRqYmN3cXdibG5odWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc2OTQsImV4cCI6MjA3OTU0MzY5NH0.fmyt1OPdu15FUMxr3FrlWEstGMTMXlWcE9clqDOov5o';

async function testConnection() {
  console.log('🔍 Тестирование подключения к Supabase...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Key:', SUPABASE_KEY.substring(0, 30) + '...\n');

  try {
    // Простой HTTP запрос для проверки
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      console.log('✅ Подключение к Supabase работает!\n');
      
      // Проверка таблицы users
      const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact'
        }
      });

      if (usersResponse.ok) {
        const count = usersResponse.headers.get('content-range')?.split('/')[1] || '0';
        console.log(`✅ Таблица users доступна (записей: ${count})`);
      } else {
        console.log('⚠️ Таблица users не найдена или недоступна');
        console.log('   Выполните SQL скрипт: scripts/setup-supabase-complete.sql');
      }

      // Проверка таблицы progress
      const progressResponse = await fetch(`${SUPABASE_URL}/rest/v1/progress?select=count`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact'
        }
      });

      if (progressResponse.ok) {
        const count = progressResponse.headers.get('content-range')?.split('/')[1] || '0';
        console.log(`✅ Таблица progress доступна (записей: ${count})`);
      } else {
        console.log('⚠️ Таблица progress не найдена или недоступна');
        console.log('   Выполните SQL скрипт: scripts/setup-supabase-complete.sql');
      }

      console.log('\n🎉 Базовая проверка завершена!');
      console.log('\n📝 Следующие шаги:');
      console.log('   1. Выполните SQL скрипт в Supabase Dashboard');
      console.log('   2. Запустите приложение: npm run dev');
      console.log('   3. Проверьте консоль браузера');

    } else {
      console.error('❌ Ошибка подключения:', response.status, response.statusText);
      console.log('\n💡 Проверьте:');
      console.log('   - Правильность URL и ключа');
      console.log('   - Доступность проекта Supabase');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testConnection();
