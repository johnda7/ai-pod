

import { Lecture, Task, User, UserRole, StudentProgress, Meditation, Soundscape, Quote } from "./types";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Алекс',
  role: UserRole.TEEN,
  xp: 1250,
  level: 5,
  hp: 5, // Full health
  maxHp: 5,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  streak: 12,
  completedTaskIds: ['t1'], 
  learningStyle: 'VISUAL',
  interest: 'Гейминг'
};

export const WEEKS = [1, 2, 3];

export const TASKS: Task[] = [
  // --- WEEK 1: ДОФАМИНОВЫЙ ВЗЛОМ ---
  {
    id: 't1',
    week: 1,
    title: 'Взлом Системы',
    description: 'Основы нейробиологии. Почему ты залипаешь в телефоне.',
    xpReward: 150,
    position: { x: 50, y: 0 },
    slides: [
      {
        id: 's1',
        type: 'VIDEO',
        videoUrl: "https://www.youtube.com/embed/qmMMq7Qc7n0",
        duration: "3:00",
        description: "Посмотри короткий инструктаж от базы."
      },
      {
        id: 's2',
        type: 'THEORY',
        title: 'Дофамин — это топливо',
        content: 'Представь, что дофамин — это бензин для твоей мотивации. Но есть "дешевый" бензин (TikTok, сладкое), который убивает двигатель, и "премиум" (спорт, победы).',
        buttonText: 'Понял, идем дальше'
      },
      {
        id: 's3',
        type: 'SORTING',
        title: 'Фильтр Бака',
        question: 'Рассортируй источники дофамина. Свайпай или жми кнопки.',
        leftCategoryLabel: 'ДЕШЕВЫЙ (ВРЕД)',
        rightCategoryLabel: 'ДОРОГОЙ (ТОП)',
        items: [
          { id: 'i1', text: 'Скроллинг ленты', emoji: '📱', category: 'LEFT' },
          { id: 'i2', text: 'Тренировка', emoji: '💪', category: 'RIGHT' },
          { id: 'i3', text: 'Фастфуд', emoji: '🍔', category: 'LEFT' },
          { id: 'i4', text: 'Изучение нового', emoji: '🧠', category: 'RIGHT' },
          { id: 'i5', text: 'Выполненная цель', emoji: '🎯', category: 'RIGHT' }
        ]
      },
      {
        id: 's4',
        type: 'QUIZ',
        title: 'Проверка связи',
        question: 'Что происходит с рецепторами, если постоянно сидеть в телефоне?',
        options: [
            "Они прокачиваются и становятся мощнее",
            "Они 'выгорают' и тебе становится скучно жить",
            "Ничего, это безопасно"
        ],
        correctIndex: 1,
        explanation: 'Верно! Это называется "дофаминовая яма". Мозг перестает реагировать на простые радости.'
      }
    ]
  },
  {
    id: 't2',
    week: 1,
    title: 'Аватар Будущего',
    description: 'Настройка твоего персонажа. Кто ты через год?',
    xpReward: 200,
    position: { x: 20, y: 0 },
    slides: [
      {
        id: 'p1',
        type: 'PUZZLE',
        title: 'Код Мышления',
        question: 'Собери установку на рост:',
        correctSentence: ["Я", "могу", "прокачать", "любой", "скилл", "усилиями"],
        distractorWords: ["рожден", "таким", "неудачником"]
      },
      {
        id: 'p2',
        type: 'THEORY',
        title: 'Концепт Я-Идеального',
        content: 'Твой мозг не отличает яркую фантазию от реальности. Если ты детально представишь себя успешного, нейросеть начнет искать пути к этому образу.',
        buttonText: 'Загрузить образ'
      }
    ]
  },
  {
    id: 't3',
    week: 1,
    title: 'Чит-код: 5 Секунд',
    description: 'Как обмануть мозг и начать действовать.',
    xpReward: 150,
    position: { x: 80, y: 0 },
    slides: [
      {
         id: 'q1',
         type: 'QUIZ',
         title: 'Ситуация',
         question: 'Ты лежишь, надо делать уроки, но лень. Твои действия?',
         options: [
             "Жду, пока появится настроение",
             "Считаю 5-4-3-2-1 и ВСТАЮ как ракета",
             "Обещаю себе сделать это завтра"
         ],
         correctIndex: 1,
         explanation: 'Правило 5 секунд отключает "жвачку" в голове и перехватывает управление.'
      }
    ]
  },
  
  // --- WEEK 2 ---
  {
    id: 't4',
    week: 2,
    title: 'Босс: Прокрастинация',
    description: 'Битва с главным врагом продуктивности.',
    xpReward: 300,
    position: { x: 50, y: 0 },
    slides: [
        {
            id: 's_boss',
            type: 'THEORY',
            title: 'Метод Помидоро',
            content: '25 минут работы, 5 минут отдыха. Это не про овощи, это про ритм мозга.',
            buttonText: 'В бой'
        }
    ]
  },
  {
    id: 't5',
    week: 2,
    title: 'База: Энергия',
    description: 'Сон и восстановление.',
    xpReward: 200,
    position: { x: 20, y: 0 },
    slides: []
  },
  {
    id: 't6',
    week: 3,
    title: 'Финальный Босс',
    description: 'Экзамен на выживание.',
    xpReward: 500,
    position: { x: 80, y: 0 },
    slides: []
  }
];

export const LECTURES: Lecture[] = [
  {
    id: 'l1',
    week: 1,
    title: 'Урок 1. Мотивация',
    duration: '15:58',
    description: 'Разбираем природу мотивации.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000',
    topics: ["Типы мотивации", "Дисциплина"]
  },
];

export const MOCK_STUDENTS: StudentProgress[] = [
  { id: 's1', name: 'Иван Петров', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan', week1Progress: 100, week2Progress: 40, week3Progress: 0, status: 'active', lastLogin: '2ч назад', tasksCompleted: 14 },
];

export const MEDITATIONS: Meditation[] = [
  { id: 'm1', title: 'Супер-сон', category: 'SLEEP', duration: '15 мин', color: 'bg-indigo-900' },
  { id: 'm2', title: 'Спокойствие', category: 'ANXIETY', duration: '5 мин', color: 'bg-teal-500' },
  { id: 'm3', title: 'Фокус', category: 'FOCUS', duration: '10 мин', color: 'bg-indigo-500' },
];

export const SOUNDSCAPES: Soundscape[] = [
  { id: 's1', title: 'Дождь', iconType: 'RAIN', color: 'bg-slate-700', youtubeId: 'mPZkdNFkNps' },
  { id: 's2', title: 'Лес', iconType: 'FOREST', color: 'bg-emerald-800', youtubeId: 'xNN7iTA57jM' },
];

export const QUOTES: Quote[] = [
  { 
    text: "Дисциплина — это решение делать то, чего ты очень не хочешь делать.", 
    author: "Майк Тайсон", 
    movie: "Спорт"
  },
];

export const KATYA_IMAGE_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300';
export const KATYA_VARIANTS = { IDLE: KATYA_IMAGE_URL, BLINK: KATYA_IMAGE_URL, TALK: KATYA_IMAGE_URL, TALK_OPEN: KATYA_IMAGE_URL };