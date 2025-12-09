import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, CheckCircle, Zap, Star, Battery, BatteryLow, BatteryMedium, BatteryFull,
  Gamepad2, Sparkles, Trophy, Timer, Coffee, Moon, Sun, Sunrise, Sunset,
  Clock, Flame, Award, ArrowRight, Droplet, Apple, Dumbbell, Smartphone
} from 'lucide-react';
import { Task } from '../types';
import { KatyaMentor } from './KatyaMentor';
import { hapticSelection, hapticSuccess, hapticError, hapticLight } from '../services/telegramService';
import { playCorrectSound, playWrongSound, playCompleteSound, playClickSound } from '../services/soundService';

interface BatteryLessonProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// Фазы урока
type LessonPhase = 'intro' | 'hook' | 'learn' | 'practice' | 'challenge' | 'reflection' | 'reward';

const PHASE_NAMES: Record<LessonPhase, string> = {
  intro: '👋 Встреча с Катей',
  hook: '🔋 Шок-факт',
  learn: '🧠 Знания',
  practice: '🎮 Практика',
  challenge: '⚡ Испытание',
  reflection: '✨ Рефлексия',
  reward: '🏆 Награда'
};

// Хронотипы
const CHRONOTYPES = [
  { id: 'lion', emoji: '🦁', name: 'ЛЕВ', time: '6:00-10:00', desc: 'Пик утром, засыпаешь рано' },
  { id: 'bear', emoji: '🐻', name: 'МЕДВЕДЬ', time: '10:00-14:00', desc: 'Пик днём, следуешь солнцу' },
  { id: 'wolf', emoji: '🐺', name: 'ВОЛК', time: '16:00-22:00', desc: 'Пик вечером, сова' },
  { id: 'dolphin', emoji: '🐬', name: 'ДЕЛЬФИН', time: 'Нестабильно', desc: 'Лёгкий сон, высокая чувствительность' },
];

