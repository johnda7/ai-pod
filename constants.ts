import { Lecture, Task, User, UserRole, StudentProgress, Meditation } from "./types";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Алекс',
  role: UserRole.TEEN,
  xp: 1250,
  level: 5,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  streak: 12,
  completedTaskIds: [], // Reset for demo
  learningStyle: 'VISUAL'
};

export const WEEKS = [1, 2, 3];

export const TASKS: Task[] = [
  // WEEK 1
  {
    id: 't1',
    week: 1,
    title: 'Старт',
    description: 'Вводное видео от Кати.',
    xpReward: 100,
    type: 'VIDEO',
    learningStyle: 'VISUAL',
    position: { x: 50, y: 0 },
    content: {
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
      videoDuration: "2:30"
    }
  },
  {
    id: 't2',
    week: 1,
    title: 'Суперсила',
    description: 'Тест на таланты.',
    xpReward: 150,
    type: 'QUIZ',
    learningStyle: 'KINESTHETIC',
    position: { x: 25, y: 120 },
    content: {
      questions: [
        {
          question: "Что ты выберешь в свободное время?",
          options: ["Порисовать 🎨", "Погулять с друзьями 🚶", "Поиграть в игры 🎮", "Почитать книгу 📚"],
          correctIndex: 0
        },
        {
          question: "Твой любимый предмет?",
          options: ["Физра 🏃", "Математика 📐", "Литература 📖", "Информатика 💻"],
          correctIndex: 3
        }
      ]
    }
  },
  {
    id: 't3',
    week: 1,
    title: 'Аудио-гид',
    description: 'Подкаст о работе мозга.',
    xpReward: 150,
    type: 'AUDIO',
    learningStyle: 'AUDIO',
    position: { x: 75, y: 240 },
    content: {
       videoUrl: "https://example.com/audio.mp3",
       videoDuration: "5:00"
    }
  },
  {
    id: 't4',
    week: 1,
    title: 'Карта Желаний',
    description: 'Создай свой вижн-борд.',
    xpReward: 300,
    type: 'UPLOAD',
    learningStyle: 'VISUAL',
    position: { x: 50, y: 360 },
    content: {
      actionSteps: ["Найди 5 картинок мечты", "Загрузи их сюда", "Напиши к каждой цель"]
    }
  },
  
  // WEEK 2
  {
    id: 't5',
    week: 2,
    title: 'Победа над ленью',
    description: 'Челлендж: 1 дело за 5 минут.',
    xpReward: 200,
    type: 'ACTION',
    learningStyle: 'KINESTHETIC',
    position: { x: 20, y: 500 },
    content: {
      actionSteps: ["Убери на столе", "Сделай зарядку", "Выпей стакан воды"]
    }
  },
  {
    id: 't6',
    week: 2,
    title: 'Тайм-хаки',
    description: 'Видео-разбор техник.',
    xpReward: 150,
    type: 'VIDEO',
    learningStyle: 'VISUAL',
    position: { x: 60, y: 620 },
    content: {
       videoUrl: "",
       videoDuration: "4:15"
    }
  },
  {
    id: 't7',
    week: 3,
    title: 'Финальный Босс',
    description: 'Защита проекта.',
    xpReward: 1000,
    type: 'UPLOAD',
    learningStyle: 'KINESTHETIC',
    position: { x: 50, y: 780 },
    content: {
      actionSteps: ["Собери всё чему научился", "Запиши видео-отзыв", "Получи сертификат"]
    }
  },
];

export const MEDITATIONS: Meditation[] = [
  { id: 'm1', title: 'Супер-сон', category: 'SLEEP', duration: '15 мин', color: 'bg-indigo-900' },
  { id: 'm2', title: 'Спокойствие перед экзаменом', category: 'ANXIETY', duration: '5 мин', color: 'bg-teal-700' },
  { id: 'm3', title: 'Фокус внимания', category: 'FOCUS', duration: '10 мин', color: 'bg-orange-600' },
  { id: 'm4', title: 'Сканирование тела', category: 'SLEEP', duration: '20 мин', color: 'bg-blue-800' },
  { id: 'm5', title: 'Перезагрузка', category: 'ANXIETY', duration: '3 мин', color: 'bg-sky-600' },
];

export const LECTURES: Lecture[] = [
  {
    id: 'l1',
    week: 1,
    title: 'Как говорить, чтобы подросток слышал',
    duration: '25 мин',
    description: 'Разбираем барьеры в общении.',
    thumbnail: 'https://picsum.photos/400/225?random=10',
  },
  {
    id: 'l2',
    week: 1,
    title: 'Биология переходного возраста',
    duration: '15 мин',
    description: 'Что происходит с мозгом и гормонами.',
    thumbnail: 'https://picsum.photos/400/225?random=11',
  },
  {
    id: 'l3',
    week: 2,
    title: 'Гаджеты: враги или друзья?',
    duration: '20 мин',
    description: 'Здоровые границы без скандалов.',
    thumbnail: 'https://picsum.photos/400/225?random=12',
  },
];

export const MOCK_STUDENTS: StudentProgress[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `s${i}`,
  name: i % 2 === 0 ? `Алексей П. ${i}` : `Мария К. ${i}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  week1Progress: Math.floor(Math.random() * 100),
  week2Progress: Math.floor(Math.random() * 80),
  week3Progress: Math.floor(Math.random() * 20),
  status: Math.random() > 0.7 ? 'risk' : Math.random() > 0.8 ? 'inactive' : 'active',
  lastLogin: Math.random() > 0.5 ? 'Сегодня' : '3 дня назад',
  tasksCompleted: Math.floor(Math.random() * 15)
}));

// -- Rive-like Animation Assets --
// Using DiceBear with distinct features to simulate animation frames
const BASE = "https://api.dicebear.com/7.x/avataaars/svg?seed=KatyaNew&hairColor=4a3121&top=longHair&skinColor=f8d2a7&clothesColor=3c4f76&eyebrows=default&backgroundColor=transparent";

export const KATYA_VARIANTS = {
  // Idle: Happy smile
  IDLE: `${BASE}&eyes=happy&mouth=smile`,
  // Blink: Eyes closed
  BLINK: `${BASE}&eyes=closed&mouth=smile`,
  // Talk: Mouth open/default
  TALK: `${BASE}&eyes=happy&mouth=default`,
  // Talk Open: Mouth wide/scream (used for animation)
  TALK_OPEN: `${BASE}&eyes=happy&mouth=scream`, 
};

export const KATYA_AVATAR = KATYA_VARIANTS.IDLE;