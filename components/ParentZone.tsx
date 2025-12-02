import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, Trophy, Users, Heart, Star, 
  ChevronRight, Gift, Medal, Crown, Sparkles,
  GraduationCap, Target, MessageCircle, Clock,
  CheckCircle, Lock
} from 'lucide-react';
import { hapticLight, hapticSuccess } from '../services/telegramService';

interface ParentZoneProps {
  isOpen: boolean;
  onClose: () => void;
}

// 🏆 ЧЕЛЛЕНДЖ ДЛЯ РОДИТЕЛЕЙ: Призы - книги Кати
const PARENT_CHALLENGE_PRIZES = [
  { 
    place: 1, 
    prize: '📚 ГЛАВНЫЙ ПРИЗ', 
    description: 'Книга "Шаг к себе" + личная консультация с Катей (30 мин)',
    color: 'from-yellow-400 to-amber-500',
    icon: '👑'
  },
  { 
    place: 2, 
    prize: '📖 2 МЕСТО', 
    description: 'Книга "Шаг к себе" с автографом + видео-разбор',
    color: 'from-gray-300 to-gray-400',
    icon: '🥈'
  },
  { 
    place: 3, 
    prize: '📕 3 МЕСТО', 
    description: 'Книга "Шаг к себе" с автографом',
    color: 'from-amber-600 to-amber-700',
    icon: '🥉'
  },
  { 
    place: '4-5', 
    prize: '📗 ТОП-5', 
    description: 'Книга "Шаг к себе" (электронная версия)',
    color: 'from-purple-400 to-purple-600',
    icon: '⭐'
  },
];

// Мок-данные лидерборда родителей
const PARENT_LEADERBOARD = [
  { id: '1', name: 'Мама Маши', points: 580, avatar: '👩' },
  { id: '2', name: 'Папа Артёма', points: 520, avatar: '👨' },
  { id: '3', name: 'Мама Даши', points: 490, avatar: '👩‍🦰' },
  { id: '4', name: 'Папа Максима', points: 450, avatar: '🧔' },
  { id: '5', name: 'Мама Алины', points: 420, avatar: '👱‍♀️' },
];

// Модули для родителей из книги Кати
const PARENT_MODULES = [
  {
    id: 'understanding',
    title: 'Понимание подростка',
    description: 'Как понять что происходит с вашим ребёнком',
    icon: '🧠',
    lessons: 5,
    points: 100,
    isLocked: false,
  },
  {
    id: 'communication',
    title: 'Эффективное общение',
    description: 'Как говорить чтобы подросток слышал',
    icon: '💬',
    lessons: 6,
    points: 120,
    isLocked: false,
  },
  {
    id: 'motivation',
    title: 'Мотивация без давления',
    description: 'Как вдохновлять не заставляя',
    icon: '🔥',
    lessons: 4,
    points: 80,
    isLocked: true,
  },
  {
    id: 'boundaries',
    title: 'Границы и свобода',
    description: 'Баланс контроля и доверия',
    icon: '🛡️',
    lessons: 5,
    points: 100,
    isLocked: true,
  },
  {
    id: 'emotions',
    title: 'Эмоции подростка',
    description: 'Что делать с перепадами настроения',
    icon: '💖',
    lessons: 4,
    points: 80,
    isLocked: true,
  },
  {
    id: 'crisis',
    title: 'Кризисные ситуации',
    description: 'Как помочь в сложные моменты',
    icon: '🆘',
    lessons: 3,
    points: 60,
    isLocked: true,
  },
];

// Советы дня для родителей
const DAILY_TIPS = [
  {
    title: 'Слушайте без оценок',
    content: 'Когда подросток делится переживаниями, просто слушайте. Не давайте советов сразу — сначала покажите что вы слышите.',
    author: 'Катя Карпенко',
  },
  {
    title: 'Признавайте чувства',
    content: '"Я понимаю, что тебе сейчас тяжело" — эта фраза творит чудеса. Подростку важно знать, что его чувства нормальны.',
    author: 'Катя Карпенко',
  },
  {
    title: 'Не сравнивайте',
    content: 'Сравнение с другими детьми — главный убийца самооценки. Сравнивайте ребёнка только с ним самим вчерашним.',
    author: 'Катя Карпенко',
  },
];