// Структурированные этапы урока
const LESSON_STAGES = [
  // === ФАЗА 1: INTRO ===
  {
    id: 'intro',
    phase: 'intro' as LessonPhase,
    type: 'katya_intro',
    katyaMessage: 'Привет! 👋 Сегодня мы разберёмся с твоей батарейкой. Почему иногда сил нет, а иногда — море энергии? Всё дело в науке!',
    katyaState: 'waving' as const,
  },
  
  // === ФАЗА 2: HOOK ===
  {
    id: 'hook_1',
    phase: 'hook' as LessonPhase,
    type: 'shock_fact',
    title: '🔋 Твоя энергия не бесконечна',
    content: '"Лень" — это не плохо.\n\nЭто сигнал твоего тела:\n💬 "Я не понимаю, зачем это делать"\n💬 "Мне страшно, что не получится"\n\n99% "лени" — это проблема ЭНЕРГИИ, не характера!',
    emoji: '🔋',
  },
  {
    id: 'hook_quiz',
    phase: 'hook' as LessonPhase,
    type: 'quiz',
    question: 'Почему подростки часто не могут заснуть до полуночи?',
    options: ['Они ленивые', 'Биологический сдвиг хронотипа', 'Слишком много кофе'],
    correctIndex: 1,
    explanation: '🧬 Это БИОЛОГИЯ! Мелатонин у подростков вырабатывается на 2 часа позже, чем у взрослых. Это не лень — это наука!',
    xpReward: 15,
  },
  
  // === ФАЗА 3: LEARN ===
  {
    id: 'learn_chrono',
    phase: 'learn' as LessonPhase,
    type: 'chronotype_quiz',
    title: '🦁 Узнай свой хронотип!',
    description: 'Ответь на вопрос — и узнаешь, когда ты на пике продуктивности.',
    xpReward: 20,
  },
  {
    id: 'learn_90min',
    phase: 'learn' as LessonPhase,
    type: 'theory',
    title: '⏰ Секретный ритм: 90 минут',
    content: 'Твой мозг работает циклами:\n\n🔥 90 минут АКТИВНОСТИ\n😴 20 минут ОТДЫХА\n\nЭто ультрадианный ритм. Работать дольше 90 минут без перерыва = терять эффективность!\n\n⏱️ Ставь таймер!',
    katyaTip: 'Я сама работаю блоками по 90 минут — это реально меняет всё!',
  },
  {
    id: 'learn_food',
    phase: 'learn' as LessonPhase,
    type: 'theory',
    title: '🍎 Еда = Топливо',
    content: 'Не всё топливо одинаковое:\n\n❌ САХАР = быстрый буст → резкий спад\n❌ ФАСТФУД = тяжесть и сонливость\n\n✅ БЕЛОК + СЛОЖНЫЕ УГЛЕВОДЫ = стабильная энергия на 3-4 часа',
    katyaTip: 'Белок на завтрак = +2 часа энергии. Яйца + тост > круассан!',
  },
  {
    id: 'learn_quiz_caff',
    phase: 'learn' as LessonPhase,
    type: 'quiz',
    question: 'Сколько часов кофеин остаётся в организме?',
    options: ['1-2 часа', '3-4 часа', '5-6 часов'],
    correctIndex: 2,
    explanation: '☕ Период полувыведения кофеина — 5-6 часов. Кофе в 16:00 = бессонница до полуночи!',
    xpReward: 15,
  },
  
  // === ФАЗА 4: PRACTICE ===
  {
    id: 'practice_sorting',
    phase: 'practice' as LessonPhase,
    type: 'sorting',
    title: '🎯 Рассортируй!',
    question: 'Что даёт энергию, а что крадёт?',
    leftLabel: '📉 Крадёт',
    rightLabel: '📈 Даёт',
    items: [
      { id: 'i1', text: 'Энергетик', emoji: '🥤', correct: 'left' },
      { id: 'i2', text: 'Орехи', emoji: '🥜', correct: 'right' },
      { id: 'i3', text: 'Сладкая газировка', emoji: '🥤', correct: 'left' },
      { id: 'i4', text: 'Вода', emoji: '💧', correct: 'right' },
      { id: 'i5', text: 'Чипсы', emoji: '🍟', correct: 'left' },
      { id: 'i6', text: '10 минут прогулки', emoji: '🚶', correct: 'right' },
    ],
    xpReward: 20,
  },
  {
    id: 'practice_bucket',
    phase: 'practice' as LessonPhase,
    type: 'theory',
    title: '🪣 Техника «Дырявое ведро»',
    content: 'Представь: твоя энергия — это вода в ведре.\n\nНо в ведре есть дыры:\n• 📱 Бессмысленный скроллинг\n• 😴 Недосып\n• 🗣️ Токсичные люди\n• 🗑️ Беспорядок вокруг\n\n🔧 Найди свои дыры и заткни их!',
    katyaTip: 'Запиши 3 свои главные "дыры" — это первый шаг к их устранению!',
  },
  {
    id: 'practice_5min',
    phase: 'practice' as LessonPhase,
    type: 'theory',
    title: '⏱️ Правило 5 минут',
    content: 'Самое сложное — начать.\n\nСкажи себе: "Я поделаю это ВСЕГО 5 минут. Если надоест — брошу".\n\n🎯 Спойлер: обычно не бросаешь!\n\nПотому что страх начала уже прошёл.',
    katyaTip: 'Этот трюк работает на всё: учёбу, спорт, уборку!',
  },
  
  // === ФАЗА 5: CHALLENGE ===
  {
    id: 'challenge_game',
    phase: 'challenge' as LessonPhase,
    type: 'battery_game',
    title: '🔋 Защити свою батарейку!',
    description: 'Утечки атакуют! Нажимай на красные (утечки), НЕ нажимай на зелёные (источники энергии)',
    duration: 25,
    targetScore: 10,
    xpReward: 30,
  },
  {
    id: 'challenge_matching',
    phase: 'challenge' as LessonPhase,
    type: 'matching',
    title: '🔗 Соедини проблемы и решения',
    pairs: [
      { id: 'p1', left: 'Не могу заснуть', right: 'Убрать телефон за 1ч до сна' },
      { id: 'p2', left: 'Устаю к обеду', right: 'Белковый завтрак + вода' },
      { id: 'p3', left: 'Нет сил после школы', right: '15 минут на улице' },
      { id: 'p4', left: 'Вечно прокрастинирую', right: 'Правило 5 минут' },
    ],
    xpReward: 20,
  },
  
  // === ФАЗА 6: REFLECTION ===
  {
    id: 'reflection_input1',
    phase: 'reflection' as LessonPhase,
    type: 'input',
    question: '🪣 Какая твоя главная "дыра", через которую утекает энергия?',
    placeholder: 'Телефон перед сном, токсичный друг...',
    katyaTip: 'Будь честен с собой — это первый шаг к изменениям!',
    xpReward: 10,
  },
  {
    id: 'reflection_input2',
    phase: 'reflection' as LessonPhase,
    type: 'input',
    question: '🔋 Что ты сделаешь ЗАВТРА, чтобы зарядить батарейку?',
    placeholder: 'Лягу раньше, съем нормальный завтрак...',
    katyaTip: 'Одно маленькое действие лучше, чем 10 намерений!',
    xpReward: 10,
  },
  
  // === ФАЗА 7: REWARD ===
  {
    id: 'reward',
    phase: 'reward' as LessonPhase,
    type: 'reward',
    title: '🏆 Мастер Энергии!',
    summary: [
      '✅ "Лень" — это сигнал, не характер',
      '✅ Хронотип определяет твой пик',
      '✅ 90 минут работы + 20 минут отдыха',
      '✅ Еда + Сон + Движение = Энергия',
      '✅ Правило 5 минут побеждает прокрастинацию',
    ],
    katyaMessage: 'Ты справился! 🎉 Теперь ты знаешь секреты энергии. Управляй своей батарейкой каждый день!',
    xpReward: 150,
    coinsReward: 75,
  },
];

