

import { Lecture, Task, User, UserRole, StudentProgress, Meditation, Soundscape, Quote, ShopItem } from "./types";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Алекс',
  role: UserRole.TEEN,
  xp: 1250,
  coins: 350,
  level: 5,
  hp: 4, // Slightly damaged
  maxHp: 5,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  streak: 12,
  completedTaskIds: ['t1'], 
  learningStyle: 'VISUAL',
  interest: 'Гейминг',
  inventory: [],
  league: 'SILVER'
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'hp_potion',
    name: 'Зелье Здоровья',
    description: 'Восстанавливает все 5 сердец.',
    price: 300,
    icon: '❤️',
    type: 'POWERUP'
  },
  {
    id: 'streak_freeze',
    name: 'Заморозка',
    description: 'Сохраняет стрик, если пропустил день.',
    price: 500,
    icon: '❄️',
    type: 'POWERUP'
  },
  {
    id: 'xp_boost',
    name: 'XP Бустер x2',
    description: 'Удваивает опыт за следующие 3 урока.',
    price: 450,
    icon: '🚀',
    type: 'POWERUP'
  },
  {
    id: 'mystery_box',
    name: 'Лутбокс',
    description: 'Случайная награда (XP или Коины).',
    price: 150,
    icon: '🎁',
    type: 'POWERUP'
  },
  {
    id: 'frame_gold',
    name: 'Золотая Рамка',
    description: 'Элитная рамка для аватара.',
    price: 1000,
    icon: '👑',
    type: 'COSMETIC'
  },
  {
    id: 'frame_cyber',
    name: 'Киберпанк',
    description: 'Неоновая подсветка профиля.',
    price: 1200,
    icon: '🤖',
    type: 'COSMETIC'
  }
];

export const WEEKS = [1, 2, 3, 4];

