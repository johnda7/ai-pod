-- ============================================
-- ПОЛНЫЙ SQL СКРИПТ ДЛЯ НАСТРОЙКИ SUPABASE
-- ============================================
-- Проект: rnxqyltjbcwqwblnhuhm
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- ============================================
-- ШАГ 1: Удаление старых таблиц (если есть)
-- ============================================
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- ШАГ 2: Создание таблицы users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE,
    username TEXT,
    name TEXT NOT NULL DEFAULT 'Студент',
    role TEXT NOT NULL DEFAULT 'TEEN' CHECK (role IN ('TEEN', 'PARENT', 'CURATOR')),
    xp INTEGER DEFAULT 0 NOT NULL,
    coins INTEGER DEFAULT 100 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    hp INTEGER DEFAULT 5 NOT NULL,
    max_hp INTEGER DEFAULT 5 NOT NULL,
    avatar_url TEXT,
    streak INTEGER DEFAULT 0 NOT NULL,
    interest TEXT DEFAULT 'Гейминг',
    inventory JSONB DEFAULT '[]'::jsonb,
    league TEXT DEFAULT 'BRONZE' CHECK (league IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ШАГ 3: Создание таблицы progress
-- ============================================
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0 NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- ============================================
-- ШАГ 4: Создание индексов для производительности
-- ============================================
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_task_id ON progress(task_id);
CREATE INDEX idx_progress_user_task ON progress(user_id, task_id);

-- ============================================
-- ШАГ 5: Функция для автоматического обновления updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- ШАГ 6: Триггер для автоматического обновления updated_at
-- ============================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ШАГ 7: Настройка Row Level Security (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Удаление старых политик (если есть)
DROP POLICY IF EXISTS "Allow all for users" ON users;
DROP POLICY IF EXISTS "Allow all for progress" ON progress;
DROP POLICY IF EXISTS "Public users access" ON users;
DROP POLICY IF EXISTS "Public progress access" ON progress;

-- Политики для таблицы users (разрешаем все для анонимных пользователей)
-- ВНИМАНИЕ: Для продакшена настройте более строгие политики!
CREATE POLICY "Public users access" ON users
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Политики для таблицы progress
CREATE POLICY "Public progress access" ON progress
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- ШАГ 8: Проверка создания таблиц
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Таблица users создана';
    RAISE NOTICE '✅ Таблица progress создана';
    RAISE NOTICE '✅ Индексы созданы';
    RAISE NOTICE '✅ RLS политики настроены';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Проверьте структуру:';
    RAISE NOTICE '   SELECT * FROM users LIMIT 1;';
    RAISE NOTICE '   SELECT * FROM progress LIMIT 1;';
END $$;

-- ============================================
-- ГОТОВО! Теперь можно тестировать подключение
-- ============================================
