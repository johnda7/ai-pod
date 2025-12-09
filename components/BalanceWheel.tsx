import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, RotateCcw, Sparkles, TrendingUp, TrendingDown, Award, Lightbulb, Calendar, ArrowRight, History, Flame, Trophy, Target, Star, Zap } from 'lucide-react';
import { useSyncTool } from '../hooks/useSyncTool';

interface BalanceWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: AreaScore[]) => void;
  onXPGain?: (xp: number) => void;
}

interface AreaScore {
  id: string;
  name: string;
  emoji: string;
  score: number;
  color: string;
  gradient: string;
  tip: string;
}

interface HistoryEntry {
  date: string;
  scores: AreaScore[];
  average: number;
  xpEarned?: number;
}

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// 🎮 XP REWARDS SYSTEM
const XP_REWARDS = {
  completeWheel: 30,
  improvement: 5,
  perfectBalance: 50,
  streak3Days: 20,
  streak7Days: 50,
  firstWheel: 100,
  breakthrough: 30,
};

// 🏆 ACHIEVEMENTS
const ACHIEVEMENTS_CONFIG: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_wheel', name: 'Первый Баланс', emoji: '🎯', description: 'Заполни колесо впервые' },
  { id: 'harmony', name: 'Гармония', emoji: '⚖️', description: 'Все сферы 7+' },
  { id: 'perfectionist', name: 'Перфекционист', emoji: '🏆', description: 'Все сферы 10' },
  { id: 'week_streak', name: 'Неделя Баланса', emoji: '🔥', description: '7 дней подряд' },
  { id: 'month_streak', name: 'Мастер Баланса', emoji: '🌟', description: '30 дней подряд' },
  { id: 'breakthrough', name: 'Прорыв', emoji: '💪', description: 'Улучши сферу на 3+ балла' },
  { id: 'consistent', name: 'Стабильность', emoji: '📈', description: '4 недели подряд' },
];

// 🎨 KATYA INSIGHTS
const KATYA_INSIGHTS = {
  declining: [
    "😟 Заметила, что {area} немного просела. Давай вместе разберёмся почему?",
    "💭 {area} требует внимания. Может, стоит уделить ей больше времени?",
    "🤔 Хм, {area} падает... Что произошло на этой неделе?",
  ],
  improving: [
    "🎉 Вау! {area} растёт! Расскажи, что помогло?",
    "💪 Отличный прогресс в {area}! Так держать!",
    "✨ {area} на подъёме! Ты молодец!",
  ],
  weak: [
    "💡 Фокус недели: {area}. Попробуй: {tip}",
    "🎯 {area} — твоя зона роста. Маленькие шаги каждый день!",
    "🌱 Давай вместе поработаем над {area}?",
  ],
  balanced: [
    "⚖️ Отличный баланс! Продолжай в том же духе!",
    "🌟 Все сферы в гармонии — это редкость!",
    "👏 Впечатляющий результат! Ты настоящий мастер баланса!",
  ],
};

// 🎨 CONFETTI COLORS
const CONFETTI_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6'];

// 🎨 iOS 26 LIQUID GLASS - без фото, градиенты + эмодзи
const LIFE_AREAS: Omit<AreaScore, 'score'>[] = [
  { 
    id: 'study', 
    name: 'Учёба', 
    emoji: '📚', 
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    tip: 'Попробуй технику Помодоро для лучшей концентрации'
  },
  { 
    id: 'health', 
    name: 'Здоровье', 
    emoji: '💪', 
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    tip: 'Начни с 10 минут зарядки каждое утро'
  },
  { 
    id: 'friends', 
    name: 'Друзья', 
    emoji: '👥', 
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    tip: 'Напиши другу, с которым давно не общался'
  },
  { 
    id: 'family', 
    name: 'Семья', 
    emoji: '🏠', 
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    tip: 'Проведи вечер без телефона с семьёй'
  },
  { 
    id: 'hobby', 
    name: 'Хобби', 
    emoji: '🎨', 
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    tip: 'Выдели час в неделю только для себя'
  },
  { 
    id: 'rest', 
    name: 'Отдых', 
    emoji: '😴', 
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
    tip: 'Ложись спать в одно время каждый день'
  },
  { 
    id: 'growth', 
    name: 'Развитие', 
    emoji: '🌱', 
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
    tip: 'Читай 10 страниц полезной книги каждый день'
  },
  { 
    id: 'mood', 
    name: 'Настроение', 
    emoji: '😊', 
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    tip: 'Веди дневник благодарности'
  },
];

