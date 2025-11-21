
import { Lecture, Task, User, UserRole, StudentProgress, Meditation, Soundscape, Quote } from "./types";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Алекс',
  role: UserRole.TEEN,
  xp: 1250,
  level: 5,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  streak: 12,
  completedTaskIds: [], 
  learningStyle: 'VISUAL',
  interest: 'Гейминг' // Default interest
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
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
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
  { id: 'm1', title: 'Супер-сон', category: 'SLEEP', duration: '15 мин', color: 'from-indigo-900 to-blue-900' },
  { id: 'm2', title: 'Спокойствие перед экзаменом', category: 'ANXIETY', duration: '5 мин', color: 'from-teal-700 to-emerald-800' },
  { id: 'm3', title: 'Фокус внимания', category: 'FOCUS', duration: '10 мин', color: 'from-orange-600 to-red-700' },
  { id: 'm4', title: 'Сканирование тела', category: 'SLEEP', duration: '20 мин', color: 'from-blue-800 to-indigo-900' },
  { id: 'm5', title: 'Перезагрузка', category: 'ANXIETY', duration: '3 мин', color: 'from-sky-600 to-blue-600' },
];

// Updated with Real Ambient YouTube IDs
export const SOUNDSCAPES: Soundscape[] = [
  { id: 's1', title: 'Дождь', iconType: 'RAIN', color: 'bg-blue-500', youtubeId: 'mPZkdNFkNps' }, // Heavy Rain
  { id: 's2', title: 'Лес', iconType: 'FOREST', color: 'bg-green-600', youtubeId: 'xNN7iTA57jM' }, // Forest Birds
  { id: 's3', title: 'Океан', iconType: 'OCEAN', color: 'bg-cyan-500', youtubeId: 'BnT44CqT-ec' }, // Ocean Waves
  { id: 's4', title: 'Камин', iconType: 'FIRE', color: 'bg-orange-500', youtubeId: 'L_LUpnjgPso' }, // Fireplace
  { id: 's5', title: 'Ветер', iconType: 'WIND', color: 'bg-slate-400', youtubeId: '5mflS1Yb4Ms' }, // Wind
];

export const QUOTES: Quote[] = [
  { 
    text: "Не слушай никого, кто скажет, будто ты чего-то не можешь. Даже меня. Понял? Если есть мечта, оберегай её.", 
    author: "Крис Гарднер", 
    movie: "В погоне за счастьем",
    videoUrl: "https://www.youtube.com/embed/UivKhvJHl1Q?si=MhX7_mXw5q9q1y1_" 
  },
  { 
    text: "Совсем не важно, как ты ударишь, а важно, какой держишь удар, как двигаешься вперёд. Будешь идти – иди, если с испугу не свернёшь.", 
    author: "Рокки Бальбоа", 
    movie: "Рокки Бальбоа",
    videoUrl: "https://www.youtube.com/embed/D_Vg4uyYwEk"
  },
  { 
    text: "Да, прошлое может причинять боль. Но можно или убегать от него, или учиться у него.", 
    author: "Рафики", 
    movie: "Король Лев",
    videoUrl: "https://www.youtube.com/embed/dZfGTL2PY3E" 
  },
  { 
    text: "Странно, да? Мы путешествуем по миру, чтобы найти красоту, но должны нести её в себе, иначе не найдём.", 
    author: "Хранитель Времени",
    movie: "Хранитель Времени" 
  },
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
const BASE = "https://api.dicebear.com/7.x/avataaars/svg?seed=KatyaNew&hairColor=4a3121&top=longHair&skinColor=f8d2a7&clothesColor=3c4f76&eyebrows=default&backgroundColor=transparent";

export const KATYA_VARIANTS = {
  IDLE: `${BASE}&eyes=happy&mouth=smile`,
  BLINK: `${BASE}&eyes=closed&mouth=smile`,
  TALK: `${BASE}&eyes=happy&mouth=default`,
  TALK_OPEN: `${BASE}&eyes=happy&mouth=scream`, 
};

export const KATYA_AVATAR = KATYA_VARIANTS.IDLE;
