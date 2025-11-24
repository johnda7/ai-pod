

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
  // --- WEEK 1: ДОФАМИНОВЫЙ ВЗЛОМ (LEVELS 1-5) ---
  {
    id: 't1',
    week: 1,
    title: 'Инструктаж',
    description: 'Вводная миссия. Пойми правила игры.',
    xpReward: 100,
    slides: [
      {
        id: 's1',
        type: 'VIDEO',
        videoUrl: "https://www.youtube.com/embed/qmMMq7Qc7n0",
        duration: "1:30",
        description: "Катя объясняет, зачем мы здесь."
      },
      {
        id: 's2',
        type: 'THEORY',
        title: 'Твой Мозг — Это ПК',
        content: 'Сейчас у тебя стоит устаревшая ОС. Мы будем ставить патчи. Первый патч — понимание Дофамина.',
        buttonText: 'Начать загрузку'
      }
    ]
  },
  {
    id: 't2',
    week: 1,
    title: 'Дешевый Кайф',
    description: 'Различаем виды топлива для мозга.',
    xpReward: 150,
    slides: [
      {
        id: 's3',
        type: 'SORTING',
        title: 'Фильтр Контента',
        question: 'Свайпай: Это заряжает (ВПРАВО) или истощает (ВЛЕВО)?',
        leftCategoryLabel: 'ИСТОЩАЕТ',
        rightCategoryLabel: 'ЗАРЯЖАЕТ',
        items: [
          { id: 'i1', text: 'Скроллинг Reels 2 часа', emoji: '🧟‍♂️', category: 'LEFT' },
          { id: 'i2', text: 'Победа в катке', emoji: '🏆', category: 'RIGHT' },
          { id: 'i3', text: 'Сахарная кома', emoji: '🍩', category: 'LEFT' },
          { id: 'i4', text: 'Тренировка', emoji: '⚡️', category: 'RIGHT' },
        ]
      },
      {
        id: 's4',
        type: 'THEORY',
        title: 'Дофаминовая Яма',
        content: 'Когда ты получаешь слишком много дешевого кайфа, рецепторы "глохнут". Жизнь кажется серой. Это баг, а не фича.',
      }
    ]
  },
  {
    id: 't3',
    week: 1,
    title: 'Анализ Системы',
    description: 'Честная диагностика твоих триггеров.',
    xpReward: 200,
    slides: [
      {
        id: 'inp1',
        type: 'INPUT',
        question: 'Напиши 3 приложения, в которые ты заходишь "на автомате", когда скучно.',
        placeholder: 'Например: TikTok, Brawl Stars, YouTube...',
        minLength: 5
      },
      {
        id: 'match1',
        type: 'MATCHING',
        question: 'Соедини триггер и реакцию:',
        pairs: [
            { id: 'p1', left: 'Скука', right: 'Телефон в руки' },
            { id: 'p2', left: 'Стресс', right: 'Сладкое / Еда' },
            { id: 'p3', left: 'Усталость', right: 'Скроллинг' }
        ]
      }
    ]
  },
  {
    id: 't4',
    week: 1,
    title: 'Нейро-Код',
    description: 'Программируем новые установки.',
    xpReward: 150,
    slides: [
      {
        id: 'p1',
        type: 'PUZZLE',
        title: 'Код Уверенности',
        question: 'Собери фразу-установку:',
        correctSentence: ["Я", "контролирую", "свое", "внимание", "а", "не", "алгоритмы"],
        distractorWords: ["они", "телефон", "слабый"]
      }
    ]
  },
  {
    id: 't5',
    week: 1,
    title: 'БОСС: Искушение',
    description: 'Проверка на прочность. Ошибаться нельзя.',
    xpReward: 500,
    isBoss: true,
    slides: [
       {
         id: 'q_boss1',
         type: 'QUIZ',
         question: 'Ты сел делать домашку, но пришло уведомление. Твой мозг требует проверить. Что это?',
         options: [
             "Это интуиция, надо проверить",
             "Это дофаминовая ловушка",
             "Это важно для социализации"
         ],
         correctIndex: 1,
       },
       {
         id: 'q_boss2',
         type: 'QUIZ',
         question: 'Сколько нужно времени, чтобы вернуть фокус после отвлечения?',
         options: [
             "Мгновенно",
             "Около 23 минут",
             "5 минут"
         ],
         correctIndex: 1,
       }
    ]
  },

  // --- WEEK 2: ЭНЕРГИЯ И СОН (LEVELS 6-9) ---
  {
    id: 't6',
    week: 2,
    title: 'Режим Сна',
    description: 'Почему ты просыпаешься разбитым.',
    xpReward: 200,
    slides: [
        {
            id: 's_sleep1',
            type: 'THEORY',
            title: 'Мелатонин vs Экран',
            content: 'Синий свет от экрана блокирует гормон сна. Сидеть в телефоне перед сном = красть у себя завтрашнюю энергию.'
        },
        {
            id: 'match_sleep',
            type: 'MATCHING',
            question: 'Собери идеальный вечер:',
            pairs: [
                { id: 'sp1', left: 'За 1 час до сна', right: 'Убрать телефон' },
                { id: 'sp2', left: 'Комната', right: 'Темно и прохладно' },
                { id: 'sp3', left: 'Ужин', right: 'За 3 часа до сна' }
            ]
        }
    ]
  },
  {
    id: 't7',
    week: 2,
    title: 'Техника 5 Секунд',
    description: 'Как вставать с кровати без мучений.',
    xpReward: 150,
    slides: [
        {
         id: 'q5sec',
         type: 'QUIZ',
         title: 'Механика',
         question: 'Почему счет 5-4-3-2-1 работает?',
         options: [
             "Это магия чисел",
             "Это переключает мозг с чувств на действия (префронтальная кора)",
             "Это просто отвлекает"
         ],
         correctIndex: 1,
        }
    ]
  },
  {
    id: 't8',
    week: 2,
    title: 'Энерго-Аудит',
    description: 'Куда утекают твои силы?',
    xpReward: 250,
    slides: [
        {
            id: 'inp_energy',
            type: 'INPUT',
            question: 'Вспомни вчерашний день. Какое действие забрало больше всего сил впустую?',
            placeholder: 'Ссора, соцсети, переживания...',
            minLength: 3
        }
    ]
  },
  {
    id: 't9',
    week: 2,
    title: 'БОСС: Лень',
    description: 'Финальный тест второй недели.',
    xpReward: 600,
    isBoss: true,
    slides: []
  },

   // --- WEEK 3: ФОКУС И БУДУЩЕЕ (LEVELS 10-12) ---
  {
    id: 't10',
    week: 3,
    title: 'Состояние Потока',
    description: 'Как делать сложные дела с кайфом.',
    xpReward: 300,
    slides: []
  },
  {
    id: 't11',
    week: 3,
    title: 'Аватар 2.0',
    description: 'Проектируем твое будущее.',
    xpReward: 300,
    slides: []
  },
  {
    id: 't12',
    week: 3,
    title: 'ФИНАЛ: Мастер',
    description: 'Ты прошел курс молодого бойца.',
    xpReward: 1000,
    isBoss: true,
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