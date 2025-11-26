import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Zap, Trophy, Flame, Volume2, VolumeX, TreePine } from 'lucide-react';

/**
 * FOCUS MODE
 * Inspired by Forest app - grow a tree while staying focused
 * Based on Pomodoro technique with gamification
 */

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number, coins: number, minutes: number) => void;
}

const FOCUS_DURATIONS = [
  { minutes: 15, label: '15 мин', xp: 15, coins: 5 },
  { minutes: 25, label: '25 мин', xp: 30, coins: 10 },
  { minutes: 45, label: '45 мин', xp: 60, coins: 25 },
  { minutes: 60, label: '1 час', xp: 100, coins: 40 },
];

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Тишина', emoji: '🔇' },
  { id: 'rain', name: 'Дождь', emoji: '🌧️' },
  { id: 'forest', name: 'Лес', emoji: '🌲' },
  { id: 'cafe', name: 'Кафе', emoji: '☕' },
  { id: 'fire', name: 'Камин', emoji: '🔥' },
];

export const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose, onComplete }) => {
  const [selectedDuration, setSelectedDuration] = useState(FOCUS_DURATIONS[1]);
  const [timeLeft, setTimeLeft] = useState(selectedDuration.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS[0]);
  const [treeGrowth, setTreeGrowth] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load streak
  useEffect(() => {
    const saved = localStorage.getItem('focus_streak');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.lastDate === today) {
        setStreak(data.streak);
      } else {
        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (data.lastDate === yesterday.toDateString()) {
          setStreak(data.streak);
        } else {
          setStreak(0);
        }
      }
    }
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        
        // Update tree growth
        const totalSeconds = selectedDuration.minutes * 60;
        const elapsed = totalSeconds - prev + 1;
        setTreeGrowth((elapsed / totalSeconds) * 100);
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedDuration]);

  // Reset when duration changes
  useEffect(() => {
    setTimeLeft(selectedDuration.minutes * 60);
    setTreeGrowth(0);
    setIsComplete(false);
  }, [selectedDuration]);

  const handleComplete = () => {
    setIsRunning(false);
    setIsComplete(true);
    setTreeGrowth(100);
    
    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('focus_streak', JSON.stringify({
      streak: newStreak,
      lastDate: new Date().toDateString(),
    }));
    
    // Award XP and coins
    const bonusMultiplier = 1 + (newStreak * 0.1); // 10% bonus per streak
    const finalXp = Math.round(selectedDuration.xp * bonusMultiplier);
    const finalCoins = Math.round(selectedDuration.coins * bonusMultiplier);
    
    onComplete(finalXp, finalCoins, selectedDuration.minutes);
  };

  const handleGiveUp = () => {
    setIsRunning(false);
    setTreeGrowth(0);
    setTimeLeft(selectedDuration.minutes * 60);
    // Tree dies - lose streak
    setStreak(0);
    localStorage.setItem('focus_streak', JSON.stringify({
      streak: 0,
      lastDate: new Date().toDateString(),
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTreeEmoji = () => {
    if (treeGrowth < 25) return '🌱';
    if (treeGrowth < 50) return '🌿';
    if (treeGrowth < 75) return '🌳';
    return '🌲';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden"
      >
        {/* Background - Dynamic based on tree growth */}
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: isComplete 
              ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
              : `linear-gradient(135deg, #0c1222 0%, #020617 ${100 - treeGrowth}%, #064e3b ${100}%)`,
          }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-14 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.2) 100%)',
                }}
              >
                <TreePine size={24} className="text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Режим Фокуса</h1>
                <p className="text-white/50 text-xs">Вырасти дерево концентрации</p>
              </div>
            </div>
            
            {!isRunning && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center px-4 h-[calc(100vh-200px)]">
          {!isComplete ? (
            <>
              {/* Tree Visualization */}
              <motion.div
                animate={{ 
                  scale: isRunning ? [1, 1.02, 1] : 1,
                }}
                transition={{ 
                  duration: 2,
                  repeat: isRunning ? Infinity : 0,
                }}
                className="relative mb-8"
              >
                <div 
                  className="w-40 h-40 rounded-full flex items-center justify-center relative"
                  style={{
                    background: `conic-gradient(
                      rgba(34,197,94,0.3) ${treeGrowth}%, 
                      rgba(255,255,255,0.05) ${treeGrowth}%
                    )`,
                    boxShadow: isRunning ? '0 0 60px rgba(34,197,94,0.3)' : 'none',
                  }}
                >
                  <div className="w-36 h-36 rounded-full bg-[#020617] flex items-center justify-center">
                    <motion.span 
                      className="text-7xl"
                      animate={{ 
                        scale: treeGrowth > 0 ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {getTreeEmoji()}
                    </motion.span>
                  </div>
                </div>
                
                {/* Streak indicator */}
                {streak > 0 && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-orange-400 text-xs font-bold">{streak}</span>
                  </div>
                )}
              </motion.div>

              {/* Timer */}
              <motion.div
                className="text-6xl font-black text-white mb-8 font-mono"
                animate={{ opacity: isRunning ? [1, 0.8, 1] : 1 }}
                transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
              >
                {formatTime(timeLeft)}
              </motion.div>

              {/* Duration Selection (only when not running) */}
              {!isRunning && (
                <div className="flex gap-2 mb-6">
                  {FOCUS_DURATIONS.map((duration) => (
                    <button
                      key={duration.minutes}
                      onClick={() => setSelectedDuration(duration)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedDuration.minutes === duration.minutes
                          ? 'bg-green-500 text-white'
                          : 'bg-white/5 text-white/50'
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Sound Selection (only when not running) */}
              {!isRunning && (
                <div className="flex gap-2 mb-8">
                  {AMBIENT_SOUNDS.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => setSelectedSound(sound)}
                      className={`w-12 h-12 rounded-xl text-xl transition-all ${
                        selectedSound.id === sound.id
                          ? 'bg-white/20 ring-2 ring-white/30'
                          : 'bg-white/5'
                      }`}
                    >
                      {sound.emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-4">
                {isRunning ? (
                  <button
                    onClick={handleGiveUp}
                    className="px-8 py-4 rounded-2xl font-bold text-white bg-red-500/20 border border-red-500/30 flex items-center gap-2"
                  >
                    <X size={20} />
                    Сдаться (дерево погибнет)
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRunning(true)}
                    className="px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
                    }}
                  >
                    <Play size={20} />
                    Начать фокус
                  </button>
                )}
              </div>

              {/* Reward Preview */}
              {!isRunning && (
                <div className="mt-6 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <Zap size={14} />
                    <span>+{selectedDuration.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <span>🪙</span>
                    <span>+{selectedDuration.coins}</span>
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 text-orange-400">
                      <Flame size={14} />
                      <span>+{streak * 10}% бонус</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Completion Screen */
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-8xl mb-6"
              >
                🌲
              </motion.div>
              
              <h2 className="text-3xl font-black text-white mb-2">Дерево выросло!</h2>
              <p className="text-white/60 mb-6">{selectedDuration.minutes} минут чистого фокуса</p>
              
              <div 
                className="p-6 rounded-3xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Zap size={20} className="text-yellow-400" />
                      <span className="text-2xl font-bold text-yellow-400">
                        +{Math.round(selectedDuration.xp * (1 + streak * 0.1))}
                      </span>
                    </div>
                    <span className="text-white/40 text-xs">XP</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="text-yellow-400 text-xl">🪙</span>
                      <span className="text-2xl font-bold text-yellow-400">
                        +{Math.round(selectedDuration.coins * (1 + streak * 0.1))}
                      </span>
                    </div>
                    <span className="text-white/40 text-xs">Монет</span>
                  </div>
                </div>
                
                {streak > 1 && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-orange-400 font-bold">{streak} дней подряд!</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsComplete(false);
                    setTimeLeft(selectedDuration.minutes * 60);
                    setTreeGrowth(0);
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-white/10"
                >
                  Ещё раз
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  }}
                >
                  Готово
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FocusMode;

