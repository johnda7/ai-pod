import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Zap, Clock, Brain, Trophy, Star, Flame, Gift, 
  Coins, ChevronRight, Lock, Play, RefreshCw, Crown,
  Smartphone, Bell, Gamepad2, BookOpen, Sparkles, Heart
} from 'lucide-react';
import { supabase, isSupabaseEnabled } from '../services/supabaseClient';

// ============= ТИПЫ =============

interface GameConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  levels: GameLevel[];
}

interface GameLevel {
  level: number;
  name: string;
  targetScore: number;
  duration: number;
  spawnRate: number;
  rewards: {
    xp: number;
    coins: number;
    bonus?: string; // Специальный бонус
  };
  unlockRequirement?: number; // Нужно пройти предыдущий уровень с таким счётом
}

interface GameResult {
  gameId: string;
  level: number;
  score: number;
  maxCombo: number;
  perfectRounds: number;
  timestamp: Date;
}

interface GameSystemProps {
  userId: string;
  onReward: (xp: number, coins: number, bonus?: string) => void;
  onClose: () => void;
}

// ============= КОНФИГУРАЦИЯ ИГР =============

const GAMES: GameConfig[] = [
  {
    id: 'focus_defender',
    name: 'Охотник за Отвлечениями',
    description: 'Кликай по красным, избегай зелёных!',
    icon: <Target size={32} />,
    color: 'from-rose-500 to-orange-500',
    levels: [
      { level: 1, name: 'Новичок', targetScore: 8, duration: 30, spawnRate: 1500, rewards: { xp: 30, coins: 15 } },
      { level: 2, name: 'Ученик', targetScore: 15, duration: 30, spawnRate: 1200, rewards: { xp: 50, coins: 25 }, unlockRequirement: 8 },
      { level: 3, name: 'Мастер', targetScore: 25, duration: 30, spawnRate: 900, rewards: { xp: 80, coins: 40, bonus: 'streak_freeze' }, unlockRequirement: 15 },
      { level: 4, name: 'Легенда', targetScore: 40, duration: 30, spawnRate: 700, rewards: { xp: 120, coins: 60, bonus: 'mystery_box' }, unlockRequirement: 25 },
    ]
  },
  {
    id: 'memory_match',
    name: 'Нейро-Матч',
    description: 'Найди все пары карточек!',
    icon: <Brain size={32} />,
    color: 'from-indigo-500 to-purple-500',
    levels: [
      { level: 1, name: 'Новичок', targetScore: 4, duration: 60, spawnRate: 0, rewards: { xp: 25, coins: 12 } }, // 4 пары
      { level: 2, name: 'Ученик', targetScore: 6, duration: 60, spawnRate: 0, rewards: { xp: 45, coins: 22 }, unlockRequirement: 4 },
      { level: 3, name: 'Мастер', targetScore: 8, duration: 45, spawnRate: 0, rewards: { xp: 70, coins: 35, bonus: 'hp_potion' }, unlockRequirement: 6 },
      { level: 4, name: 'Легенда', targetScore: 10, duration: 40, spawnRate: 0, rewards: { xp: 100, coins: 50, bonus: 'mystery_box' }, unlockRequirement: 8 },
    ]
  },
  {
    id: 'reaction_time',
    name: 'Молниеносная Реакция',
    description: 'Кликай как можно быстрее!',
    icon: <Zap size={32} />,
    color: 'from-yellow-500 to-amber-500',
    levels: [
      { level: 1, name: 'Новичок', targetScore: 5, duration: 30, spawnRate: 2000, rewards: { xp: 20, coins: 10 } },
      { level: 2, name: 'Ученик', targetScore: 8, duration: 25, spawnRate: 1500, rewards: { xp: 40, coins: 20 }, unlockRequirement: 5 },
      { level: 3, name: 'Мастер', targetScore: 12, duration: 20, spawnRate: 1200, rewards: { xp: 65, coins: 32, bonus: 'streak_freeze' }, unlockRequirement: 8 },
      { level: 4, name: 'Легенда', targetScore: 18, duration: 20, spawnRate: 900, rewards: { xp: 100, coins: 50, bonus: 'mystery_box' }, unlockRequirement: 12 },
    ]
  },
];

