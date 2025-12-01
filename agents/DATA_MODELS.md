# Модели данных AI Pod

## 👤 User (Пользователь)

```typescript
interface User {
  id: string;                    // Уникальный ID
  telegramId?: number;           // ID в Telegram
  username?: string;              // Username в Telegram
  name: string;                   // Имя пользователя
  role: UserRole;                 // Роль: TEEN, PARENT, CURATOR
  xp: number;                     // Опыт (Experience Points)
  coins: number;                  // Монеты (валюта)
  level: number;                  // Уровень (рассчитывается из XP)
  hp: number;                     // Здоровье (Health Points)
  maxHp: number;                  // Максимальное здоровье
  avatarUrl: string;              // URL аватара
  streak: number;                 // Дней подряд активности
  completedTaskIds: string[];     // ID завершенных задач
  learningStyle?: LearningStyle;  // Стиль обучения
  interest: string;               // Интерес (Гейминг, Спорт, и т.д.)
  inventory: string[];            // Инвентарь (купленные предметы)
  league: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND'; // Лига
}
```

**Роли:**
- `TEEN` - подросток (основной пользователь)
- `PARENT` - родитель (мониторинг)
- `CURATOR` - куратор (управление группой)

**Стили обучения:**
- `VISUAL` - визуальный
- `AUDIO` - аудиальный
- `KINESTHETIC` - кинестетический

---

## 📚 Task (Задача/Урок)

```typescript
interface Task {
  id: string;                     // Уникальный ID
  week: number;                   // Неделя (1, 2, 3)
  title: string;                  // Название урока
  description: string;            // Описание
  xpReward: number;               // Награда XP
  coinsReward: number;            // Награда монетами
  isLocked?: boolean;             // Заблокирована ли
  isBoss?: boolean;              // Босс-урок (финальный)
  slides: LessonSlide[];         // Слайды урока
}
```

**Структура курса:**
- **Неделя 1**: Нейробиология мотивации (6 уроков)
- **Неделя 2**: Стратегия и дисциплина (6 уроков)
- **Неделя 3**: Мастерство и поток (7 уроков)

---

## 🎯 LessonSlide (Слайд урока)

Базовый интерфейс:
```typescript
interface BaseSlide {
  id: string;
  type: SlideType;
  title?: string;
}
```

### Типы слайдов:

#### 1. TheorySlide (Теория)
```typescript
interface TheorySlide extends BaseSlide {
  type: 'THEORY';
  content: string;
  imageUrl?: string;
  buttonText?: string;
}
```

#### 2. QuizSlide (Викторина)
```typescript
interface QuizSlide extends BaseSlide {
  type: 'QUIZ';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}
```

#### 3. VideoSlide (Видео)
```typescript
interface VideoSlide extends BaseSlide {
  type: 'VIDEO';
  videoUrl: string;
  duration: string;
  description: string;
}
```

#### 4. SortingSlide (Сортировка)
```typescript
interface SortingSlide extends BaseSlide {
  type: 'SORTING';
  question: string;
  leftCategoryLabel: string;
  rightCategoryLabel: string;
  items: SortingItem[];
}

interface SortingItem {
  id: string;
  text: string;
  emoji: string;
  category: 'LEFT' | 'RIGHT';
}
```

#### 5. PuzzleSlide (Пазл)
```typescript
interface PuzzleSlide extends BaseSlide {
  type: 'PUZZLE';
  question: string;
  correctSentence: string[];
  distractorWords?: string[];
}
```

#### 6. MatchingSlide (Сопоставление)
```typescript
interface MatchingSlide extends BaseSlide {
  type: 'MATCHING';
  question: string;
  pairs: PairItem[];
}

interface PairItem {
  id: string;
  left: string;
  right: string;
}
```

#### 7. InputSlide (Текстовый ввод)
```typescript
interface InputSlide extends BaseSlide {
  type: 'INPUT';
  question: string;
  placeholder: string;
  minLength?: number;
}
```

#### 8. PollSlide (Опрос)
```typescript
interface PollSlide extends BaseSlide {
  type: 'POLL';
  question: string;
  options: string[];
}
```

