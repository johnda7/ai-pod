import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Star, Trophy, Zap, Target, Users, Lightbulb, Heart, Shield, Brain, MessageCircle, Clock, Check, Play, Lock, Coins } from 'lucide-react';

interface LifeSkillsModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number, coins: number) => void;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  emoji: string;
  image: string;
  category: 'leadership' | 'financial' | 'emotional' | 'social' | 'productivity';
  color: string;
  lessons: SkillLesson[];
}

interface SkillLesson {
  id: string;
  title: string;
  duration: string;
  xp: number;
  type: 'video' | 'exercise' | 'quiz' | 'practice';
}

// 🚀 ОПТИМИЗАЦИЯ: уменьшены размеры изображений + качество
const LIFE_SKILLS: Skill[] = [
  {
    id: 'public_speaking',
    name: 'Публичные выступления',
    description: 'Говори уверенно перед любой аудиторией',
    emoji: '🎤',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=200&h=150&fit=crop&q=50',
    category: 'leadership',
    color: '#6366f1',
    lessons: [
      { id: 'ps1', title: 'Преодоление страха сцены', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'ps2', title: 'Структура выступления', duration: '7 мин', xp: 40, type: 'exercise' },
      { id: 'ps3', title: 'Язык тела', duration: '5 мин', xp: 35, type: 'practice' },
    ]
  },
  {
    id: 'money_basics',
    name: 'Финансовая грамотность',
    description: 'Управляй деньгами как профи',
    emoji: '💰',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=150&fit=crop&q=50',
    category: 'financial',
    color: '#22c55e',
    lessons: [
      { id: 'mb1', title: 'Бюджет подростка', duration: '6 мин', xp: 35, type: 'video' },
      { id: 'mb2', title: 'Сбережения vs Траты', duration: '5 мин', xp: 30, type: 'quiz' },
      { id: 'mb3', title: 'Первые инвестиции', duration: '8 мин', xp: 50, type: 'exercise' },
    ]
  },
  {
    id: 'emotional_iq',
    name: 'Эмоциональный интеллект',
    description: 'Понимай себя и других',
    emoji: '💜',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=150&fit=crop&q=50',
    category: 'emotional',
    color: '#ec4899',
    lessons: [
      { id: 'eq1', title: 'Распознавание эмоций', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'eq2', title: 'Управление гневом', duration: '6 мин', xp: 40, type: 'practice' },
      { id: 'eq3', title: 'Эмпатия', duration: '5 мин', xp: 35, type: 'exercise' },
    ]
  },
  {
    id: 'goal_setting',
    name: 'Постановка целей',
    description: 'От мечты к плану действий',
    emoji: '🎯',
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=200&h=150&fit=crop&q=50',
    category: 'productivity',
    color: '#f59e0b',
    lessons: [
      { id: 'gs1', title: 'SMART цели', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'gs2', title: 'Разбиение на шаги', duration: '6 мин', xp: 35, type: 'exercise' },
      { id: 'gs3', title: 'Отслеживание прогресса', duration: '5 мин', xp: 30, type: 'practice' },
    ]
  },
  {
    id: 'networking',
    name: 'Нетворкинг',
    description: 'Строй полезные связи',
    emoji: '🤝',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=150&fit=crop&q=50',
    category: 'social',
    color: '#3b82f6',
    lessons: [
      { id: 'nw1', title: 'Первое впечатление', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'nw2', title: 'Искусство small talk', duration: '6 мин', xp: 35, type: 'practice' },
      { id: 'nw3', title: 'Поддержание контактов', duration: '5 мин', xp: 30, type: 'exercise' },
    ]
  },
  {
    id: 'problem_solving',
    name: 'Решение проблем',
    description: 'Мысли как инженер',
    emoji: '🧩',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop&q=50',
    category: 'productivity',
    color: '#8b5cf6',
    lessons: [
      { id: 'pr1', title: 'Определение проблемы', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'pr2', title: 'Генерация решений', duration: '7 мин', xp: 40, type: 'exercise' },
      { id: 'pr3', title: 'Принятие решений', duration: '5 мин', xp: 35, type: 'quiz' },
    ]
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Все', emoji: '📚' },
  { id: 'leadership', name: 'Лидерство', emoji: '👑' },
  { id: 'financial', name: 'Финансы', emoji: '💰' },
  { id: 'emotional', name: 'Эмоции', emoji: '💜' },
  { id: 'social', name: 'Общение', emoji: '🤝' },
  { id: 'productivity', name: 'Продуктивность', emoji: '⚡' },
];

const LESSON_TYPE_ICONS = {
  video: Play,
  exercise: Target,
  quiz: Brain,
  practice: Users,
};

export const LifeSkillsModule: React.FC<LifeSkillsModuleProps> = ({ isOpen, onClose, onComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('life_skills_progress');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('life_skills_progress', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const filteredSkills = selectedCategory === 'all' 
    ? LIFE_SKILLS 
    : LIFE_SKILLS.filter(s => s.category === selectedCategory);

  const getSkillProgress = (skill: Skill) => {
    const completed = skill.lessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completed / skill.lessons.length) * 100);
  };

  const [activeLesson, setActiveLesson] = useState<SkillLesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [lessonStep, setLessonStep] = useState(0);
  
  // Контент для каждого урока
  const LESSON_CONTENT: Record<string, { steps: string[], quiz?: { question: string, options: string[], correct: number } }> = {
    // Публичные выступления
    'ps1': {
      steps: [
        '🎭 **Страх сцены — это нормально!**\n\nДаже опытные ораторы нервничают. Разница в том, как они с этим справляются.',
        '🧘 **Техника 4-7-8**\n\n• Вдох на 4 счёта\n• Задержка на 7 счётов\n• Выдох на 8 счётов\n\nПовтори 3 раза перед выступлением.',
        '💪 **Поза силы**\n\nЗа 2 минуты до выступления встань в "позу супергероя" — руки на поясе, плечи расправлены. Это реально снижает кортизол!',
      ],
      quiz: { question: 'Что снижает волнение перед выступлением?', options: ['Кофе', 'Поза силы', 'Избегание'], correct: 1 }
    },
    'ps2': {
      steps: [
        '📝 **Структура — твой друг**\n\nЛюбое хорошее выступление имеет:\n• Вступление (зацепи внимание)\n• Основную часть (3 ключевых пункта)\n• Заключение (призыв к действию)',
        '🎣 **Крючок в начале**\n\nНачни с:\n• Вопроса к аудитории\n• Шокирующего факта\n• Короткой истории',
        '🎯 **Правило трёх**\n\nЛюди запоминают максимум 3 идеи. Выбери 3 главных пункта и раскрой их.',
      ],
    },
    'ps3': {
      steps: [
        '👁️ **Зрительный контакт**\n\nСмотри на людей 3-5 секунд, потом переводи взгляд. Не сканируй комнату — это выдаёт нервозность.',
        '🤚 **Жесты**\n\n• Открытые ладони = честность\n• Руки выше пояса = энергия\n• Избегай скрещивания рук',
        '🚶 **Движение**\n\nНе стой статуей! Двигайся по сцене. Подходи к аудитории в важные моменты.',
      ],
    },
    // Финансы
    'mb1': {
      steps: [
        '💰 **Правило 50/30/20**\n\n• 50% — необходимое (транспорт, еда)\n• 30% — хотелки (развлечения)\n• 20% — сбережения (копилка)',
        '📱 **Отслеживай траты**\n\nПервую неделю просто записывай всё, на что тратишь. Ты удивишься результату!',
        '🎯 **Цель сбережений**\n\nНакопить на что-то конкретное проще, чем просто "откладывать". Поставь цель!',
      ],
    },
    'mb2': {
      steps: [
        '⚖️ **Нужды vs Хотелки**\n\nНужды — то, без чего нельзя (еда, транспорт). Хотелки — то, что приятно, но не обязательно.',
        '⏰ **Правило 24 часов**\n\nПеред покупкой хотелки подожди 24 часа. Если завтра всё ещё хочется — покупай.',
        '📊 **Цена за час**\n\nПодели цену вещи на свой "доход в час". Стоит ли кроссовок 20 часов твоей работы?',
      ],
    },
    'mb3': {
      steps: [
        '📈 **Сложный процент — 8-е чудо света**\n\nЕсли откладывать 1000₽/мес с 16 лет под 10% годовых, к 30 годам будет ~500,000₽!',
        '🎓 **Инвестируй в себя**\n\nЛучшая инвестиция в твоём возрасте — образование и навыки. Они дают доход всю жизнь.',
        '⚠️ **Никаких "быстрых денег"**\n\nЕсли обещают 100% в месяц — это мошенники. Реальная доходность: 8-15% в год.',
      ],
    },
    // EQ
    'eq1': {
      steps: [
        '🎭 **6 базовых эмоций**\n\n• 😊 Радость\n• 😢 Грусть\n• 😠 Гнев\n• 😨 Страх\n• 😲 Удивление\n• 🤢 Отвращение',
        '🔍 **Где живут эмоции?**\n\nЗаметь ощущения в теле:\n• Тревога — живот\n• Гнев — челюсть, кулаки\n• Грусть — грудь',
        '📝 **Называй эмоции**\n\nВместо "мне плохо" скажи точнее: "я разочарован" или "я тревожусь". Это снижает интенсивность!',
      ],
    },
    'eq2': {
      steps: [
        '🌡️ **Гнев — это сигнал**\n\nОн говорит: "Нарушены твои границы" или "Это несправедливо". Услышь сигнал!',
        '⏸️ **СТОП-техника**\n\n• С — стой (замри)\n• Т — тихо (вдох-выдох)\n• О — отступи (физически отойди)\n• П — подумай (что происходит?)',
        '💪 **Конструктивный выход**\n\n• Физическая активность\n• Письмо (не отправляй!)\n• Разговор "Я чувствую... когда ты..."',
      ],
    },
    'eq3': {
      steps: [
        '👂 **Эмпатия ≠ согласие**\n\nПонять чувства другого не значит одобрить его действия.',
        '🪞 **Отзеркаливание**\n\n"Похоже, тебе сейчас тяжело..."\n"Ты расстроен, потому что..."\n\nПокажи, что слышишь.',
        '❓ **Открытые вопросы**\n\nВместо "Тебе плохо?" спроси "Как ты себя чувствуешь?". Дай человеку раскрыться.',
      ],
    },
    // Цели
    'gs1': {
      steps: [
        '🎯 **SMART — умные цели**\n\n• S — конкретная\n• M — измеримая\n• A — достижимая\n• R — релевантная\n• T — ограниченная по времени',
        '❌ **Плохо:** "Хочу выучить английский"\n\n✅ **Хорошо:** "Выучить 500 слов за 2 месяца, занимаясь 15 мин/день"',
        '📊 **Как измерить?**\n\nУ каждой цели должен быть показатель прогресса. Иначе не поймёшь, достиг ли ты её.',
      ],
    },
    'gs2': {
      steps: [
        '🧱 **Ешь слона по кусочкам**\n\nБольшая цель пугает. Разбей её на шаги, которые можно сделать за 1 день.',
        '📅 **Обратное планирование**\n\n1. Конечная цель\n2. Что нужно за месяц до?\n3. Что нужно за неделю до?\n4. Что сделать сегодня?',
        '✅ **Правило 2 минут**\n\nЕсли шаг занимает меньше 2 минут — сделай прямо сейчас!',
      ],
    },
    'gs3': {
      steps: [
        '📈 **Визуализация прогресса**\n\nГрафик или чек-лист на видном месте. Мозг любит видеть рост!',
        '🎮 **Геймификация**\n\nПревращай цели в игру:\n• Уровни (бронза → серебро → золото)\n• Награды за этапы\n• Челленджи с друзьями',
        '📝 **Еженедельный обзор**\n\nКаждое воскресенье 10 минут:\n• Что сделано?\n• Что мешало?\n• План на неделю',
      ],
    },
    // Нетворкинг
    'nw1': {
      steps: [
        '⏱️ **7 секунд**\n\nСтолько формируется первое впечатление. Важно:\n• Улыбка\n• Зрительный контакт\n• Уверенная поза',
        '🤝 **Рукопожатие**\n\n• Крепкое, но не давящее\n• 2-3 качания\n• Смотри в глаза',
        '🎭 **Зеркало**\n\nЛюди симпатизируют похожим. Незаметно копируй позу и темп речи собеседника.',
      ],
    },
    'nw2': {
      steps: [
        '💬 **F.O.R.D. — темы для разговора**\n\n• Family (семья)\n• Occupation (занятия)\n• Recreation (хобби)\n• Dreams (мечты)',
        '❓ **Вопросы > Утверждения**\n\n"Чем ты увлекаешься?" лучше чем "Я люблю футбол".\n\nДай человеку говорить о себе!',
        '👂 **Активное слушание**\n\n• Кивай\n• "Интересно!"\n• Уточняющие вопросы\n• Запоминай детали',
      ],
    },
    'nw3': {
      steps: [
        '📱 **Сохраняй контакты**\n\nСразу после знакомства добавь в телефон с пометкой: "Маша, волейбол, любит рок".',
        '💌 **Поддерживай связь**\n\n• Репост интересной статьи\n• Поздравление с достижением\n• "Вспомнил о тебе, когда..."\n\nХотя бы раз в 2-3 месяца.',
        '🎁 **Давай ценность**\n\nНе только проси, но и помогай. Познакомь полезных людей, поделись ресурсом.',
      ],
    },
    // Решение проблем
    'pr1': {
      steps: [
        '🔍 **5 "Почему?"**\n\nКопай до корня:\n1. Почему опаздываю? — Поздно встаю\n2. Почему? — Поздно ложусь\n3. Почему? — Залипаю в телефон\n4. Почему? — Нет границ экранного времени\n5. Почему? — Не настроил...',
        '📝 **Формулировка проблемы**\n\n❌ "Всё плохо"\n✅ "Я трачу 4 часа в день на соцсети и не успеваю делать уроки"',
        '🎯 **Один фокус**\n\nРешай одну проблему за раз. Многозадачность не работает!',
      ],
    },
    'pr2': {
      steps: [
        '🧠 **Брейншторм**\n\nЗапиши ВСЕ идеи за 10 минут. Даже глупые. Критика запрещена!',
        '🔄 **Что если наоборот?**\n\nИнверсия помогает: "Как сделать хуже?" → Делай наоборот.',
        '👥 **Чужой взгляд**\n\n"Что бы сделал [герой/ментор]?" — Илон Маск? Твой любимый персонаж?',
      ],
    },
    'pr3': {
      steps: [
        '⚖️ **Плюсы и минусы**\n\nДля каждого варианта:\n• Список плюсов\n• Список минусов\n• Вес каждого (1-10)',
        '🎲 **Правило монетки**\n\nПодбрось монетку. Не смотри на результат — следи за своей реакцией. Она покажет, чего ты хочешь!',
        '⏰ **Дедлайн решения**\n\nНе откладывай. "Я приму решение до пятницы" — и принимай.',
      ],
    },
  };

  const startLesson = (lesson: SkillLesson) => {
    if (completedLessons.includes(lesson.id)) return;
    setActiveLesson(lesson);
    setLessonProgress(0);
    setLessonStep(0);
  };
  
  const nextLessonStep = () => {
    if (!activeLesson) return;
    const content = LESSON_CONTENT[activeLesson.id];
    
    // 🚫 Если контента нет - не даём продолжить
    if (!content || !content.steps || content.steps.length === 0) {
      return;
    }
    
    const totalSteps = content.steps.length + (content.quiz ? 1 : 0);
    const newStep = lessonStep + 1;
    
    if (newStep >= totalSteps) {
      setLessonProgress(100);
    } else {
      setLessonStep(newStep);
      setLessonProgress(Math.round((newStep / totalSteps) * 100));
    }
  };

  const completeLesson = () => {
    if (!activeLesson) return;
    
    setCompletedLessons([...completedLessons, activeLesson.id]);
    onComplete(activeLesson.xp, Math.floor(activeLesson.xp / 3));
    setActiveLesson(null);
    setLessonProgress(0);
    setLessonStep(0);
  };

  const totalProgress = Math.round(
    (completedLessons.length / LIFE_SKILLS.reduce((acc, s) => acc + s.lessons.length, 0)) * 100
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        {/* Beautiful Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0f2a 50%, #0a0a1a 100%)',
            }}
          />
          
          {/* Aurora effects */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.25) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 right-0 w-1/2 h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 100% 20%, rgba(139,92,246,0.2) 0%, transparent 60%)',
              filter: 'blur(50px)',
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />

          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        {/* Header - MORE PADDING FOR TELEGRAM */}
        <div className="sticky top-0 z-30 px-4 pt-4 pb-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-xl overflow-hidden relative"
                  style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop"
                    alt="Life Skills"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Life Skills</h1>
                  <p className="text-white/50 text-xs">Навыки для жизни</p>
                </div>
              </div>
              
              <button
                onClick={selectedSkill ? () => setSelectedSkill(null) : onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                {selectedSkill ? (
                  <ChevronRight size={20} className="text-white rotate-180" />
                ) : (
                  <X size={20} className="text-white" />
                )}
              </button>
            </div>

            {/* Total Progress */}
            {!selectedSkill && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/50">Общий прогресс</span>
                    <span className="text-indigo-400 font-bold">{totalProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
                      style={{
                        background: selectedCategory === cat.id 
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : 'rgba(255,255,255,0.05)',
                        color: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.5)',
                        boxShadow: selectedCategory === cat.id ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
                      }}
                    >
                      <span>{cat.emoji}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 pb-40 overflow-y-auto h-[calc(100vh-280px)]">
          {!selectedSkill ? (
            /* Skills Grid */
            <div className="grid grid-cols-2 gap-3">
              {filteredSkills.map((skill, index) => {
                const progress = getSkillProgress(skill);
                const isComplete = progress === 100;
                
                return (
                  <motion.button
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedSkill(skill)}
                    className="rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
                    style={{
                      boxShadow: `0 8px 32px ${skill.color}20`,
                    }}
                  >
                    {/* Image */}
                    <div className="h-28 relative">
                      <img 
                        src={skill.image}
                        alt={skill.name}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(180deg, transparent 0%, ${skill.color}90 100%)`,
                        }}
                      />
                      
                      {/* Progress badge */}
                      {progress > 0 && (
                        <div 
                          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: isComplete ? '#22c55e' : 'rgba(0,0,0,0.5)',
                            color: 'white',
                          }}
                        >
                          {isComplete ? '✓' : `${progress}%`}
                        </div>
                      )}
                      
                      {/* Emoji */}
                      <div className="absolute bottom-2 left-3">
                        <span className="text-3xl drop-shadow-lg">{skill.emoji}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div 
                      className="p-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      }}
                    >
                      <h4 className="text-white font-bold text-sm mb-0.5 truncate">{skill.name}</h4>
                      <p className="text-white/40 text-[10px] mb-2 line-clamp-1">{skill.description}</p>
                      
                      {/* Progress bar */}
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${progress}%`,
                            background: skill.color,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-white/30 text-[9px]">{skill.lessons.length} уроков</span>
                        <span className="text-[9px] font-bold" style={{ color: skill.color }}>{progress}%</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            /* Skill Detail */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Skill Header Card */}
              <div 
                className="rounded-3xl overflow-hidden mb-4"
                style={{ boxShadow: `0 8px 32px ${selectedSkill.color}30` }}
              >
                <div className="h-40 relative">
                  <img 
                    src={selectedSkill.image}
                    alt={selectedSkill.name}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${selectedSkill.color}95 100%)`,
                    }}
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{selectedSkill.emoji}</span>
                      <div>
                        <h2 className="text-white font-bold text-xl">{selectedSkill.name}</h2>
                        <p className="text-white/70 text-sm">{selectedSkill.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/40 text-xs">Прогресс</span>
                    <span className="font-bold" style={{ color: selectedSkill.color }}>
                      {getSkillProgress(selectedSkill)}%
                    </span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${getSkillProgress(selectedSkill)}%`,
                        background: selectedSkill.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                {selectedSkill.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isLocked = index > 0 && !completedLessons.includes(selectedSkill.lessons[index - 1].id);
                  const TypeIcon = LESSON_TYPE_ICONS[lesson.type];
                  
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => !isLocked && !isCompleted && startLesson(lesson)}
                      disabled={isLocked}
                      className={`w-full p-4 rounded-2xl text-left transition-all ${
                        isLocked ? 'opacity-50' : 'active:scale-[0.98]'
                      }`}
                      style={{
                        background: isCompleted 
                          ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: isCompleted 
                              ? '#22c55e' 
                              : isLocked 
                                ? 'rgba(255,255,255,0.05)' 
                                : `${selectedSkill.color}20`,
                          }}
                        >
                          {isCompleted ? (
                            <Check size={20} className="text-white" />
                          ) : isLocked ? (
                            <Lock size={18} className="text-white/30" />
                          ) : (
                            <TypeIcon size={20} style={{ color: selectedSkill.color }} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-white/30 text-xs flex items-center gap-1">
                              <Clock size={10} />
                              {lesson.duration}
                            </span>
                            <span className="text-xs flex items-center gap-1" style={{ color: '#fbbf24' }}>
                              <Zap size={10} />
                              +{lesson.xp} XP
                            </span>
                          </div>
                        </div>
                        
                        {!isLocked && !isCompleted && (
                          <div 
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                              background: `${selectedSkill.color}20`,
                              color: selectedSkill.color,
                            }}
                          >
                            Начать
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Active Lesson Modal */}
        <AnimatePresence>
          {activeLesson && selectedSkill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {/* Lesson Header */}
                <div className="p-6 text-center">
                  <span className="text-5xl mb-4 block">{selectedSkill.emoji}</span>
                  <h3 className="text-xl font-bold text-white mb-2">{activeLesson.title}</h3>
                  <p className="text-white/50 text-sm">{selectedSkill.name}</p>
                </div>

                {/* Progress */}
                <div className="px-6 pb-6">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ 
                        width: `${lessonProgress}%`,
                        background: selectedSkill.color,
                      }}
                    />
                  </div>
                  
                  {lessonProgress < 100 ? (
                    <div>
                      {/* Lesson Content */}
                      {LESSON_CONTENT[activeLesson.id] && LESSON_CONTENT[activeLesson.id].steps?.length > 0 ? (
                        <div className="mb-6">
                          <div 
                            className="p-4 rounded-2xl text-left max-h-64 overflow-y-auto"
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                          >
                            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                              {LESSON_CONTENT[activeLesson.id].steps[lessonStep]?.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </p>
                          </div>
                          <p className="text-white/40 text-xs text-center mt-2">
                            Шаг {lessonStep + 1} из {LESSON_CONTENT[activeLesson.id].steps.length}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 rounded-2xl text-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                          <p className="text-red-400 text-sm mb-2">⚠️ Материал в разработке</p>
                          <p className="text-white/50 text-xs">Этот урок скоро будет готов!</p>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setActiveLesson(null);
                            setLessonProgress(0);
                            setLessonStep(0);
                          }}
                          className="flex-1 py-3 rounded-xl text-white/50 text-sm font-medium"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                          {LESSON_CONTENT[activeLesson.id]?.steps?.length > 0 ? 'Отмена' : 'Назад'}
                        </button>
                        {LESSON_CONTENT[activeLesson.id]?.steps?.length > 0 && (
                          <button
                            onClick={nextLessonStep}
                            className="flex-1 py-3 rounded-xl text-white text-sm font-medium"
                            style={{ 
                              background: selectedSkill.color,
                            }}
                          >
                            {lessonStep < LESSON_CONTENT[activeLesson.id].steps.length - 1 
                              ? 'Далее →' 
                              : 'Завершить ✓'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20">
                          <Zap size={18} className="text-yellow-400" />
                          <span className="text-yellow-400 font-bold">+{activeLesson.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20">
                          <Coins size={18} className="text-yellow-400" />
                          <span className="text-yellow-400 font-bold">+{Math.floor(activeLesson.xp / 3)}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={completeLesson}
                        className="w-full py-4 rounded-2xl font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${selectedSkill.color} 0%, ${selectedSkill.color}cc 100%)`,
                          boxShadow: `0 8px 32px ${selectedSkill.color}40`,
                        }}
                      >
                        Готово! 🎉
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default LifeSkillsModule;