// ============= ГЛАВНЫЙ КОМПОНЕНТ =============

export const GameSystem: React.FC<GameSystemProps> = ({ userId, onReward, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [gameResults, setGameResults] = useState<Record<string, number[]>>({}); // gameId -> bestScores per level
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReward, setShowReward] = useState<{ xp: number; coins: number; bonus?: string } | null>(null);

  // Загрузка результатов из Supabase
  useEffect(() => {
    loadGameResults();
  }, [userId]);

  const loadGameResults = async () => {
    if (!isSupabaseEnabled()) {
      // Загрузка из localStorage
      const saved = localStorage.getItem(`game_results_${userId}`);
      if (saved) {
        setGameResults(JSON.parse(saved));
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('game_id, level, best_score')
        .eq('user_id', userId);

      if (error) throw error;

      const results: Record<string, number[]> = {};
      data?.forEach(r => {
        if (!results[r.game_id]) results[r.game_id] = [];
        results[r.game_id][r.level - 1] = r.best_score;
      });
      setGameResults(results);
    } catch (err) {
      console.error('Error loading game results:', err);
      // Fallback to localStorage
      const saved = localStorage.getItem(`game_results_${userId}`);
      if (saved) setGameResults(JSON.parse(saved));
    }
  };

  const saveGameResult = async (gameId: string, level: number, score: number) => {
    const currentBest = gameResults[gameId]?.[level - 1] || 0;
    if (score <= currentBest) return; // Не сохраняем если не побили рекорд

    // Обновляем локальное состояние
    const newResults = { ...gameResults };
    if (!newResults[gameId]) newResults[gameId] = [];
    newResults[gameId][level - 1] = score;
    setGameResults(newResults);

    // Сохраняем в localStorage
    localStorage.setItem(`game_results_${userId}`, JSON.stringify(newResults));

    // Сохраняем в Supabase
    if (isSupabaseEnabled()) {
      try {
        await supabase.from('game_results').upsert({
          user_id: userId,
          game_id: gameId,
          level: level,
          best_score: score,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,game_id,level' });
      } catch (err) {
        console.error('Error saving game result:', err);
      }
    }
  };

  const isLevelUnlocked = (game: GameConfig, level: GameLevel): boolean => {
    if (level.level === 1) return true;
    const prevLevel = game.levels[level.level - 2];
    const prevBest = gameResults[game.id]?.[level.level - 2] || 0;
    return prevBest >= (level.unlockRequirement || prevLevel.targetScore);
  };

  const handleGameComplete = (score: number) => {
    if (!selectedGame || !selectedLevel) return;

    saveGameResult(selectedGame.id, selectedLevel.level, score);

    // Проверяем победу
    if (score >= selectedLevel.targetScore) {
      const rewards = selectedLevel.rewards;
      setShowReward(rewards);
      onReward(rewards.xp, rewards.coins, rewards.bonus);
    }

    setIsPlaying(false);
  };

  // ============= РЕНДЕР ВЫБОРА ИГРЫ =============

  if (!selectedGame) {
    return (
      <div className="min-h-screen bg-[#020617] p-4 pb-32">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <Gamepad2 size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">Мини-Игры</h1>
            <p className="text-slate-400">Тренируй мозг и зарабатывай награды!</p>
          </div>

          {/* Games Grid */}
          <div className="space-y-4">
            {GAMES.map((game, idx) => {
              const bestScores = gameResults[game.id] || [];
              const completedLevels = bestScores.filter((s, i) => s >= game.levels[i].targetScore).length;
              const totalStars = bestScores.reduce((acc, score, i) => {
                const target = game.levels[i]?.targetScore || 0;
                if (score >= target * 1.5) return acc + 3;
                if (score >= target * 1.2) return acc + 2;
                if (score >= target) return acc + 1;
                return acc;
              }, 0);

              return (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedGame(game)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 flex items-center gap-4 transition-all group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {game.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-white">{game.name}</h3>
                    <p className="text-slate-400 text-sm">{game.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-indigo-400 font-bold">
                        {completedLevels}/{game.levels.length} уровней
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400 text-xs">
                        <Star size={12} fill="currentColor" /> {totalStars}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                </motion.button>
              );
            })}
          </div>

          {/* Daily Challenge Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-3xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center">
                <Trophy size={28} className="text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Ежедневный челлендж</h3>
                <p className="text-yellow-200/80 text-sm">Пройди все игры на 3 звезды!</p>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold flex items-center gap-1">
                  <Coins size={16} /> +100
                </div>
                <div className="text-yellow-300/60 text-xs">награда</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============= РЕНДЕР ВЫБОРА УРОВНЯ =============

  if (!selectedLevel && !isPlaying) {
    return (
      <div className="min-h-screen bg-[#020617] p-4 pb-32">
        <div className="max-w-md mx-auto pt-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Назад к играм
          </button>

          {/* Game Header */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${selectedGame.color} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
              {selectedGame.icon}
            </div>
            <h1 className="text-2xl font-black text-white mb-2">{selectedGame.name}</h1>
            <p className="text-slate-400">{selectedGame.description}</p>
          </div>

          {/* Levels */}
          <div className="space-y-3">
            {selectedGame.levels.map((level, idx) => {
              const isUnlocked = isLevelUnlocked(selectedGame, level);
              const bestScore = gameResults[selectedGame.id]?.[idx] || 0;
              const stars = bestScore >= level.targetScore * 1.5 ? 3 
                         : bestScore >= level.targetScore * 1.2 ? 2 
                         : bestScore >= level.targetScore ? 1 : 0;

              return (
                <motion.button
                  key={level.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => isUnlocked && setSelectedLevel(level)}
                  disabled={!isUnlocked}
                  className={`w-full p-4 rounded-2xl border transition-all ${
                    isUnlocked 
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 cursor-pointer' 
                      : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Level Number */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                      isUnlocked 
                        ? `bg-gradient-to-br ${selectedGame.color} text-white` 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isUnlocked ? level.level : <Lock size={20} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{level.name}</span>
                        {level.rewards.bonus && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                            <Gift size={10} className="inline mr-1" />
                            Бонус!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>🎯 {level.targetScore} очков</span>
                        <span>⏱️ {level.duration}с</span>
                      </div>
                    </div>

                    {/* Stars & Rewards */}
                    <div className="text-right">
                      <div className="flex gap-0.5 justify-end mb-1">
                        {[1, 2, 3].map(s => (
                          <Star 
                            key={s} 
                            size={16} 
                            className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} 
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-500">
                        {bestScore > 0 && <span>Рекорд: {bestScore}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Rewards Preview */}
                  {isUnlocked && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-indigo-400">
                        <Zap size={12} /> +{level.rewards.xp} ОП
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Coins size={12} /> +{level.rewards.coins}
                      </span>
                      {level.rewards.bonus && (
                        <span className="flex items-center gap-1 text-pink-400">
                          <Gift size={12} /> {level.rewards.bonus === 'mystery_box' ? 'Сюрприз!' : level.rewards.bonus === 'streak_freeze' ? 'Заморозка' : 'HP'}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============= РЕНДЕР ИГРЫ =============

  if (selectedLevel && !isPlaying && !showReward) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#151925] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center"
        >
          <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${selectedGame.color} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
            {selectedGame.icon}
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            Уровень {selectedLevel.level}: {selectedLevel.name}
          </h2>

          <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Цель:</span>
              <span className="text-white font-bold">{selectedLevel.targetScore} очков</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Время:</span>
              <span className="text-white font-bold">{selectedLevel.duration} секунд</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Награда:</span>
              <span className="text-yellow-400 font-bold">
                +{selectedLevel.rewards.xp} XP, +{selectedLevel.rewards.coins} 💰
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsPlaying(true)}
              className={`w-full py-4 bg-gradient-to-r ${selectedGame.color} text-white font-black rounded-2xl uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform`}
            >
              <Play size={20} className="inline mr-2" fill="white" />
              Начать!
            </button>
            <button
              onClick={() => setSelectedLevel(null)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-colors"
            >
              Назад
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============= РЕНДЕР НАГРАДЫ =============

  if (showReward) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="bg-[#151925] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-7xl mb-6"
          >
            🎉
          </motion.div>

          <h2 className="text-3xl font-black text-white mb-2">Победа!</h2>
          <p className="text-slate-400 mb-6">Ты прошёл уровень!</p>

          <div className="space-y-3 mb-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-indigo-500/20 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-indigo-300 font-bold flex items-center gap-2">
                <Zap size={20} /> Опыт
              </span>
              <span className="text-2xl font-black text-white">+{showReward.xp}</span>
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-yellow-300 font-bold flex items-center gap-2">
                <Coins size={20} /> Монеты
              </span>
              <span className="text-2xl font-black text-white">+{showReward.coins}</span>
            </motion.div>

            {showReward.bonus && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-pink-500/20 border border-pink-500/30 rounded-2xl p-4 flex items-center justify-between"
              >
                <span className="text-pink-300 font-bold flex items-center gap-2">
                  <Gift size={20} /> Бонус
                </span>
                <span className="text-lg font-black text-white">
                  {showReward.bonus === 'mystery_box' ? '🎁 Сюрприз!' 
                   : showReward.bonus === 'streak_freeze' ? '❄️ Заморозка' 
                   : '❤️ +1 HP'}
                </span>
              </motion.div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setShowReward(null);
                setIsPlaying(true);
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Играть снова
            </button>
            <button
              onClick={() => {
                setShowReward(null);
                setSelectedLevel(null);
              }}
              className={`w-full py-4 bg-gradient-to-r ${selectedGame?.color} text-white font-black rounded-2xl uppercase tracking-wider`}
            >
              Продолжить
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============= РЕНДЕР АКТИВНОЙ ИГРЫ =============

  if (isPlaying && selectedGame && selectedLevel) {
    return (
      <FocusDefenderGame
        level={selectedLevel}
        gameColor={selectedGame.color}
        onComplete={handleGameComplete}
        onQuit={() => {
          setIsPlaying(false);
          setSelectedLevel(null);
        }}
      />
    );
  }

  return null;
};

// ============= ИГРА: FOCUS DEFENDER =============

interface FocusDefenderGameProps {
  level: GameLevel;
  gameColor: string;
  onComplete: (score: number) => void;
  onQuit: () => void;
}

const FocusDefenderGame: React.FC<FocusDefenderGameProps> = ({ level, gameColor, onComplete, onQuit }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.duration);
  const [targets, setTargets] = useState<{id: number, x: number, y: number, type: 'DISTRACTION' | 'FOCUS', iconIdx: number}[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  
  const targetIdCounter = useRef(Date.now());

  // Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    if (timeLeft <= 0) {
      if (score >= level.targetScore) {
        setGameState('WON');
        setTimeout(() => onComplete(score), 1500);
      } else {
        setGameState('LOST');
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, level.targetScore, onComplete]);

  // Spawner
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const spawner = setInterval(() => {
      setTargets(prev => {
        if (prev.length >= 5) return prev;

        const isDistraction = Math.random() > 0.25; // 75% красных
        const newTarget = {
          id: targetIdCounter.current++,
          x: Math.random() * 70 + 15,
          y: Math.random() * 50 + 25,
          type: isDistraction ? 'DISTRACTION' : 'FOCUS' as 'DISTRACTION' | 'FOCUS',
          iconIdx: Math.floor(Math.random() * 3),
        };
        return [...prev, newTarget];
      });
    }, level.spawnRate);

    return () => clearInterval(spawner);
  }, [gameState, level.spawnRate]);

  // Auto-remove old targets
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    const cleanup = setInterval(() => {
      setTargets(prev => prev.slice(-6)); // Keep only last 6
    }, 3000);
    
    return () => clearInterval(cleanup);
  }, [gameState]);

  const handleTargetClick = (id: number, type: 'DISTRACTION' | 'FOCUS') => {
    if (type === 'DISTRACTION') {
      const comboBonus = Math.min(combo, 5);
      setScore(s => s + 1 + comboBonus);
      setCombo(c => {
        const newCombo = c + 1;
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        return newCombo;
      });
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 400);
    } else {
      setScore(s => Math.max(0, s - 1));
      setCombo(0);
    }
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const getTargetIcon = (type: 'DISTRACTION' | 'FOCUS', idx: number) => {
    if (type === 'DISTRACTION') {
      const icons = [<Smartphone key="p" size={24} />, <Bell key="b" size={24} />, <Gamepad2 key="g" size={24} />];
      return icons[idx % icons.length];
    } else {
      const icons = [<Brain key="br" size={24} />, <BookOpen key="bo" size={24} />, <Zap key="z" size={24} />];
      return icons[idx % icons.length];
    }
  };

  // WIN/LOSE screens
  if (gameState === 'WON') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-white mb-2">Отлично!</h2>
          <p className="text-emerald-400 font-bold">Счёт: {score} | Макс комбо: {maxCombo}</p>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'LOST') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center bg-[#151925] rounded-3xl p-8 max-w-sm w-full"
        >
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-black text-white mb-2">Почти!</h2>
          <p className="text-slate-400 mb-4">Счёт: {score} / {level.targetScore}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setScore(0);
                setCombo(0);
                setMaxCombo(0);
                setTimeLeft(level.duration);
                setTargets([]);
                setGameState('PLAYING');
              }}
              className={`w-full py-4 bg-gradient-to-r ${gameColor} text-white font-black rounded-2xl`}
            >
              Ещё раз!
            </button>
            <button
              onClick={onQuit}
              className="w-full py-3 bg-white/10 text-white font-bold rounded-2xl"
            >
              Выйти
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="min-h-screen bg-[#050B14] relative overflow-hidden select-none touch-none">
      {/* Grid BG */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Combo Popup */}
      <AnimatePresence>
        {showCombo && combo > 1 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
              🔥 x{combo}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30">
        <div className="flex justify-between items-center">
          {/* Score */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
            <div className="text-xs text-slate-400">Счёт</div>
            <div className="text-2xl font-black text-white">{score}<span className="text-slate-500 text-sm">/{level.targetScore}</span></div>
          </div>

          {/* Timer */}
          <div className={`bg-black/50 backdrop-blur-md rounded-2xl px-4 py-2 border ${timeLeft <= 10 ? 'border-red-500 animate-pulse' : 'border-white/10'}`}>
            <div className="text-xs text-slate-400">Время</div>
            <div className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>{timeLeft}с</div>
          </div>

          {/* Quit */}
          <button
            onClick={onQuit}
            className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${gameColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (score / level.targetScore) * 100)}%` }}
          />
        </div>
      </div>

      {/* Game Area */}
      <div className="absolute inset-0 pt-28 pb-20">
        {targets.map(target => (
          <motion.button
            key={target.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => handleTargetClick(target.id, target.type)}
            className={`absolute w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              target.type === 'DISTRACTION'
                ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/40'
                : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/20 opacity-70'
            }`}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {getTargetIcon(target.type, target.iconIdx)}
          </motion.button>
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-4 bg-black/50 backdrop-blur-md rounded-full px-6 py-2 border border-white/10">
          <span className="flex items-center gap-2 text-rose-400 text-sm font-bold">
            <div className="w-4 h-4 bg-rose-500 rounded" /> Кликай!
          </span>
          <span className="flex items-center gap-2 text-emerald-400/60 text-sm font-bold">
            <div className="w-4 h-4 bg-emerald-600 rounded opacity-60" /> Не трогай
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameSystem;