// 🧠 4 ТИПА ПРОБЛЕМНОГО ПОВЕДЕНИЯ (из книги Кати)
const BEHAVIOR_TYPES = [
  {
    id: 'attention',
    type: '👀 Привлечение внимания',
    emoji: '👀',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.3)',
    description: 'Ребёнок делает что угодно, чтобы вы обратили на него внимание',
    signs: ['Постоянно перебивает', 'Ноет и канючит', 'Капризничает без причины', 'Делает назло при вас'],
    whatToDo: 'Давайте внимание ДО того как он его требует. 15 минут качественного времени в день.',
    whatNotToDo: 'Не ругайте и не читайте нотации — это тоже внимание!',
  },
  {
    id: 'power',
    type: '💪 Борьба за власть',
    emoji: '💪',
    color: 'from-orange-500 to-red-500',
    bgColor: 'rgba(249,115,22,0.15)',
    borderColor: 'rgba(249,115,22,0.3)',
    description: 'Ребёнок хочет контролировать ситуацию и принимать решения сам',
    signs: ['Спорит по любому поводу', 'Делает наоборот', 'Отказывается выполнять просьбы', '"Ты мне не указ!"'],
    whatToDo: 'Дайте выбор там, где можете. "Ты уберёшь сейчас или через 10 минут?"',
    whatNotToDo: 'Не вступайте в борьбу — вы оба проиграете.',
  },
  {
    id: 'revenge',
    type: '😤 Месть',
    emoji: '😤',
    color: 'from-red-500 to-pink-500',
    bgColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.3)',
    description: 'Ребёнок чувствует себя обиженным и хочет отомстить',
    signs: ['Говорит обидные вещи', 'Специально ломает/портит', 'Жестокость к младшим', '"Я тебя ненавижу!"'],
    whatToDo: 'Признайте его боль: "Я вижу, что тебе больно. Мне жаль."',
    whatNotToDo: 'Не мстите в ответ и не наказывайте жёстко.',
  },
  {
    id: 'avoidance',
    type: '🙈 Избегание неудачи',
    emoji: '🙈',
    color: 'from-gray-500 to-slate-500',
    bgColor: 'rgba(107,114,128,0.15)',
    borderColor: 'rgba(107,114,128,0.3)',
    description: 'Ребёнок боится потерпеть неудачу и заранее сдаётся',
    signs: ['Не пробует новое', 'Сдаётся при первой сложности', '"У меня не получится"', 'Притворяется больным'],
    whatToDo: 'Хвалите усилия, не результат. Показывайте свои неудачи.',
    whatNotToDo: 'Не делайте за него и не говорите "это же легко!"',
  },
];

// 🪣 ТЕХНИКА "ДЫРЯВОЕ ВЕДРО"
const BUCKET_TECHNIQUE = {
  title: 'Дырявое ведро самооценки',
  description: 'Представьте, что самооценка вашего подростка — это ведро с водой. Каждый день вода вытекает через дырки (критика, сравнения, неудачи). Ваша задача — наполнять ведро быстрее, чем оно протекает.',
  fillers: [
    { emoji: '💬', text: 'Слова поддержки', example: '"Я в тебя верю"' },
    { emoji: '⏰', text: 'Качественное время', example: '15 мин без телефона' },
    { emoji: '👂', text: 'Активное слушание', example: 'Без советов и критики' },
    { emoji: '🎯', text: 'Признание усилий', example: '"Ты старался!"' },
    { emoji: '🤗', text: 'Физический контакт', example: 'Объятия, если позволяет' },
  ],
  drains: [
    { emoji: '❌', text: 'Сравнение с другими' },
    { emoji: '❌', text: 'Критика личности' },
    { emoji: '❌', text: 'Игнорирование чувств' },
    { emoji: '❌', text: 'Завышенные ожидания' },
    { emoji: '❌', text: 'Публичные замечания' },
  ],
};

