-- ============================================
-- ИСПРАВЛЕНИЕ inventory - ПОШАГОВО
-- ============================================

-- ШАГ 1: Удаляем DEFAULT значение (если есть)
ALTER TABLE users ALTER COLUMN inventory DROP DEFAULT;

-- ШАГ 2: Конвертируем тип из text[] в jsonb
ALTER TABLE users 
ALTER COLUMN inventory TYPE jsonb 
USING CASE 
    WHEN inventory IS NULL THEN '[]'::jsonb
    WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb
    ELSE to_jsonb(inventory)
END;

-- ШАГ 3: Устанавливаем новый DEFAULT
ALTER TABLE users ALTER COLUMN inventory SET DEFAULT '[]'::jsonb;

-- ШАГ 4: Обновляем NULL значения
UPDATE users 
SET inventory = '[]'::jsonb 
WHERE inventory IS NULL;

SELECT '✅ Тип inventory исправлен на jsonb!' as status;