#### 9. GameSlide (Игра)
```typescript
interface GameSlide extends BaseSlide {
  type: 'GAME';
  gameType: 'FOCUS_DEFENDER' | 'NEURO_MATCH';
  instructions: string;
  durationSeconds?: number;
  targetScore?: number;
}
```

**Типы игр:**
- `FOCUS_DEFENDER` - защита от отвлечений
- `NEURO_MATCH` - поиск пар понятий

---

## 📊 TaskProgress (Прогресс по задаче)

```typescript
interface TaskProgress {
  userId: string;
  taskId: string;
  completedAt: string;  // ISO timestamp
  xpEarned: number;
}
```

---

## 🏆 StudentStats (Статистика студента)

```typescript
interface StudentStats {
  id: string;
  name: string;
  avatar: string;
  week1Progress: number;      // Процент выполнения недели 1
  week2Progress: number;      // Процент выполнения недели 2
  week3Progress: number;      // Процент выполнения недели 3
  status: 'active' | 'risk' | 'inactive';
  lastLogin: string;
  totalXp: number;
  tasksCompletedCount: number;
}
```

**Статусы:**
- `active` - активный (прогресс > 50%)
- `risk` - в зоне риска (прогресс < 50%)
- `inactive` - неактивный (нет прогресса)

---

## 🛒 ShopItem (Предмет в магазине)

```typescript
interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  type: 'POWERUP' | 'COSMETIC';
}
```

**Типы:**
- `POWERUP` - усиление (здоровье, стрик)
- `COSMETIC` - косметика (рамки, аватары)

---

## 💬 ChatMessage (Сообщение в чате)

```typescript
interface ChatMessage {
  id: string;
  sender: 'user' | 'katya';
  text: string;
  timestamp: number;
}
```

---

## 📖 Lecture (Лекция)

```typescript
interface Lecture {
  id: string;
  week: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  topics?: string[];
}
```

---

## 🧘 Meditation (Медитация)

```typescript
interface Meditation {
  id: string;
  title: string;
  category: 'SLEEP' | 'FOCUS' | 'ANXIETY';
  duration: string;
  color: string;
}
```

---

## 🌊 Soundscape (Звуковой пейзаж)

```typescript
interface Soundscape {
  id: string;
  title: string;
  iconType: 'RAIN' | 'FOREST' | 'OCEAN' | 'FIRE' | 'WIND';
  color: string;
  youtubeId: string;
}
```

---

## 💭 Quote (Цитата)

```typescript
interface Quote {
  text: string;
  author: string;
  movie?: string;
  videoUrl?: string;
}
```

---

## 🔄 Связи между моделями

```
User
  ├─ completedTaskIds → Task[]
  ├─ inventory → ShopItem[]
  └─ xp, coins, level (вычисляемые)

Task
  ├─ slides → LessonSlide[]
  └─ week (1, 2, 3)

TaskProgress
  ├─ userId → User.id
  └─ taskId → Task.id

StudentStats
  └─ id → User.id
```

---

## 📝 Примеры данных

### Пример User:
```typescript
{
  id: 'u_123456789',
  telegramId: 123456789,
  username: 'alex_gamer',
  name: 'Алекс',
  role: 'TEEN',
  xp: 1250,
  coins: 350,
  level: 5,
  hp: 4,
  maxHp: 5,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=123',
  streak: 12,
  completedTaskIds: ['t1', 't2', 't3'],
  interest: 'Гейминг',
  inventory: ['hp_potion', 'streak_freeze'],
  league: 'BRONZE'
}
```

### Пример Task:
```typescript
{
  id: 't1',
  week: 1,
  title: 'Мозг v2.0',
  description: 'Инструкция к твоему железу',
  xpReward: 100,
  coinsReward: 50,
  isLocked: false,
  isBoss: false,
  slides: [
    { id: 's1_0', type: 'THEORY', title: 'Твой аватар в реальности', content: '...' },
    { id: 's1_1', type: 'QUIZ', question: '...', options: [...], correctIndex: 1 }
  ]
}
```

---

## 🗄️ Хранение данных

### LocalStorage
- Ключ: `ai_teenager_users`
- Формат: JSON массив `User[]`

### Supabase
- Таблица `users`: все поля User
- Таблица `progress`: TaskProgress записи

### Google Sheets
- Лист "Users": колонки соответствуют полям User
- Лист "Progress": колонки соответствуют TaskProgress

