// 🆘 SOS-КАРТОЧКИ для кризисных ситуаций
const SOS_CARDS = [
  {
    id: 'screaming',
    emoji: '😱',
    title: 'Подросток кричит',
    color: 'from-red-500 to-orange-500',
    steps: [
      '1. Глубокий вдох — не реагируйте сразу',
      '2. Говорите тихо: "Я вижу, что тебе плохо"',
      '3. Не пытайтесь остановить — дайте выкричаться',
      '4. После: "Когда ты готов — поговорим"',
    ],
    avoid: 'НЕ ДЕЛАЙТЕ: Не кричите в ответ, не угрожайте, не уходите демонстративно',
  },
  {
    id: 'closed',
    emoji: '🚪',
    title: 'Замкнулся в себе',
    color: 'from-blue-500 to-indigo-500',
    steps: [
      '1. Не ломитесь в дверь — дайте пространство',
      '2. Записка под дверь: "Я рядом, когда захочешь"',
      '3. Предложите совместное дело без разговоров',
      '4. Терпение — это может занять дни',
    ],
    avoid: 'НЕ ДЕЛАЙТЕ: Не допрашивайте, не выбивайте признания, не наказывайте молчанием в ответ',
  },
  {
    id: 'phone',
    emoji: '📱',
    title: 'Война за телефон',
    color: 'from-purple-500 to-pink-500',
    steps: [
      '1. Договоритесь о правилах ЗАРАНЕЕ (не в конфликте)',
      '2. Объясните причину, а не "потому что я сказал"',
      '3. Предложите альтернативу: "Что будем делать вместо?"',
      '4. Будьте примером — отложите свой телефон',
    ],
    avoid: 'НЕ ДЕЛАЙТЕ: Не отбирайте внезапно, не читайте переписки тайком, не используйте как наказание',
  },
  {
    id: 'grades',
    emoji: '📉',
    title: 'Плохие оценки',
    color: 'from-amber-500 to-yellow-500',
    steps: [
      '1. Спросите: "Что случилось?" без обвинений',
      '2. Узнайте: может есть причина (буллинг, проблемы)',
      '3. Фокус на решении: "Как я могу помочь?"',
      '4. Разделите: оценки ≠ ценность ребёнка',
    ],
    avoid: 'НЕ ДЕЛАЙТЕ: Не сравнивайте с другими, не лишайте всего, не повторяйте "ты способен на большее"',
  },
  {
    id: 'lies',
    emoji: '🤥',
    title: 'Поймали на лжи',
    color: 'from-slate-500 to-gray-500',
    steps: [
      '1. Спросите себя: почему он боится сказать правду?',
      '2. Не устраивайте допрос — скажите: "Я знаю правду"',
      '3. Обсудите: "Что ты боялся что случится?"',
      '4. Договоритесь: правда = меньшие последствия',
    ],
    avoid: 'НЕ ДЕЛАЙТЕ: Не называйте "лжецом", не устраивайте ловушки, не наказывайте жёстче за ложь чем за проступок',
  },
  {
    id: 'hate',
    emoji: '💔',
    title: '"Я тебя ненавижу!"',
    color: 'from-rose-500 to-red-500',
    steps: [
      '1. Это не про вас — это про его боль',
      '2. Не принимайте на свой счёт',
      '3. Ответьте: "Я вижу, что тебе больно. Я тебя люблю."',
      '4. Позже обсудите: "Что ты на самом деле хотел сказать?"',
    ],
    avoid: 'НЕ ДЕЛАЙТЕ: Не говорите "И я тебя!", не обижайтесь всерьёз, не наказывайте за слова в гневе',
  },
];

// 🌡️ ТЕРМОМЕТР ОТНОШЕНИЙ
const RELATIONSHIP_QUESTIONS = [
  { id: 1, text: 'Сколько раз на этой неделе вы провели время вместе без телефонов?', max: 7 },
  { id: 2, text: 'Сколько раз вы похвалили подростка?', max: 10 },
  { id: 3, text: 'Сколько раз вы повысили голос?', max: 10, inverse: true },
  { id: 4, text: 'Подросток сам рассказывал вам что-то о своей жизни?', max: 5 },
  { id: 5, text: 'Вы знаете имена его друзей и чем он увлекается?', yesNo: true },
];

