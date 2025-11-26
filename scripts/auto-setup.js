/**
 * Автоматическая настройка через Supabase Management API
 * Требуется service_role ключ из Settings -> API
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
// ВАЖНО: Используйте service_role ключ (не anon key!)
// Получите его в Supabase Dashboard -> Settings -> API -> service_role key
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function setupViaManagementAPI() {
  if (!SUPABASE_SERVICE_KEY) {
    console.log('❌ SUPABASE_SERVICE_KEY не указан!');
    console.log('\n📝 Как получить:');
    console.log('1. Откройте Supabase Dashboard');
    console.log('2. Settings -> API');
    console.log('3. Скопируйте service_role key (секретный ключ)');
    console.log('4. Запустите: SUPABASE_SERVICE_KEY=ваш_ключ node scripts/auto-setup.js');
    process.exit(1);
  }

  console.log('🚀 Автоматическая настройка Supabase через Management API...\n');

  // Создаем клиент с service_role для полного доступа
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // SQL команды
    const sql = `
      -- Добавление колонок
      ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'BRONZE';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS interest TEXT DEFAULT 'Гейминг';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS max_hp INTEGER DEFAULT 5;

      -- Исправление inventory
      DO $$ 
      BEGIN
        BEGIN
          ALTER TABLE users ALTER COLUMN inventory DROP DEFAULT;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
      END $$;

      ALTER TABLE users 
      ALTER COLUMN inventory TYPE jsonb 
      USING CASE 
        WHEN inventory IS NULL THEN '[]'::jsonb
        WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb
        ELSE to_jsonb(inventory)
      END;

      ALTER TABLE users ALTER COLUMN inventory SET DEFAULT '[]'::jsonb;

      -- Индексы
      CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);

      -- Уникальное ограничение
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'progress_user_id_task_id_key'
        ) THEN
          ALTER TABLE progress ADD CONSTRAINT progress_user_id_task_id_key 
            UNIQUE(user_id, task_id);
        END IF;
      END $$;

      -- RLS
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public users access" ON users;
      CREATE POLICY "Public users access" ON users
        FOR ALL USING (true) WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Public progress access" ON progress;
      CREATE POLICY "Public progress access" ON progress
        FOR ALL USING (true) WITH CHECK (true);
    `;

    // Выполняем через RPC (если функция exec_sql существует)
    // Или используем прямой запрос к PostgREST
    console.log('📝 Выполняю SQL команды...\n');

    // Пробуем через прямой HTTP запрос к PostgREST
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log('✅ Все команды выполнены успешно!');
    } else {
      const error = await response.text();
      console.log('⚠️ Не удалось выполнить через RPC');
      console.log('📋 Создаю SQL файл для ручного выполнения...\n');
      
      // Создаем файл с SQL
      const fs = await import('fs');
      fs.writeFileSync('scripts/auto-generated-setup.sql', sql);
      console.log('✅ SQL скрипт сохранен в: scripts/auto-generated-setup.sql');
      console.log('📝 Выполните его в Supabase SQL Editor');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.log('\n💡 Создаю SQL файл для ручного выполнения...');
    
    // Создаем файл с SQL
    const fs = await import('fs');
    const sql = `-- Автоматически сгенерированный SQL скрипт
-- Выполните в Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'BRONZE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS interest TEXT DEFAULT 'Гейминг';
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_hp INTEGER DEFAULT 5;

DO $$ 
BEGIN
  BEGIN
    ALTER TABLE users ALTER COLUMN inventory DROP DEFAULT;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

ALTER TABLE users 
ALTER COLUMN inventory TYPE jsonb 
USING CASE 
  WHEN inventory IS NULL THEN '[]'::jsonb
  WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb
  ELSE to_jsonb(inventory)
END;

ALTER TABLE users ALTER COLUMN inventory SET DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'progress_user_id_task_id_key'
  ) THEN
    ALTER TABLE progress ADD CONSTRAINT progress_user_id_task_id_key 
      UNIQUE(user_id, task_id);
  END IF;
END $$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users access" ON users;
CREATE POLICY "Public users access" ON users
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public progress access" ON progress;
CREATE POLICY "Public progress access" ON progress
  FOR ALL USING (true) WITH CHECK (true);

SELECT '✅ Настройка завершена!' as status;
`;
    
    fs.writeFileSync('scripts/auto-generated-setup.sql', sql);
    console.log('✅ SQL скрипт сохранен в: scripts/auto-generated-setup.sql');
  }
}

setupViaManagementAPI();
