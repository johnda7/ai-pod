import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, CheckCircle, Zap, Star, Target, Brain, Shield,
  Gamepad2, Sparkles, Trophy, Timer, Smartphone, Bell, BellOff,
  Volume2, VolumeX, Eye, EyeOff, Clock, Flame, Award, ArrowRight
} from 'lucide-react';
import { Task, LessonSlide } from '../types';
import { KatyaMentor } from './KatyaMentor';
import { hapticSelection, hapticSuccess, hapticError, hapticLight } from '../services/telegramService';
import { playCorrectSound, playWrongSound, playCompleteSound, playClickSound } from '../services/soundService';

interface FocusNinjaLessonProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (earnedXp?: number, earnedCoins?: number) => void;
}

// Фазы урока как путешествие
type LessonPhase = 'intro' | 'hook' | 'learn' | 'practice' | 'challenge' | 'reflection' | 'reward';

const PHASE_NAMES: Record<LessonPhase, string> = {
  intro: '👋 Встреча с Катей',
  hook: '🎯 Шок-факт',
  learn: '🧠 Знания',
  practice: '🎮 Практика',
  challenge: '⚔️ Испытание',
  reflection: '✨ Рефлексия',
  reward: '🏆 Награда'
};

// Структурированные этапы урока "Фокус-Ниндзя"
const LESSON_STAGES = [
  // === ФАЗА 1: INTRO ===
  {
    id: 'intro',
    phase: 'intro' as LessonPhase,
    type: 'katya_intro',
    katyaMessage: 'Привет! 👋 Сегодня ты станешь настоящим Ниндзя Фокуса! Готов узнать, как победить отвлечения?',
    katyaState: 'waving' as const,
  },
  
  // === ФАЗА 2: HOOK ===
  {
    id: 'hook_1',
    phase: 'hook' as LessonPhase,
    type: 'shock_fact',
    title: '⚔️ Война за твоё внимание',
    content: 'Google, TikTok, Netflix — они зарабатывают деньги на каждой твоей секунде внимания.\n\n💰 Один час в соцсетях = $0.50 для них',
    emoji: '💰',
  },
  {
    id: 'hook_quiz',
    phase: 'hook' as LessonPhase,
    type: 'quiz',
    question: 'Сколько времени нужно мозгу, чтобы вернуться в фокус после уведомления?',
    options: ['30 секунд', '5 минут', '23 минуты'],
    correctIndex: 2,
    explanation: '😱 23 минуты 15 секунд! Одно сообщение может разрушить целый час работы.',
    xpReward: 15,
  },
  
  // === ФАЗА 3: LEARN ===
  {
    id: 'learn_brain',
    phase: 'learn' as LessonPhase,
    type: 'theory',
    title: '🧠 Почему так долго?',
    content: 'Когда тебя отвлекают:\n\n1️⃣ Мозг переключается на новую задачу\n2️⃣ Загружает контекст в "оперативку"\n3️⃣ Пытается вспомнить, что делал\n4️⃣ Снова загружает старый контекст\n\nЭто как перезагрузка компьютера каждый раз! 💻',
    katyaTip: 'Даже короткий взгляд на телефон = перезагрузка мозга!',
  },
  {
    id: 'learn_myth',
    phase: 'learn' as LessonPhase,
    type: 'theory',
    title: '🚫 Многозадачность — МИФ',
    content: 'Ты НЕ можешь делать два дела одновременно.\n\nТы просто быстро переключаешься между ними.\n\n📉 Качество работы падает на 40%\n😰 Уровень стресса растёт\n🔋 Устаёшь быстрее',
    katyaTip: 'Даже гении делают одно дело за раз!',
  },
  {
    id: 'learn_quiz_multi',
    phase: 'learn' as LessonPhase,
    type: 'quiz',
    question: 'На сколько % падает качество работы при многозадачности?',
    options: ['~10%', '~25%', '~40%'],
    correctIndex: 2,
    explanation: '📉 На 40%! Ты делаешь больше ошибок, тратишь больше времени и устаёшь быстрее.',
    xpReward: 15,
  },
  
  // === ФАЗА 4: PRACTICE ===
  {
    id: 'practice_sorting',
    phase: 'practice' as LessonPhase,
    type: 'sorting',
    title: '🎯 Рассортируй!',
    question: 'Враги и Друзья фокуса:',
    leftLabel: '👿 Враги',
    rightLabel: '💚 Друзья',
    items: [
      { id: 'i1', text: 'Телефон на столе', emoji: '📱', correct: 'left' },
      { id: 'i2', text: 'Таймер Pomodoro', emoji: '⏱️', correct: 'right' },
      { id: 'i3', text: 'Включённые уведомления', emoji: '🔔', correct: 'left' },
      { id: 'i4', text: 'Авиарежим', emoji: '✈️', correct: 'right' },
      { id: 'i5', text: 'Фоновый шум ТВ', emoji: '📺', correct: 'left' },
      { id: 'i6', text: 'Lo-fi музыка', emoji: '🎧', correct: 'right' },
    ],
    xpReward: 20,
  },
  {
    id: 'practice_pomodoro',
    phase: 'practice' as LessonPhase,
    type: 'theory',
    title: '🍅 Техника Pomodoro',
    content: 'Простой способ держать фокус:\n\n🍅 25 минут работы\n☕ 5 минут отдыха\n🔄 Повтори 4 раза\n🎉 Длинный перерыв 15-30 мин\n\nЗа 25 минут мозг не успевает устать!',
    katyaTip: 'Я сама так учусь — реально работает!',
  },
  {
    id: 'practice_deepwork',
    phase: 'practice' as LessonPhase,
    type: 'theory',
    title: '🌊 Deep Work — глубокая работа',
    content: 'Cal Newport из MIT доказал:\n\n⏰ 2-4 часа глубокой работы в день — это МАКСИМУМ продуктивности\n\n💡 Остальное время — "мелочи"\n\n🧠 Это редкий навык в мире соцсетей!',
    katyaTip: 'Самые успешные люди практикуют Deep Work каждый день',
  },
  
  // === ФАЗА 5: CHALLENGE ===
  {
    id: 'challenge_game',
    phase: 'challenge' as LessonPhase,
    type: 'focus_game',
    title: '🛡️ Защити свой фокус!',
    description: 'Отвлечения атакуют! Нажимай на красные (отвлечения), НЕ нажимай на зелёные (полезное)',
    duration: 30,
    targetScore: 10,
    xpReward: 30,
  },
  {
    id: 'challenge_matching',
    phase: 'challenge' as LessonPhase,
    type: 'matching',
    title: '🔗 Соедини проблемы и решения',
    pairs: [
      { id: 'p1', left: 'Постоянно проверяю телефон', right: 'Убрать в другую комнату' },
      { id: 'p2', left: 'Не могу начать работу', right: 'Техника 5 минут' },
      { id: 'p3', left: 'Быстро устаю', right: 'Pomodoro (25/5)' },
      { id: 'p4', left: 'Отвлекают уведомления', right: 'Авиарежим' },
    ],
    xpReward: 20,
  },
  
  // === ФАЗА 6: REFLECTION ===
  {
    id: 'reflection_input1',
    phase: 'reflection' as LessonPhase,
    type: 'input',
    question: '✨ Напиши 1 вещь, за которую ты СЕГОДНЯ молодец:',
    placeholder: 'Я молодец, потому что...',
    katyaTip: 'Даже маленькие победы важны! "Встал вовремя", "Сделал домашку"...',
    xpReward: 10,
  },
  {
    id: 'reflection_input2',
    phase: 'reflection' as LessonPhase,
    type: 'input',
    question: '🎯 Какое главное отвлечение ты уберёшь завтра?',
    placeholder: 'Уведомления, телефон на столе...',
    katyaTip: 'Запомни: убирай отвлечения, а не борись с ними!',
    xpReward: 10,
  },
  
  // === ФАЗА 7: REWARD ===
  {
    id: 'reward',
    phase: 'reward' as LessonPhase,
    type: 'reward',
    title: '🏆 Ты — Фокус-Ниндзя!',
    summary: [
      '✅ Внимание — твой главный ресурс',
      '✅ 23 минуты на восстановление фокуса',
      '✅ Многозадачность — миф (падение на 40%)',
      '✅ Убирай отвлечения, не борись с ними',
      '✅ Pomodoro: 25 мин работы / 5 мин отдыха',
    ],
    katyaMessage: 'Ты справился! 🎉 Теперь ты знаешь секреты фокуса. Используй их каждый день!',
  },
];

