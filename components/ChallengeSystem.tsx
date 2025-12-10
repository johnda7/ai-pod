import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Clock, Star, Zap, Target, Check, ChevronRight, Gift, Sparkles, ArrowRight, Play, BookOpen, Timer } from 'lucide-react';
import { useSyncTool } from '../hooks/useSyncTool';
import { SyncIndicator } from './SyncIndicator';
import { premiumSuccess, premiumClick, premiumCoin } from '../services/telegramService';

interface ChallengeSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number, coins: number) => void;
  userXp: number;
  completedLessons: number;
  userStreak?: number;
  onNavigateToSection?: (section: 'PATH' | 'TOOLS' | 'RELAX' | 'PROFILE') => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  image: string;
  type: 'daily' | 'weekly' | 'special';
  requirement: {
    type: 'lessons' | 'xp' | 'streak' | 'tools' | 'meditation';
    value: number;
  };
  reward: {
    xp: number;
    coins: number;
  };
  progress?: number;
}

// 🚀 ОПТИМИЗАЦИЯ: уменьшены размеры изображений + качество
// 🎯 21 ДНЕВНЫХ ЧЕЛЛЕНДЖЕЙ — ротация по дням недели + бонусные
const DAILY_CHALLENGES: Challenge[] = [
  // Понедельник — Учёба
  {
    id: 'd1',
    title: 'Утренний старт',
    description: 'Заверши 1 урок до 12:00',
    emoji: '🌅',
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=200&h=130&fit=crop&q=50',
    type: 'daily',
    requirement: { type: 'lessons', value: 1 },
    reward: { xp: 30, coins: 15 },
  },
  // Вторник — Фокус
  {
    id: 'd2',
    title: 'Режим Фокуса',
    description: 'Вырасти дерево концентрации',
    emoji: '🌲',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&h=130&fit=crop&q=50',
    type: 'daily',
    requirement: { type: 'tools', value: 1 },
    reward: { xp: 25, coins: 10 },
  },
  // Среда — Отдых
  {
    id: 'd3',
    title: 'Момент тишины',
    description: 'Проведи 5 минут в медитации',
    emoji: '🧘',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=130&fit=crop&q=50',
    type: 'daily',
    requirement: { type: 'meditation', value: 5 },
    reward: { xp: 20, coins: 10 },
  },
  // Четверг — Дневник
  {
    id: 'd4',
    title: 'Запись в дневник',
    description: 'Запиши мысли или настроение',
    emoji: '📔',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200&h=130&fit=crop&q=50',
    type: 'daily',
    requirement: { type: 'tools', value: 1 },
    reward: { xp: 20, coins: 10 },
  },
  // Пятница — Привычки
  {
    id: 'd5',
    title: 'Привычка дня',
    description: 'Выполни хотя бы 1 привычку',
    emoji: '💪',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=130&fit=crop&q=50',
    type: 'daily',
    requirement: { type: 'tools', value: 1 },
    reward: { xp: 20, coins: 10 },
  },
  // Суббота — Баланс
  {
    id: 'd6',
    title: 'Оценка баланса',
    description: 'Заполни Колесо Баланса',
    emoji: '⚖️',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=130&fit=crop&q=50',
    type: 'daily',
    requirement: { type: 'tools', value: 1 },
    reward: { xp: 25, coins: 15 },
  },
  // Воскресенье — Цели
  {
    id: 'd7',
    title: 'Цель на неделю',
    description: 'Поставь или обнови цель',
    emoji: '🎯',
    image: 'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=200&h=130&fit=crop&q=50',
    type: 'daily',
    requirement: { type: 'tools', value: 1 },
    reward: { xp: 25, coins: 15 },
  },
];

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'w1',
    title: 'Недельный марафон',
    description: 'Заверши 5 уроков за неделю',
    emoji: '🏃',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200&h=130&fit=crop&q=50',
    type: 'weekly',
    requirement: { type: 'lessons', value: 5 },
    reward: { xp: 150, coins: 75 },
  },
  {
    id: 'w2',
    title: 'XP охотник',
    description: 'Набери 500 XP за неделю',
    emoji: '⚡',
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=200&h=130&fit=crop&q=50',
    type: 'weekly',
    requirement: { type: 'xp', value: 500 },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 'w3',
    title: 'Огненная серия',
    description: 'Поддержи streak 7 дней',
    emoji: '🔥',
    image: 'https://images.unsplash.com/photo-1475552113915-6fcb52652ba2?w=200&h=130&fit=crop&q=50',
    type: 'weekly',
    requirement: { type: 'streak', value: 7 },
    reward: { xp: 200, coins: 100 },
  },
];

