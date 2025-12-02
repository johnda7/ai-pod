-- ============================================
-- ИСПРАВЛЕНИЕ ТИПА ДАННЫХ inventory
-- ============================================

-- Сначала проверим текущий тип
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'inventory';

-- Если inventory это text[], конвертируем в jsonb
DO $$
BEGIN
    -- Проверяем тип колонки
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'inventory' 
        AND data_type = 'ARRAY'
    ) THEN
        -- Конвертируем text[] в jsonb
        ALTER TABLE users 
        ALTER COLUMN inventory TYPE jsonb 
        USING CASE 
            WHEN inventory IS NULL THEN '[]'::jsonb
            WHEN array_length(inventory, 1) IS NULL THEN '[]'::jsonb
            ELSE to_jsonb(inventory)
        END;
        
        RAISE NOTICE '✅ Конвертирован inventory из text[] в jsonb';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'inventory'
    ) THEN
        -- Если колонки нет, создаем как jsonb
        ALTER TABLE users ADD COLUMN inventory JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Создана колонка inventory как jsonb';
    ELSE
        RAISE NOTICE '✅ Колонка inventory уже имеет правильный тип';
    END IF;
END $$;

-- Теперь безопасное обновление значений
UPDATE users 
SET 
    inventory = CASE 
        WHEN inventory IS NULL THEN '[]'::jsonb
        WHEN inventory::text = '[]' THEN '[]'::jsonb
        ELSE inventory
    END,
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
    OR max_hp IS NULL
    OR coins IS NULL
    OR xp IS NULL
    OR level IS NULL
    OR hp IS NULL;

SELECT '✅ Исправление завершено!' as status;
