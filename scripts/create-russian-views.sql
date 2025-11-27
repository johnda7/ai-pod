-- =====================================================
-- РУССКОЯЗЫЧНЫЕ ПРЕДСТАВЛЕНИЯ ДЛЯ КУРАТОРОВ
-- Запустите этот скрипт в Supabase SQL Editor
-- =====================================================

-- 1. ОСНОВНОЕ ПРЕДСТАВЛЕНИЕ: СТУДЕНТЫ (все данные на русском)
CREATE OR REPLACE VIEW "Студенты" AS
SELECT 
    id AS "ID",
    telegram_id AS "Telegram ID",
    username AS "Логин",
    name AS "Имя",
    CASE role 
        WHEN 'TEEN' THEN 'Ученик'
        WHEN 'PARENT' THEN 'Родитель'
        WHEN 'CURATOR' THEN 'Куратор'
        ELSE role 
    END AS "Роль",
    xp AS "Опыт (XP)",
    coins AS "Монеты",
    level AS "Уровень",
    hp AS "Жизни (HP)",
    max_hp AS "Макс. жизней",
    streak AS "Серия дней",
    CASE league 
        WHEN 'BRONZE' THEN 'Бронза'
        WHEN 'SILVER' THEN 'Серебро'
        WHEN 'GOLD' THEN 'Золото'
        WHEN 'PLATINUM' THEN 'Платина'
        WHEN 'DIAMOND' THEN 'Бриллиант'
        ELSE league 
    END AS "Лига",
    interest AS "Интерес",
    COALESCE(array_length(inventory, 1), 0) AS "Предметов в инвентаре",
    created_at AS "Дата регистрации",
    updated_at AS "Последняя активность"
FROM public.users
WHERE role = 'TEEN' OR role IS NULL
ORDER BY xp DESC;

-- 2. ПРЕДСТАВЛЕНИЕ: ПРОГРЕСС СТУДЕНТОВ
CREATE OR REPLACE VIEW "Прогресс_Студентов" AS
SELECT 
    u.name AS "Имя студента",
    u.telegram_id AS "Telegram ID",
    COUNT(p.task_id) AS "Уроков пройдено",
    SUM(COALESCE(p.xp_earned, 0)) AS "Заработано XP",
    u.xp AS "Всего XP",
    u.coins AS "Монеты",
    u.level AS "Уровень",
    u.streak AS "Серия дней",
    MAX(p.completed_at) AS "Последний урок"
FROM public.users u
LEFT JOIN public.progress p ON u.id = p.user_id
WHERE u.role = 'TEEN' OR u.role IS NULL
GROUP BY u.id, u.name, u.telegram_id, u.xp, u.coins, u.level, u.streak
ORDER BY u.xp DESC;

-- 3. ПРЕДСТАВЛЕНИЕ: ДЕТАЛИ ПРОГРЕССА (какие уроки пройдены)
CREATE OR REPLACE VIEW "Детали_Прогресса" AS
SELECT 
    u.name AS "Имя студента",
    p.task_id AS "ID урока",
    CASE p.task_id
        WHEN 't1' THEN 'Мозг v2.0'
        WHEN 't2' THEN 'Дофамин'
        WHEN 't3' THEN 'Фокус-Ниндзя'
        WHEN 't4' THEN 'Батарейка'
        WHEN 't5' THEN 'Сон: Перезагрузка'
        WHEN 't6' THEN 'БОСС: Король Шума'
        WHEN 't6_new' THEN 'Анатомия Лени'
        WHEN 't6_detox' THEN 'Дофаминовый Детокс'
        WHEN 't7' THEN 'Сила "Зачем"'
        WHEN 't8' THEN 'Съешь Лягушку'
        WHEN 't9' THEN 'Дисциплина > Мотивация'
        WHEN 't10' THEN 'Архитектура Выбора'
        WHEN 't11' THEN 'Level Up через Ошибки'
        WHEN 't12' THEN 'БОСС: Прокрастинатор'
        WHEN 't13' THEN 'Состояние Потока'
        WHEN 't14' THEN 'Помодоро 2.0'
        WHEN 't15' THEN 'Deep Work'
        WHEN 't16' THEN 'Искусство Отдыха'
        WHEN 't17' THEN 'Социальный Движок'
        WHEN 't18' THEN 'Манифест'
        WHEN 't19' THEN 'ФИНАЛ: Грандмастер'
        ELSE p.task_id
    END AS "Название урока",
    p.xp_earned AS "XP за урок",
    p.completed_at AS "Дата прохождения"
FROM public.progress p
JOIN public.users u ON p.user_id = u.id
ORDER BY p.completed_at DESC;

-- 4. ПРЕДСТАВЛЕНИЕ: ЛИДЕРБОРД
CREATE OR REPLACE VIEW "Лидерборд" AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY xp DESC) AS "Место",
    name AS "Имя",
    xp AS "Опыт (XP)",
    level AS "Уровень",
    coins AS "Монеты",
    streak AS "Серия дней",
    CASE league 
        WHEN 'BRONZE' THEN '🥉 Бронза'
        WHEN 'SILVER' THEN '🥈 Серебро'
        WHEN 'GOLD' THEN '🥇 Золото'
        WHEN 'PLATINUM' THEN '💎 Платина'
        WHEN 'DIAMOND' THEN '💠 Бриллиант'
        ELSE league 
    END AS "Лига"
