-- ============================================
-- СКРИПТ ДЛЯ ПРОВЕРКИ СТРУКТУРЫ ТАБЛИЦ
-- ============================================
-- Выполните в SQL Editor для проверки структуры

-- Проверка таблицы users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Проверка таблицы progress
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'progress'
ORDER BY ordinal_position;

-- Проверка индексов
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'progress');

-- Проверка ограничений (constraints)
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('users', 'progress')
ORDER BY tc.table_name, tc.constraint_type;
