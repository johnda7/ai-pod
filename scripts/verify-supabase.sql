-- ============================================
-- СКРИПТ ДЛЯ ПРОВЕРКИ НАСТРОЙКИ SUPABASE
-- ============================================
-- Выполните этот скрипт после setup-supabase-complete.sql

-- 1. Проверка существования таблиц
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('users', 'progress')
ORDER BY table_name;

-- 2. Проверка структуры таблицы users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Проверка структуры таблицы progress
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'progress'
ORDER BY ordinal_position;

-- 4. Проверка индексов
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'progress')
ORDER BY tablename, indexname;

-- 5. Проверка ограничений (constraints)
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('users', 'progress')
ORDER BY tc.table_name, tc.constraint_type;

-- 6. Проверка RLS политик
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('users', 'progress')
ORDER BY tablename, policyname;

-- 7. Тестовая вставка (опционально)
-- Раскомментируйте для теста:
/*
INSERT INTO users (telegram_id, name, role) 
VALUES (123456789, 'Test User', 'TEEN')
RETURNING *;

INSERT INTO progress (user_id, task_id, xp_earned)
SELECT id, 't1', 100 FROM users WHERE telegram_id = 123456789
RETURNING *;

-- Удаление тестовых данных
DELETE FROM progress WHERE user_id IN (SELECT id FROM users WHERE telegram_id = 123456789);
DELETE FROM users WHERE telegram_id = 123456789;
*/
