import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Zap, Clock, Brain, CheckCircle, XCircle, Trophy, Star, 
  Sparkles, Heart, Flame, Play, RefreshCw, ArrowRight, Gift
} from 'lucide-react';
import { KatyaCharacter } from './KatyaCharacter';

// ============================================
// GAME 1: BUBBLE POP - Лопай пузыри с позитивными мыслями
// ============================================
interface BubblePopProps {
  onComplete: (score: number) => void;
  duration?: number;
  targetScore?: number;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  text: string;
  isPositive: boolean;
  size: number;
  speed: number;
}

const POSITIVE_THOUGHTS = [
  "Я молодец!", "Я справлюсь", "Я уникален", "Я силён", 
  "Я расту", "Я учусь", "Я верю в себя", "Я достоин",
  "Я смелый", "Я умный", "Я талантлив", "Я добрый"
];

const NEGATIVE_THOUGHTS = [
  "Я не могу", "Это сложно", "Я боюсь", "Не получится",
  "Я слабый", "Я глупый", "Зачем пытаться", "Всё плохо"
];

export const BubblePopGame: React.FC<BubblePopProps> = ({ 
  onComplete, 
  duration = 30,
  targetScore = 10 
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'won' | 'lost'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [combo, setCombo] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ text: string; type: 'good' | 'bad' } | null>(null);
  const bubbleIdRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (timeLeft <= 0) {
      if (score >= targetScore) {
        setGameState('won');
        setTimeout(() => onComplete(score * 10), 2000);
      } else {
        setGameState('lost');
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, targetScore, onComplete]);

  // Spawn bubbles
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawner = setInterval(() => {
      setBubbles(prev => {
        if (prev.length >= 6) return prev;
        
        const isPositive = Math.random() > 0.35; // 65% positive
        const thoughts = isPositive ? POSITIVE_THOUGHTS : NEGATIVE_THOUGHTS;
        
        const newBubble: Bubble = {
          id: bubbleIdRef.current++,
          x: 10 + Math.random() * 80,
          y: 110, // Start below screen
          text: thoughts[Math.floor(Math.random() * thoughts.length)],
          isPositive,
          size: 60 + Math.random() * 30,
          speed: 1 + Math.random() * 1.5
        };
        
        return [...prev, newBubble];
      });
    }, 800);

    return () => clearInterval(spawner);
  }, [gameState]);

  // Move bubbles up
  useEffect(() => {
    if (gameState !== 'playing') return;

    const mover = setInterval(() => {
      setBubbles(prev => prev
        .map(b => ({ ...b, y: b.y - b.speed }))
        .filter(b => b.y > -20)
      );
    }, 50);

    return () => clearInterval(mover);
  }, [gameState]);

  const handleBubblePop = (bubble: Bubble) => {
    if (bubble.isPositive) {
      // Pop positive - GOOD!
      setScore(s => s + 1 + Math.min(combo, 5));
      setCombo(c => c + 1);
      setShowFeedback({ text: '+' + (1 + Math.min(combo, 5)), type: 'good' });
    } else {
      // Pop negative - also good but less points
      setScore(s => s + 1);
      setCombo(0);
      setShowFeedback({ text: 'Прочь негатив!', type: 'good' });
    }
    
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    setTimeout(() => setShowFeedback(null), 500);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    setBubbles([]);
  };

  // Intro Screen
  if (gameState === 'intro') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/50" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <KatyaCharacter state="happy" size="lg" />
          
          <h2 className="text-2xl font-black text-white mt-6 mb-2">
            🫧 Пузыри Мыслей
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-[250px]">
            Лопай пузыри с позитивными и негативными мыслями. 
            Собирай комбо!
          </p>

          <div className="flex gap-4 justify-center mb-6">
            <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30">
              <span className="text-green-400 text-sm font-bold">🟢 Позитив</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30">
              <span className="text-red-400 text-sm font-bold">🔴 Негатив</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl font-bold text-white text-lg flex items-center gap-2 mx-auto transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              boxShadow: '0 10px 40px rgba(99,102,241,0.4)',
            }}
          >
            <Play size={24} /> Играть
          </button>
        </motion.div>
      </div>
    );
  }

  // Win Screen
  if (gameState === 'won') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-emerald-900/50" />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <KatyaCharacter state="celebrating" size="lg" showBubble message="Супер! 🎉" />
          
          <h2 className="text-3xl font-black text-white mt-6 mb-2">
            Победа! 🏆
          </h2>
          <p className="text-green-400 text-xl font-bold mb-4">
            +{score * 10} XP
          </p>
          
          <div className="flex gap-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Star size={32} fill="#FCD34D" className="text-yellow-400" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Lost Screen
  if (gameState === 'lost') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/80" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <KatyaCharacter state="thinking" size="lg" showBubble message="Попробуем ещё раз?" />
          
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">
            Почти получилось!
          </h2>
          <p className="text-white/60 mb-6">
            Набрано: {score} / {targetScore}
          </p>
          
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            }}
          >
            <RefreshCw size={20} /> Ещё раз
          </button>
        </motion.div>
      </div>
    );
  }

  // Game Screen
  return (
    <div 
      ref={gameAreaRef}
      className="h-full relative overflow-hidden touch-none"
      style={{
        background: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
      }}
    >
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 backdrop-blur-sm">
          <Target size={16} className="text-yellow-400" />
          <span className="text-white font-bold">{score}/{targetScore}</span>
        </div>
        
        {combo > 1 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-2 rounded-xl bg-orange-500/30 backdrop-blur-sm"
          >
            <span className="text-orange-400 font-bold">🔥 x{combo}</span>
          </motion.div>
        )}
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 backdrop-blur-sm">
          <Clock size={16} className="text-blue-400" />
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-3xl font-black ${
              showFeedback.type === 'good' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {showFeedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubbles */}
      {bubbles.map(bubble => (
        <motion.button
          key={bubble.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => handleBubblePop(bubble)}
          className="absolute rounded-full flex items-center justify-center p-2 text-center transition-transform active:scale-90"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
            transform: 'translate(-50%, -50%)',
            background: bubble.isPositive 
              ? 'linear-gradient(135deg, rgba(34,197,94,0.8) 0%, rgba(22,163,74,0.8) 100%)'
              : 'linear-gradient(135deg, rgba(239,68,68,0.8) 0%, rgba(220,38,38,0.8) 100%)',
            border: bubble.isPositive ? '2px solid rgba(74,222,128,0.5)' : '2px solid rgba(248,113,113,0.5)',
            boxShadow: bubble.isPositive 
              ? '0 0 20px rgba(34,197,94,0.4), inset 0 -2px 10px rgba(0,0,0,0.2)'
              : '0 0 20px rgba(239,68,68,0.4), inset 0 -2px 10px rgba(0,0,0,0.2)',
          }}
        >
          <span className="text-white text-[10px] font-bold leading-tight">
            {bubble.text}
          </span>
        </motion.button>
      ))}

      {/* Progress bar */}
      <div className="absolute bottom-4 left-4 right-4 h-2 bg-black/30 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${(score / targetScore) * 100}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// GAME 2: EMOTION MATCH - Сопоставь эмоции