export const BatteryLesson: React.FC<BatteryLessonProps> = ({
  task,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [popupXp, setPopupXp] = useState(0);
  const [katyaState, setKatyaState] = useState<'idle' | 'talking' | 'happy' | 'waving' | 'thinking' | 'encouraging' | 'celebrating'>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(50); // Уровень батарейки 0-100

  const currentStage = LESSON_STAGES[currentStageIndex];
  const currentPhase = currentStage.phase;
  const totalStages = LESSON_STAGES.length;
  const progress = ((currentStageIndex + 1) / totalStages) * 100;

  useEffect(() => {
    if (isOpen) {
      setCurrentStageIndex(0);
      setXpEarned(0);
      setCompletedStages(new Set());
      setKatyaState('waving');
      setBatteryLevel(50);
    }
  }, [isOpen]);

  const addXp = useCallback((amount: number, isCorrect: boolean = true) => {
    if (isCorrect) {
      setComboCount(prev => {
        const newCombo = prev + 1;
        if (newCombo >= 2) {
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 1500);
        }
        return newCombo;
      });
      // Увеличиваем батарейку при правильных ответах
      setBatteryLevel(prev => Math.min(100, prev + 5));
    } else {
      setComboCount(0);
      // Уменьшаем батарейку при ошибках
      setBatteryLevel(prev => Math.max(0, prev - 3));
    }
    
    const comboBonus = isCorrect && comboCount >= 2 ? Math.floor(amount * 0.5) : 0;
    const totalXp = amount + comboBonus;
    
    setXpEarned(prev => prev + totalXp);
    setPopupXp(totalXp);
    setShowXpPopup(true);
    hapticSuccess();
    playCorrectSound();
    setTimeout(() => setShowXpPopup(false), 1500);
  }, [comboCount]);

  const markStageComplete = useCallback((stageId: string, xp: number = 0, isCorrect: boolean = true) => {
    if (!completedStages.has(stageId)) {
      setCompletedStages(prev => new Set([...prev, stageId]));
      if (xp > 0) {
        addXp(xp, isCorrect);
      }
    }
  }, [completedStages, addXp]);

  const goToNextStage = useCallback(() => {
    if (currentStageIndex < totalStages - 1) {
      setIsAnimating(true);
      hapticSelection();
      playClickSound();
      
      setTimeout(() => {
        setCurrentStageIndex(prev => prev + 1);
        setIsAnimating(false);
        setKatyaState('talking');
        setTimeout(() => setKatyaState('idle'), 2000);
      }, 300);
    } else {
      hapticSuccess();
      playCompleteSound();
      onComplete();
    }
  }, [currentStageIndex, totalStages, onComplete]);

  // Цвет фона в зависимости от уровня батарейки
  const getBackgroundGradient = () => {
    if (batteryLevel < 30) {
      return 'from-red-900/95 via-orange-900/90 to-black';
    } else if (batteryLevel < 70) {
      return 'from-amber-900/95 via-yellow-900/90 to-black';
    } else {
      return 'from-green-900/95 via-emerald-900/90 to-black';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 overflow-hidden">
      {/* Solid background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getBackgroundGradient()} transition-colors duration-1000`} />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
            }}
            initial={{ 
              y: '100vh',
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: '-10vh',
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[60] safe-area-top bg-gradient-to-b from-slate-900 to-transparent pb-4">
        <div className="px-4 pt-3 pb-2">
          {/* Phase indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {(['intro', 'hook', 'learn', 'practice', 'challenge', 'reflection', 'reward'] as LessonPhase[]).map((phase, idx) => (
              <div
                key={phase}
                className={`h-1.5 flex-1 max-w-8 rounded-full transition-all duration-300 ${
                  currentPhase === phase
                    ? 'bg-yellow-400 scale-y-150'
                    : idx < ['intro', 'hook', 'learn', 'practice', 'challenge', 'reflection', 'reward'].indexOf(currentPhase)
                    ? 'bg-yellow-600'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Header controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
                {PHASE_NAMES[currentPhase]}
              </span>
              <span className="text-white/60 text-xs">
                {currentStageIndex + 1}/{totalStages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Combo indicator */}
              {comboCount >= 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-1"
                >
                  <Flame size={12} className="text-white" />
                  <span className="text-white font-bold text-xs">x{comboCount}</span>
                </motion.div>
              )}
              <motion.div 
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 flex items-center gap-1.5"
                animate={showXpPopup ? { scale: [1, 1.2, 1] } : {}}
              >
                <Zap size={14} className="text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">+{xpEarned}</span>
              </motion.div>
            </div>
          </div>

          {/* Battery Meter */}
          <BatteryMeter level={batteryLevel} />
        </div>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 pt-36 pb-28 overflow-y-auto z-[10]">
        <div className="max-w-lg mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStageIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <StageRenderer
                stage={currentStage}
                onComplete={markStageComplete}
                onNext={goToNextStage}
                katyaState={katyaState}
                setKatyaState={setKatyaState}
                setShowConfetti={setShowConfetti}
                setBatteryLevel={setBatteryLevel}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* XP Popup */}
      <AnimatePresence>
        {showXpPopup && (
          <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[70] pointer-events-none"
          >
            <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 shadow-2xl shadow-orange-500/50">
              <div className="flex items-center gap-3">
                <Sparkles size={28} className="text-white" />
                <span className="text-white font-black text-2xl">+{popupXp} XP</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Popup */}
      <AnimatePresence>
        {showCombo && comboCount >= 2 && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[71] pointer-events-none"
          >
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50">
              <div className="flex items-center gap-2">
                <Flame size={24} className="text-white" />
                <span className="text-white font-black text-xl">КОМБО x{comboCount}!</span>
                <Flame size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#22C55E'][Math.floor(Math.random() * 5)],
                }}
                initial={{ y: -20, rotate: 0, opacity: 1 }}
                animate={{
                  y: '100vh',
                  rotate: Math.random() * 720 - 360,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Katya floating */}
      {currentStage?.type !== 'katya_intro' && (
        <motion.div
          className="fixed bottom-24 right-4 z-[50]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <KatyaMentor state={katyaState} size="sm" />
        </motion.div>
      )}
    </div>
  );
};

