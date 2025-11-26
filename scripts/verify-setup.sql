-- ============================================
-- ПРОВЕРКА НАСТРОЙКИ SUPABASE
-- Выполните в SQL Editor для проверки
-- ============================================

-- 1. Проверка структуры таблицы users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Проверка что все нужные поля есть
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'telegram_id') THEN '✅ telegram_id'
        ELSE '❌ telegram_id'
    END as telegram_id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'inventory') THEN '✅ inventory (jsonb)'
        ELSE '❌ inventory'
    END as inventory,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'league') THEN '✅ league'
        ELSE '❌ league'
    END as league;

-- 3. Проверка типа inventory
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'inventory';

-- 4. Проверка индексов
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('users', 'progress')
ORDER BY tablename, indexname;

-- 5. Проверка RLS политик
SELECT 
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN ('users', 'progress');

-- 6. Проверка данных (пример)
SELECT 
    id,
    telegram_id,
    name,
    xp,
    coins,
    level,
    inventory,
    league
FROM users
LIMIT 5;