export const TASKS: Task[] = [
  // --- WEEK 1: ДОФАМИНОВЫЙ ВЗЛОМ (LEVELS 1-5) ---
  {
    id: 't1',
    week: 1,
    title: 'Инструктаж',
    description: 'Вводная миссия. Пойми правила игры.',
    xpReward: 100,
    coinsReward: 50,
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
    coinsReward: 75,
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
    coinsReward: 100,
    slides: [
      {
        id: 'poll1',
        type: 'POLL',
        question: 'Что чаще всего отвлекает тебя?',
        options: [
            "Уведомления",
            "Скука",
            "Друзья",
            "Голод"
        ]
      },
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
    coinsReward: 80,
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
    coinsReward: 250,
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
    coinsReward: 100,
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
    coinsReward: 75,
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
    coinsReward: 125,
    slides: [
        {
            id: 'poll_energy',
            type: 'POLL',
            question: 'В какое время дня ты чувствуешь максимум энергии?',
            options: ["Утро", "День (после школы)", "Вечер", "Ночь"]
        },
        {
            id: 'inp_energy',
            type: 'INPUT',
            question: 'Вспомни вчерашний день. Какое действие забрало больше всего сил впустую?',
            placeholder: 'Ссора, соцсети, переживания...',
            minLength: 3
        },
        {
            id: 'sort_energy',
            type: 'SORTING',
            question: 'Куда уходит батарейка?',
            leftCategoryLabel: 'СЛИВ',
            rightCategoryLabel: 'ЗАРЯД',
            items: [
                { id: 'e1', text: 'Сплетни', emoji: '🗣️', category: 'LEFT' },
                { id: 'e2', text: 'Холодный душ', emoji: '🚿', category: 'RIGHT' },
                { id: 'e3', text: 'Обида', emoji: '😤', category: 'LEFT' },
                { id: 'e4', text: 'Музыка', emoji: '🎧', category: 'RIGHT' },
            ]
        }
    ]
  },
  {
    id: 't9',
    week: 2,
    title: 'БОСС: Лень',
    description: 'Финальный тест второй недели.',
    xpReward: 600,
    coinsReward: 300,
    isBoss: true,
    slides: [
        {
            id: 'boss2_q1',
            type: 'QUIZ',
            question: 'Твой мозг говорит: "Давай сделаем это завтра". Что это на самом деле?',
            options: [
                "Разумное планирование",
                "Страх перед сложной задачей",
                "Нехватка времени"
            ],
            correctIndex: 1
        },
        {
            id: 'boss2_puz',
            type: 'PUZZLE',
            question: 'Собери правило продуктивности:',
            correctSentence: ["Сделай", "самое", "сложное", "дело", "утром"],
            distractorWords: ["вечером", "никогда", "легкое"]
        }
    ]
  },

   // --- WEEK 3: ФОКУС И БУДУЩЕЕ (LEVELS 10-12) ---
  {
    id: 't10',
    week: 3,
    title: 'Миф Многозадачности',
    description: 'Почему делать два дела сразу — плохая идея.',
    xpReward: 300,
    coinsReward: 150,
    slides: [
        {
            id: 'theory_multi',
            type: 'THEORY',
            title: 'Процессор перегревается',
            content: 'Твой мозг не может делать два дела с полным вниманием. Он просто быстро переключается. Это тратит кучу энергии и снижает IQ.'
        },
        {
            id: 'sort_multi',
            type: 'SORTING',
            question: 'Эффективно или нет?',
            leftCategoryLabel: 'БАГ',
            rightCategoryLabel: 'ФИЧА',
            items: [
                { id: 'm1', text: 'ДЗ + Сериал', emoji: '📺', category: 'LEFT' },
                { id: 'm2', text: 'Бег + Подкаст', emoji: '🏃', category: 'RIGHT' },
                { id: 'm3', text: 'Разговор + Телефон', emoji: '📱', category: 'LEFT' },
                { id: 'm4', text: 'Один таск за раз', emoji: '🎯', category: 'RIGHT' },
            ]
        }
    ]
  },
  {
    id: 't11',
    week: 3,
    title: 'Состояние Потока',
    description: 'Как взломать реальность и работать в кайф.',
    xpReward: 300,
    coinsReward: 150,
    slides: [
        {
            id: 'match_flow',
            type: 'MATCHING',
            question: 'Условия для входа в Поток:',
            pairs: [
                { id: 'f1', left: 'Цель', right: 'Четкая и понятная' },
                { id: 'f2', left: 'Отвлечения', right: 'Ноль (Авиарежим)' },
                { id: 'f3', left: 'Сложность', right: 'Чуть выше привычной' }
            ]
        },
        {
            id: 'inp_flow',
            type: 'INPUT',
            question: 'Вспомни дело, за которым ты теряешь счет времени. Что это?',
            placeholder: 'Рисование, кодинг, футбол...',
            minLength: 3
        }
    ]
  },
  {
    id: 't12',
    week: 3,
    title: 'Тест: Потребитель vs Создатель',
    description: 'Определи свою роль в цифровом мире.',
    xpReward: 250,
    coinsReward: 100,
    slides: [
        {
            id: 'fin_sort',
            type: 'SORTING',
            question: 'Кто ты сейчас?',
            leftCategoryLabel: 'ПОТРЕБИТЕЛЬ',
            rightCategoryLabel: 'СОЗДАТЕЛЬ',
            items: [
                { id: 'fin1', text: 'Жду лайков', emoji: '🥺', category: 'LEFT' },
                { id: 'fin2', text: 'Строю планы', emoji: '🏗️', category: 'RIGHT' },
                { id: 'fin3', text: 'Вижу возможности', emoji: '👀', category: 'RIGHT' },
                { id: 'fin4', text: 'Убиваю время', emoji: '💀', category: 'LEFT' },
            ]
        }
    ]
  },

  // --- WEEK 4: СОЦИАЛЬНЫЙ ИНТЕЛЛЕКТ (EQ) (LEVELS 13-16) ---
  {
    id: 't13',
    week: 4,
    title: 'Зеркальные Нейроны',
    description: 'Почему мы зеваем, когда зевают другие?',
    xpReward: 350,
    coinsReward: 175,
    slides: [
        {
            id: 'w4_th1',
            type: 'THEORY',
            title: 'Wi-Fi Мозга',
            content: 'У нас есть нейроны, которые "зеркалят" эмоции других. Если ты общаешься с нытиками, ты начнешь ныть. Если с лидерами — начнешь расти.'
        },
        {
            id: 'w4_poll',
            type: 'POLL',
            question: 'Твое окружение чаще:',
            options: ["Поддерживает идеи", "Критикует и ноет", "Вообще все равно"]
        }
    ]
  },
  {
    id: 't14',
    week: 4,
    title: 'Взлом Харизмы',
    description: 'Как нравиться людям (научный подход).',
    xpReward: 350,
    coinsReward: 175,
    slides: [
        {
            id: 'w4_match',
            type: 'MATCHING',
            question: 'Правила сильного общения:',
            pairs: [
                { id: 'eq1', left: 'Имя', right: 'Самый сладкий звук' },
                { id: 'eq2', left: 'Слушание', right: 'Важнее говорения' },
                { id: 'eq3', left: 'Взгляд', right: 'Прямой контакт' }
            ]
        }
    ]
  },
  {
    id: 't15',
    week: 4,
    title: 'Защита от Токсиков',
    description: 'Энергетический щит в действии.',
    xpReward: 400,
    coinsReward: 200,
    slides: [
        {
            id: 'w4_sort',
            type: 'SORTING',
            question: 'Реакция на хейт',
            leftCategoryLabel: 'СЛАБОСТЬ',
            rightCategoryLabel: 'СИЛА',
            items: [
                { id: 'tx1', text: 'Оправдываться', emoji: '😭', category: 'LEFT' },
                { id: 'tx2', text: 'Игнор / Юмор', emoji: '😎', category: 'RIGHT' },
                { id: 'tx3', text: 'Агрессия в ответ', emoji: '🤬', category: 'LEFT' },
                { id: 'tx4', text: 'Анализ фактов', emoji: '🧐', category: 'RIGHT' },
            ]
        }
    ]
  },
  {
    id: 't16',
    week: 4,
    title: 'БОСС: Хейтер',
    description: 'Сможешь ли ты сохранить хладнокровие?',
    xpReward: 1000,
    coinsReward: 500,
    isBoss: true,
    slides: [
        {
            id: 'boss4_q1',
            type: 'QUIZ',
            question: 'Тебе написали: "Твой проект — полная чушь". Твоя реакция?',
            options: [
                "Удалить проект и плакать",
                "Написать гадость в ответ",
                "Спросить: 'Что именно не так?' или проигнорировать"
            ],
            correctIndex: 2
        },
        {
            id: 'boss4_puz',
            type: 'PUZZLE',
            question: 'Собери мантру уверенности:',
            correctSentence: ["Чужое", "мнение", "не", "определяет", "мою", "ценность"],
            distractorWords: ["всегда", "только", "лайки"]
        }
    ]
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
  {
    id: 'l2',
    week: 2,
    title: 'Урок 2. Гормоны',
    duration: '12:30',
    description: 'Как гормоны управляют подростком.',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000',
    topics: ["Дофамин", "Серотонин", "Кортизол"]
  },
];

export const MOCK_STUDENTS: StudentProgress[] = [
  { id: 's1', name: 'Иван Петров', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan', week1Progress: 100, week2Progress: 40, week3Progress: 0, status: 'active', lastLogin: '2ч назад', tasksCompleted: 14 },
  { id: 's2', name: 'Мария С.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', week1Progress: 80, week2Progress: 10, week3Progress: 0, status: 'risk', lastLogin: '3д назад', tasksCompleted: 8 },
];

export const MEDITATIONS: Meditation[] = [
  { id: 'm1', title: 'Супер-сон', category: 'SLEEP', duration: '15 мин', color: 'bg-indigo-900' },
  { id: 'm2', title: 'Спокойствие', category: 'ANXIETY', duration: '5 мин', color: 'bg-teal-500' },
  { id: 'm3', title: 'Фокус', category: 'FOCUS', duration: '10 мин', color: 'bg-indigo-500' },
  { id: 'm4', title: 'Уверенность', category: 'FOCUS', duration: '7 мин', color: 'bg-amber-600' },
];

export const SOUNDSCAPES: Soundscape[] = [
  { id: 's1', title: 'Дождь', iconType: 'RAIN', color: 'bg-slate-700', youtubeId: 'mPZkdNFkNps' },
  { id: 's2', title: 'Лес', iconType: 'FOREST', color: 'bg-emerald-800', youtubeId: 'xNN7iTA57jM' },
  { id: 's3', title: 'Океан', iconType: 'OCEAN', color: 'bg-cyan-900', youtubeId: 'bn9F19Hi1Lk' },
  { id: 's4', title: 'Костер', iconType: 'FIRE', color: 'bg-orange-900', youtubeId: 'L_LUpnjgPso' },
];

export const QUOTES: Quote[] = [
  { 
    text: "Дисциплина — это решение делать то, чего ты очень не хочешь делать.", 
    author: "Майк Тайсон", 
    movie: "Спорт"
  },
  { 
    text: "Не пробуй. Делай. Или не делай. Не надо пробовать.", 
    author: "Йода", 
    movie: "Звездные Войны"
  },
];

export const KATYA_IMAGE_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300';
export const KATYA_VARIANTS = { IDLE: KATYA_IMAGE_URL, BLINK: KATYA_IMAGE_URL, TALK: KATYA_IMAGE_URL, TALK_OPEN: KATYA_IMAGE_URL };