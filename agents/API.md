# API и Сервисы

## 📡 Внешние API

### Google Gemini API

**Назначение**: AI-наставник Катя и адаптация контента

**Ключ**: `GEMINI_API_KEY` в `.env.local`

**Использование:**
```typescript
import { askKatya, adaptTaskContent } from './services/geminiService';

// Чат с Катей
const response = await askKatya(
  userMessage,
  userContext,
  userInterest
);

// Адаптация контента
const adapted = await adaptTaskContent(
  taskTitle,
  originalDescription,
  userInterest
);
```

**Модель**: `gemini-2.5-flash`

**Особенности**:
- Персонализация под интересы пользователя
- Использование метафор из хобби
- Краткие и мотивирующие ответы

---

### Supabase API

**Назначение**: Хранение данных пользователей и прогресса

**Ключи**: `SUPABASE_URL` и `SUPABASE_KEY` в `supabaseClient.ts`

**Таблицы**:
- `users` - пользователи
- `progress` - прогресс по задачам

**Использование:**
```typescript
import { supabase, isSupabaseEnabled } from './services/supabaseClient';

if (isSupabaseEnabled) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', userId);
}
```

**Схема таблиц**:
```sql
-- users
id: string
telegram_id: number
username: string
name: string
role: 'TEEN' | 'PARENT' | 'CURATOR'
xp: number
coins: number
level: number
hp: number
max_hp: number
avatar_url: string
streak: number
interest: string

-- progress
id: string
user_id: string
task_id: string
xp_earned: number
completed_at: timestamp
```

---

### Google Sheets API

**Назначение**: Простое хранение данных в Google Sheets

**Настройка**: URL Google Sheets таблицы

**Использование:**
```typescript
import { sheetsAPI, isGoogleSheetsEnabled } from './services/googleSheetsService';

if (isGoogleSheetsEnabled) {
  const user = await sheetsAPI.getUser(telegramId);
  await sheetsAPI.updateUser(user);
}
```

**Структура таблицы**:
- Лист "Users": ID, Telegram ID, Имя, XP, Уровень, и т.д.
- Лист "Progress": User ID, Task ID, Дата завершения

---

### Telegram Bot API

**Назначение**: Telegram бот для команд

**Токен**: `TELEGRAM_BOT_TOKEN` в `.env`

**Команды**:
- `/start` - приветствие
- `/help` - справка
- `/profile` - профиль
- `/tasks` - задачи
- `/leaderboard` - рейтинг
- `/katya` - чат с Катей

**WebApp Integration**:
```typescript
import { initTelegramApp, getTelegramUser } from './services/telegramService';

// Инициализация
initTelegramApp();

// Получение пользователя
const user = getTelegramUser();
// { id: number, first_name: string, username?: string }
```

---

## 🔧 Внутренние сервисы

### Database Service (`db.ts`)

**Приоритет хранения:**
1. Google Sheets (если доступно)
2. Supabase (если доступно)
3. LocalStorage (fallback)

**Основные функции:**

#### `getOrCreateUser(telegramUser)`
Получение или создание пользователя

```typescript
const user = await getOrCreateUser(telegramUser);
// Возвращает User объект
```

#### `completeTask(userId, task)`
Завершение задачи

```typescript
await completeTask(userId, task);
// Обновляет XP, монеты, прогресс
```

#### `updateUserProfile(user)`
Обновление профиля

```typescript
await updateUserProfile(user);
// Сохраняет изменения
```

#### `getAllStudentsStats()`
Статистика всех студентов (для кураторов)

```typescript
const stats = await getAllStudentsStats();
// Возвращает StudentStats[]
```

---

### Gemini Service (`geminiService.ts`)

#### `askKatya(userMessage, userContext, userInterest)`
Чат с AI-наставником

**Параметры:**
- `userMessage`: Сообщение пользователя
- `userContext`: Контекст пользователя (XP, уровень, прогресс)
- `userInterest`: Интерес пользователя (Гейминг, Спорт, и т.д.)

**Возвращает**: Персонализированный ответ

#### `adaptTaskContent(taskTitle, originalDescription, userInterest)`
Адаптация описания задачи под интересы

**Возвращает**: Адаптированное описание

---

### Telegram Service (`telegramService.ts`)

#### `initTelegramApp()`
Инициализация Telegram WebApp

#### `getTelegramUser()`
Получение данных пользователя из Telegram

**Возвращает**: `{ id, first_name, username }` или `null`

#### `isTelegramApp()`
Проверка запуска в Telegram

**Возвращает**: `boolean`

---

## 📊 Типы данных

См. [DATA_MODELS.md](./DATA_MODELS.md) для полного описания типов.

**Основные типы:**
- `User` - пользователь
- `Task` - задача/урок
- `LessonSlide` - слайд урока
- `TaskProgress` - прогресс по задаче
- `StudentStats` - статистика студента

---

## 🔄 Потоки данных

### Создание пользователя
```
Telegram WebApp → getTelegramUser() → getOrCreateUser() 
→ [Google Sheets | Supabase | LocalStorage]
```

### Завершение задачи
```
UI → completeTask() → [LocalStorage + Google Sheets + Supabase]
→ Обновление UI
```

### Чат с Катей
```
UI → askKatya() → Gemini API → Персонализированный ответ → UI
```

---

## ⚙️ Конфигурация

### Environment Variables

**`.env.local`** (для веб-приложения):
```
GEMINI_API_KEY=your_key_here
```

**`telegram-bot/.env`** (для бота):
```
TELEGRAM_BOT_TOKEN=your_token_here
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

---

## 🛠️ Расширение API

### Добавление нового сервиса

1. Создайте файл в `services/`
2. Экспортируйте функции
3. Добавьте проверку доступности
4. Интегрируйте в `db.ts` с приоритетом

### Пример:
```typescript
// services/myService.ts
export const isMyServiceEnabled = !!process.env.MY_SERVICE_KEY;

export const myServiceFunction = async () => {
  if (!isMyServiceEnabled) return null;
  // Ваша логика
};
```




