-- ============================================
-- ДОБАВЛЕНИЕ КОЛОНКИ tools_data В ТАБЛИЦУ users
-- ============================================
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Добавляем колонку tools_data для хранения данных инструментов
-- (Привычки, Цели, Заметки, Колесо Баланса, Дневник Эмоций и т.д.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}'::jsonb;

-- 2. Добавляем колонку last_activity для отслеживания стриков
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TEXT;

-- 3. Создаём индекс для быстрого доступа к tools_data
CREATE INDEX IF NOT EXISTS idx_users_tools_data ON users USING GIN (tools_data);

-- 4. Обновляем NULL значения
UPDATE users 
SET tools_data = '{}'::jsonb 
WHERE tools_data IS NULL;

-- 5. Проверка - показать структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Готово!
SELECT '✅ Колонка tools_data успешно добавлена!' as status;