export const FocusNinjaLesson: React.FC<FocusNinjaLessonProps> = ({
  task,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [popupXp, setPopupXp] = useState(0);
  const [katyaState, setKatyaState] = useState<'idle' | 'talking' | 'happy' | 'waving' | 'thinking' | 'encouraging' | 'celebrating'>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentStage = LESSON_STAGES[currentStageIndex];
  const currentPhase = currentStage.phase;
  const totalStages = LESSON_STAGES.length;
  const progress = ((currentStageIndex + 1) / totalStages) * 100;

  useEffect(() => {
    if (isOpen) {
      setCurrentStageIndex(0);
      setXpEarned(0);
      setCoinsEarned(0);
      setCompletedStages(new Set());
      setKatyaState('waving');
    }
  }, [isOpen]);

  const addXp = useCallback((amount: number, isCorrect: boolean = true) => {
    // Комбо-система
    if (isCorrect) {
      setComboCount(prev => {
        const newCombo = prev + 1;
        if (newCombo >= 2) {
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 1500);
        }
        return newCombo;
      });
    } else {
      setComboCount(0);
    }
    
    // Бонус за комбо
    const comboBonus = isCorrect && comboCount >= 2 ? Math.floor(amount * 0.5) : 0;
    const totalXp = amount + comboBonus;
    
    setXpEarned(prev => prev + totalXp);
    setPopupXp(totalXp);
    setShowXpPopup(true);
    hapticSuccess();
    playCorrectSound();
    setTimeout(() => setShowXpPopup(false), 1500);
  }, [comboCount]);

  const markStageComplete = useCallback((stageId: string, xp: number = 0, isCorrect: boolean = true, coins: number = 0) => {
    if (!completedStages.has(stageId)) {
      setCompletedStages(prev => new Set([...prev, stageId]));
      if (xp > 0) {
        addXp(xp, isCorrect);
      }
      if (coins > 0) {
        setCoinsEarned(prev => prev + coins);
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
      // Урок завершён
      hapticSuccess();
      playCompleteSound();
      // Передаём реально заработанный XP и монеты
      const finalXp = xpEarned > 0 ? xpEarned : (task.xpReward || 200);
      const finalCoins = coinsEarned > 0 ? coinsEarned : (task.coinsReward || Math.floor(finalXp * 0.5));
      onComplete(finalXp, finalCoins);
    }
  }, [currentStageIndex, totalStages, onComplete, xpEarned, coinsEarned, task]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 overflow-hidden">
      {/* Solid background to block everything behind */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-900 to-slate-950" />
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
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
                    ? 'bg-emerald-400 scale-y-150'
                    : idx < ['intro', 'hook', 'learn', 'practice', 'challenge', 'reflection', 'reward'].indexOf(currentPhase)
                    ? 'bg-emerald-600'
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
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
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
        </div>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 pt-24 pb-28 overflow-y-auto z-[10]">
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
                <span className="text-white font-black text-2xl">+{popupXp} ОП</span>
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

      {/* Katya floating - hide during katya_intro to avoid overlap */}
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

// Stage Renderer
interface StageRendererProps {
  stage: typeof LESSON_STAGES[0];
  onComplete: (stageId: string, xp?: number, isCorrect?: boolean) => void;
  onNext: () => void;
  katyaState: string;
  setKatyaState: (state: any) => void;
  setShowConfetti?: (show: boolean) => void;
}

const StageRenderer: React.FC<StageRendererProps> = ({ stage, onComplete, onNext, katyaState, setKatyaState, setShowConfetti }) => {
  switch (stage.type) {
    case 'katya_intro':
      return <KatyaIntroStage stage={stage} onComplete={onComplete} onNext={onNext} />;
    case 'shock_fact':
      return <ShockFactStage stage={stage} onNext={onNext} />;
    case 'quiz':
      return <QuizStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'theory':
      return <TheoryStage stage={stage} onNext={onNext} />;
    case 'sorting':
      return <SortingStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'focus_game':
      return <FocusGameStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'matching':
      return <MatchingStage stage={stage} onComplete={onComplete} onNext={onNext} setKatyaState={setKatyaState} />;
    case 'input':
      return <InputStage stage={stage} onComplete={onComplete} onNext={onNext} />;
    case 'reward':
      return <RewardStage stage={stage} onNext={onNext} setShowConfetti={setShowConfetti} onComplete={onComplete} />;
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

  // Typing effect
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
        {/* Chat bubble pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/10 border-l border-t border-white/20" />
        
        <p className="text-white text-xl font-medium leading-relaxed min-h-[3rem]">
          {displayedText}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-6 bg-emerald-400 ml-1 align-middle"
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
        className={`px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-3 mx-auto ${
          isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-emerald-500/50 hover:scale-105'
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
      {/* Pulsing glow effect */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="relative w-28 h-28 mx-auto"
      >
        {/* Pulsing background */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 blur-xl"
        />
        <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-red-500/40 to-orange-600/40 flex items-center justify-center backdrop-blur-xl border border-red-400/30 shadow-2xl shadow-red-500/30">
          <motion.span 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="text-5xl"
          >
            {stage.emoji}
          </motion.span>
        </div>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex justify-center"
      >
        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold uppercase tracking-wider">
          🔥 ШОК-ФАКТ
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
            className="p-6 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 backdrop-blur-sm"
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
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:shadow-emerald-500/50 transition-all"
      >
        <span>Дальше</span>
        <ChevronRight size={24} />
      </motion.button>
    </div>
  );
};

// === QUIZ ===
const QuizStage: React.FC<{ stage: any; onComplete: any; onNext: any; setKatyaState: any }> = ({ stage, onComplete, onNext, setKatyaState }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);

  // Timer countdown
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
    
    // Bonus XP for fast answer
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
      {/* Timer and label row */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Zap size={16} />
            <span>Вопрос</span>
          </div>
        </motion.div>
        
        {/* Timer */}
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
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
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
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

      {/* Categories */}
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

      {/* Current item */}
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
              ← Враг
            </button>
            <button
              onClick={() => handleSort('right')}
              className="flex-1 py-3 rounded-xl bg-green-500/30 border border-green-400/30 text-green-300 font-bold hover:bg-green-500/50 transition-colors"
            >
              Друг →
            </button>
          </div>
        </motion.div>
      )}

      {/* Result */}
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <span>Дальше</span>
            <ChevronRight size={24} />
          </motion.button>
        </>
      )}
    </div>
  );
};

// === STROOP CHALLENGE (научная игра на внимание) ===
const STROOP_COLORS = [
  { name: 'КРАСНЫЙ', color: '#EF4444', textRu: 'красный' },
  { name: 'СИНИЙ', color: '#3B82F6', textRu: 'синий' },
  { name: 'ЗЕЛЁНЫЙ', color: '#22C55E', textRu: 'зелёный' },
  { name: 'ЖЁЛТЫЙ', color: '#EAB308', textRu: 'жёлтый' },
  { name: 'ФИОЛЕТОВЫЙ', color: '#A855F7', textRu: 'фиолетовый' },
];

const FocusGameStage: React.FC<{ stage: any; onComplete: any; onNext: any; setKatyaState: any }> = ({ stage, onComplete, onNext, setKatyaState }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [currentWord, setCurrentWord] = useState<{ text: string; displayColor: string; correctColor: string } | null>(null);
  const [options, setOptions] = useState<typeof STROOP_COLORS>([]);
  const totalRounds = 10;
  const targetScore = 7;

  // Generate new round
  const generateRound = useCallback(() => {
    // Pick a random word (color name)
    const wordIndex = Math.floor(Math.random() * STROOP_COLORS.length);
    const word = STROOP_COLORS[wordIndex];
    
    // Pick a DIFFERENT color to display it in (Stroop effect!)
    let displayColorIndex = Math.floor(Math.random() * STROOP_COLORS.length);
    while (displayColorIndex === wordIndex) {
      displayColorIndex = Math.floor(Math.random() * STROOP_COLORS.length);
    }
    const displayColor = STROOP_COLORS[displayColorIndex];
    
    setCurrentWord({
      text: word.name,
      displayColor: displayColor.color,
      correctColor: displayColor.color // Player must tap the DISPLAY color, not word meaning
    });
    
    // Shuffle options
    const shuffled = [...STROOP_COLORS].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  }, []);

  // Start game
  useEffect(() => {
    if (gameStarted && !gameOver && round < totalRounds) {
      generateRound();
    }
  }, [gameStarted, gameOver, round, generateRound]);

  const handleColorSelect = (selectedColor: string) => {
    if (showFeedback || !currentWord) return;
    
    const isCorrect = selectedColor === currentWord.correctColor;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setCombo(prev => prev + 1);
      setShowFeedback('correct');
      hapticSuccess();
      playCorrectSound();
    } else {
      setCombo(0);
      setShowFeedback('wrong');
      hapticError();
      playWrongSound();
    }
    
    // Next round or end game
    setTimeout(() => {
      setShowFeedback(null);
      if (round + 1 >= totalRounds) {
        setGameOver(true);
        const success = score + (isCorrect ? 1 : 0) >= targetScore;
        setKatyaState(success ? 'celebrating' : 'encouraging');
        onComplete(stage.id, success ? stage.xpReward : 10, success);
        setTimeout(() => setKatyaState('idle'), 2000);
      } else {
        setRound(prev => prev + 1);
      }
    }, 600);
  };

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-purple-500/40 to-pink-600/40 flex items-center justify-center backdrop-blur-xl border border-purple-400/30"
        >
          <Brain size={56} className="text-purple-300" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold mb-3">
            🧠 НАУЧНЫЙ ТЕСТ
          </div>
          <h2 className="text-2xl font-bold text-white">Тест Струпа</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-white/10 border border-white/20 text-left space-y-3"
        >
          <p className="text-white/90 font-medium">🎯 Правила:</p>
          <p className="text-white/70 text-sm">
            Слово написано <span className="text-red-400 font-bold">ОДНИМ ЦВЕТОМ</span>, 
            но означает <span className="text-blue-400 font-bold">ДРУГОЙ</span>.
          </p>
          <p className="text-white font-bold text-center py-2">
            Нажми на <span className="text-emerald-400">ЦВЕТ БУКВ</span>, а не на слово!
          </p>
          <div className="text-center p-3 rounded-xl bg-slate-800/50">
            <span className="text-3xl font-black" style={{ color: '#3B82F6' }}>КРАСНЫЙ</span>
            <p className="text-white/50 text-xs mt-2">↑ Правильный ответ: СИНИЙ (цвет букв)</p>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
            <span className="text-white/60 text-sm">Цель:</span>
            <span className="text-white font-bold ml-2">{targetScore}/{totalRounds}</span>
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
        >
          🧠 Начать тест!
        </motion.button>
      </div>
    );
  }

  if (gameOver) {
    const success = score >= targetScore;
    const percentage = Math.round((score / totalRounds) * 100);
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-7xl"
        >
          {success ? '🏆' : '💪'}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            {success ? 'Отличный фокус!' : 'Неплохо для начала!'}
          </h2>
          <p className="text-white/70">
            Результат: <span className="text-white font-bold">{score}/{totalRounds}</span> ({percentage}%)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-white/10 border border-white/20"
        >
          <p className="text-white/80 text-sm">
            {success 
              ? '🧠 Твой мозг отлично справляется с конфликтом информации! Это важный навык для концентрации.'
              : '🔄 Эффект Струпа - это нормально! С практикой твоё внимание станет острее.'}
          </p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <span>Дальше</span>
          <ChevronRight size={24} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header: Progress & Combo */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
            <span className="text-white font-bold text-sm">{round + 1}/{totalRounds}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-yellow-500/20 border border-yellow-400/30">
            <span className="text-yellow-400 font-bold text-sm">⭐ {score}</span>
          </div>
        </div>
        
        {/* Combo indicator */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
            >
              <span className="text-white font-bold text-sm">🔥 x{combo}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instruction */}
      <div className="text-center">
        <p className="text-white/60 text-sm">Нажми на <span className="text-emerald-400 font-bold">ЦВЕТ БУКВ</span></p>
      </div>

      {/* Word display */}
      <AnimatePresence mode="wait">
        {currentWord && (
          <motion.div
            key={round}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`py-8 rounded-2xl backdrop-blur-xl border text-center ${
              showFeedback === 'correct' 
                ? 'bg-green-500/20 border-green-400/50' 
                : showFeedback === 'wrong'
                ? 'bg-red-500/20 border-red-400/50'
                : 'bg-white/10 border-white/20'
            }`}
          >
            <motion.span
              animate={showFeedback ? { scale: [1, 1.1, 1] } : {}}
              className="text-4xl font-black tracking-wider"
              style={{ color: currentWord.displayColor }}
            >
              {currentWord.text}
            </motion.span>
            
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3"
              >
                <span className={`text-lg font-bold ${showFeedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                  {showFeedback === 'correct' ? '✓ Верно!' : '✗ Неверно'}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color options */}
      <div className="grid grid-cols-5 gap-2">
        {options.map((color, index) => (
          <motion.button
            key={color.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleColorSelect(color.color)}
            disabled={!!showFeedback}
            className={`aspect-square rounded-xl border-2 transition-all ${
              showFeedback 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 active:scale-95'
            }`}
            style={{ 
              backgroundColor: color.color,
              borderColor: color.color,
              boxShadow: `0 4px 15px ${color.color}40`
            }}
          />
        ))}
      </div>

      {/* Color labels */}
      <div className="grid grid-cols-5 gap-2">
        {options.map((color) => (
          <p key={color.name} className="text-center text-white/50 text-[10px] truncate">
            {color.textRu}
          </p>
        ))}
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
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
// Options for reflection questions
const REFLECTION_OPTIONS: Record<string, string[]> = {
  'proud': [
    '✅ Встал(а) вовремя',
    '📚 Сделал(а) домашку',
    '🏃 Позанимался(ась) спортом',
    '🍎 Поел(а) полезную еду',
    '😴 Лёг(ла) вовремя спать',
    '📵 Не залипал(а) в телефон',
    '💬 Помог(ла) кому-то',
    '🎯 Закончил(а) важное дело',
  ],
  'distraction': [
    '📱 Уведомления на телефоне',
    '📺 YouTube / TikTok',
    '💬 Мессенджеры',
    '🎮 Игры',
    '📸 Instagram / соцсети',
    '🔔 Шум вокруг',
    '💭 Свои мысли',
    '👥 Друзья отвлекают',
  ],
};

const InputStage: React.FC<{ stage: any; onComplete: any; onNext: any }> = ({ stage, onComplete, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Determine which options to show based on question type
  const getOptions = () => {
    if (stage.question?.includes('молодец') || stage.question?.includes('гордишься')) {
      return REFLECTION_OPTIONS['proud'];
    }
    if (stage.question?.includes('отвлечение') || stage.question?.includes('убер')) {
      return REFLECTION_OPTIONS['distraction'];
    }
    return REFLECTION_OPTIONS['proud'];
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
              className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm text-left hover:bg-white/20 hover:border-emerald-400/50 active:scale-95 transition-all"
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
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
const RewardStage: React.FC<{ stage: any; onNext: any; setShowConfetti?: (show: boolean) => void; onComplete?: (stageId: string, xp?: number, isCorrect?: boolean, coins?: number) => void }> = ({ stage, onNext, setShowConfetti, onComplete }) => {
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  
  // Trigger confetti on mount
  React.useEffect(() => {
    if (setShowConfetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
    hapticSuccess();
    // НЕ вызываем onComplete здесь - финальная награда передаётся в goToNextStage
  }, [setShowConfetti]);

  const handleClaimReward = () => {
    setShowRewardAnimation(true);
    hapticSuccess();
    playCompleteSound();
    
    // Wait for animation then close
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

      {/* Reward summary - XP and Coins */}
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
            <span className="text-yellow-300 font-black text-xl">+{stage.xpReward || 200} ОП</span>
          </div>
        </motion.div>
        <motion.div 
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-green-500/30 border border-emerald-400/40"
          animate={showRewardAnimation ? { scale: [1, 1.2, 0], y: [0, -30, -60], opacity: [1, 1, 0] } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="text-emerald-300 font-black text-xl">+{stage.coinsReward || 100}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Where rewards go */}
      <AnimatePresence>
        {showRewardAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-green-500/20 border border-green-400/30"
          >
            <p className="text-green-300 font-bold text-lg">✅ Награда добавлена в профиль!</p>
            <p className="text-white/60 text-sm mt-1">Смотри свой прогресс на главной</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showRewardAnimation && (
        <>
          {/* What you learned */}
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

          {/* Katya message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
          >
            <p className="text-white text-sm">💜 Катя: {stage.katyaMessage}</p>
          </motion.div>

          {/* Claim button */}
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

export default FocusNinjaLesson;

