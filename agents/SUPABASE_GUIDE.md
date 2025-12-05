# 🗄️ SUPABASE GUIDE - Полное руководство

---

## 📊 СТРУКТУРА БАЗЫ ДАННЫХ

### Таблица `users` - Пользователи

| Колонка | Тип | По умолчанию | Описание |
|---------|-----|--------------|----------|
| `id` | UUID | auto | Уникальный идентификатор |
| `telegram_id` | BIGINT | null | ID из Telegram (уникальный) |
| `username` | TEXT | null | Username из Telegram |
| `name` | TEXT | 'Студент' | Имя пользователя |
| `role` | TEXT | 'TEEN' | Роль: TEEN/PARENT/CURATOR |
| `xp` | INTEGER | 0 | Очки опыта |
| `coins` | INTEGER | 100 | Монеты (Welcome bonus) |
| `level` | INTEGER | 1 | Уровень (xp / 500 + 1) |
| `hp` | INTEGER | 5 | Текущее здоровье |
| `max_hp` | INTEGER | 5 | Максимальное здоровье |
| `avatar_url` | TEXT | null | URL аватара |
| `streak` | INTEGER | 0 | Дней подряд |
| `interest` | TEXT | 'Гейминг' | Интерес пользователя |
| `inventory` | JSONB | '[]' | Инвентарь (предметы) |
| `league` | TEXT | 'BRONZE' | Лига: BRONZE/SILVER/GOLD/DIAMOND |
| `tools_data` | JSONB | '{}' | Данные инструментов* |
| `last_activity` | TEXT | null | Дата последней активности |
| `created_at` | TIMESTAMP | NOW() | Дата создания |
| `updated_at` | TIMESTAMP | NOW() | Дата обновления |

**⚠️ ВАЖНО:** Колонка `tools_data` должна быть добавлена вручную!
Используйте: `scripts/ADD_TOOLS_DATA_COLUMN.sql`

### Таблица `progress` - Прогресс по задачам

| Колонка | Тип | По умолчанию | Описание |
|---------|-----|--------------|----------|
| `id` | UUID | auto | Уникальный идентификатор |
| `user_id` | UUID | - | Ссылка на users.id |
| `task_id` | TEXT | - | ID задачи |
| `xp_earned` | INTEGER | 0 | Полученный XP |
| `completed_at` | TIMESTAMP | NOW() | Дата завершения |

**Ограничение:** UNIQUE(user_id, task_id) - одна задача = один раз

---

## 🔑 ПОДКЛЮЧЕНИЕ

### Файл: `services/supabaseClient.ts`

```typescript
const SUPABASE_URL = 'https://rnxqyltjbcwqwblnhuhm.supabase.co'; 
const SUPABASE_KEY = 'eyJ...'; // anon key
```

### Проверка подключения:
```javascript
// В консоли браузера должно быть:
✅ Supabase успешно подключена: https://...
```

---

## 🔄 СИНХРОНИЗАЦИЯ ДАННЫХ

### 1. Основные данные пользователя

**Файл:** `services/db.ts`

```
getOrCreateUser() → Получить/создать пользователя
completeTask() → Завершить задачу + XP
purchaseItem() → Покупка в магазине
checkAndUpdateStreak() → Обновление стрика
checkMilestoneReward() → Проверка milestones
```

### 2. Данные инструментов (tools_data)

**Что хранится в tools_data:**
```javascript
{
  habit_tracker_data: [...],     // Привычки
  goals_tracker: [...],          // Цели
  notes_journal: [...],          // Заметки
  balance_wheel_history: [...],  // Колесо Баланса
  emotion_diary_entries: [...],  // Дневник Эмоций
  gratitude_entries: [...],      // Благодарности
  reflection_entries: [...],     // Рефлексия
  planner_tasks: [...],          // Планировщик
  focus_sessions: [...],         // Режим Фокуса
  challenges_data: {...},        // Челленджи
  life_skills_progress: {...}    // Life Skills
}
```

### 3. Функции синхронизации

```typescript
// Сохранить tools_data в Supabase
syncToolsDataToSupabase(userId: string): Promise<boolean>

// Загрузить tools_data из Supabase
loadToolsDataFromSupabase(userId: string): Promise<boolean>

// Обновить пользователя из Supabase
refreshUserFromSupabase(userId: string): Promise<User | null>
```

---

## 📋 SQL СКРИПТЫ

### 1. Первичная настройка
```bash
scripts/setup-supabase.sql
```

### 2. Обновление структуры
```bash
scripts/FINAL_SETUP.sql
```

