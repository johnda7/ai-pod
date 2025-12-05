import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, RotateCcw, Sparkles, TrendingUp, Award, Lightbulb, Cloud, CheckCircle } from 'lucide-react';
import { syncToolsDataToSupabase, loadToolsDataFromSupabase } from '../services/db';
import { getTelegramUser } from '../services/telegramService';

interface BalanceWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: AreaScore[]) => void;
}

interface AreaScore {
  id: string;
  name: string;
  emoji: string;
  score: number;
  color: string;
  image: string;
  tip: string;
}

// 🚀 ОПТИМИЗАЦИЯ: уменьшены размеры изображений + качество
const LIFE_AREAS: Omit<AreaScore, 'score'>[] = [
  { 
    id: 'study', 
    name: 'Учёба', 
    emoji: '📚', 
    color: '#6366f1',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&h=150&fit=crop&q=50',
    tip: 'Попробуй технику Помодоро для лучшей концентрации'
  },
  { 
    id: 'health', 
    name: 'Здоровье', 
    emoji: '💪', 
    color: '#22c55e',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&q=50',
    tip: 'Начни с 10 минут зарядки каждое утро'
  },
  { 
    id: 'friends', 
    name: 'Друзья', 
    emoji: '👥', 
    color: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&h=150&fit=crop&q=50',
    tip: 'Напиши другу, с которым давно не общался'
  },
  { 
    id: 'family', 
    name: 'Семья', 
    emoji: '🏠', 
    color: '#ec4899',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&h=150&fit=crop&q=50',
    tip: 'Проведи вечер без телефона с семьёй'
  },
  { 
    id: 'hobby', 
    name: 'Хобби', 
    emoji: '🎨', 
    color: '#8b5cf6',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150&h=150&fit=crop&q=50',
    tip: 'Выдели час в неделю только для себя'
  },
  { 
    id: 'rest', 
    name: 'Отдых', 
    emoji: '😴', 
    color: '#14b8a6',
    image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=150&h=150&fit=crop&q=50',
    tip: 'Ложись спать в одно время каждый день'
  },
  { 
    id: 'growth', 
    name: 'Развитие', 
    emoji: '🌱', 
    color: '#f97316',
    image: 'https://images.unsplash.com/photo-1492552181161-62217fc3076d?w=150&h=150&fit=crop&q=50',
    tip: 'Читай 10 страниц полезной книги каждый день'
  },
  { 
    id: 'mood', 
    name: 'Настроение', 
    emoji: '😊', 
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=150&h=150&fit=crop&q=50',
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

export const BalanceWheel: React.FC<BalanceWheelProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'intro' | 'scoring' | 'result'>('intro');
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [scores, setScores] = useState<AreaScore[]>(
    LIFE_AREAS.map(area => ({ ...area, score: 5 }))
  );
  const [history, setHistory] = useState<{ date: string; scores: AreaScore[] }[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  useEffect(() => {
    const loadData = async () => {
      const saved = localStorage.getItem('balance_wheel_history');
      if (saved) setHistory(JSON.parse(saved));
      
      const tgUser = getTelegramUser();
      if (tgUser?.id) {
        await loadToolsDataFromSupabase(tgUser.id.toString());
        const fresh = localStorage.getItem('balance_wheel_history');
        if (fresh) setHistory(JSON.parse(fresh));
      }
    };
    loadData();
  }, []);

  const currentArea = LIFE_AREAS[currentAreaIndex];
  const currentScore = scores.find(s => s.id === currentArea?.id)?.score || 5;
  const scoreDesc = getScoreDescription(currentScore);

  const handleScoreChange = (value: number) => {
    setScores(prev => prev.map(s => 
      s.id === currentArea.id ? { ...s, score: value } : s
    ));
  };

  const handleNext = async () => {
    if (currentAreaIndex < LIFE_AREAS.length - 1) {
      setCurrentAreaIndex(prev => prev + 1);
    } else {
      const newEntry = {
        date: new Date().toISOString(),
        scores: [...scores],
      };
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('balance_wheel_history', JSON.stringify(updatedHistory));
      
      // Sync to Supabase
      const tgUser = getTelegramUser();
      if (tgUser?.id) {
        setSyncStatus('syncing');
        const success = await syncToolsDataToSupabase(tgUser.id.toString());
        setSyncStatus(success ? 'synced' : 'idle');
        if (success) setTimeout(() => setSyncStatus('idle'), 2000);
      }
      
      setStep('result');
      onComplete?.(scores);
    }
  };

  const handleReset = () => {
    setStep('intro');
    setCurrentAreaIndex(0);
    setScores(LIFE_AREAS.map(area => ({ ...area, score: 5 })));
  };

  const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const weakestArea = [...scores].sort((a, b) => a.score - b.score)[0];
  const strongestArea = [...scores].sort((a, b) => b.score - a.score)[0];

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Beautiful Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)',
          }}
        />
        
        {/* Aurora effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1/2"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.3) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-0 right-0 w-full h-1/2"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.2) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
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

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-14 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <X size={20} className="text-white/70" />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto pt-6 pb-8 px-4">
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto pt-8"
            >
              {/* Header image */}
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-3xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=200&fit=crop"
                  alt="Balance"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">⚖️</span>
                </div>
              </div>

              <h2 className="text-3xl font-black text-white text-center mb-3">
                Колесо Баланса
              </h2>
              <p className="text-white/60 text-center mb-8 px-4">
                Оцени 8 сфер жизни и узнай, где ты сейчас. Это займёт всего 2 минуты.
              </p>

              {/* Preview cards */}
              <div className="grid grid-cols-4 gap-2 mb-8">
                {LIFE_AREAS.map((area, i) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square rounded-xl overflow-hidden relative"
                  >
                    <img 
                      src={area.image}
                      alt={area.name}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${area.color}60 0%, ${area.color}30 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">{area.emoji}</span>
                    </div>
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
            </motion.div>
          )}

          {/* SCORING */}
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
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      background: i < currentAreaIndex 
                        ? 'linear-gradient(90deg, #22c55e, #10b981)'
                        : i === currentAreaIndex 
                          ? currentArea.color
                          : 'rgba(255,255,255,0.1)',
                    }}
                    initial={i === currentAreaIndex ? { scaleX: 0 } : {}}
                    animate={i === currentAreaIndex ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              {/* Area Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-3xl overflow-hidden mb-6 relative"
                style={{
                  boxShadow: `0 20px 60px ${currentArea.color}30`,
                }}
              >
                {/* Background Image */}
                <div className="h-48 relative">
                  <img 
                    src={currentArea.image}
                    alt={currentArea.name}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${currentArea.color}90 100%)`,
                    }}
                  />
                  
                  {/* Area info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{currentArea.emoji}</span>
                      <div>
                        <h3 className="text-2xl font-black text-white">{currentArea.name}</h3>
                        <p className="text-white/70 text-sm">Как ты оцениваешь эту сферу?</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Section */}
                <div 
                  className="p-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    backdropFilter: 'blur(40px)',
                  }}
                >
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
                      <div className="text-3xl mb-1">{scoreDesc.emoji}</div>
                      <div className="text-white/60 text-sm">{scoreDesc.label}</div>
                    </div>
                  </div>

                  {/* Score Buttons */}
                  <div className="grid grid-cols-10 gap-1.5 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                      <motion.button
                        key={v}
                        onClick={() => handleScoreChange(v)}
                        className="aspect-square rounded-xl font-bold text-sm transition-all"
                        style={{
                          background: currentScore === v 
                            ? currentArea.color 
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

                  {/* Tip */}
                  <motion.button
                    onClick={() => setShowTip(!showTip)}
                    className="w-full p-3 rounded-xl text-left flex items-center gap-3"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Lightbulb size={18} className="text-amber-400 shrink-0" />
                    <span className="text-white/60 text-sm flex-1">
                      {showTip ? currentArea.tip : 'Нажми для совета'}
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Next Button */}
              <motion.button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${currentArea.color} 0%, ${currentArea.color}cc 100%)`,
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

          {/* RESULT */}
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

              {/* Wheel Visualization */}
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
                    animate={{ opacity: 0.4, scale: 1 }}
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
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="1"
                        />
                        <motion.circle
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                          cx={x}
                          cy={y}
                          r="8"
                          fill={s.color}
                          style={{ filter: `drop-shadow(0 0 8px ${s.color})` }}
                        />
                        <text
                          x={100 + 88 * Math.cos(rad)}
                          y={100 + 88 * Math.sin(rad)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-base"
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

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.1) 100%)',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  <div className="text-3xl font-black text-indigo-400">
                    {averageScore.toFixed(1)}
                  </div>
                  <div className="text-white/50 text-xs mt-1">Средний балл</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-2xl text-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${strongestArea.color}30 0%, ${strongestArea.color}15 100%)`,
                    border: `1px solid ${strongestArea.color}40`,
                  }}
                >
                  <Award size={16} className="absolute top-2 right-2 text-amber-400" />
                  <div className="text-2xl mb-1">{strongestArea.emoji}</div>
                  <div className="text-white/50 text-xs">Твоя сила</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-4 rounded-2xl text-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${weakestArea.color}30 0%, ${weakestArea.color}15 100%)`,
                    border: `1px solid ${weakestArea.color}40`,
                  }}
                >
                  <TrendingUp size={16} className="absolute top-2 right-2 text-emerald-400" />
                  <div className="text-2xl mb-1">{weakestArea.emoji}</div>
                  <div className="text-white/50 text-xs">Зона роста</div>
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
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                      style={{ boxShadow: `0 2px 10px ${s.color}30` }}
                    >
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{s.name}</span>
                        <span className="text-lg">{s.emoji}</span>
                      </div>
                    </div>
                    <div 
                      className="text-lg font-bold"
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
                  background: `linear-gradient(135deg, ${weakestArea.color}15 0%, ${weakestArea.color}05 100%)`,
                  border: `1px solid ${weakestArea.color}30`,
                }}
              >
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/80 text-sm mb-2">
                      <strong>{weakestArea.name}</strong> — твоя зона роста на этой неделе.
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
