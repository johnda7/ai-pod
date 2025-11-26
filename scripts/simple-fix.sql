-- ============================================
-- ПРОСТОЙ И БЕЗОПАСНЫЙ СКРИПТ
-- Выполняйте по частям если есть ошибки
-- ============================================

-- ЧАСТЬ 1: Добавление полей в таблицу users (безопасно)
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'BRONZE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS interest TEXT DEFAULT 'Гейминг';
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_hp INTEGER DEFAULT 5;

-- ЧАСТЬ 2: Уникальный индекс для telegram_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_telegram_id_unique ON users(telegram_id) WHERE telegram_id IS NOT NULL;

-- ЧАСТЬ 3: Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);

-- ЧАСТЬ 4: Уникальное ограничение для progress (если еще нет)
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

-- ЧАСТЬ 5: Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ЧАСТЬ 6: Триггер
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ЧАСТЬ 7: RLS политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users access" ON users;
CREATE POLICY "Public users access" ON users
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public progress access" ON progress;
CREATE POLICY "Public progress access" ON progress
    FOR ALL USING (true) WITH CHECK (true);

-- Готово!
SELECT '✅ Все настройки применены!' as status;