### 3. Добавление tools_data (ОБЯЗАТЕЛЬНО!)
```bash
scripts/ADD_TOOLS_DATA_COLUMN.sql
```

---

## 🐛 ЧАСТЫЕ ОШИБКИ И РЕШЕНИЯ

### Ошибка 400: "column tools_data does not exist"

**Причина:** Колонка `tools_data` не добавлена в таблицу `users`.

**Решение:**
1. Откройте Supabase Dashboard → SQL Editor
2. Выполните `scripts/ADD_TOOLS_DATA_COLUMN.sql`

### Ошибка 400: "invalid input syntax for type uuid"

**Причина:** Попытка использовать не-UUID ID (например, `guest_123`).

**Решение:** Код автоматически мигрирует старые ID на UUID формат.

### Ошибка 400: "violates row-level security policy"

**Причина:** RLS политики блокируют доступ.

**Решение:**
1. Проверьте политики в Supabase Dashboard → Authentication → Policies
2. Добавьте политики "Allow all" для разработки

### Данные не синхронизируются

**Причина:** Пользователь не существует в БД или нет интернета.

**Проверка:**
```javascript
// В консоли браузера
localStorage.getItem('ai_teenager_current_id_v6')
// Должен вернуть UUID
```

---

## 🔍 ПРОВЕРКА В КОНСОЛИ БРАУЗЕРА

### 1. Проверить текущего пользователя:
```javascript
localStorage.getItem('ai_teenager_current_id_v6')
```

### 2. Проверить данные пользователя:
```javascript
JSON.parse(localStorage.getItem('ai_teenager_users_v6'))
```

### 3. Проверить данные инструментов:
```javascript
// Привычки
JSON.parse(localStorage.getItem('habit_tracker_data'))

// Цели
JSON.parse(localStorage.getItem('goals_tracker'))

// Заметки
JSON.parse(localStorage.getItem('notes_journal'))
```

### 4. Принудительная синхронизация:
```javascript
// Если есть доступ к db модулю
import { syncToolsDataToSupabase } from './services/db';
const userId = localStorage.getItem('ai_teenager_current_id_v6');
syncToolsDataToSupabase(userId);
```

---

## 🛠️ ДОБАВЛЕНИЕ НОВЫХ ИНСТРУМЕНТОВ

Если добавляете новый инструмент с сохранением данных:

### 1. Добавьте ключ в `TOOLS_STORAGE_KEYS`:
```typescript
// services/db.ts
const TOOLS_STORAGE_KEYS = [
  'habit_tracker_data',
  'goals_tracker',
  // ... существующие
  'new_tool_data'  // ← Добавить!
];
```

### 2. Сохраняйте в localStorage:
```typescript
localStorage.setItem('new_tool_data', JSON.stringify(data));
```

### 3. Синхронизация автоматическая через `syncToolsDataToSupabase()`

---

## 🔐 БЕЗОПАСНОСТЬ (ПРОДАКШЕН)

Текущие политики RLS разрешают ВСЕ операции. Для продакшена:

### 1. Строгие политики:
```sql
-- Только свои данные
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Только свои данные для обновления  
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Telegram авторизация:
- Добавить проверку `initData` от Telegram
- Верифицировать подпись на сервере

---

## 📊 ПОЛЕЗНЫЕ SQL ЗАПРОСЫ

### Посмотреть всех пользователей:
```sql
SELECT id, name, telegram_id, xp, coins, level 
FROM users 
ORDER BY xp DESC;
```

### Посмотреть структуру таблицы:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### Посмотреть топ игроков:
```sql
SELECT name, xp, coins, level, league
FROM users
WHERE role = 'TEEN'
ORDER BY xp DESC
LIMIT 10;
```

### Проверить прогресс пользователя:
```sql
SELECT u.name, COUNT(p.id) as tasks_done, SUM(p.xp_earned) as total_xp
FROM users u
LEFT JOIN progress p ON u.id = p.user_id
GROUP BY u.id, u.name
ORDER BY total_xp DESC;
```

---

## ✅ ЧЕК-ЛИСТ ДЛЯ КРИТИКА

### Проверка Supabase:

- [ ] Консоль: "✅ Supabase успешно подключена"
- [ ] Нет ошибок 400 в консоли
- [ ] При завершении задачи: "✅ Task completed and synced"
- [ ] При покупке: "✅ Purchase synced"
- [ ] XP/монеты сохраняются после перезагрузки
- [ ] Данные инструментов синхронизируются
- [ ] Стрики обновляются правильно

---

**Версия:** 1.0
**Обновлено:** 2025-12-05