// 📖 ИСТОРИИ И ПРИМЕРЫ ДИАЛОГОВ
const DIALOG_EXAMPLES = [
  {
    id: 'morning',
    title: 'Утренние сборы',
    situation: 'Подросток копается и опаздывает в школу каждый день',
    wrongDialog: {
      parent: '— Сколько можно копаться?! Ты опять опоздаешь! Почему ты такой безответственный?!',
      teen: '— Отстань! Я уже иду!',
      result: '❌ Конфликт, испорченное утро, ничего не изменится',
    },
    rightDialog: {
      parent: '— Я вижу, что тебе сложно собираться по утрам. Что бы тебе помогло? Может, будильник пораньше?',
      teen: '— Да ничего... ладно, попробую раньше вставать.',
      result: '✅ Разговор, поиск решения, подросток берёт ответственность',
    },
    tip: 'Задавайте вопросы вместо обвинений. "Почему ты...?" замените на "Что бы помогло...?"',
  },
  {
    id: 'grades',
    title: 'Плохая оценка',
    situation: 'Пришёл домой с двойкой по контрольной',
    wrongDialog: {
      parent: '— Опять двойка?! Ты вообще учишься?! Я в твоём возрасте отличником был!',
      teen: '— Да мне вообще всё равно на эту школу...',
      result: '❌ Демотивация, закрытость, "мне всё равно" — защита от боли',
    },
    rightDialog: {
      parent: '— Вижу, что-то пошло не так с контрольной. Хочешь рассказать что случилось?',
      teen: '— Да я вообще не понял эту тему... и спросить постеснялся.',
      result: '✅ Выявлена реальная причина, можно помочь',
    },
    tip: 'За плохими оценками всегда есть причина. Узнайте её без осуждения.',
  },
  {
    id: 'phone',
    title: 'Зависание в телефоне',
    situation: 'Часами сидит в телефоне, не реагирует на просьбы',
    wrongDialog: {
      parent: '— Ты опять в этом телефоне! Я его сейчас заберу!',
      teen: '— Не трогай! Это моё!',
      result: '❌ Война, телефон станет "запретным плодом", отношения испортятся',
    },
    rightDialog: {
      parent: '— Я заметила, что ты много времени проводишь в телефоне. Расскажи, что там интересного?',
      teen: '— Да там... (начинает рассказывать)',
      result: '✅ Контакт, понимание его мира, возможность вместе установить правила',
    },
    tip: 'Проявите интерес к его миру, прежде чем его ограничивать.',
  },
];