const SPECIAL_CHALLENGES: Challenge[] = [
  {
    id: 's1',
    title: 'Первые шаги',
    description: 'Заверши свой первый урок',
    emoji: '👣',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&h=130&fit=crop&q=50',
    type: 'special',
    requirement: { type: 'lessons', value: 1 },
    reward: { xp: 50, coins: 25 },
  },
  {
    id: 's2',
    title: 'Исследователь',
    description: 'Попробуй все инструменты',
    emoji: '🔍',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=130&fit=crop&q=50',
    type: 'special',
    requirement: { type: 'tools', value: 6 },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 's3',
    title: 'Мастер мотивации',
    description: 'Набери 1000 XP',
    emoji: '👑',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&h=130&fit=crop&q=50',
    type: 'special',
    requirement: { type: 'xp', value: 1000 },
    reward: { xp: 250, coins: 125 },
  },
];

export const ChallengeSystem: React.FC<ChallengeSystemProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  userXp,
  completedLessons,
  userStreak = 0,
  onNavigateToSection
}) => {
  // 🔄 useSyncTool вместо ручной синхронизации - автоматическая синхронизация с Supabase!
  const { data: completedChallenges, setData: setCompletedChallenges, syncStatus } = useSyncTool<string[]>([], {
    storageKey: 'completed_challenges',
    debounceMs: 1000
  });
  
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Get challenge progress from localStorage counters
  const getChallengeProgress = (challenge: Challenge): number => {
    switch (challenge.requirement.type) {
      case 'lessons':
        return Math.min(completedLessons, challenge.requirement.value);
      case 'xp':
        return Math.min(userXp, challenge.requirement.value);
      case 'tools':
        // Count pomodoro sessions from localStorage
        const pomodoroCount = parseInt(localStorage.getItem('pomodoro_sessions_today') || '0', 10);
        const toolsUsed = parseInt(localStorage.getItem('tools_used_today') || '0', 10);
        return Math.min(Math.max(pomodoroCount, toolsUsed), challenge.requirement.value);
      case 'meditation':
        // Minutes of meditation today
        const meditationMins = parseInt(localStorage.getItem('meditation_minutes_today') || '0', 10);
        return Math.min(meditationMins, challenge.requirement.value);
      case 'streak':
        // Get streak from prop passed from parent
        return Math.min(userStreak, challenge.requirement.value);
      default:
        return 0;
    }
  };

  const isChallengeComplete = (challenge: Challenge): boolean => {
    return getChallengeProgress(challenge) >= challenge.requirement.value;
  };

  const isClaimed = (challengeId: string): boolean => {
    return completedChallenges.includes(challengeId);
  };

  const claimReward = (challenge: Challenge) => {
    if (!isChallengeComplete(challenge) || isClaimed(challenge.id)) return;
    
    // 🎵 Premium feedback при начале получения награды
    premiumClick();
    setClaimingId(challenge.id);
    
    setTimeout(() => {
      // 🎵 Premium feedback при получении награды!
      premiumCoin();
      setCompletedChallenges([...completedChallenges, challenge.id]);
      onComplete(challenge.reward.xp, challenge.reward.coins);
      setClaimingId(null);
    }, 1000);
  };

  // 🎯 Авторотация: показываем 3 дневных челленджа в зависимости от дня недели
  const getDailyChallengesByDay = () => {
    const dayOfWeek = new Date().getDay(); // 0 = воскресенье, 1 = понедельник, ...
    
    // Ротация: показываем 3 челленджа на каждый день
    const rotations: Record<number, string[]> = {
      0: ['d1', 'd6', 'd7'], // Воскресенье: Учёба, Баланс, Цели
      1: ['d1', 'd2', 'd5'], // Понедельник: Учёба, Фокус, Привычки
      2: ['d2', 'd3', 'd4'], // Вторник: Фокус, Медитация, Дневник
      3: ['d1', 'd4', 'd5'], // Среда: Учёба, Дневник, Привычки
      4: ['d2', 'd5', 'd6'], // Четверг: Фокус, Привычки, Баланс
      5: ['d3', 'd4', 'd7'], // Пятница: Медитация, Дневник, Цели
      6: ['d1', 'd3', 'd6'], // Суббота: Учёба, Медитация, Баланс
    };
    
    const todayIds = rotations[dayOfWeek] || ['d1', 'd2', 'd3'];
    return DAILY_CHALLENGES.filter(c => todayIds.includes(c.id));
  };
  
  const getChallenges = () => {
    switch (activeTab) {
      case 'daily': return getDailyChallengesByDay();
      case 'weekly': return WEEKLY_CHALLENGES;
      case 'special': return SPECIAL_CHALLENGES;
    }
  };

  // 📋 Инструкции для каждого челленджа
  const getChallengeInstructions = (challenge: Challenge) => {
    const instructions: Record<string, { steps: string[]; tip: string; action: string }> = {
      'd1': {
        steps: [
          '🌅 Проснись пораньше и открой приложение',
          '📚 Выбери любой урок из раздела "Путь"',
          '✅ Заверши урок до 12:00',
        ],
        tip: 'Утренняя учёба эффективнее в 2 раза! Мозг ещё свежий.',
        action: 'Перейти к урокам →',
      },
      'd2': {
        steps: [
          '🌲 Открой "Фокус" в разделе "Полезное"',
          '⏱️ Выбери время и запусти таймер',
          '🎯 Вырасти дерево концентрации',
        ],
        tip: 'Чем дольше фокусируешься — тем больше растёт дерево!',
        action: 'Открыть Фокус →',
      },
      'd3': {
        steps: [
          '🧘 Открой раздел "Чилл"',
          '🎧 Выбери любую медитацию',
          '⏰ Проведи 5 минут в спокойствии',
        ],
        tip: 'Медитация снижает стресс и улучшает концентрацию.',
        action: 'К медитациям →',
      },
      'd4': {
        steps: [
          '📔 Открой "Дневник" в "Полезное"',
          '✍️ Выбери шаблон или создай запись',
          '💭 Запиши свои мысли или настроение',
        ],
        tip: 'Ведение дневника помогает понять себя лучше.',
        action: 'Открыть Дневник →',
      },
      'd5': {
        steps: [
          '💪 Открой "Привычки" в "Полезное"',
          '✅ Отметь выполненную привычку',
          '🔥 Сохрани свой streak!',
        ],
        tip: 'Маленькие ежедневные действия меняют жизнь.',
        action: 'К привычкам →',
      },
      'd6': {
        steps: [
          '⚖️ Открой "Колесо Баланса"',
          '📊 Оцени все 8 сфер жизни',
          '💡 Получи советы от Кати',
        ],
        tip: 'Раз в неделю — идеально для отслеживания прогресса.',
        action: 'К балансу →',
      },
      'd7': {
        steps: [
          '🎯 Открой "Цели" в "Полезное"',
          '📝 Поставь цель на неделю',
          '📈 Отслеживай свой прогресс',
        ],
        tip: 'Чёткая цель — половина успеха!',
        action: 'К целям →',
      },
      'w1': {
        steps: [
          '📚 Заходи в приложение каждый день',
          '✅ Проходи минимум 1 урок в день',
          '🏆 Заверши 5 уроков за 7 дней',
        ],
        tip: 'Равномерное распределение лучше, чем всё за один день!',
        action: 'К урокам →',
      },
      'w2': {
        steps: [
          '⚡ Проходи уроки и получай XP',
          '🎮 Используй инструменты',
          '🎯 Набери 500 XP за неделю',
        ],
        tip: 'XP = уроки + инструменты + челленджи. Комбинируй!',
        action: 'Заработать XP →',
      },
      'w3': {
        steps: [
          '🔥 Заходи в приложение каждый день',
          '📚 Проходи хотя бы 1 урок',
          '🎯 Не пропускай ни одного дня!',
        ],
        tip: 'Streak = непрерывные дни активности. Не сломай цепочку!',
        action: 'Поддержать streak →',
      },
      's1': {
        steps: [
          '👆 Нажми на любой урок',
          '📖 Пройди все шаги урока',
          '🎉 Получи награду!',
        ],
        tip: 'Первый шаг — самый важный. Ты уже молодец!',
        action: 'Начать урок →',
      },
      's2': {
        steps: [
          '🔧 Открой раздел "Полезное"',
          '🔍 Попробуй каждый инструмент',
          '✅ Используй все 6 инструментов',
        ],
        tip: 'Каждый инструмент полезен по-своему. Найди свой любимый!',
        action: 'К инструментам →',
      },
      's3': {
        steps: [
          '📚 Проходи уроки регулярно',
          '🎮 Используй инструменты',
          '🏆 Достигни 1000 XP!',
        ],
        tip: '1000 XP = примерно 10-15 уроков. Ты справишься!',
        action: 'Продолжить путь →',
      },
    };
    return instructions[challenge.id] || {
      steps: ['Выполни задание челленджа', 'Проверь прогресс', 'Получи награду'],
      tip: 'Каждый челлендж — шаг к лучшей версии себя!',
      action: 'Начать →',
    };
  };

  // 🔗 Маппинг челленджей к разделам для навигации
  const getChallengeNavigation = (challengeId: string): 'PATH' | 'TOOLS' | 'RELAX' | null => {
    const navigationMap: Record<string, 'PATH' | 'TOOLS' | 'RELAX'> = {
      'd1': 'PATH',      // Утренний старт → Уроки
      'd2': 'TOOLS',     // Режим Фокуса → Полезное
      'd3': 'RELAX',     // Момент тишины → Медитации
      'd4': 'TOOLS',     // Дневник → Полезное
      'd5': 'TOOLS',     // Привычки → Полезное
      'd6': 'TOOLS',     // Колесо Баланса → Полезное
      'd7': 'TOOLS',     // Цели → Полезное
      'w1': 'PATH',      // Недельный марафон → Уроки
      'w2': 'PATH',      // XP Охотник → Уроки
      'w3': 'PATH',      // Серийный победитель → Уроки
      's1': 'PATH',      // Первопроходец → Уроки
      's2': 'TOOLS',     // Исследователь → Инструменты
      's3': 'PATH',      // XP Легенда → Уроки
    };
    return navigationMap[challengeId] || null;
  };

  // Используем getDailyChallengesByDay для подсчёта дневных челленджей
  const todayDailyChallenges = getDailyChallengesByDay();
  
  const tabs = [
    { id: 'daily', label: 'Сегодня', emoji: '☀️', count: todayDailyChallenges.filter(c => !isClaimed(c.id) && isChallengeComplete(c)).length },
    { id: 'weekly', label: 'Недельные', emoji: '📅', count: WEEKLY_CHALLENGES.filter(c => !isClaimed(c.id) && isChallengeComplete(c)).length },
    { id: 'special', label: 'Особые', emoji: '⭐', count: SPECIAL_CHALLENGES.filter(c => !isClaimed(c.id) && isChallengeComplete(c)).length },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        {/* Beautiful Background - pointer-events-none чтобы не блокировать клики! */}
        <div className="absolute inset-0 pointer-events-none">
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
              background: 'radial-gradient(ellipse at 30% 0%, rgba(245,158,11,0.2) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 right-0 w-1/2 h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 100% 20%, rgba(234,88,12,0.15) 0%, transparent 60%)',
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
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        {/* Header */}
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
                  style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=100&h=100&fit=crop"
                    alt="Trophy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-600/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Челленджи</h1>
                  <p className="text-white/50 text-xs">Выполняй задания — получай награды!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <SyncIndicator status={syncStatus} />
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 relative"
                  style={{
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                      : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                    boxShadow: activeTab === tab.id ? '0 4px 15px rgba(245,158,11,0.4)' : 'none',
                  }}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: '#22c55e', color: 'white' }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 pb-40 overflow-y-auto h-[calc(100vh-220px)]">
          <div className="space-y-4">
            {getChallenges().map((challenge, index) => {
              const progress = getChallengeProgress(challenge);
              const isComplete = isChallengeComplete(challenge);
              const claimed = isClaimed(challenge.id);
              const isClaiming = claimingId === challenge.id;
              const progressPercent = Math.min((progress / challenge.requirement.value) * 100, 100);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !claimed && setSelectedChallenge(challenge)}
                  className={`rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${claimed ? 'opacity-60' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: `1px solid ${isComplete && !claimed ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isComplete && !claimed ? '0 4px 20px rgba(34,197,94,0.2)' : 'none',
                  }}
                >
                  {/* Image Header */}
                  <div className="h-24 relative">
                    <img 
                      src={challenge.image}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Status badge */}
                    {claimed ? (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-green-500/90 text-white text-xs font-bold flex items-center gap-1">
                        <Check size={12} />
                        Получено
                      </div>
                    ) : isComplete ? (
                      <motion.div 
                        className="absolute top-3 right-3 px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1"
                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Gift size={12} />
                        Забери!
                      </motion.div>
                    ) : null}
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{challenge.emoji}</span>
                        <h4 className="text-white font-bold">{challenge.title}</h4>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <p className="text-white/60 text-sm mb-3">{challenge.description}</p>
                    
                    {/* Progress Bar */}
                    {!claimed && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/40">{progress}/{challenge.requirement.value}</span>
                          <span className={isComplete ? 'text-green-400 font-bold' : 'text-white/40'}>
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full rounded-full"
                            style={{
                              background: isComplete 
                                ? 'linear-gradient(90deg, #22c55e, #10b981)'
                                : 'linear-gradient(90deg, #f59e0b, #ea580c)',
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Reward & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-yellow-500/10">
                          <Zap size={12} className="text-yellow-400" />
                          <span className="text-yellow-400 font-medium">+{challenge.reward.xp} ОП</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-yellow-500/10">
                          <span className="text-yellow-400">🪙</span>
                          <span className="text-yellow-400 font-medium">+{challenge.reward.coins}</span>
                        </div>
                      </div>

                      {isComplete && !claimed && (
                        <motion.button
                          onClick={() => claimReward(challenge)}
                          disabled={isClaiming}
                          className="px-4 py-2 rounded-xl font-medium text-white text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            boxShadow: '0 4px 15px rgba(34,197,94,0.4)',
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isClaiming ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles size={16} />
                            </motion.div>
                          ) : (
                            'Забрать'
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Совет</h4>
                <p className="text-white/60 text-xs">
                  Дневные челленджи обновляются каждый день в полночь. 
                  Не пропускай — получай больше наград!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 📋 Challenge Detail Modal */}
        <AnimatePresence>
          {selectedChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setSelectedChallenge(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {/* Header Image */}
                <div className="h-32 relative">
                  <img 
                    src={selectedChallenge.image}
                    alt={selectedChallenge.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <X size={16} className="text-white" />
                  </button>
                  
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{selectedChallenge.emoji}</span>
                      <div>
                        <h3 className="text-white font-bold text-lg">{selectedChallenge.title}</h3>
                        <p className="text-white/60 text-sm">{selectedChallenge.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Progress */}
                  {(() => {
                    const progress = getChallengeProgress(selectedChallenge);
                    const isComplete = isChallengeComplete(selectedChallenge);
                    const claimed = isClaimed(selectedChallenge.id);
                    const progressPercent = Math.min((progress / selectedChallenge.requirement.value) * 100, 100);
                    
                    return (
                      <>
                        <div className="mb-5">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/50">Прогресс</span>
                            <span className={isComplete ? 'text-green-400 font-bold' : 'text-white/70'}>
                              {progress}/{selectedChallenge.requirement.value}
                            </span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              className="h-full rounded-full"
                              style={{
                                background: isComplete 
                                  ? 'linear-gradient(90deg, #22c55e, #10b981)'
                                  : 'linear-gradient(90deg, #f59e0b, #ea580c)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Instructions */}
                        {!claimed && (
                          <div className="mb-5">
                            <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                              <BookOpen size={16} className="text-amber-400" />
                              Как выполнить:
                            </h4>
                            <div className="space-y-2">
                              {getChallengeInstructions(selectedChallenge).steps.map((step, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-start gap-3 p-2.5 rounded-xl"
                                  style={{ background: 'rgba(255,255,255,0.03)' }}
                                >
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                                    style={{ 
                                      background: idx < progress ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                      color: idx < progress ? 'white' : 'rgba(255,255,255,0.5)',
                                    }}
                                  >
                                    {idx < progress ? <Check size={12} /> : idx + 1}
                                  </div>
                                  <span className="text-white/80 text-sm">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tip */}
                        <div 
                          className="mb-5 p-3 rounded-xl"
                          style={{ 
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.2)',
                          }}
                        >
                          <p className="text-purple-300 text-xs">
                            💡 {getChallengeInstructions(selectedChallenge).tip}
                          </p>
                        </div>

                        {/* Reward */}
                        <div className="flex items-center justify-center gap-4 mb-5">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10">
                            <Zap size={16} className="text-yellow-400" />
                            <span className="text-yellow-400 font-bold">+{selectedChallenge.reward.xp} ОП</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10">
                            <span className="text-yellow-400">🪙</span>
                            <span className="text-yellow-400 font-bold">+{selectedChallenge.reward.coins}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        {claimed ? (
                          <div className="py-4 rounded-2xl text-center bg-green-500/20">
                            <span className="text-green-400 font-bold flex items-center justify-center gap-2">
                              <Check size={20} />
                              Награда получена!
                            </span>
                          </div>
                        ) : isComplete ? (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              claimReward(selectedChallenge);
                              setTimeout(() => setSelectedChallenge(null), 1000);
                            }}
                            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                            style={{
                              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Gift size={20} />
                            Забрать награду!
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => {
                              const targetSection = getChallengeNavigation(selectedChallenge.id);
                              setSelectedChallenge(null);
                              if (targetSection && onNavigateToSection) {
                                onNavigateToSection(targetSection);
                              } else {
                                onClose();
                              }
                            }}
                            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                              boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Play size={20} />
                            {getChallengeInstructions(selectedChallenge).action}
                          </motion.button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeSystem;
