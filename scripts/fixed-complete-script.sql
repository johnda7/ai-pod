-- ============================================
-- ИСПРАВЛЕННЫЙ ПОЛНЫЙ СКРИПТ
-- ============================================

-- 1. Добавление недостающих колонок (безопасно)
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'BRONZE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS interest TEXT DEFAULT 'Гейминг';
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_hp INTEGER DEFAULT 5;

-- 2. Исправление типа inventory (если это text[])
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'inventory' 
        AND data_type = 'ARRAY'
    ) THEN
        -- Конвертируем text[] в jsonb
        ALTER TABLE users 
        ALTER COLUMN inventory TYPE jsonb 
        USING CASE 
            WHEN inventory IS NULL THEN '[]'::jsonb
            WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb
            ELSE to_jsonb(inventory)
        END;
        RAISE NOTICE '✅ Конвертирован inventory из text[] в jsonb';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'inventory'
    ) THEN
        ALTER TABLE users ADD COLUMN inventory JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Создана колонка inventory';
    END IF;
END $$;

-- 3. Обновление значений по умолчанию (БЕЗ COALESCE для inventory)
UPDATE users 
SET 
    inventory = CASE 
        WHEN inventory IS NULL THEN '[]'::jsonb
        ELSE inventory
    END,
    league = COALESCE(league, 'BRONZE'),
    interest = COALESCE(interest, 'Гейминг'),
    streak = COALESCE(streak, 0),
    max_hp = COALESCE(max_hp, 5),
    coins = COALESCE(coins, 100),
    xp = COALESCE(xp, 0),
    level = COALESCE(level, 1),
    hp = COALESCE(hp, 5)
WHERE 
    league IS NULL 
    OR interest IS NULL 
    OR streak IS NULL 
    OR max_hp IS NULL
    OR coins IS NULL
    OR xp IS NULL
    OR level IS NULL
    OR hp IS NULL
    OR inventory IS NULL;

-- 4. Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_task ON progress(user_id, task_id);

-- 5. Уникальное ограничение для progress
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

-- 6. Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Триггер
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for users" ON users;
DROP POLICY IF EXISTS "Allow all for progress" ON progress;
DROP POLICY IF EXISTS "Public users access" ON users;
DROP POLICY IF EXISTS "Public progress access" ON progress;

CREATE POLICY "Public users access" ON users
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public progress access" ON progress
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Готово!
SELECT '✅ Все исправления применены успешно!' as status;