// 🔋 Battery Meter Component
const BatteryMeter: React.FC<{ level: number }> = ({ level }) => {
  const getBatteryColor = () => {
    if (level < 30) return 'from-red-500 to-red-600';
    if (level < 70) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-600';
  };

  const getBatteryIcon = () => {
    if (level < 30) return <BatteryLow size={20} className="text-red-400" />;
    if (level < 70) return <BatteryMedium size={20} className="text-yellow-400" />;
    return <BatteryFull size={20} className="text-green-400" />;
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mt-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {getBatteryIcon()}
          <span className="text-white/80 text-xs font-medium">Твоя батарейка</span>
        </div>
        <span className="text-white font-bold text-sm">{level}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${getBatteryColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

// Stage Renderer
interface StageRendererProps {
  stage: typeof LESSON_STAGES[0];
  onComplete: (stageId: string, xp?: number, isCorrect?: boolean) => void;
  onNext: () => void;
  katyaState: string;
  setKatyaState: (state: any) => void;
  setShowConfetti?: (show: boolean) => void;
  setBatteryLevel?: (fn: (prev: number) => number) => void;
}

const StageRenderer: React.FC<StageRendererProps> = ({ stage, onComplete, onNext, katyaState, setKatyaState, setShowConfetti, setBatteryLevel }) => {
  switch (stage.type) {
    case 'katya_intro':
      return <KatyaIntroStage stage={stage} onComplete={onComplete} onNext={onNext} />;
    case 'shock_fact':
      return <ShockFactStage stage={stage} onNext={onNext} />;
    case 'quiz':
      return <QuizStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'theory':
      return <TheoryStage stage={stage} onNext={onNext} />;
    case 'chronotype_quiz':
      return <ChronotypeQuizStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'sorting':
      return <SortingStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'battery_game':
      return <BatteryGameStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} setBatteryLevel={setBatteryLevel} />;
    case 'matching':
      return <MatchingStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'input':
      return <InputStage stage={stage} onComplete={onComplete} onNext={onNext} />;
    case 'reward':
      return <RewardStage stage={stage} onNext={onNext} setShowConfetti={setShowConfetti} />;
    default:
      return <TheoryStage stage={stage} onNext={onNext} />;
  }
};

// === KATYA INTRO ===
const KatyaIntroStage: React.FC<{ stage: any; onComplete: any; onNext: any }> = ({ stage, onComplete, onNext }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = stage.katyaMessage || '';

  useEffect(() => {
    onComplete(stage.id);
  }, []);

  useEffect(() => {
    if (displayedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [displayedText, fullText]);

  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="mx-auto"
      >
        <KatyaMentor state={isTyping ? 'talking' : 'waving'} size="lg" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 relative"
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/10 border-l border-t border-white/20" />
        
        <p className="text-white text-xl font-medium leading-relaxed min-h-[3rem]">
          {displayedText}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-6 bg-yellow-400 ml-1 align-middle"
            />
          )}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isTyping ? 0.5 : 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onNext}
        disabled={isTyping}
        className={`px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-500/30 transition-all flex items-center gap-3 mx-auto ${
          isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-orange-500/50 hover:scale-105'
        }`}
      >
        <span>Поехали!</span>
        <ArrowRight size={24} />
      </motion.button>
    </div>
  );
};

// === SHOCK FACT ===
const ShockFactStage: React.FC<{ stage: any; onNext: any }> = ({ stage, onNext }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    hapticLight();
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="relative w-28 h-28 mx-auto"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-600 blur-xl"
        />
        <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-yellow-500/40 to-orange-600/40 flex items-center justify-center backdrop-blur-xl border border-yellow-400/30 shadow-2xl shadow-yellow-500/30">
          <motion.span 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="text-5xl"
          >
            {stage.emoji}
          </motion.span>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex justify-center"
      >
        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold uppercase tracking-wider">
          ⚡ ФАКТ ОБ ЭНЕРГИИ
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black text-white text-center"
      >
        {stage.title}
      </motion.h1>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 backdrop-blur-sm"
          >
            <p className="text-white text-lg leading-relaxed whitespace-pre-line">
              {stage.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:shadow-orange-500/50 transition-all"
      >
        <span>Дальше</span>
        <ChevronRight size={24} />
      </motion.button>
    </div>
  );
};

