import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Zap, Trophy, Flame, TreePine, Leaf, Sparkles } from 'lucide-react';

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
  { id: 'none', name: 'Тишина', emoji: '🔇', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop' },
  { id: 'rain', name: 'Дождь', emoji: '🌧️', image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=100&h=100&fit=crop' },
  { id: 'forest', name: 'Лес', emoji: '🌲', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=100&h=100&fit=crop' },
  { id: 'cafe', name: 'Кафе', emoji: '☕', image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=100&h=100&fit=crop' },
  { id: 'fire', name: 'Камин', emoji: '🔥', image: 'https://images.unsplash.com/photo-1475552113915-6fcb52652ba2?w=100&h=100&fit=crop' },
];

// Tree stages based on progress
const TREE_STAGES = [
  { min: 0, emoji: '🌱', label: 'Росток' },
  { min: 25, emoji: '🌿', label: 'Побег' },
  { min: 50, emoji: '🪴', label: 'Растение' },
  { min: 75, emoji: '🌳', label: 'Деревце' },
  { min: 100, emoji: '🌲', label: 'Дерево!' },
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
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('focus_streak', JSON.stringify({
      streak: newStreak,
      lastDate: new Date().toDateString(),
    }));
    
    const bonusMultiplier = 1 + (newStreak * 0.1);
    const finalXp = Math.round(selectedDuration.xp * bonusMultiplier);
    const finalCoins = Math.round(selectedDuration.coins * bonusMultiplier);
    
    onComplete(finalXp, finalCoins, selectedDuration.minutes);
  };

  const handleGiveUp = () => {
    setIsRunning(false);
    setTreeGrowth(0);
    setTimeLeft(selectedDuration.minutes * 60);
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

  const getCurrentTreeStage = () => {
    return [...TREE_STAGES].reverse().find(s => treeGrowth >= s.min) || TREE_STAGES[0];
  };

  const treeStage = getCurrentTreeStage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        {/* Beautiful Forest Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div 
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background: isComplete 
                ? 'linear-gradient(180deg, #064e3b 0%, #022c22 50%, #0a0a1a 100%)'
                : isRunning
                  ? `linear-gradient(180deg, #0a1a0f 0%, #0f2518 ${Math.min(treeGrowth, 50)}%, #0a0a1a 100%)`
                  : 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)',
            }}
          />
          
          {/* Forest image overlay when growing */}
          {(isRunning || isComplete) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: treeGrowth / 200 + 0.1 }}
              className="absolute inset-0"
            >
              <img 
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=1200&fit=crop"
                alt="Forest"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.3) saturate(1.2)' }}
              />
            </motion.div>
          )}
          
          {/* Aurora effects */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2"
            style={{
              background: isRunning 
                ? 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.2) 0%, transparent 60%)'
                : 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Floating leaves when running */}
          {isRunning && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                  }}
                  initial={{ y: -50, rotate: 0, opacity: 0 }}
                  animate={{
                    y: ['0vh', '100vh'],
                    rotate: [0, 360],
                    opacity: [0, 0.6, 0],
                    x: [0, Math.random() * 100 - 50],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: i * 1.5,
                    ease: "linear",
                  }}
                >
                  🍃
                </motion.div>
              ))}
            </div>
          )}

          {/* Stars */}
          {!isRunning && (
            <div className="absolute inset-0">
              {[...Array(25)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                    opacity: 0.3 + Math.random() * 0.4,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-14 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl overflow-hidden relative"
                style={{
                  boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=100&h=100&fit=crop"
                  alt="Tree"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-600/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TreePine size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Режим Фокуса</h1>
                <p className="text-white/50 text-xs">Вырасти дерево концентрации</p>
              </div>
            </div>
            
            {!isRunning && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <X size={20} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 h-[calc(100vh-200px)]">
          {!isComplete ? (
            <>
              {/* Tree Visualization */}
              <motion.div
                animate={{ 
                  scale: isRunning ? [1, 1.02, 1] : 1,
                }}
                transition={{ 
                  duration: 3,
                  repeat: isRunning ? Infinity : 0,
                }}
                className="relative mb-8"
              >
                {/* Progress ring */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={565.48}
                      strokeDashoffset={565.48 * (1 - treeGrowth / 100)}
                      style={{
                        filter: isRunning ? 'drop-shadow(0 0 10px rgba(34,197,94,0.5))' : 'none',
                      }}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      className="text-6xl mb-2"
                      key={treeStage.emoji}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {treeStage.emoji}
                    </motion.span>
                    <span className="text-white/50 text-xs">{treeStage.label}</span>
                  </div>
                </div>
                
                {/* Streak badge */}
                {streak > 0 && (
                  <motion.div 
                    className="absolute -top-2 -right-2 flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249,115,22,0.9) 0%, rgba(234,88,12,0.9) 100%)',
                      boxShadow: '0 4px 15px rgba(249,115,22,0.4)',
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame size={14} className="text-white" />
                    <span className="text-white text-sm font-bold">{streak}</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Timer */}
              <motion.div
                className="text-6xl font-black text-white mb-8 font-mono tracking-wider"
                animate={{ opacity: isRunning ? [1, 0.7, 1] : 1 }}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
              >
                {formatTime(timeLeft)}
              </motion.div>

              {/* Duration Selection */}
              {!isRunning && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 mb-6"
                >
                  {FOCUS_DURATIONS.map((duration) => (
                    <button
                      key={duration.minutes}
                      onClick={() => setSelectedDuration(duration)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: selectedDuration.minutes === duration.minutes
                          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                          : 'rgba(255,255,255,0.05)',
                        color: selectedDuration.minutes === duration.minutes ? 'white' : 'rgba(255,255,255,0.5)',
                        boxShadow: selectedDuration.minutes === duration.minutes 
                          ? '0 4px 15px rgba(34,197,94,0.4)' 
                          : 'none',
                      }}
                    >
                      {duration.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Sound Selection */}
              {!isRunning && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-2 mb-8"
                >
                  {AMBIENT_SOUNDS.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => setSelectedSound(sound)}
                      className="w-14 h-14 rounded-xl overflow-hidden relative transition-all"
                      style={{
                        border: selectedSound.id === sound.id 
                          ? '2px solid rgba(34,197,94,0.8)' 
                          : '2px solid transparent',
                        boxShadow: selectedSound.id === sound.id 
                          ? '0 4px 15px rgba(34,197,94,0.3)' 
                          : 'none',
                      }}
                    >
                      <img 
                        src={sound.image}
                        alt={sound.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-xl">{sound.emoji}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Controls */}
              <div className="flex gap-4">
                {isRunning ? (
                  <motion.button
                    onClick={handleGiveUp}
                    className="px-6 py-4 rounded-2xl font-bold text-white flex items-center gap-2"
                    style={{
                      background: 'rgba(239,68,68,0.2)',
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={20} />
                    Сдаться (дерево погибнет)
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => setIsRunning(true)}
                    className="px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play size={20} />
                    Начать фокус
                  </motion.button>
                )}
              </div>

              {/* Reward Preview */}
              {!isRunning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex items-center gap-4 text-sm"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 font-medium">+{selectedDuration.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10">
                    <span className="text-yellow-400">🪙</span>
                    <span className="text-yellow-400 font-medium">+{selectedDuration.coins}</span>
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-orange-400 font-medium">+{streak * 10}% бонус</span>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            /* Completion Screen */
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              {/* Celebration */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="relative inline-block mb-6"
              >
                <span className="text-8xl">🌲</span>
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{ scale: [0, 1.2, 1], rotate: [0, 20, 0] }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles size={32} className="text-yellow-400" />
                </motion.div>
              </motion.div>
              
              <h2 className="text-3xl font-black text-white mb-2">Дерево выросло!</h2>
              <p className="text-white/60 mb-6">{selectedDuration.minutes} минут чистого фокуса</p>
              
              {/* Rewards Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-3xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  boxShadow: '0 8px 32px rgba(34,197,94,0.2)',
                }}
              >
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <Zap size={24} className="text-yellow-400" />
                      <span className="text-3xl font-bold text-yellow-400">
                        +{Math.round(selectedDuration.xp * (1 + streak * 0.1))}
                      </span>
                    </div>
                    <span className="text-white/40 text-sm">XP</span>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <span className="text-2xl">🪙</span>
                      <span className="text-3xl font-bold text-yellow-400">
                        +{Math.round(selectedDuration.coins * (1 + streak * 0.1))}
                      </span>
                    </div>
                    <span className="text-white/40 text-sm">Монет</span>
                  </div>
                </div>
                
                {streak > 1 && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
                    <Flame size={20} className="text-orange-400" />
                    <span className="text-orange-400 font-bold text-lg">{streak} дней подряд!</span>
                  </div>
                )}
              </motion.div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    setIsComplete(false);
                    setTimeLeft(selectedDuration.minutes * 60);
                    setTreeGrowth(0);
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-white/70">Ещё раз</span>
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Готово
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FocusMode;
