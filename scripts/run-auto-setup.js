/**
 * Автоматическая настройка Supabase через API
 */

const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHF5bHRqYmN3cXdibG5odWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk2NzY5NCwiZXhwIjoyMDc5NTQzNjk0fQ.THfAkq_i0eFEnBqtd22n6ZdNZyKnldve_d2rl88e6_w';

async function executeSQL(sql) {
  try {
    // Пробуем через прямой HTTP запрос к PostgREST
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    return { ok: response.ok, data: await response.text() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function setupSupabase() {
  console.log('🚀 Начинаю автоматическую настройку Supabase...\n');

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
    DO $$ BEGIN BEGIN ALTER TABLE users ALTER COLUMN inventory DROP DEFAULT; EXCEPTION WHEN OTHERS THEN NULL; END; END $$;
    ALTER TABLE users ALTER COLUMN inventory TYPE jsonb USING CASE WHEN inventory IS NULL THEN '[]'::jsonb WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb ELSE to_jsonb(inventory) END;
    ALTER TABLE users ALTER COLUMN inventory SET DEFAULT '[]'::jsonb;

    -- Обновление значений
    UPDATE users SET inventory = COALESCE(inventory, '[]'::jsonb), league = COALESCE(league, 'BRONZE'), interest = COALESCE(interest, 'Гейминг'), streak = COALESCE(streak, 0), max_hp = COALESCE(max_hp, 5), coins = COALESCE(coins, 100), xp = COALESCE(xp, 0), level = COALESCE(level, 1), hp = COALESCE(hp, 5) WHERE inventory IS NULL OR league IS NULL OR interest IS NULL OR streak IS NULL OR max_hp IS NULL OR coins IS NULL OR xp IS NULL OR level IS NULL OR hp IS NULL;

    -- Индексы
    CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);

    -- Уникальное ограничение
    DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'progress_user_id_task_id_key') THEN ALTER TABLE progress ADD CONSTRAINT progress_user_id_task_id_key UNIQUE(user_id, task_id); END IF; END $$;

    -- Функция и триггер
    CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- RLS политики
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public users access" ON users;
    CREATE POLICY "Public users access" ON users FOR ALL USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Public progress access" ON progress;
    CREATE POLICY "Public progress access" ON progress FOR ALL USING (true) WITH CHECK (true);
  `;

  console.log('📝 Пробую выполнить через API...\n');

  const result = await executeSQL(sql);

  if (result.ok) {
    console.log('✅ Настройка выполнена успешно через API!');
  } else {
    console.log('⚠️  Не удалось выполнить через API');
    console.log('💡 Причина: ' + (result.error || result.data));
    console.log('\n📋 Выполните SQL вручную:');
    console.log('   1. Откройте файл: scripts/QUICK_FIX.sql');
    console.log('   2. Скопируйте весь код');
    console.log('   3. В Supabase Dashboard -> SQL Editor -> вставьте и Run');
  }

  console.log('\n✅ Готово!');
}

setupSupabase();