// === CHRONOTYPE QUIZ ===
const ChronotypeQuizStage: React.FC<{ stage: any; onComplete: any; onNext: any; setKatyaState: any }> = ({ stage, onComplete, onNext, setKatyaState }) => {
  const [selectedChronotype, setSelectedChronotype] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (chronoId: string) => {
    if (showResult) return;
    setSelectedChronotype(chronoId);
    setShowResult(true);
    hapticSuccess();
    playCorrectSound();
    setKatyaState('celebrating');
    onComplete(stage.id, stage.xpReward || 20, true);
    setTimeout(() => setKatyaState('idle'), 2000);
  };

  const selectedChrono = CHRONOTYPES.find(c => c.id === selectedChronotype);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex justify-center"
      >
        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm uppercase tracking-wider">
          🧬 ТЕСТ
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white text-center"
      >
        {stage.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white/70 text-center text-sm"
      >
        Когда у тебя больше всего энергии?
      </motion.p>

      {!showResult ? (
        <div className="grid grid-cols-2 gap-3">
          {CHRONOTYPES.map((chrono, index) => (
            <motion.button
              key={chrono.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(chrono.id)}
              className="p-4 rounded-2xl bg-white/10 border border-white/20 text-center hover:bg-white/20 hover:border-purple-400/50 transition-all active:scale-95"
            >
              <span className="text-4xl block mb-2">{chrono.emoji}</span>
              <span className="text-white font-bold block">{chrono.name}</span>
              <span className="text-white/60 text-xs">{chrono.time}</span>
            </motion.button>
          ))}
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-center"
          >
            <span className="text-6xl block mb-3">{selectedChrono?.emoji}</span>
            <h3 className="text-2xl font-black text-white mb-2">Ты — {selectedChrono?.name}!</h3>
            <p className="text-white/80">{selectedChrono?.desc}</p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-white/10 inline-block">
              <span className="text-purple-300 font-medium">Твой пик: {selectedChrono?.time}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-400/30"
          >
            <p className="text-yellow-200 text-sm">
              💡 <strong>Лайфхак:</strong> Планируй сложные задачи на свой пик активности!
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onNext}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <span>Дальше</span>
            <ChevronRight size={24} />
          </motion.button>
        </>
      )}
    </div>
  );
};