export const ParentZone: React.FC<ParentZoneProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'psychology' | 'sos' | 'thermometer' | 'learn'>('psychology');
  const [parentPoints, setParentPoints] = useState(120);
  const [dailyTipIndex] = useState(Math.floor(Math.random() * DAILY_TIPS.length));
  const [selectedBehavior, setSelectedBehavior] = useState<string | null>(null);
  const [selectedSOS, setSelectedSOS] = useState<string | null>(null);
  const [thermometerAnswers, setThermometerAnswers] = useState<Record<number, number>>({});
  const [showBucketTechnique, setShowBucketTechnique] = useState(false);
  const [selectedDialog, setSelectedDialog] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const dailyTip = DAILY_TIPS[dailyTipIndex];
  const userPosition = PARENT_LEADERBOARD.findIndex(u => u.points < parentPoints) + 1 || 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              border: '1px solid rgba(236,72,153,0.3)',
            }}
          >
            <GraduationCap className="text-pink-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Зона Родителей</h1>
            <p className="text-white/50 text-xs">По книге Кати Карпенко</p>
          </div>
        </div>
        
        {/* Points */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: 'rgba(236,72,153,0.15)',
              border: '1px solid rgba(236,72,153,0.3)',
            }}
          >
            <Star className="text-pink-400" size={16} fill="currentColor" />
            <span className="text-pink-300 font-bold">{parentPoints}</span>
          </div>
          
          <button 
            onClick={() => { hapticLight(); onClose(); }}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="text-white/70" size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-4 overflow-x-auto">
        {[
          { id: 'psychology', label: '🧠 Психология', icon: BookOpen },
          { id: 'sos', label: '🆘 SOS', icon: Heart },
          { id: 'thermometer', label: '🌡️ Термометр', icon: Target },
          { id: 'learn', label: '📚 Уроки', icon: GraduationCap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { hapticLight(); setActiveTab(tab.id as 'psychology' | 'sos' | 'thermometer' | 'learn'); }}
            className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            style={{
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 100%)'
                : 'rgba(255,255,255,0.05)',
              border: activeTab === tab.id 
                ? '1px solid rgba(236,72,153,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* PSYCHOLOGY TAB - 4 типа поведения + дырявое ведро + диалоги */}
          {activeTab === 'psychology' && (
            <motion.div
              key="psychology"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Daily Tip */}
              <div 
                className="p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                  border: '1px solid rgba(236,72,153,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-pink-400" size={18} />
                  <span className="text-pink-300 font-semibold text-sm">Совет дня</span>
                </div>
                <h3 className="text-white font-bold mb-2">{dailyTip.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">{dailyTip.content}</p>
                <p className="text-white/40 text-xs italic">— {dailyTip.author}</p>
              </div>

              {/* 4 ТИПА ПРОБЛЕМНОГО ПОВЕДЕНИЯ */}
              <h2 className="text-white font-bold text-lg mt-6 mb-3 flex items-center gap-2">
                <span>🧠</span> 4 типа проблемного поведения
              </h2>
              <p className="text-white/60 text-sm mb-4">
                Любое "плохое" поведение — это сигнал. Определите тип — найдёте решение.
              </p>
              
              <div className="space-y-3">
                {BEHAVIOR_TYPES.map((behavior, index) => (
                  <motion.div
                    key={behavior.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        hapticLight();
                        setSelectedBehavior(selectedBehavior === behavior.id ? null : behavior.id);
                      }}
                      className="w-full p-4 rounded-2xl text-left"
                      style={{
                        background: behavior.bgColor,
                        border: `1px solid ${behavior.borderColor}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{behavior.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{behavior.type}</h3>
                          <p className="text-white/60 text-sm">{behavior.description}</p>
                        </div>
                        <ChevronRight 
                          className={`text-white/50 transition-transform ${selectedBehavior === behavior.id ? 'rotate-90' : ''}`} 
                          size={20} 
                        />
                      </div>
                    </button>
                    
                    {/* Expanded Content */}
                    <AnimatePresence>
                      {selectedBehavior === behavior.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-4 bg-white/5 rounded-b-2xl border-x border-b border-white/10">
                            {/* Признаки */}
                            <div>
                              <h4 className="text-white/80 font-semibold text-sm mb-2">📋 Признаки:</h4>
                              <div className="flex flex-wrap gap-2">
                                {behavior.signs.map((sign, i) => (
                                  <span key={i} className="px-2 py-1 bg-white/10 rounded-lg text-white/70 text-xs">
                                    {sign}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {/* Что делать */}
                            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                              <h4 className="text-green-400 font-semibold text-sm mb-1">✅ Что делать:</h4>
                              <p className="text-white/80 text-sm">{behavior.whatToDo}</p>
                            </div>
                            
                            {/* Чего НЕ делать */}
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                              <h4 className="text-red-400 font-semibold text-sm mb-1">❌ Чего НЕ делать:</h4>
                              <p className="text-white/80 text-sm">{behavior.whatNotToDo}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* ТЕХНИКА ДЫРЯВОЕ ВЕДРО */}
              <motion.button
                onClick={() => { hapticLight(); setShowBucketTechnique(!showBucketTechnique); }}
                className="w-full p-4 rounded-2xl text-left mt-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.15) 100%)',
                  border: '1px solid rgba(251,191,36,0.3)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🪣</span>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{BUCKET_TECHNIQUE.title}</h3>
                    <p className="text-amber-200/70 text-sm">Главная техника для самооценки</p>
                  </div>
                  <ChevronRight 
                    className={`text-amber-400 transition-transform ${showBucketTechnique ? 'rotate-90' : ''}`} 
                    size={20} 
                  />
                </div>
              </motion.button>
              
              <AnimatePresence>
                {showBucketTechnique && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                      <p className="text-white/80 text-sm">{BUCKET_TECHNIQUE.description}</p>
                      
                      {/* Наполнители */}
                      <div>
                        <h4 className="text-green-400 font-semibold text-sm mb-3">💚 Наполняет ведро:</h4>
                        <div className="space-y-2">
                          {BUCKET_TECHNIQUE.fillers.map((filler, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-green-500/10 rounded-xl">
                              <span className="text-xl">{filler.emoji}</span>
                              <div>
                                <span className="text-white/90 text-sm font-medium">{filler.text}</span>
                                <span className="text-green-300/60 text-xs ml-2">{filler.example}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Дыры */}
                      <div>
                        <h4 className="text-red-400 font-semibold text-sm mb-3">🕳️ Пробивает дыры:</h4>
                        <div className="flex flex-wrap gap-2">
                          {BUCKET_TECHNIQUE.drains.map((drain, i) => (
                            <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                              {drain.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ПРИМЕРЫ ДИАЛОГОВ */}
              <h2 className="text-white font-bold text-lg mt-6 mb-3 flex items-center gap-2">
                <span>💬</span> Примеры диалогов
              </h2>
              <p className="text-white/60 text-sm mb-4">
                Как говорить, чтобы подросток слышал
              </p>
              
              <div className="space-y-3">
                {DIALOG_EXAMPLES.map((dialog, index) => (
                  <motion.div
                    key={dialog.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        hapticLight();
                        setSelectedDialog(selectedDialog === dialog.id ? null : dialog.id);
                      }}
                      className="w-full p-4 rounded-2xl text-left"
                      style={{
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.2)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💬</span>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{dialog.title}</h3>
                          <p className="text-purple-200/60 text-sm">{dialog.situation}</p>
                        </div>
                        <ChevronRight 
                          className={`text-purple-400 transition-transform ${selectedDialog === dialog.id ? 'rotate-90' : ''}`} 
                          size={20} 
                        />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {selectedDialog === dialog.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-4 bg-purple-500/5 rounded-b-2xl border-x border-b border-purple-500/20">
                            {/* Неправильный диалог */}
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                              <h4 className="text-red-400 font-semibold text-sm mb-2">❌ Как НЕ надо:</h4>
                              <div className="space-y-2 text-sm">
                                <p className="text-white/70"><span className="text-red-300">Родитель:</span> {dialog.wrongDialog.parent}</p>
                                <p className="text-white/70"><span className="text-red-300">Подросток:</span> {dialog.wrongDialog.teen}</p>
                                <p className="text-red-300/80 text-xs mt-2">{dialog.wrongDialog.result}</p>
                              </div>
                            </div>
                            
                            {/* Правильный диалог */}
                            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                              <h4 className="text-green-400 font-semibold text-sm mb-2">✅ Как лучше:</h4>
                              <div className="space-y-2 text-sm">
                                <p className="text-white/70"><span className="text-green-300">Родитель:</span> {dialog.rightDialog.parent}</p>
                                <p className="text-white/70"><span className="text-green-300">Подросток:</span> {dialog.rightDialog.teen}</p>
                                <p className="text-green-300/80 text-xs mt-2">{dialog.rightDialog.result}</p>
                              </div>
                            </div>
                            
                            {/* Совет */}
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                              <p className="text-amber-200 text-sm">💡 {dialog.tip}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SOS TAB - Карточки для кризисных ситуаций */}
          {activeTab === 'sos' && (
            <motion.div
              key="sos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-2">
                  <span>🆘</span> SOS-карточки
                </h2>
                <p className="text-white/70 text-sm">
                  Быстрые инструкции для сложных ситуаций. Выберите ситуацию — получите пошаговый план.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SOS_CARDS.map((card, index) => (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      hapticLight();
                      setSelectedSOS(selectedSOS === card.id ? null : card.id);
                    }}
                    className={`p-4 rounded-2xl text-center bg-gradient-to-br ${card.color} ${
                      selectedSOS === card.id ? 'ring-2 ring-white/50' : ''
                    }`}
                  >
                    <span className="text-4xl block mb-2">{card.emoji}</span>
                    <span className="text-white font-bold text-sm">{card.title}</span>
                  </motion.button>
                ))}
              </div>

              {/* Selected SOS Card Detail */}
              <AnimatePresence>
                {selectedSOS && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {SOS_CARDS.filter(c => c.id === selectedSOS).map(card => (
                      <div 
                        key={card.id}
                        className="p-4 rounded-2xl space-y-4"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                          <span>{card.emoji}</span> {card.title}
                        </h3>
                        
                        {/* Шаги */}
                        <div className="space-y-2">
                          {card.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-xl">
                              <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-white/90 text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Чего избегать */}
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-red-300 text-sm">⚠️ {card.avoid}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* THERMOMETER TAB - Термометр отношений */}
          {activeTab === 'thermometer' && (
            <motion.div
              key="thermometer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-2">
                  <span>🌡️</span> Термометр отношений
                </h2>
                <p className="text-white/70 text-sm">
                  Еженедельный чек-ин качества ваших отношений с подростком
                </p>
              </div>

              <div className="space-y-4">
                {RELATIONSHIP_QUESTIONS.map((q, index) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <p className="text-white/90 text-sm mb-3">{q.text}</p>
                    
                    {q.yesNo ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            hapticLight();
                            setThermometerAnswers(prev => ({ ...prev, [q.id]: 1 }));
                          }}
                          className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                            thermometerAnswers[q.id] === 1
                              ? 'bg-green-500 text-white'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          ✅ Да
                        </button>
                        <button
                          onClick={() => {
                            hapticLight();
                            setThermometerAnswers(prev => ({ ...prev, [q.id]: 0 }));
                          }}
                          className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                            thermometerAnswers[q.id] === 0
                              ? 'bg-red-500 text-white'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          ❌ Нет
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max={q.max}
                          value={thermometerAnswers[q.id] || 0}
                          onChange={(e) => {
                            setThermometerAnswers(prev => ({ 
                              ...prev, 
                              [q.id]: parseInt(e.target.value) 
                            }));
                          }}
                          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                        <span className={`text-xl font-bold min-w-[2.5rem] text-center ${
                          q.inverse 
                            ? (thermometerAnswers[q.id] || 0) > q.max / 2 ? 'text-red-400' : 'text-green-400'
                            : (thermometerAnswers[q.id] || 0) > q.max / 2 ? 'text-green-400' : 'text-amber-400'
                        }`}>
                          {thermometerAnswers[q.id] || 0}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Results */}
              {Object.keys(thermometerAnswers).length >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl mt-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.15) 100%)',
                    border: '1px solid rgba(20,184,166,0.3)',
                  }}
                >
                  <h3 className="text-white font-bold mb-2">📊 Ваш результат</h3>
                  <p className="text-teal-200 text-sm">
                    Продолжайте отвечать на вопросы каждую неделю, чтобы отслеживать динамику отношений.
                  </p>
                  <button
                    onClick={() => {
                      hapticSuccess();
                      setThermometerAnswers({});
                    }}
                    className="mt-3 w-full py-3 rounded-xl bg-teal-500 text-white font-bold"
                  >
                    Сохранить и начать заново
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* LEARN TAB - Модули обучения */}
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Modules */}
              <h2 className="text-white font-bold text-lg mb-3">📚 Модули обучения</h2>
              <div className="space-y-3">
                {PARENT_MODULES.map((module, index) => (
                  <motion.button
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !module.isLocked && hapticLight()}
                    disabled={module.isLocked}
                    className="w-full p-4 rounded-2xl text-left relative overflow-hidden"
                    style={{
                      background: module.isLocked 
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.05)',
                      border: module.isLocked
                        ? '1px solid rgba(255,255,255,0.05)'
                        : '1px solid rgba(255,255,255,0.1)',
                      opacity: module.isLocked ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          background: module.isLocked 
                            ? 'rgba(255,255,255,0.05)'
                            : 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                        }}
                      >
                        {module.isLocked ? <Lock size={24} className="text-white/30" /> : module.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{module.title}</h3>
                        <p className="text-white/50 text-sm">{module.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-white/40 text-xs">{module.lessons} уроков</span>
                          <span className="text-pink-400 text-xs font-medium">+{module.points} очков</span>
                        </div>
                      </div>
                      <ChevronRight className="text-white/30" size={20} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ParentZone;