// ============================================
interface EmotionMatchProps {
  onComplete: (score: number) => void;
}

const EMOTIONS = [
  { emoji: '😊', name: 'Радость', color: '#FCD34D' },
  { emoji: '😢', name: 'Грусть', color: '#60A5FA' },
  { emoji: '😠', name: 'Злость', color: '#F87171' },
  { emoji: '😨', name: 'Страх', color: '#A78BFA' },
  { emoji: '😌', name: 'Спокойствие', color: '#34D399' },
  { emoji: '🤔', name: 'Интерес', color: '#FB923C' },
];

export const EmotionMatchGame: React.FC<EmotionMatchProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'won'>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [targetEmotion, setTargetEmotion] = useState(EMOTIONS[0]);
  const [options, setOptions] = useState<typeof EMOTIONS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const totalRounds = 6;

  const startRound = useCallback(() => {
    const shuffled = [...EMOTIONS].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const opts = shuffled.slice(0, 4).sort(() => Math.random() - 0.5);
    
    setTargetEmotion(target);
    setOptions(opts);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      startRound();
    }
  }, [gameState, currentRound, startRound]);

  const handleAnswer = (emotion: typeof EMOTIONS[0]) => {
    if (emotion.name === targetEmotion.name) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (currentRound + 1 >= totalRounds) {
        setGameState('won');
        setTimeout(() => onComplete((score + (emotion.name === targetEmotion.name ? 1 : 0)) * 15), 2000);
      } else {
        setCurrentRound(r => r + 1);
      }
    }, 800);
  };

  if (gameState === 'intro') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-900/50 to-purple-900/50" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <div className="text-6xl mb-4">🎭</div>
          
          <h2 className="text-2xl font-black text-white mb-2">
            Угадай Эмоцию
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-[250px]">
            Посмотри на эмодзи и выбери правильное название эмоции
          </p>

          <button
            onClick={() => setGameState('playing')}
            className="px-8 py-4 rounded-2xl font-bold text-white text-lg flex items-center gap-2 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              boxShadow: '0 10px 40px rgba(236,72,153,0.4)',
            }}
          >
            <Play size={24} /> Начать
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-emerald-900/50" />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <KatyaCharacter state="celebrating" size="lg" />
          
          <h2 className="text-3xl font-black text-white mt-6 mb-2">
            Отлично! 🎉
          </h2>
          <p className="text-white/70 mb-2">
            Правильных ответов: {score}/{totalRounds}
          </p>
          <p className="text-green-400 text-xl font-bold">
            +{score * 15} XP
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 to-purple-900/80" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Progress */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-white/60 text-sm">{currentRound + 1}/{totalRounds}</span>
          <div className="flex gap-1">
            {[...Array(totalRounds)].map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentRound ? 'bg-green-500' : i === currentRound ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-yellow-400 font-bold">{score} ⭐</span>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-white/60 text-sm mb-4">Какая это эмоция?</p>
          
          <motion.div
            key={currentRound}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-8xl mb-8"
          >
            {targetEmotion.emoji}
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {options.map((emotion, idx) => (
              <motion.button
                key={emotion.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => !feedback && handleAnswer(emotion)}
                disabled={!!feedback}
                className={`p-4 rounded-2xl font-bold text-white transition-all ${
                  feedback === 'correct' && emotion.name === targetEmotion.name
                    ? 'bg-green-500 scale-105'
                    : feedback === 'wrong' && emotion.name === targetEmotion.name
                      ? 'bg-green-500'
                      : feedback && emotion.name !== targetEmotion.name
                        ? 'opacity-50'
                        : 'bg-white/10 hover:bg-white/20 active:scale-95'
                }`}
                style={{
                  border: `2px solid ${emotion.color}40`,
                }}
              >
                {emotion.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center py-4 ${
                feedback === 'correct' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {feedback === 'correct' ? '✓ Правильно!' : '✗ Неверно'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================
// GAME 3: BREATH SYNC - Дыхательная игра
// ============================================
interface BreathSyncProps {
  onComplete: (score: number) => void;
  cycles?: number;
}

export const BreathSyncGame: React.FC<BreathSyncProps> = ({ onComplete, cycles = 3 }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'done'>('intro');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(4);
  const [isHolding, setIsHolding] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            if (isHolding) setScore(s => s + 1);
            return 4;
          }
          if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          }
          if (phase === 'exhale') {
            if (currentCycle + 1 >= cycles) {
              setGameState('done');
              setTimeout(() => onComplete(score * 20), 2000);
              return 0;
            }
            setCurrentCycle(c => c + 1);
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, phase, currentCycle, cycles, isHolding, score, onComplete]);

  if (gameState === 'intro') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/50 to-blue-900/50" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <KatyaCharacter state="idle" size="lg" showBubble message="Дышим вместе! 🌬️" />
          
          <h2 className="text-2xl font-black text-white mt-6 mb-2">
            Синхронное Дыхание
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-[250px]">
            Держи кнопку на вдохе, отпускай на выдохе. 
            Следуй за кругом!
          </p>

          <button
            onClick={() => setGameState('playing')}
            className="px-8 py-4 rounded-2xl font-bold text-white text-lg flex items-center gap-2 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              boxShadow: '0 10px 40px rgba(6,182,212,0.4)',
            }}
          >
            <Play size={24} /> Начать
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'done') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-teal-900/50" />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <KatyaCharacter state="happy" size="lg" />
          
          <h2 className="text-3xl font-black text-white mt-6 mb-2">
            Отлично! 😌
          </h2>
          <p className="text-white/70 mb-2">
            Ты дышал синхронно {score} из {cycles * 2} раз
          </p>
          <p className="text-cyan-400 text-xl font-bold">
            +{score * 20} XP
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-900" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[...Array(cycles)].map((_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < currentCycle ? 'bg-cyan-500' : i === currentCycle ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Breathing circle */}
        <div className="relative">
          <motion.div
            className="w-48 h-48 rounded-full flex items-center justify-center"
            animate={{
              scale: phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.3 : 0.8,
              background: phase === 'inhale' 
                ? 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(59,130,246,0.3) 100%)'
                : phase === 'hold'
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(139,92,246,0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(20,184,166,0.3) 0%, rgba(16,185,129,0.3) 100%)',
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            style={{
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            <div className="text-center">
              <div className="text-5xl font-bold text-white">{timer}</div>
              <div className="text-white/60 text-sm uppercase tracking-wider mt-1">
                {phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hold button */}
        <button
          onMouseDown={() => setIsHolding(true)}
          onMouseUp={() => setIsHolding(false)}
          onTouchStart={() => setIsHolding(true)}
          onTouchEnd={() => setIsHolding(false)}
          className={`mt-8 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isHolding 
              ? 'bg-cyan-500 scale-110' 
              : 'bg-white/10 border-2 border-white/30'
          }`}
        >
          <span className="text-white font-bold text-sm">
            {isHolding ? 'Держу!' : 'Держи'}
          </span>
        </button>

        <p className="text-white/40 text-xs mt-4">
          Держи на вдохе, отпускай на выдохе
        </p>
      </div>
    </div>
  );
};



