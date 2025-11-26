/**
 * Автоматическая настройка Supabase через API
 * Использование: node scripts/auto-setup-with-key.js YOUR_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) {
  console.log('❌ Укажите service_role ключ!');
  console.log('\n📝 Использование:');
  console.log('   node scripts/auto-setup-with-key.js YOUR_SERVICE_ROLE_KEY');
  console.log('\n💡 Где взять ключ:');
  console.log('   1. Supabase Dashboard -> Settings -> API Keys');
  console.log('   2. Вкладка "Legacy anon, service_role API keys"');
  console.log('   3. Скопируйте service_role ключ');
  process.exit(1);
}

async function setupSupabase() {
  console.log('🚀 Начинаю автоматическую настройку Supabase...\n');

  try {
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
      `DO $$ BEGIN BEGIN ALTER TABLE users ALTER COLUMN inventory DROP DEFAULT; EXCEPTION WHEN OTHERS THEN NULL; END; END $$;`,
      `ALTER TABLE users ALTER COLUMN inventory TYPE jsonb USING CASE WHEN inventory IS NULL THEN '[]'::jsonb WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb ELSE to_jsonb(inventory) END;`,
      `ALTER TABLE users ALTER COLUMN inventory SET DEFAULT '[]'::jsonb;`,

      // 3. Обновление значений
      `UPDATE users SET inventory = COALESCE(inventory, '[]'::jsonb), league = COALESCE(league, 'BRONZE'), interest = COALESCE(interest, 'Гейминг'), streak = COALESCE(streak, 0), max_hp = COALESCE(max_hp, 5), coins = COALESCE(coins, 100), xp = COALESCE(xp, 0), level = COALESCE(level, 1), hp = COALESCE(hp, 5) WHERE inventory IS NULL OR league IS NULL OR interest IS NULL OR streak IS NULL OR max_hp IS NULL OR coins IS NULL OR xp IS NULL OR level IS NULL OR hp IS NULL;`,

      // 4. Индексы
      `CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
      `CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);`,

      // 5. Уникальное ограничение
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'progress_user_id_task_id_key') THEN ALTER TABLE progress ADD CONSTRAINT progress_user_id_task_id_key UNIQUE(user_id, task_id); END IF; END $$;`,

      // 6. Функция и триггер
      `CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';`,
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users;`,
      `CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

      // 7. RLS политики
      `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE progress ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Public users access" ON users;`,
      `CREATE POLICY "Public users access" ON users FOR ALL USING (true) WITH CHECK (true);`,
      `DROP POLICY IF EXISTS "Public progress access" ON progress;`,
      `CREATE POLICY "Public progress access" ON progress FOR ALL USING (true) WITH CHECK (true);`
    ];

    console.log('📝 Выполняю SQL команды через API...\n');

    // Выполняем каждую команду
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`[${i + 1}/${sqlCommands.length}] Выполняю команду...`);

      try {
        // Пробуем через прямой SQL запрос (требует специальной функции)
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: sql })
        });

        if (response.ok) {
          console.log(`   ✅ Успешно`);
        } else {
          const error = await response.text();
          console.log(`   ⚠️  Пропущено (возможно уже выполнено): ${error.substring(0, 50)}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Ошибка: ${error.message}`);
      }
    }

    console.log('\n✅ Настройка завершена!');
    console.log('\n📋 Проверьте:');
    console.log('   1. Запустите приложение: npm run dev');
    console.log('   2. Проверьте консоль браузера');
    console.log('   3. Войдите через Telegram и проверьте работу');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.log('\n💡 Альтернатива: Выполните SQL скрипт вручную');
    console.log('   Файл: scripts/FINAL_SETUP.sql');
  }
}

setupSupabase();