const SCORE_DESCRIPTIONS = [
  { min: 1, max: 2, label: 'Критично', emoji: '😰', color: '#ef4444' },
  { min: 3, max: 4, label: 'Слабо', emoji: '😟', color: '#f97316' },
  { min: 5, max: 6, label: 'Нормально', emoji: '😐', color: '#eab308' },
  { min: 7, max: 8, label: 'Хорошо', emoji: '😊', color: '#22c55e' },
  { min: 9, max: 10, label: 'Отлично!', emoji: '🤩', color: '#10b981' },
];

const getScoreDescription = (score: number) => {
  return SCORE_DESCRIPTIONS.find(d => score >= d.min && score <= d.max) || SCORE_DESCRIPTIONS[2];
};

export const BalanceWheel: React.FC<BalanceWheelProps> = ({ isOpen, onClose, onComplete, onXPGain }) => {
  // 🔄 useSyncTool для автоматической синхронизации
  const { data: history, setData: setHistory } = useSyncTool<HistoryEntry[]>([], {
    storageKey: 'balance_wheel_history',
    debounceMs: 1000
  });
  
  // 🏆 Достижения
  const { data: achievements, setData: setAchievements } = useSyncTool<Achievement[]>(
    ACHIEVEMENTS_CONFIG.map(a => ({ ...a, unlocked: false })),
    { storageKey: 'balance_wheel_achievements', debounceMs: 1000 }
  );
  
  // 🔥 Стрик
  const { data: streakData, setData: setStreakData } = useSyncTool<{ count: number; lastDate: string }>( 
    { count: 0, lastDate: '' },
    { storageKey: 'balance_wheel_streak', debounceMs: 1000 }
  );
  
  // Определяем начальный экран на основе истории
  const [step, setStep] = useState<'history' | 'intro' | 'scoring' | 'result' | 'compare' | 'celebrate'>('intro');
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [scores, setScores] = useState<AreaScore[]>(
    LIFE_AREAS.map(area => ({ ...area, score: 5 }))
  );
  const [showTip, setShowTip] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [katyaInsight, setKatyaInsight] = useState('');
  
  // Последняя запись в истории
  const lastEntry = useMemo(() => history.length > 0 ? history[0] : null, [history]);
  
  // 🔥 Расчёт стрика
  const currentStreak = useMemo(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (streakData.lastDate === today) {
      return streakData.count;
    } else if (streakData.lastDate === yesterday) {
      return streakData.count; // Стрик сохраняется
    }
    return 0; // Стрик сброшен
  }, [streakData]);
  
  // 🎯 Генерация инсайта от Кати
  const generateKatyaInsight = useCallback((currentScores: AreaScore[], prevScores?: AreaScore[]) => {
    const avgScore = currentScores.reduce((sum, s) => sum + s.score, 0) / currentScores.length;
    const weakest = [...currentScores].sort((a, b) => a.score - b.score)[0];
    
    // Если есть предыдущие оценки - сравниваем
    if (prevScores) {
      const declining = currentScores.filter(s => {
        const prev = prevScores.find(p => p.id === s.id);
        return prev && s.score < prev.score - 1;
      });
      
      const improving = currentScores.filter(s => {
        const prev = prevScores.find(p => p.id === s.id);
        return prev && s.score > prev.score + 1;
      });
      
      if (declining.length > 0) {
        const templates = KATYA_INSIGHTS.declining;
        return templates[Math.floor(Math.random() * templates.length)]
          .replace('{area}', declining[0].name);
      }
      
      if (improving.length > 0) {
        const templates = KATYA_INSIGHTS.improving;
        return templates[Math.floor(Math.random() * templates.length)]
          .replace('{area}', improving[0].name);
      }
    }
    
    // Проверяем баланс
    if (avgScore >= 7 && currentScores.every(s => s.score >= 6)) {
      const templates = KATYA_INSIGHTS.balanced;
      return templates[Math.floor(Math.random() * templates.length)];
    }
    
    // Рекомендация по слабой сфере
    const templates = KATYA_INSIGHTS.weak;
    return templates[Math.floor(Math.random() * templates.length)]
      .replace('{area}', weakest.name)
      .replace('{tip}', weakest.tip);
  }, []);
  
  // 🏆 Проверка достижений
  const checkAchievements = useCallback((currentScores: AreaScore[], prevScores?: AreaScore[]) => {
    const newUnlocked: Achievement[] = [];
    const updatedAchievements = [...achievements];
    
    const unlock = (id: string) => {
      const idx = updatedAchievements.findIndex(a => a.id === id);
      if (idx !== -1 && !updatedAchievements[idx].unlocked) {
        updatedAchievements[idx] = { ...updatedAchievements[idx], unlocked: true, unlockedAt: new Date().toISOString() };
        newUnlocked.push(updatedAchievements[idx]);
      }
    };
    
    // Первое колесо
    if (history.length === 0) {
      unlock('first_wheel');
    }
    
    // Гармония - все сферы 7+
    if (currentScores.every(s => s.score >= 7)) {
      unlock('harmony');
    }
    
    // Перфекционист - все сферы 10
    if (currentScores.every(s => s.score === 10)) {
      unlock('perfectionist');
    }
    
    // Прорыв - улучшить сферу на 3+
    if (prevScores) {
      const hasBreakthrough = currentScores.some(s => {
        const prev = prevScores.find(p => p.id === s.id);
        return prev && s.score >= prev.score + 3;
      });
      if (hasBreakthrough) unlock('breakthrough');
    }
    
    // Стрики
    const newStreakCount = currentStreak + 1;
    if (newStreakCount >= 7) unlock('week_streak');
    if (newStreakCount >= 30) unlock('month_streak');
    if (newStreakCount >= 28) unlock('consistent');
    
    if (newUnlocked.length > 0) {
      setAchievements(updatedAchievements);
    }
    
    return newUnlocked;
  }, [achievements, history.length, currentStreak, setAchievements]);
  
  // 💰 Расчёт XP
  const calculateXP = useCallback((currentScores: AreaScore[], prevScores?: AreaScore[], newAchievements: Achievement[] = []) => {
    let xp = XP_REWARDS.completeWheel;
    
    // Первое колесо
    if (history.length === 0) {
      xp += XP_REWARDS.firstWheel;
    }
    
    // Улучшения
    if (prevScores) {
      const improvements = currentScores.filter(s => {
        const prev = prevScores.find(p => p.id === s.id);
        return prev && s.score > prev.score;
      }).length;
      xp += improvements * XP_REWARDS.improvement;
      
      // Прорыв
      const hasBreakthrough = currentScores.some(s => {
        const prev = prevScores.find(p => p.id === s.id);
        return prev && s.score >= prev.score + 3;
      });
      if (hasBreakthrough) xp += XP_REWARDS.breakthrough;
    }
    
    // Идеальный баланс
    if (currentScores.every(s => s.score >= 7)) {
      xp += XP_REWARDS.perfectBalance;
    }
    
    // Бонус за стрик
    const newStreakCount = currentStreak + 1;
    if (newStreakCount === 3) xp += XP_REWARDS.streak3Days;
    if (newStreakCount === 7) xp += XP_REWARDS.streak7Days;
    
    // Бонус за достижения (по 20 XP за каждое)
    xp += newAchievements.length * 20;
    
    return xp;
  }, [history.length, currentStreak]);
  
  // При открытии: если есть история → показать её, иначе intro
  useEffect(() => {
    if (isOpen) {
      if (history.length > 0) {
        setStep('history');
      } else {
        setStep('intro');
      }
      setCurrentAreaIndex(0);
      setScores(LIFE_AREAS.map(area => ({ ...area, score: 5 })));
    }
  }, [isOpen, history.length]);

  const currentArea = LIFE_AREAS[currentAreaIndex];
  const currentScore = scores.find(s => s.id === currentArea?.id)?.score || 5;
  const scoreDesc = getScoreDescription(currentScore);

  const handleScoreChange = (value: number) => {
    setScores(prev => prev.map(s => 
      s.id === currentArea.id ? { ...s, score: value } : s
    ));
  };

  const handleNext = () => {
    if (currentAreaIndex < LIFE_AREAS.length - 1) {
      setCurrentAreaIndex(prev => prev + 1);
      setShowTip(false);
    } else {
      // Завершаем оценку
      const average = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      
      // 🏆 Проверяем достижения
      const prevScores = lastEntry?.scores;
      const unlockedAchievements = checkAchievements(scores, prevScores);
      setNewAchievements(unlockedAchievements);
      
      // 💰 Считаем XP
      const xp = calculateXP(scores, prevScores, unlockedAchievements);
      setEarnedXP(xp);
      
      // 🤖 Генерируем инсайт от Кати
      const insight = generateKatyaInsight(scores, prevScores);
      setKatyaInsight(insight);
      
      // 🔥 Обновляем стрик
      const today = new Date().toDateString();
      if (streakData.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newCount = streakData.lastDate === yesterday ? streakData.count + 1 : 1;
        setStreakData({ count: newCount, lastDate: today });
      }
      
      const newEntry: HistoryEntry = {
        date: new Date().toISOString(),
        scores: [...scores],
        average,
        xpEarned: xp,
      };
      
      // Сохраняем в историю (useSyncTool автоматически синхронизирует)
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
      
      // 🎉 Показываем celebration
      setShowConfetti(true);
      setStep('celebrate');
      
      // Отправляем XP
      onXPGain?.(xp);
      onComplete?.(scores);
      
      // Убираем конфетти через 3 секунды
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleStartNew = () => {
    setStep('intro');
  };

  const handleReset = () => {
    setStep('intro');
    setCurrentAreaIndex(0);
    setScores(LIFE_AREAS.map(area => ({ ...area, score: 5 })));
  };

  // Статистика
  const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const weakestArea = [...scores].sort((a, b) => a.score - b.score)[0];
  const strongestArea = [...scores].sort((a, b) => b.score - a.score)[0];
  
  // Сравнение с предыдущей записью
  const comparison = useMemo(() => {
    if (!lastEntry) return null;
    
    const prevAvg = lastEntry.average;
    const currAvg = averageScore;
    const diff = currAvg - prevAvg;
    
    const areaChanges = scores.map(s => {
      const prevScore = lastEntry.scores.find(ps => ps.id === s.id)?.score || 5;
      return {
        ...s,
        prevScore,
        diff: s.score - prevScore,
      };
    });
    
    return {
      prevAvg,
      currAvg,
      diff,
      areaChanges,
      improved: areaChanges.filter(a => a.diff > 0),
      declined: areaChanges.filter(a => a.diff < 0),
    };
  }, [lastEntry, scores, averageScore]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      {/* 🎨 iOS 26 OPTIMIZED BACKGROUND - без тяжёлых анимаций */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          }}
        />
        
        {/* Static gradient blobs - NO animation for performance */}
        <div
          className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-14 right-4 z-50 w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <X size={20} className="text-white/80" />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto pt-6 pb-8 px-4">
        <AnimatePresence mode="wait">
          
          {/* 📊 HISTORY - показываем последний результат */}
          {step === 'history' && lastEntry && (
        <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto pt-8"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">⚖️</div>
                <h2 className="text-2xl font-black text-white mb-2">
                  Твой Баланс
                </h2>
                <p className="text-white/50 text-sm mb-4">
                  Последняя оценка: {new Date(lastEntry.date).toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                
                {/* Stats */}
                <div className="flex justify-center gap-3">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/20">
                    <Flame size={14} className="text-orange-400" />
                    <span className="text-white text-sm font-bold">{currentStreak}</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20">
                    <Trophy size={14} className="text-amber-400" />
                    <span className="text-white text-sm font-bold">{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
                  </div>
                  {lastEntry.xpEarned && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20">
                      <Zap size={14} className="text-purple-400" />
                      <span className="text-white text-sm font-bold">+{lastEntry.xpEarned}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Average score card */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="p-6 rounded-3xl mb-6 text-center"
          style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="text-6xl font-black text-white mb-2">
                  {lastEntry.average.toFixed(1)}
                </div>
                <div className="text-white/60">Средний балл из 10</div>
                <div className="flex justify-center gap-1 mt-3">
                  {[1,2,3,4,5,6,7,8,9,10].map(i => (
                    <div
                      key={i}
                      className="w-2 h-6 rounded-full"
                      style={{
                        background: i <= Math.round(lastEntry.average) 
                          ? 'linear-gradient(180deg, #8b5cf6, #6366f1)'
                          : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
              
              {/* Areas grid - iOS 26 style */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {lastEntry.scores.map((area, i) => (
          <motion.div
                    key={area.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center p-2"
            style={{
                      background: `${area.color}25`,
                      border: `1px solid ${area.color}40`,
                    }}
                  >
                    <span className="text-2xl mb-1">{area.emoji}</span>
                    <span 
                      className="text-lg font-bold"
                      style={{ color: area.color }}
                    >
                      {area.score}
                    </span>
                  </motion.div>
                ))}
              </div>
              
              {/* Insights */}
              <div className="space-y-3 mb-6">
                <div 
                  className="p-4 rounded-2xl flex items-center gap-3"
                  style={{
                    background: `${strongestArea?.color}15`,
                    border: `1px solid ${strongestArea?.color}30`,
                  }}
                >
                  <span className="text-2xl">💪</span>
                  <div className="flex-1">
                    <div className="text-white/60 text-xs">Твоя сила</div>
                    <div className="text-white font-medium">
                      {lastEntry.scores.sort((a, b) => b.score - a.score)[0]?.name}
                    </div>
                  </div>
                  <Award size={20} className="text-amber-400" />
                </div>
                
                <div 
                  className="p-4 rounded-2xl flex items-center gap-3"
                  style={{
                    background: `${weakestArea?.color}15`,
                    border: `1px solid ${weakestArea?.color}30`,
                  }}
                >
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <div className="text-white/60 text-xs">Зона роста</div>
                    <div className="text-white font-medium">
                      {lastEntry.scores.sort((a, b) => a.score - b.score)[0]?.name}
                    </div>
                  </div>
                  <TrendingUp size={20} className="text-emerald-400" />
                </div>
      </div>

              {/* Action buttons */}
              <motion.button
                onClick={handleStartNew}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mb-3"
        style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={18} />
                Пройти снова
              </motion.button>
              
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-white/60 text-sm"
              >
                Закрыть
      </button>
            </motion.div>
          )}

          {/* 🎬 INTRO */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto pt-8"
            >
              {/* iOS 26 Header with liquid glass */}
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative w-36 h-36 mx-auto mb-6"
              >
                <div 
                  className="w-full h-full rounded-[32px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 20px 60px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-6xl">⚖️</span>
                </div>
              </motion.div>

              <h2 className="text-3xl font-black text-white text-center mb-3">
                Колесо Баланса
              </h2>
              <p className="text-white/60 text-center mb-4 px-4">
                Оцени 8 сфер жизни и узнай, где ты сейчас. Это займёт всего 2 минуты.
              </p>
              
              {/* Stats row */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
                  <Flame size={18} className="text-orange-400" />
                  <span className="text-white font-bold">{currentStreak}</span>
                  <span className="text-white/50 text-sm">дней</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <History size={18} className="text-purple-400" />
                  <span className="text-white font-bold">{history.length}</span>
                  <span className="text-white/50 text-sm">оценок</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                  <Trophy size={18} className="text-amber-400" />
                  <span className="text-white font-bold">{achievements.filter(a => a.unlocked).length}</span>
                  <span className="text-white/50 text-sm">🏆</span>
                </div>
              </div>

              {/* iOS 26 style preview grid */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {LIFE_AREAS.map((area, i) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square rounded-2xl flex items-center justify-center"
                      style={{
                      background: area.gradient,
                      boxShadow: `0 8px 24px ${area.color}40`,
                    }}
                  >
                    <span className="text-3xl">{area.emoji}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={() => setStep('scoring')}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={20} />
                Начать оценку
              </motion.button>
              
              {history.length > 0 && (
                <button
                  onClick={() => setStep('history')}
                  className="w-full py-3 mt-3 rounded-xl text-white/60 text-sm flex items-center justify-center gap-2"
                >
                  <History size={16} />
                  Посмотреть последний результат
                </button>
              )}
            </motion.div>
          )}

          {/* 📝 SCORING */}
          {step === 'scoring' && currentArea && (
            <motion.div
              key={`scoring-${currentAreaIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-md mx-auto pt-4"
            >
              {/* Progress */}
              <div className="flex gap-1.5 mb-6">
                {LIFE_AREAS.map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-2 flex-1 rounded-full"
                    style={{
                      background: i < currentAreaIndex 
                        ? 'linear-gradient(90deg, #22c55e, #10b981)'
                        : i === currentAreaIndex 
                          ? currentArea.gradient
                          : 'rgba(255,255,255,0.1)',
                    }}
                    initial={i === currentAreaIndex ? { scaleX: 0 } : {}}
                    animate={i === currentAreaIndex ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              {/* iOS 26 LIQUID GLASS Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-[32px] overflow-hidden mb-6"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: `0 24px 64px ${currentArea.color}30`,
                }}
              >
                {/* Header with gradient */}
                <div 
                  className="p-6 pb-8"
                  style={{ background: currentArea.gradient }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      <span className="text-5xl">{currentArea.emoji}</span>
                    </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">{currentArea.name}</h3>
                      <p className="text-white/80 text-sm">Как оцениваешь эту сферу?</p>
                    </div>
                  </div>
                </div>

                {/* Score Section */}
                <div className="p-6 -mt-4 rounded-t-[24px] bg-slate-900/80">
                  {/* Score Display */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <motion.div
                      key={currentScore}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-7xl font-black"
                      style={{ color: scoreDesc.color }}
                    >
                      {currentScore}
                    </motion.div>
                    <div className="text-left">
                      <div className="text-4xl mb-1">{scoreDesc.emoji}</div>
                      <div className="text-white/60 text-sm">{scoreDesc.label}</div>
                    </div>
                  </div>

                  {/* Score Buttons - iOS 26 style */}
                  <div className="grid grid-cols-10 gap-1.5 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                      <motion.button
                        key={v}
                        onClick={() => handleScoreChange(v)}
                        className="aspect-square rounded-xl font-bold text-sm transition-all"
                        style={{
                          background: currentScore === v 
                            ? currentArea.gradient 
                            : currentScore >= v 
                              ? `${currentArea.color}40`
                              : 'rgba(255,255,255,0.05)',
                          color: currentScore >= v ? 'white' : 'rgba(255,255,255,0.4)',
                          boxShadow: currentScore === v ? `0 4px 15px ${currentArea.color}50` : 'none',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {v}
                      </motion.button>
                    ))}
                  </div>

                  {/* Tip - liquid glass */}
                  <motion.button
                    onClick={() => setShowTip(!showTip)}
                    className="w-full p-4 rounded-2xl text-left flex items-center gap-3"
                    style={{
                      background: showTip ? `${currentArea.color}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${showTip ? currentArea.color + '40' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <Lightbulb size={20} className="text-amber-400 shrink-0" />
                    <span className="text-white/70 text-sm flex-1">
                      {showTip ? currentArea.tip : 'Нажми для совета 💡'}
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Next Button */}
              <motion.button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: currentArea.gradient,
                  boxShadow: `0 8px 32px ${currentArea.color}40`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentAreaIndex < LIFE_AREAS.length - 1 ? (
                  <>Далее <ChevronRight size={20} /></>
                ) : (
                  <>Показать результат <Sparkles size={20} /></>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* 📊 COMPARE - сравнение с предыдущим */}
          {step === 'compare' && comparison && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto pt-4"
            >
              <h2 className="text-2xl font-black text-white text-center mb-6">
                📈 Твой Прогресс
              </h2>
              
              {/* Comparison card */}
              <div 
                className="p-6 rounded-3xl mb-6"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-white/50 text-xs mb-1">Было</div>
                    <div className="text-3xl font-bold text-white/60">
                      {comparison.prevAvg.toFixed(1)}
                    </div>
                  </div>
                  
                  <ArrowRight size={24} className="text-white/30" />
                  
                  <div className="text-center">
                    <div className="text-white/50 text-xs mb-1">Стало</div>
                    <div className="text-4xl font-black text-white">
                      {comparison.currAvg.toFixed(1)}
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`text-center p-3 rounded-xl ${
                    comparison.diff > 0 ? 'bg-emerald-500/20' : 
                    comparison.diff < 0 ? 'bg-red-500/20' : 'bg-white/10'
                  }`}
                >
                  <span className="text-2xl mr-2">
                    {comparison.diff > 0 ? '🚀' : comparison.diff < 0 ? '📉' : '➡️'}
                  </span>
                  <span className={`font-bold ${
                    comparison.diff > 0 ? 'text-emerald-400' : 
                    comparison.diff < 0 ? 'text-red-400' : 'text-white/60'
                  }`}>
                    {comparison.diff > 0 ? '+' : ''}{comparison.diff.toFixed(1)} балла
                  </span>
                </div>
              </div>
              
              {/* Area changes */}
              <div className="space-y-2 mb-6">
                {comparison.areaChanges
                  .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
                  .map((area, i) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: area.diff !== 0 
                        ? `${area.diff > 0 ? '#22c55e' : '#ef4444'}15`
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <span className="text-2xl">{area.emoji}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{area.name}</div>
                      <div className="text-white/40 text-xs">
                        {area.prevScore} → {area.score}
                      </div>
                    </div>
                    {area.diff !== 0 && (
                      <div className={`flex items-center gap-1 ${
                        area.diff > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {area.diff > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="font-bold">
                          {area.diff > 0 ? '+' : ''}{area.diff}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Actions */}
              <motion.button
                onClick={() => setStep('result')}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check size={18} />
                Смотреть полный результат
              </motion.button>
            </motion.div>
          )}

          {/* 🎉 CELEBRATE - новый экран с XP и достижениями */}
          {step === 'celebrate' && (
            <motion.div
              key="celebrate"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto pt-8 text-center"
            >
              {/* Confetti effect */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                        left: `${Math.random() * 100}%`,
                        top: -20,
                      }}
                      animate={{
                        y: [0, window.innerHeight + 50],
                        x: [0, (Math.random() - 0.5) * 200],
                        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        delay: Math.random() * 0.5,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Animated emoji */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, type: "spring" }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black text-white mb-2"
              >
                Отлично!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/60 mb-8"
              >
                Ты оценил свой баланс
              </motion.p>

              {/* XP Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-3xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Zap size={32} className="text-amber-400" />
                  <span className="text-5xl font-black text-white">+{earnedXP}</span>
                  <span className="text-2xl text-white/60">XP</span>
                </div>
                
                {/* XP breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Заполнение колеса</span>
                    <span>+{XP_REWARDS.completeWheel}</span>
                  </div>
                  {history.length === 1 && (
                    <div className="flex justify-between text-amber-400">
                      <span>🎯 Первое колесо!</span>
                      <span>+{XP_REWARDS.firstWheel}</span>
                    </div>
                  )}
                  {scores.every(s => s.score >= 7) && (
                    <div className="flex justify-between text-emerald-400">
                      <span>⚖️ Идеальный баланс!</span>
                      <span>+{XP_REWARDS.perfectBalance}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl mb-6"
                style={{
                  background: 'rgba(251,146,60,0.15)',
                  border: '1px solid rgba(251,146,60,0.3)',
                }}
              >
                <Flame size={28} className="text-orange-400" />
                <div className="text-left">
                  <div className="text-white font-bold">{currentStreak + 1} дней подряд!</div>
                  <div className="text-white/50 text-xs">Продолжай каждую неделю</div>
                </div>
              </motion.div>

              {/* New Achievements */}
              {newAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3 mb-6"
                >
                  <div className="text-white/50 text-sm flex items-center justify-center gap-2">
                    <Trophy size={16} className="text-amber-400" />
                    Новые достижения
                  </div>
                  {newAchievements.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="p-4 rounded-2xl flex items-center gap-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.1) 100%)',
                        border: '1px solid rgba(251,191,36,0.3)',
                      }}
                    >
                      <span className="text-3xl">{a.emoji}</span>
                      <div className="text-left flex-1">
                        <div className="text-white font-bold">{a.name}</div>
                        <div className="text-white/50 text-xs">{a.description}</div>
                      </div>
                      <span className="text-amber-400 font-bold">+20 XP</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Katya Insight */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 rounded-2xl mb-6 text-left"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center shrink-0">
                    <span className="text-lg">👩‍🦰</span>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">Катя говорит:</div>
                    <p className="text-white text-sm">{katyaInsight}</p>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => setStep('result')}
                  className="flex-1 py-4 rounded-2xl font-bold text-white/70"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Подробнее
                </button>
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check size={18} />
                  Готово
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* 🏆 RESULT */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto pt-4"
            >
              <h2 className="text-2xl font-black text-white text-center mb-6">
                ✨ Твой Баланс
              </h2>

              {/* Wheel Visualization - iOS 26 style */}
              <div className="relative w-72 h-72 mx-auto mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Grid circles */}
                  {[2, 4, 6, 8, 10].map(r => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r * 7}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Filled polygon */}
                  <motion.polygon
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    points={scores.map((s, i) => {
                      const angle = (i * 360) / scores.length - 90;
                      const rad = (angle * Math.PI) / 180;
                      const r = s.score * 7;
                      return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
                    }).join(' ')}
                    fill="url(#wheelGradient)"
                    stroke="url(#wheelGradient)"
                    strokeWidth="2"
                  />
                  
                  {/* Lines and points */}
                  {scores.map((s, i) => {
                    const angle = (i * 360) / scores.length - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r = s.score * 7;
                    const x = 100 + r * Math.cos(rad);
                    const y = 100 + r * Math.sin(rad);
                    
                    return (
                      <g key={s.id}>
                        <line
                          x1="100"
                          y1="100"
                          x2={100 + 70 * Math.cos(rad)}
                          y2={100 + 70 * Math.sin(rad)}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="1"
                        />
                        <motion.circle
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                          cx={x}
                          cy={y}
                          r="10"
                          fill={s.color}
                          style={{ filter: `drop-shadow(0 0 10px ${s.color})` }}
                        />
                        <text
                          x={100 + 90 * Math.cos(rad)}
                          y={100 + 90 * Math.sin(rad)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-lg"
                        >
                          {s.emoji}
                        </text>
                      </g>
                    );
                  })}
                  
                  <defs>
                    <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Stats Cards - iOS 26 liquid glass */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  <div className="text-3xl font-black text-indigo-400">
                    {averageScore.toFixed(1)}
                  </div>
                  <div className="text-white/50 text-xs mt-1">Средний</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: `${strongestArea.color}20`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${strongestArea.color}40`,
                  }}
                >
                  <div className="text-3xl mb-1">{strongestArea.emoji}</div>
                  <div className="text-white/50 text-xs">Сила</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: `${weakestArea.color}20`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${weakestArea.color}40`,
                  }}
                >
                  <div className="text-3xl mb-1">{weakestArea.emoji}</div>
                  <div className="text-white/50 text-xs">Рост</div>
                </motion.div>
              </div>

              {/* All Scores */}
              <div className="space-y-2 mb-6">
                {[...scores].sort((a, b) => b.score - a.score).map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: s.gradient }}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{s.name}</div>
                      <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ background: s.gradient }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.score * 10}%` }}
                          transition={{ delay: 0.9 + i * 0.05 }}
                        />
                      </div>
                    </div>
                    <div 
                      className="text-xl font-bold"
                      style={{ color: s.color }}
                    >
                      {s.score}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Insight */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="p-4 rounded-2xl mb-6"
                style={{
                  background: `${weakestArea.color}15`,
                  border: `1px solid ${weakestArea.color}30`,
                }}
              >
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/80 text-sm mb-2">
                      <strong>{weakestArea.name}</strong> — твоя зона роста на эту неделю.
                    </p>
                    <p className="text-white/50 text-xs">
                      💡 {weakestArea.tip}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleReset}
                  className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw size={18} className="text-white/60" />
                  <span className="text-white/70">Заново</span>
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check size={18} />
                  Готово
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BalanceWheel;
