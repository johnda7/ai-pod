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

// Ambient звуки - спокойные, не раздражающие (loopable)
// 🚀 ОПТИМИЗАЦИЯ: уменьшены размеры изображений + качество для быстрой загрузки
const AMBIENT_SOUNDS = [
  { 
    id: 'none', 
    name: 'Тишина', 
    emoji: '🌙', 
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=120&h=120&fit=crop&q=50',
    bgImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=1200&fit=crop&q=40',
    gradient: 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.95) 100%)',
    audioUrl: '',
  },
  { 
    id: 'rain', 
    name: 'Дождь', 
    emoji: '🌧️', 
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=120&h=120&fit=crop&q=50',
    bgImage: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=800&h=1200&fit=crop&q=40',
    gradient: 'linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%)',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112094f.mp3',
  },
  { 
    id: 'forest', 
    name: 'Лес', 
    emoji: '🌲', 
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=120&h=120&fit=crop&q=50',
    bgImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=1200&fit=crop&q=40',
    gradient: 'linear-gradient(180deg, rgba(6,78,59,0.7) 0%, rgba(2,44,34,0.95) 100%)',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d72a5a1c34.mp3',
  },
  { 
    id: 'cafe', 
    name: 'Кафе', 
    emoji: '☕', 
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&h=120&fit=crop&q=50',
    bgImage: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=1200&fit=crop&q=40',
    gradient: 'linear-gradient(180deg, rgba(120,53,15,0.7) 0%, rgba(30,20,10,0.95) 100%)',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/10/30/audio_f8e58b2f50.mp3',
  },
  { 
    id: 'fire', 
    name: 'Камин', 
    emoji: '🔥', 
    image: 'https://images.unsplash.com/photo-1517329782449-810562a4ec2f?w=120&h=120&fit=crop&q=50',
    bgImage: 'https://images.unsplash.com/photo-1475552113915-6fcb52652ba2?w=800&h=1200&fit=crop&q=40',
    gradient: 'linear-gradient(180deg, rgba(154,52,18,0.6) 0%, rgba(30,15,10,0.95) 100%)',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/02/23/audio_ea70ad08e0.mp3',
  },
];

// Tree stages based on progress
const TREE_STAGES = [
  { min: 0, emoji: '🌱', label: 'Росток', color: '#86efac' },
  { min: 25, emoji: '🌿', label: 'Побег', color: '#4ade80' },
  { min: 50, emoji: '🪴', label: 'Растение', color: '#22c55e' },
  { min: 75, emoji: '🌳', label: 'Деревце', color: '#16a34a' },
  { min: 100, emoji: '🌲', label: 'Дерево!', color: '#15803d' },
];

