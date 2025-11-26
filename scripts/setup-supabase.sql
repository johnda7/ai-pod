-- ============================================
-- SQL СКРИПТ ДЛЯ СОЗДАНИЯ ТАБЛИЦ В SUPABASE
-- ============================================
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- 1. Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE,
    username TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'TEEN' CHECK (role IN ('TEEN', 'PARENT', 'CURATOR')),
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    hp INTEGER DEFAULT 5,
    max_hp INTEGER DEFAULT 5,
    avatar_url TEXT,
    streak INTEGER DEFAULT 0,
    interest TEXT DEFAULT 'Гейминг',
    inventory JSONB DEFAULT '[]'::jsonb,
    league TEXT DEFAULT 'BRONZE' CHECK (league IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Таблица прогресса по задачам
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- 3. Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);

-- 4. Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS) - отключаем для упрощения (можно включить позже)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешаем все для анонимных пользователей)
-- ВНИМАНИЕ: Для продакшена нужно настроить более строгие политики!
DROP POLICY IF EXISTS "Allow all for users" ON users;
CREATE POLICY "Allow all for users" ON users
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for progress" ON progress;
CREATE POLICY "Allow all for progress" ON progress
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ПРОВЕРКА: Выполните эти запросы для проверки
-- ============================================
-- SELECT * FROM users;
-- SELECT * FROM progress;
