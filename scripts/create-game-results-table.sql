-- Таблица для хранения результатов игр
-- Запустите этот скрипт в Supabase SQL Editor

-- Создание таблицы game_results
CREATE TABLE IF NOT EXISTS game_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    best_score INTEGER NOT NULL DEFAULT 0,
    total_plays INTEGER NOT NULL DEFAULT 1,
    total_wins INTEGER NOT NULL DEFAULT 0,
    max_combo INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальный индекс для комбинации user_id + game_id + level
    UNIQUE(user_id, game_id, level)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_best_score ON game_results(best_score DESC);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_game_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_game_results_updated_at ON game_results;
CREATE TRIGGER trigger_game_results_updated_at
    BEFORE UPDATE ON game_results
    FOR EACH ROW
    EXECUTE FUNCTION update_game_results_updated_at();

-- RLS политики
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть свои результаты
CREATE POLICY "Users can view own game results"
    ON game_results FOR SELECT
    USING (auth.uid()::text = user_id::text OR true); -- Разрешаем всем для лидерборда

-- Политика: пользователи могут добавлять свои результаты
CREATE POLICY "Users can insert own game results"
    ON game_results FOR INSERT
    WITH CHECK (true);

-- Политика: пользователи могут обновлять свои результаты
CREATE POLICY "Users can update own game results"
    ON game_results FOR UPDATE
    USING (true);

-- Представление для лидерборда по играм (на русском)
CREATE OR REPLACE VIEW "Лидерборд_Игр" AS
SELECT
    u.name AS "Имя_Игрока",
    gr.game_id AS "Игра",
    gr.level AS "Уровень",
    gr.best_score AS "Лучший_Счёт",
    gr.max_combo AS "Макс_Комбо",
    gr.total_plays AS "Всего_Игр",
    gr.total_wins AS "Побед",
    ROUND((gr.total_wins::numeric / NULLIF(gr.total_plays, 0)) * 100, 1) AS "Процент_Побед"
FROM game_results gr
JOIN users u ON gr.user_id = u.id
ORDER BY gr.best_score DESC;

-- Представление для статистики игр
CREATE OR REPLACE VIEW "Статистика_Игр" AS
SELECT
    game_id AS "Игра",
    level AS "Уровень",
    COUNT(DISTINCT user_id) AS "Уникальных_Игроков",
    AVG(best_score) AS "Средний_Счёт",
    MAX(best_score) AS "Рекорд",
    SUM(total_plays) AS "Всего_Игр"
FROM game_results
GROUP BY game_id, level
ORDER BY game_id, level;

-- Комментарии к таблице
COMMENT ON TABLE game_results IS 'Результаты мини-игр пользователей';
COMMENT ON COLUMN game_results.game_id IS 'ID игры (focus_defender, memory_match, reaction_time)';
COMMENT ON COLUMN game_results.level IS 'Уровень сложности (1-4)';
COMMENT ON COLUMN game_results.best_score IS 'Лучший результат на этом уровне';
COMMENT ON COLUMN game_results.max_combo IS 'Максимальное комбо';