// === QUIZ ===
const QuizStage: React.FC<{ stage: any; onComplete: any; onNext: any; setKatyaState: any }> = ({ stage, onComplete, onNext, setKatyaState }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    if (!timerActive || showResult) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      setShowResult(true);
      setKatyaState('encouraging');
      hapticError();
      onComplete(stage.id, 5, false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive, showResult]);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setTimerActive(false);
    setSelected(index);
    setShowResult(true);
    
    const timeBonus = timeLeft > 10 ? 5 : timeLeft > 5 ? 3 : 0;
    
    if (index === stage.correctIndex) {
      setKatyaState('celebrating');
      onComplete(stage.id, (stage.xpReward || 15) + timeBonus, true);
    } else {
      setKatyaState('encouraging');
      hapticError();
      playWrongSound();
      onComplete(stage.id, 5, false);
    }
    
    setTimeout(() => setKatyaState('idle'), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Zap size={16} />
            <span>Вопрос</span>
          </div>
        </motion.div>
        
        {!showResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft <= 5 
                ? 'bg-red-500/30 border border-red-400/50' 
                : 'bg-white/10 border border-white/20'
            }`}
          >
            <Clock size={16} className={timeLeft <= 5 ? 'text-red-400' : 'text-white/80'} />
            <motion.span 
              key={timeLeft}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className={`font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}
            >
              {timeLeft}с
            </motion.span>
          </motion.div>
        )}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white text-center"
      >
        {stage.question}
      </motion.h2>

      <div className="space-y-3">
        {stage.options.map((option: string, index: number) => {
          let bgClass = 'bg-white/10 border-white/20 hover:bg-white/15';
          let textClass = 'text-white';
          
          if (showResult) {
            if (index === stage.correctIndex) {
              bgClass = 'bg-green-500/30 border-green-400 scale-105';
              textClass = 'text-green-300';
            } else if (index === selected && index !== stage.correctIndex) {
              bgClass = 'bg-red-500/30 border-red-400';
              textClass = 'text-red-300';
            }
          }

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  showResult && index === stage.correctIndex
                    ? 'bg-green-500 text-white'
                    : showResult && index === selected && index !== stage.correctIndex
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white/80'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className={`font-medium ${textClass}`}>{option}</span>
                {showResult && index === stage.correctIndex && (
                  <CheckCircle size={24} className="text-green-400 ml-auto" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            selected === stage.correctIndex
              ? 'bg-green-500/20 border border-green-400/30'
              : 'bg-orange-500/20 border border-orange-400/30'
          }`}
        >
          <p className="text-white/90">{stage.explanation}</p>
        </motion.div>
      )}

      {showResult && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <span>Дальше</span>
          <ChevronRight size={24} />
        </motion.button>
      )}
    </div>
  );
};

// === THEORY ===
const TheoryStage: React.FC<{ stage: any; onNext: any }> = ({ stage, onNext }) => {
  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black text-white text-center"
      >
        {stage.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20"
      >
        <p className="text-white text-lg leading-relaxed whitespace-pre-line">
          {stage.content}
        </p>
      </motion.div>

      {stage.katyaTip && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
        >
          <Sparkles size={20} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-purple-200 text-sm font-medium">💜 Катя: {stage.katyaTip}</p>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
      >
        <span>Понял! Дальше</span>
        <ChevronRight size={24} />
      </motion.button>
    </div>
  );
};

// === SORTING ===
const SortingStage: React.FC<{ stage: any; onComplete: any; onNext: any; setKatyaState: any }> = ({ stage, onComplete, onNext, setKatyaState }) => {
  const [items, setItems] = useState(stage.items.sort(() => Math.random() - 0.5));
  const [leftItems, setLeftItems] = useState<any[]>([]);
  const [rightItems, setRightItems] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentItem = items[0];

  const handleSort = (direction: 'left' | 'right') => {
    if (!currentItem || showResult) return;
    
    hapticSelection();
    
    const isCorrect = currentItem.correct === direction;
    if (isCorrect) {
      playCorrectSound();
      setScore(prev => prev + 1);
    } else {
      playWrongSound();
    }
    
    if (direction === 'left') {
      setLeftItems(prev => [...prev, { ...currentItem, isCorrect }]);
    } else {
      setRightItems(prev => [...prev, { ...currentItem, isCorrect }]);
    }
    
    setItems(prev => prev.slice(1));
  };

  useEffect(() => {
    if (items.length === 0 && !showResult) {
      setShowResult(true);
      const finalScore = score;
      setKatyaState(finalScore >= 4 ? 'celebrating' : 'encouraging');
      onComplete(stage.id, Math.round((finalScore / stage.items.length) * (stage.xpReward || 20)));
      setTimeout(() => setKatyaState('idle'), 2000);
    }
  }, [items.length, showResult, score]);

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white text-center"
      >
        {stage.question}
      </motion.h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/30 min-h-[100px]">
          <p className="text-red-300 font-bold text-sm mb-2 text-center">{stage.leftLabel}</p>
          <div className="space-y-2">
            {leftItems.map(item => (
              <div key={item.id} className={`px-2 py-1 rounded-lg text-xs ${item.isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                {item.emoji} {item.text}
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-green-500/20 border border-green-400/30 min-h-[100px]">
          <p className="text-green-300 font-bold text-sm mb-2 text-center">{stage.rightLabel}</p>
          <div className="space-y-2">
            {rightItems.map(item => (
              <div key={item.id} className={`px-2 py-1 rounded-lg text-xs ${item.isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                {item.emoji} {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentItem && !showResult && (
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center"
        >
          <span className="text-4xl mb-2 block">{currentItem.emoji}</span>
          <p className="text-white text-lg font-medium">{currentItem.text}</p>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleSort('left')}
              className="flex-1 py-3 rounded-xl bg-red-500/30 border border-red-400/30 text-red-300 font-bold hover:bg-red-500/50 transition-colors"
            >
              ← Крадёт
            </button>
            <button
              onClick={() => handleSort('right')}
              className="flex-1 py-3 rounded-xl bg-green-500/30 border border-green-400/30 text-green-300 font-bold hover:bg-green-500/50 transition-colors"
            >
              Даёт →
            </button>
          </div>
        </motion.div>
      )}

      {showResult && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl ${score >= 4 ? 'bg-green-500/20 border-green-400/30' : 'bg-orange-500/20 border-orange-400/30'} border text-center`}
          >
            <p className="text-white font-bold text-lg">
              {score >= 4 ? '🎉 Отлично!' : '💪 Неплохо!'} {score}/{stage.items.length}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onNext}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <span>Дальше</span>
            <ChevronRight size={24} />
          </motion.button>
        </>
      )}
    </div>
  );
};

// === BATTERY GAME (Защита батарейки) ===
const ENERGY_ITEMS = {
  drains: [
    { emoji: '📱', label: 'Скроллинг' },
    { emoji: '🍬', label: 'Сахар' },
    { emoji: '☠️', label: 'Токсик' },
    { emoji: '😴', label: 'Недосып' },
    { emoji: '🗑️', label: 'Хаос' },
  ],
  sources: [
    { emoji: '💧', label: 'Вода' },
    { emoji: '🥗', label: 'Здоровая еда' },
    { emoji: '🏃', label: 'Спорт' },
    { emoji: '🌳', label: 'Природа' },
    { emoji: '😊', label: 'Хорошие люди' },
  ]
};

const BatteryGameStage: React.FC<{ stage: any; onComplete: any; onNext: any; setKatyaState: any; setBatteryLevel?: any }> = ({ stage, onComplete, onNext, setKatyaState, setBatteryLevel }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stage.duration || 25);
  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; type: 'drain' | 'source'; item: typeof ENERGY_ITEMS.drains[0] }>>([]);
  const [gameBatteryLevel, setGameBatteryLevel] = useState(50);

  // Spawn items
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const spawnInterval = setInterval(() => {
      const isDrain = Math.random() > 0.4;
      const itemList = isDrain ? ENERGY_ITEMS.drains : ENERGY_ITEMS.sources;
      const item = itemList[Math.floor(Math.random() * itemList.length)];
      
      setItems(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: -10,
        type: isDrain ? 'drain' : 'source',
        item
      }]);
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver]);

  // Move items down
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const moveInterval = setInterval(() => {
      setItems(prev => prev
        .map(item => ({ ...item, y: item.y + 4 }))
        .filter(item => item.y < 110)
      );
    }, 100);

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      const success = score >= (stage.targetScore || 10);
      setKatyaState(success ? 'celebrating' : 'encouraging');
      onComplete(stage.id, success ? stage.xpReward : 10, success);
      setTimeout(() => setKatyaState('idle'), 2000);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver]);

  const handleItemClick = (itemId: number, type: 'drain' | 'source') => {
    if (type === 'drain') {
      // Правильно — нажал на утечку
      setScore(prev => prev + 1);
      setGameBatteryLevel(prev => Math.min(100, prev + 5));
      if (setBatteryLevel) setBatteryLevel((prev: number) => Math.min(100, prev + 2));
      hapticSuccess();
      playCorrectSound();
    } else {
      // Ошибка — нажал на источник
      setGameBatteryLevel(prev => Math.max(0, prev - 10));
      if (setBatteryLevel) setBatteryLevel((prev: number) => Math.max(0, prev - 3));
      hapticError();
      playWrongSound();
    }
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-yellow-500/40 to-orange-600/40 flex items-center justify-center backdrop-blur-xl border border-yellow-400/30"
        >
          <Battery size={56} className="text-yellow-300" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold mb-3">
            🔋 МИНИ-ИГРА
          </div>
          <h2 className="text-2xl font-bold text-white">{stage.title}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-2xl bg-white/10 border border-white/20 text-left space-y-2"
        >
          <p className="text-white/90 font-medium">🎯 Правила:</p>
          <p className="text-white/70 text-sm">
            🔴 <span className="text-red-400">Красные</span> = утечки энергии (НАЖИМАЙ!)
          </p>
          <p className="text-white/70 text-sm">
            🟢 <span className="text-green-400">Зелёные</span> = источники энергии (НЕ ТРОГАЙ!)
          </p>
          <p className="text-white font-medium text-center mt-3">
            Цель: {stage.targetScore || 10} очков за {stage.duration || 25} секунд
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg"
        >
          🔋 Начать!
        </motion.button>
      </div>
    );
  }

  if (gameOver) {
    const success = score >= (stage.targetScore || 10);
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-7xl"
        >
          {success ? '🏆' : '💪'}
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white mb-2">
            {success ? 'Батарейка защищена!' : 'Неплохо для начала!'}
          </h2>
          <p className="text-white/70">
            Результат: <span className="text-white font-bold">{score}/{stage.targetScore || 10}</span>
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <span>Дальше</span>
          <ChevronRight size={24} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="flex justify-between items-center">
        <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
          <span className="text-white font-bold text-sm">⭐ {score}</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
          <span className="text-white font-bold text-sm">🔋 {gameBatteryLevel}%</span>
        </div>
        <div className={`px-3 py-1.5 rounded-xl ${timeLeft <= 5 ? 'bg-red-500/30 border-red-400/50' : 'bg-white/10 border-white/20'} border`}>
          <span className={`font-bold text-sm ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>⏱️ {timeLeft}с</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative h-80 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => handleItemClick(item.id, item.type)}
              className={`absolute w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-colors ${
                item.type === 'drain'
                  ? 'bg-red-500/40 border-2 border-red-400'
                  : 'bg-green-500/40 border-2 border-green-400'
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {item.item.emoji}
            </motion.button>
          ))}
        </AnimatePresence>
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-4 text-xs">
          <span className="text-red-300">🔴 Нажимай</span>
          <span className="text-green-300">🟢 Не трогай</span>
        </div>
      </div>
    </div>
  );
};