// Animated Tree Component
const AnimatedTree: React.FC<{ growth: number; isRunning: boolean }> = ({ growth, isRunning }) => {
  const trunkHeight = Math.min(growth * 0.8, 60);
  const crownSize = Math.max(0, (growth - 20) * 1.2);
  const leafCount = Math.floor(growth / 10);
  
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        {/* Gradients */}
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="50%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id="crownGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="70%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Ground */}
      <ellipse 
        cx="100" 
        cy="180" 
        rx={30 + growth * 0.3} 
        ry="8" 
        fill="rgba(34,197,94,0.2)"
      />
      
      {/* Trunk */}
      <motion.rect
        x="92"
        y={180 - trunkHeight}
        width="16"
        rx="3"
        fill="url(#trunkGradient)"
        initial={{ height: 0 }}
        animate={{ height: trunkHeight }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      
      {/* Branches - appear at 30%+ */}
      {growth >= 30 && (
        <>
          <motion.path
            d={`M100,${160 - trunkHeight * 0.3} Q85,${150 - trunkHeight * 0.3} 75,${145 - trunkHeight * 0.3}`}
            stroke="#78350f"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d={`M100,${160 - trunkHeight * 0.3} Q115,${150 - trunkHeight * 0.3} 125,${145 - trunkHeight * 0.3}`}
            stroke="#78350f"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        </>
      )}
      
      {/* Crown - grows from 20%+ */}
      {growth >= 20 && (
        <motion.g filter={isRunning ? "url(#glow)" : undefined}>
          {/* Main crown */}
          <motion.ellipse
            cx="100"
            cy={140 - trunkHeight * 0.4}
            fill="url(#crownGradient)"
            initial={{ rx: 0, ry: 0 }}
            animate={{ 
              rx: Math.min(crownSize * 0.7, 45),
              ry: Math.min(crownSize * 0.6, 40),
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Crown layers for depth */}
          {growth >= 40 && (
            <motion.ellipse
              cx="85"
              cy={135 - trunkHeight * 0.4}
              fill="#22c55e"
              initial={{ rx: 0, ry: 0 }}
              animate={{ 
                rx: Math.min(crownSize * 0.4, 25),
                ry: Math.min(crownSize * 0.35, 22),
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          )}
          
          {growth >= 50 && (
            <motion.ellipse
              cx="115"
              cy={135 - trunkHeight * 0.4}
              fill="#22c55e"
              initial={{ rx: 0, ry: 0 }}
              animate={{ 
                rx: Math.min(crownSize * 0.4, 25),
                ry: Math.min(crownSize * 0.35, 22),
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          )}
          
          {growth >= 60 && (
            <motion.ellipse
              cx="100"
              cy={120 - trunkHeight * 0.4}
              fill="#4ade80"
              initial={{ rx: 0, ry: 0 }}
              animate={{ 
                rx: Math.min(crownSize * 0.35, 20),
                ry: Math.min(crownSize * 0.3, 18),
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          )}
        </motion.g>
      )}
      
      {/* Floating leaves animation - ОПТИМИЗАЦИЯ: максимум 3 листа */}
      {isRunning && growth >= 40 && [...Array(Math.min(leafCount, 3))].map((_, i) => (
        <motion.text
          key={i}
          fontSize="10"
          initial={{ 
            x: 100, 
            y: 130 - trunkHeight * 0.4,
            opacity: 0,
          }}
          animate={{ 
            x: 100 + Math.sin(i * 2) * 30,
            y: [130 - trunkHeight * 0.4, 130 - trunkHeight * 0.4 - 20, 130 - trunkHeight * 0.4],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeInOut",
          }}
        >
          🍃
        </motion.text>
      ))}
      
      {/* Sparkles when complete - ОПТИМИЗАЦИЯ: 4 вместо 6 */}
      {growth >= 100 && [...Array(4)].map((_, i) => (
        <motion.text
          key={`sparkle-${i}`}
          fontSize="12"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0.8, 1, 0.8],
            x: 100 + Math.cos(i * Math.PI / 2) * 40,
            y: 100 + Math.sin(i * Math.PI / 2) * 40,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          ✨
        </motion.text>
      ))}
      
      {/* Seed/Sprout at start */}
      {growth < 10 && (
        <motion.text
          x="92"
          y="178"
          fontSize="20"
          animate={{ 
            y: [178, 175, 178],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🌱
        </motion.text>
      )}
    </svg>
  );
};

export const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose, onComplete }) => {
  const [selectedDuration, setSelectedDuration] = useState(FOCUS_DURATIONS[1]);
  const [timeLeft, setTimeLeft] = useState(selectedDuration.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS[0]);
  const [treeGrowth, setTreeGrowth] = useState(0);
  const [streak, setStreak] = useState(0);
  const [volume, setVolume] = useState(0.3); // Тихий фоновый звук
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Управление ambient звуками
  useEffect(() => {
    // Остановить предыдущий звук
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Запустить новый звук если есть URL и таймер запущен
    if (selectedSound.audioUrl && isRunning) {
      const audio = new Audio(selectedSound.audioUrl);
      audio.loop = true;
      audio.volume = volume;
      audio.play().catch(() => {
        // Игнорируем ошибки autoplay (требуется взаимодействие пользователя)
      });
      audioRef.current = audio;
    }

    // Cleanup при размонтировании
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSound, isRunning, volume]);

  // Остановить звук при закрытии
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [isOpen]);

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
        {/* Dynamic Background based on selected sound - pointer-events-none! */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Background Image - changes with selected sound */}
          <motion.div
            key={selectedSound.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img 
              src={selectedSound.bgImage}
              alt={selectedSound.name}
              className="w-full h-full object-cover"
              style={{ 
                filter: isComplete 
                  ? 'brightness(0.5) saturate(1.3)' 
                  : isRunning 
                    ? `brightness(${0.25 + treeGrowth / 400}) saturate(1.2)` 
                    : 'brightness(0.35) saturate(1.1)',
              }}
            />
          </motion.div>
          
          {/* Gradient overlay */}
          <motion.div 
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background: selectedSound.gradient,
            }}
          />
          
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

          {/* Floating leaves when running - ОПТИМИЗАЦИЯ: уменьшено с 8 до 4 */}
          {isRunning && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  style={{
                    left: `${15 + i * 20}%`,
                    willChange: 'transform, opacity',
                  }}
                  initial={{ y: -30, rotate: 0, opacity: 0 }}
                  animate={{
                    y: ['0vh', '100vh'],
                    rotate: [0, 180],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    delay: i * 2.5,
                    ease: "linear",
                  }}
                >
                  🍃
                </motion.div>
              ))}
            </div>
          )}

          {/* Stars - ОПТИМИЗАЦИЯ: уменьшено с 25 до 12, статические позиции */}
          {!isRunning && (
            <div className="absolute inset-0 pointer-events-none">
              {[15, 25, 35, 45, 55, 65, 75, 85, 20, 40, 60, 80].map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${pos}%`,
                    top: `${10 + (i % 4) * 15}%`,
                    opacity: 0.4,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '3s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Header - MORE PADDING FOR TELEGRAM */}
        <div className="sticky top-0 z-30 px-4 pt-4 pb-4">
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
                  
                  {/* Center content - Animated Tree */}
                  <div className="absolute inset-4 flex flex-col items-center justify-center">
                    <div className="w-28 h-28">
                      <AnimatedTree growth={treeGrowth} isRunning={isRunning} />
                    </div>
                    <motion.span 
                      key={treeStage.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white/60 text-xs font-medium mt-1"
                      style={{ color: treeStage.color }}
                    >
                      {treeStage.label}
                    </motion.span>
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
                  className="flex gap-3 mb-8"
                >
                  {AMBIENT_SOUNDS.map((sound) => (
                    <motion.button
                      key={sound.id}
                      onClick={() => setSelectedSound(sound)}
                      className="w-16 h-16 rounded-2xl overflow-hidden relative transition-all"
                      style={{
                        border: selectedSound.id === sound.id 
                          ? '3px solid rgba(34,197,94,0.9)' 
                          : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: selectedSound.id === sound.id 
                          ? '0 8px 25px rgba(34,197,94,0.4), inset 0 0 20px rgba(34,197,94,0.2)' 
                          : '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img 
                        src={sound.image}
                        alt={sound.name}
                        className="w-full h-full object-cover"
                        style={{
                          filter: selectedSound.id === sound.id 
                            ? 'brightness(1.1) saturate(1.2)' 
                            : 'brightness(0.8)',
                        }}
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center transition-all"
                        style={{
                          background: selectedSound.id === sound.id 
                            ? 'linear-gradient(180deg, rgba(34,197,94,0.2) 0%, rgba(0,0,0,0.4) 100%)'
                            : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)',
                        }}
                      >
                        <span className="text-2xl drop-shadow-lg">{sound.emoji}</span>
                      </div>
                      {selectedSound.id === sound.id && (
                        <motion.div 
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            border: '2px solid rgba(34,197,94,0.5)',
                            boxShadow: 'inset 0 0 15px rgba(34,197,94,0.3)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                    </motion.button>
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
              {/* Celebration - Full grown tree */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative mb-6 w-40 h-40"
              >
                <AnimatedTree growth={100} isRunning={false} />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [0, 1.2, 1], rotate: [0, 20, 0] }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles size={32} className="text-yellow-400" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -left-2"
                  animate={{ scale: [0, 1.2, 1], rotate: [0, -20, 0] }}
                  transition={{ delay: 0.7 }}
                >
                  <Trophy size={28} className="text-yellow-400" />
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
