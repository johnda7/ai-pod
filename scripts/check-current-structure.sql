-- ============================================
-- ПРОВЕРКА ТЕКУЩЕЙ СТРУКТУРЫ ТАБЛИЦ
-- Выполните это ПЕРЕД исправлением
-- ============================================

-- Проверка структуры users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Проверка структуры progress
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'progress'
ORDER BY ordinal_position;

-- Проверка существующих индексов
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('users', 'progress');

-- Проверка ограничений
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('users', 'progress');
