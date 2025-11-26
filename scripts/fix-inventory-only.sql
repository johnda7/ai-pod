-- ============================================
-- ИСПРАВЛЕНИЕ ТОЛЬКО inventory (остальное уже готово)
-- Скопируйте и выполните в SQL Editor
-- ============================================

-- Удаляем DEFAULT
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE users ALTER COLUMN inventory DROP DEFAULT;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Конвертируем ARRAY в JSONB
ALTER TABLE users 
ALTER COLUMN inventory TYPE jsonb 
USING CASE 
  WHEN inventory IS NULL THEN '[]'::jsonb
  WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb
  ELSE to_jsonb(inventory)
END;

-- Устанавливаем новый DEFAULT
ALTER TABLE users ALTER COLUMN inventory SET DEFAULT '[]'::jsonb;

-- Обновляем существующие записи
UPDATE users 
SET inventory = COALESCE(inventory, '[]'::jsonb)
WHERE inventory IS NULL;

SELECT '✅ inventory исправлен на JSONB!' as status;