// === MATCHING ===
const MatchingStage: React.FC<{ stage: any; onComplete: any; onNext: any; setKatyaState: any }> = ({ stage, onComplete, onNext, setKatyaState }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState(false);

  const handleLeftClick = (id: string) => {
    if (showResult || matches[id]) return;
    setSelectedLeft(id);
  };

  const handleRightClick = (right: string) => {
    if (!selectedLeft || showResult) return;
    
    const newMatches = { ...matches, [selectedLeft]: right };
    setMatches(newMatches);
    setSelectedLeft(null);
    
    if (Object.keys(newMatches).length === stage.pairs.length) {
      setTimeout(() => {
        setShowResult(true);
        const correct = stage.pairs.filter((p: any) => newMatches[p.id] === p.right).length;
        setKatyaState(correct >= 3 ? 'celebrating' : 'encouraging');
        onComplete(stage.id, correct * 5);
        setTimeout(() => setKatyaState('idle'), 2000);
      }, 500);
    }
  };

  const usedRights = Object.values(matches);
  const correct = stage.pairs.filter((p: any) => matches[p.id] === p.right).length;

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white text-center"
      >
        {stage.title}
      </motion.h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {stage.pairs.map((pair: any) => (
            <button
              key={pair.id}
              onClick={() => handleLeftClick(pair.id)}
              className={`w-full p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                matches[pair.id]
                  ? showResult && matches[pair.id] === pair.right
                    ? 'bg-green-500/30 border-green-400 text-green-300'
                    : showResult
                    ? 'bg-red-500/30 border-red-400 text-red-300'
                    : 'bg-purple-500/30 border-purple-400 text-purple-300'
                  : selectedLeft === pair.id
                  ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {stage.pairs.map((pair: any) => (
            <button
              key={pair.id + '_right'}
              onClick={() => handleRightClick(pair.right)}
              disabled={usedRights.includes(pair.right)}
              className={`w-full p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                usedRights.includes(pair.right)
                  ? 'bg-purple-500/30 border-purple-400 text-purple-300'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {pair.right}
            </button>
          ))}
        </div>
      </div>

      {showResult && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl ${
              correct === stage.pairs.length ? 'bg-green-500/20 border-green-400/30' : 'bg-orange-500/20 border-orange-400/30'
            } border text-center`}
          >
            <p className="text-white font-bold">
              {correct === stage.pairs.length ? '🎉 Идеально!' : '💪 Неплохо!'} {correct}/{stage.pairs.length}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onNext}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <span>Дальше</span>
            <ChevronRight size={24} />
          </motion.button>
        </>
      )}
    </div>
  );
};

// === INPUT ===
const REFLECTION_OPTIONS: Record<string, string[]> = {
  'drain': [
    '📱 Телефон перед сном',
    '🍬 Много сладкого',
    '😴 Поздно ложусь',
    '🗣️ Токсичные люди',
    '📺 Бесконечный YouTube',
    '🎮 Игры до ночи',
    '🗑️ Беспорядок вокруг',
    '☕ Кофе после обеда',
  ],
  'charge': [
    '😴 Лягу раньше спать',
    '🥚 Съем нормальный завтрак',
    '💧 Буду пить больше воды',
    '🚶 Прогуляюсь 15 минут',
    '📵 Уберу телефон за час до сна',
    '🏃 Сделаю зарядку',
    '📋 Уберусь на столе',
    '⏱️ Применю правило 5 минут',
  ],
};

const InputStage: React.FC<{ stage: any; onComplete: any; onNext: any }> = ({ stage, onComplete, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const getOptions = () => {
    if (stage.question?.includes('дыра') || stage.question?.includes('утекает')) {
      return REFLECTION_OPTIONS['drain'];
    }
    return REFLECTION_OPTIONS['charge'];
  };

  const options = getOptions();

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelectedOption(option);
    setSubmitted(true);
    hapticSuccess();
    playCorrectSound();
    onComplete(stage.id, stage.xpReward || 15, true);
  };

  return (
    <div className="space-y-5">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white text-center"
      >
        {stage.question}
      </motion.h2>

      {stage.katyaTip && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
        >
          <Sparkles size={18} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-purple-200 text-sm">💜 {stage.katyaTip}</p>
        </motion.div>
      )}

      {!submitted ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-2"
        >
          {options.map((option, index) => (
            <motion.button
              key={option}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelect(option)}
              className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm text-left hover:bg-white/20 hover:border-yellow-400/50 active:scale-95 transition-all"
            >
              {option}
            </motion.button>
          ))}
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-xl bg-green-500/20 border border-green-400/30 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <CheckCircle size={48} className="text-green-400 mx-auto mb-2" />
            </motion.div>
            <p className="text-green-300 font-bold text-lg">Отличный выбор! 🎉</p>
            <p className="text-white/80 text-sm mt-2 px-4">{selectedOption}</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onNext}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <span>Дальше</span>
            <ChevronRight size={24} />
          </motion.button>
        </>
      )}
    </div>
  );
};

// === REWARD ===
const RewardStage: React.FC<{ stage: any; onNext: any; setShowConfetti?: (show: boolean) => void }> = ({ stage, onNext, setShowConfetti }) => {
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  
  React.useEffect(() => {
    if (setShowConfetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
    hapticSuccess();
  }, [setShowConfetti]);

  const handleClaimReward = () => {
    setShowRewardAnimation(true);
    hapticSuccess();
    playCompleteSound();
    
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  return (
    <div className="text-center space-y-5">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-yellow-500/40 to-orange-600/40 flex items-center justify-center backdrop-blur-xl border border-yellow-400/30 shadow-2xl shadow-yellow-500/30"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5, repeat: 2 }}
        >
          <Trophy size={56} className="text-yellow-400 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white"
      >
        {stage.title}
      </motion.h1>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-4"
      >
        <motion.div 
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/40"
          animate={showRewardAnimation ? { scale: [1, 1.2, 0], y: [0, -30, -60], opacity: [1, 1, 0] } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <Zap size={24} className="text-yellow-400" />
            <span className="text-yellow-300 font-black text-xl">+{stage.xpReward || 150} XP</span>
          </div>
        </motion.div>
        <motion.div 
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-green-500/30 border border-emerald-400/40"
          animate={showRewardAnimation ? { scale: [1, 1.2, 0], y: [0, -30, -60], opacity: [1, 1, 0] } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="text-emerald-300 font-black text-xl">+{stage.coinsReward || 75}</span>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showRewardAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-green-500/20 border border-green-400/30"
          >
            <p className="text-green-300 font-bold text-lg">✅ Награда добавлена!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showRewardAnimation && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-left"
          >
            <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Ты узнал(а):</p>
            <div className="space-y-1">
              {stage.summary?.slice(0, 3).map((item: string, i: number) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-white/90 text-sm"
                >
                  {item}
                </motion.p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
          >
            <p className="text-white text-sm">💜 Катя: {stage.katyaMessage}</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            onClick={handleClaimReward}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3"
          >
            <Award size={24} />
            <span>Забрать награду!</span>
          </motion.button>
        </>
      )}
    </div>
  );
};

export default BatteryLesson;