FROM public.users
WHERE role = 'TEEN' OR role IS NULL
ORDER BY xp DESC
LIMIT 100;

-- 5. ПРЕДСТАВЛЕНИЕ: СТАТИСТИКА ПО НЕДЕЛЯМ
CREATE OR REPLACE VIEW "Статистика_по_Неделям" AS
SELECT 
    u.name AS "Имя студента",
    COUNT(CASE WHEN p.task_id IN ('t1','t2','t3','t4','t5','t6') THEN 1 END) AS "Неделя 1",
    COUNT(CASE WHEN p.task_id IN ('t6_new','t6_detox','t7','t8','t9','t10','t11','t12') THEN 1 END) AS "Неделя 2",
    COUNT(CASE WHEN p.task_id IN ('t13','t14','t15','t16','t17','t18','t19') THEN 1 END) AS "Неделя 3",
    COUNT(p.task_id) AS "Всего уроков",
    ROUND(COUNT(p.task_id)::numeric / 19 * 100, 1) AS "Прогресс %"
FROM public.users u
LEFT JOIN public.progress p ON u.id = p.user_id
WHERE u.role = 'TEEN' OR u.role IS NULL
GROUP BY u.id, u.name
ORDER BY COUNT(p.task_id) DESC;

-- 6. ПРЕДСТАВЛЕНИЕ: АКТИВНОСТЬ ЗА СЕГОДНЯ
CREATE OR REPLACE VIEW "Активность_Сегодня" AS
SELECT 
    u.name AS "Имя студента",
    COUNT(p.task_id) AS "Уроков сегодня",
    SUM(COALESCE(p.xp_earned, 0)) AS "XP сегодня"
FROM public.users u
JOIN public.progress p ON u.id = p.user_id
WHERE p.completed_at >= CURRENT_DATE
  AND (u.role = 'TEEN' OR u.role IS NULL)
GROUP BY u.id, u.name
ORDER BY COUNT(p.task_id) DESC;

-- 7. ПРЕДСТАВЛЕНИЕ: ПОКУПКИ В МАГАЗИНЕ
CREATE OR REPLACE VIEW "Инвентарь_Студентов" AS
SELECT 
    name AS "Имя студента",
    telegram_id AS "Telegram ID",
    coins AS "Текущий баланс",
    CASE 
        WHEN inventory @> '["hp_potion"]'::jsonb THEN '✅'
        ELSE '❌'
    END AS "Зелье жизни",
    CASE 
        WHEN inventory @> '["streak_freeze"]'::jsonb THEN '✅'
        ELSE '❌'
    END AS "Заморозка",
    CASE 
        WHEN inventory @> '["mystery_box"]'::jsonb THEN '✅'
        ELSE '❌'
    END AS "Сюрприз",
    CASE 
        WHEN inventory @> '["frame_gold"]'::jsonb THEN '✅'
        ELSE '❌'
    END AS "Золотая рамка",
    jsonb_array_length(COALESCE(inventory, '[]'::jsonb)) AS "Всего предметов"
FROM public.users
WHERE role = 'TEEN' OR role IS NULL
ORDER BY jsonb_array_length(COALESCE(inventory, '[]'::jsonb)) DESC;

-- =====================================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ (для понимания структуры)
-- =====================================================

COMMENT ON TABLE public.users IS 'Основная таблица пользователей приложения AI Pod';
COMMENT ON COLUMN public.users.id IS 'Уникальный идентификатор (UUID)';
COMMENT ON COLUMN public.users.telegram_id IS 'ID пользователя в Telegram';
COMMENT ON COLUMN public.users.username IS 'Логин в Telegram (@username)';
COMMENT ON COLUMN public.users.name IS 'Имя пользователя';
COMMENT ON COLUMN public.users.role IS 'Роль: TEEN (ученик), PARENT (родитель), CURATOR (куратор)';
COMMENT ON COLUMN public.users.xp IS 'Очки опыта';
COMMENT ON COLUMN public.users.coins IS 'Игровая валюта (монеты)';
COMMENT ON COLUMN public.users.level IS 'Текущий уровень (1 уровень = 500 XP)';
COMMENT ON COLUMN public.users.hp IS 'Текущие жизни';
COMMENT ON COLUMN public.users.max_hp IS 'Максимальные жизни';
COMMENT ON COLUMN public.users.streak IS 'Серия дней подряд';
COMMENT ON COLUMN public.users.league IS 'Лига: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND';
COMMENT ON COLUMN public.users.interest IS 'Интерес пользователя для персонализации';
COMMENT ON COLUMN public.users.inventory IS 'Инвентарь (купленные предметы)';

COMMENT ON TABLE public.progress IS 'Таблица прогресса - какие уроки пройдены';
COMMENT ON COLUMN public.progress.user_id IS 'ID пользователя (ссылка на users.id)';
COMMENT ON COLUMN public.progress.task_id IS 'ID урока (t1, t2, ... t19)';
COMMENT ON COLUMN public.progress.xp_earned IS 'XP заработанные за урок';
COMMENT ON COLUMN public.progress.completed_at IS 'Дата и время прохождения';

-- =====================================================
-- ГОТОВО! Теперь в Supabase появятся представления:
-- - Студенты
-- - Прогресс_Студентов
-- - Детали_Прогресса
-- - Лидерборд
-- - Статистика_по_Неделям
-- - Активность_Сегодня
-- - Инвентарь_Студентов
-- =====================================================



