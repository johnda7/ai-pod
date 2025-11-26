-- ============================================
-- СКРИПТ ДЛЯ ПРОВЕРКИ И ИСПРАВЛЕНИЯ СТРУКТУРЫ
-- ============================================
-- Выполните этот скрипт если таблицы уже существуют
-- Он проверит структуру и добавит недостающие поля

-- 1. Проверка и добавление недостающих колонок в users
DO $$
BEGIN
    -- Проверка и добавление telegram_id если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'telegram_id'
    ) THEN
        ALTER TABLE users ADD COLUMN telegram_id BIGINT UNIQUE;
        RAISE NOTICE '✅ Добавлена колонка telegram_id';
    END IF;

    -- Проверка и добавление username если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'username'
    ) THEN
        ALTER TABLE users ADD COLUMN username TEXT;
        RAISE NOTICE '✅ Добавлена колонка username';
    END IF;

    -- Проверка и добавление inventory если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'inventory'
    ) THEN
        ALTER TABLE users ADD COLUMN inventory JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Добавлена колонка inventory';
    END IF;

    -- Проверка и добавление league если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'league'
    ) THEN
        ALTER TABLE users ADD COLUMN league TEXT DEFAULT 'BRONZE' 
            CHECK (league IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND'));
        RAISE NOTICE '✅ Добавлена колонка league';
    END IF;

    -- Проверка и добавление interest если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'interest'
    ) THEN
        ALTER TABLE users ADD COLUMN interest TEXT DEFAULT 'Гейминг';
        RAISE NOTICE '✅ Добавлена колонка interest';
    END IF;

    -- Проверка и добавление streak если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'streak'
    ) THEN
        ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Добавлена колонка streak';
    END IF;

    -- Проверка и добавление max_hp если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'max_hp'
    ) THEN
        ALTER TABLE users ADD COLUMN max_hp INTEGER DEFAULT 5;
        RAISE NOTICE '✅ Добавлена колонка max_hp';
    END IF;

    -- Установка значений по умолчанию для существующих записей
    UPDATE users 
    SET 
        inventory = COALESCE(inventory, '[]'::jsonb),
        league = COALESCE(league, 'BRONZE'),
        interest = COALESCE(interest, 'Гейминг'),
        streak = COALESCE(streak, 0),
        max_hp = COALESCE(max_hp, 5),
        coins = COALESCE(coins, 100),
        xp = COALESCE(xp, 0),
        level = COALESCE(level, 1),
        hp = COALESCE(hp, 5)
    WHERE 
        inventory IS NULL 
        OR league IS NULL 
        OR interest IS NULL 
        OR streak IS NULL 
        OR max_hp IS NULL;

    RAISE NOTICE '✅ Обновлены значения по умолчанию для существующих записей';
END $$;

-- 2. Проверка и создание индексов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_task ON progress(user_id, task_id);

-- 3. Проверка и создание уникального ограничения для progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'progress_user_id_task_id_key'
    ) THEN
        ALTER TABLE progress ADD CONSTRAINT progress_user_id_task_id_key 
            UNIQUE(user_id, task_id);
        RAISE NOTICE '✅ Добавлено уникальное ограничение для progress';
    END IF;
END $$;

-- 4. Проверка и создание функции update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Проверка и создание триггера
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Проверка и настройка RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Удаление старых политик
DROP POLICY IF EXISTS "Allow all for users" ON users;
DROP POLICY IF EXISTS "Allow all for progress" ON progress;
DROP POLICY IF EXISTS "Public users access" ON users;
DROP POLICY IF EXISTS "Public progress access" ON progress;

-- Создание политик
CREATE POLICY "Public users access" ON users
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public progress access" ON progress
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 7. Финальная проверка
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Проверка и исправление структуры завершено!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Текущая структура:';
    RAISE NOTICE '   - Таблица users: проверена и обновлена';
    RAISE NOTICE '   - Таблица progress: проверена';
    RAISE NOTICE '   - Индексы: созданы';
    RAISE NOTICE '   - RLS политики: настроены';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Готово к использованию!';
END $$;
