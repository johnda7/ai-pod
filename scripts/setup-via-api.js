/**
 * Автоматическая настройка Supabase через API
 * Запуск: node scripts/setup-via-api.js
 */

const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHF5bHRqYmN3cXdibG5odWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc2OTQsImV4cCI6MjA3OTU0MzY5NH0.fmyt1OPdu15FUMxr3FrlWEstGMTMXlWcE9clqDOov5o';

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL Error: ${error}`);
  }

  return await response.json();
}

async function setupSupabase() {
  console.log('🚀 Начинаю автоматическую настройку Supabase...\n');

  try {
    // Проверка подключения
    console.log('1️⃣ Проверка подключения...');
    const healthCheck = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!healthCheck.ok) {
      throw new Error('Не удалось подключиться к Supabase');
    }
    console.log('✅ Подключение установлено\n');

    // SQL команды для выполнения
    const sqlCommands = [
      // 1. Добавление колонок
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'BRONZE';`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS interest TEXT DEFAULT 'Гейминг';`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS max_hp INTEGER DEFAULT 5;`,

      // 2. Исправление inventory
      `ALTER TABLE users ALTER COLUMN inventory DROP DEFAULT;`,
      `ALTER TABLE users ALTER COLUMN inventory TYPE jsonb USING CASE WHEN inventory IS NULL THEN '[]'::jsonb WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb ELSE to_jsonb(inventory) END;`,
      `ALTER TABLE users ALTER COLUMN inventory SET DEFAULT '[]'::jsonb;`,

      // 3. Индексы
      `CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
      `CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);`,

      // 4. Уникальное ограничение
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'progress_user_id_task_id_key') THEN ALTER TABLE progress ADD CONSTRAINT progress_user_id_task_id_key UNIQUE(user_id, task_id); END IF; END $$;`,

      // 5. RLS политики
      `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE progress ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Public users access" ON users;`,
      `CREATE POLICY "Public users access" ON users FOR ALL USING (true) WITH CHECK (true);`,
      `DROP POLICY IF EXISTS "Public progress access" ON progress;`,
      `CREATE POLICY "Public progress access" ON progress FOR ALL USING (true) WITH CHECK (true);`
    ];

    console.log('2️⃣ Выполнение SQL команд...\n');

    // Пробуем выполнить через прямой SQL запрос
    // Но для этого нужен service_role ключ или специальная функция
    
    console.log('⚠️ Для выполнения SQL через API нужен service_role ключ');
    console.log('📝 Создаю альтернативный скрипт...\n');

    // Создаем скрипт который можно выполнить в Supabase Dashboard
    const sqlScript = sqlCommands.join('\n');
    
    console.log('✅ SQL скрипт подготовлен!');
    console.log('\n📋 Скопируйте и выполните этот код в Supabase SQL Editor:\n');
    console.log('='.repeat(60));
    console.log(sqlScript);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.log('\n💡 Попробуйте выполнить SQL скрипт вручную в Supabase Dashboard');
  }
}

setupSupabase();
