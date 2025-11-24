
import { Lecture, Task, User, UserRole, StudentProgress, Meditation, Soundscape, Quote } from "./types";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Алекс',
  role: UserRole.TEEN,
  xp: 1250,
  level: 5,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Реалистичный аватар пользователя
  streak: 12,
  completedTaskIds: ['t1'], 
  learningStyle: 'VISUAL',
  interest: 'Гейминг'
};

export const WEEKS = [1, 2, 3];

// Positions are calculated for a vertical sine wave layout
// x: 50 is center. < 50 left, > 50 right.
export const TASKS: Task[] = [
  // --- WEEK 1: ПРОБУЖДЕНИЕ (Awakening) ---
  {
    id: 't1',
    week: 1,
    title: 'Старт Игры',
    description: 'Твой первый шаг. Погнали?',
    xpReward: 100,
    type: 'VIDEO',
    learningStyle: 'VISUAL',
    position: { x: 50, y: 0 },
    content: {
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
      videoDuration: "2:30",
      topics: ["Правила игры", "Твоя роль", "Награда"]
    }
  },
  {
    id: 't2',
    week: 1,
    title: 'Суперсила',
    description: 'Узнай свой класс персонажа.',
    xpReward: 150,
    type: 'QUIZ',
    learningStyle: 'KINESTHETIC',
    position: { x: 20, y: 0 }, 
    content: {
      questions: [
        {
          question: "Твой стиль боя в жизни?",
          options: ["Атака (Лидер)", "Защита (Друг)", "Магия (Креатив)", "Стелс (Наблюдатель)"],
          correctIndex: 0
        }
      ]
    }
  },
  {
    id: 't3',
    week: 1,
    title: 'Нейро-Хак',
    description: 'Как работает твой процессор.',
    xpReward: 150,
    type: 'AUDIO',
    learningStyle: 'AUDIO',
    position: { x: 80, y: 0 },
  },
  
  // --- WEEK 2: ТРАНСФОРМАЦИЯ (Transformation) ---
  {
    id: 't4',
    week: 2,
    title: 'Босс: Лень',
    description: 'Секретная техника победы.',
    xpReward: 300,
    type: 'VIDEO',
    learningStyle: 'VISUAL',
    position: { x: 50, y: 0 },
  },
  {
    id: 't5',
    week: 2,
    title: 'Чит-коды',
    description: 'Общение с родителями.',
    xpReward: 200,
    type: 'ACTION',
    learningStyle: 'KINESTHETIC',
    position: { x: 20, y: 0 },
  },
  
  // --- WEEK 3: МАСТЕРСТВО (Mastery) ---
  {
    id: 't6',
    week: 3,
    title: 'Финал',
    description: 'Создай свой проект.',
    xpReward: 500,
    type: 'UPLOAD',
    learningStyle: 'VISUAL',
    position: { x: 80, y: 0 },
  }
];

export const LECTURES: Lecture[] = [
  {
    id: 'l1',
    week: 1,
    title: 'Урок 1. Лежать, ползти, бежать — всё о мотивации',
    duration: '15:58',
    description: 'Базовый урок курса. Разбираем природу мотивации, типы дисциплины и барьеры, мешающие действовать.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000',
    topics: [
        "Как меняется мотивация?",
        "Почему мотивация отсутствует?",
        "Что не дает действовать?",
        "Типы мотивации",
        "Почему важна дисциплина?",
        "Как внедрять дисциплину в жизнь?",
        "Как сохранять уровень мотивации?"
    ]
  },
  {
    id: 'l2',
    week: 1,
    title: 'Подростковый мозг: Инструкция',
    duration: '15 мин',
    description: 'Почему они хлопают дверью и как с этим жить. Нейробиология простыми словами.',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'l3',
    week: 1,
    title: 'Как говорить, чтобы слышали',
    duration: '12 мин',
    description: 'Техники активного слушания и ненасильственного общения.',
    thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000'
  }
];

export const MOCK_STUDENTS: StudentProgress[] = [
  { id: 's1', name: 'Иван Петров', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan', week1Progress: 100, week2Progress: 40, week3Progress: 0, status: 'active', lastLogin: '2ч назад', tasksCompleted: 14 },
  { id: 's2', name: 'Маша Сидорова', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Masha', week1Progress: 100, week2Progress: 90, week3Progress: 10, status: 'active', lastLogin: '5мин назад', tasksCompleted: 22 },
  { id: 's3', name: 'Дима Волков', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dima', week1Progress: 30, week2Progress: 0, week3Progress: 0, status: 'risk', lastLogin: '5д назад', tasksCompleted: 3 },
  { id: 's4', name: 'Аня Кузнецова', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya', week1Progress: 10, week2Progress: 0, week3Progress: 0, status: 'inactive', lastLogin: '2нед назад', tasksCompleted: 1 },
];

export const MEDITATIONS: Meditation[] = [
  { id: 'm1', title: 'Супер-сон', category: 'SLEEP', duration: '15 мин', color: 'bg-indigo-900' },
  { id: 'm2', title: 'Спокойствие перед экзаменом', category: 'ANXIETY', duration: '5 мин', color: 'bg-teal-500' },
  { id: 'm3', title: 'Фокус внимания', category: 'FOCUS', duration: '10 мин', color: 'bg-indigo-500' },
  { id: 'm4', title: 'Сканирование тела', category: 'SLEEP', duration: '20 мин', color: 'bg-blue-800' },
  { id: 'm5', title: 'Перезагрузка', category: 'ANXIETY', duration: '3 мин', color: 'bg-cyan-600' },
];

export const SOUNDSCAPES: Soundscape[] = [
  { 
    id: 's1', 
    title: 'Дождь', 
    iconType: 'RAIN', 
    color: 'bg-slate-700',
    youtubeId: 'mPZkdNFkNps' 
  },
  { 
    id: 's2', 
    title: 'Лес', 
    iconType: 'FOREST', 
    color: 'bg-emerald-800',
    youtubeId: 'xNN7iTA57jM' 
  },
  { 
    id: 's3', 
    title: 'Океан', 
    iconType: 'OCEAN', 
    color: 'bg-cyan-700',
    youtubeId: 'BnFkOx7hR_E' 
  },
  { 
    id: 's4', 
    title: 'Камин', 
    iconType: 'FIRE', 
    color: 'bg-orange-800',
    youtubeId: 'L_LUpnjgPso' 
  },
  { 
    id: 's5', 
    title: 'Ветер', 
    iconType: 'WIND', 
    color: 'bg-sky-200',
    youtubeId: 'Z19tX6T_pYg' 
  }
];

export const QUOTES: Quote[] = [
  { 
    text: "Не слушай никого, кто скажет, будто ты чего-то не можешь.", 
    author: "Крис Гарднер", 
    movie: "В погоне за счастьем",
    videoUrl: "https://www.youtube.com/embed/Ucv8O7cOB7g" 
  },
  { 
    text: "Сила не в том, чтобы бить сильно. Сила в том, чтобы держать удар.", 
    author: "Рокки Бальбоа", 
    movie: "Рокки",
    videoUrl: "https://www.youtube.com/embed/D_Vg4uyYwEk" 
  }
];

// Используем одно качественное фото для всех состояний, анимация будет через CSS
export const KATYA_IMAGE_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300';

export const KATYA_VARIANTS = {
  IDLE: KATYA_IMAGE_URL,
  BLINK: KATYA_IMAGE_URL,
  TALK: KATYA_IMAGE_URL,
  TALK_OPEN: KATYA_IMAGE_URL,
};
