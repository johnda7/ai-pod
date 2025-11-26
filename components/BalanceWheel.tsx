import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, RotateCcw, Save, TrendingUp, Sparkles } from 'lucide-react';

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
}

const LIFE_AREAS: Omit<AreaScore, 'score'>[] = [
  { id: 'study', name: 'Учёба', emoji: '📚', color: '#6366f1' },
  { id: 'health', name: 'Здоровье', emoji: '💪', color: '#22c55e' },
  { id: 'friends', name: 'Друзья', emoji: '👥', color: '#f59e0b' },
  { id: 'family', name: 'Семья', emoji: '🏠', color: '#ec4899' },
  { id: 'hobby', name: 'Хобби', emoji: '🎨', color: '#8b5cf6' },
  { id: 'rest', name: 'Отдых', emoji: '😴', color: '#14b8a6' },
  { id: 'growth', name: 'Развитие', emoji: '🌱', color: '#f97316' },
  { id: 'mood', name: 'Настроение', emoji: '😊', color: '#3b82f6' },
];

const SCORE_LABELS = [
  { value: 1, label: 'Очень плохо' },
  { value: 2, label: 'Плохо' },
  { value: 3, label: 'Ниже среднего' },
  { value: 4, label: 'Средне' },
  { value: 5, label: 'Нормально' },
  { value: 6, label: 'Хорошо' },
  { value: 7, label: 'Очень хорошо' },
  { value: 8, label: 'Отлично' },
  { value: 9, label: 'Супер' },
  { value: 10, label: 'Идеально!' },
];

export const BalanceWheel: React.FC<BalanceWheelProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'intro' | 'scoring' | 'result'>('intro');
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [scores, setScores] = useState<AreaScore[]>(
    LIFE_AREAS.map(area => ({ ...area, score: 5 }))
  );
  const [history, setHistory] = useState<{ date: string; scores: AreaScore[] }[]>([]);

  // Загрузка истории
  useEffect(() => {
    const saved = localStorage.getItem('balance_wheel_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const currentArea = LIFE_AREAS[currentAreaIndex];
  const currentScore = scores.find(s => s.id === currentArea?.id)?.score || 5;

  const handleScoreChange = (value: number) => {
    setScores(prev => prev.map(s => 
      s.id === currentArea.id ? { ...s, score: value } : s
    ));
  };

  const handleNext = () => {
    if (currentAreaIndex < LIFE_AREAS.length - 1) {
      setCurrentAreaIndex(prev => prev + 1);
    } else {
      // Сохранение результатов
      const newEntry = {
        date: new Date().toISOString(),
        scores: [...scores],
      };
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('balance_wheel_history', JSON.stringify(updatedHistory));
      
      setStep('result');
      onComplete?.(scores);
    }
  };

  const handleReset = () => {
    setStep('intro');
    setCurrentAreaIndex(0);
    setScores(LIFE_AREAS.map(area => ({ ...area, score: 5 })));
  };

  // Расчёт среднего балла
  const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

  // Самая слабая и сильная область
  const weakestArea = [...scores].sort((a, b) => a.score - b.score)[0];
  const strongestArea = [...scores].sort((a, b) => b.score - a.score)[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />

      {/* Main Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-[2rem] p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={18} className="text-white/60" />
              </button>

              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-black text-white mb-2">Колесо Баланса</h2>
              <p className="text-white/60 mb-6">
                Оцени разные сферы своей жизни от 1 до 10. Это поможет понять, где ты сейчас и над чем стоит поработать.
              </p>

              {/* Preview wheel */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {LIFE_AREAS.map((area, i) => {
                    const angle = (i * 360) / LIFE_AREAS.length - 90;
                    const rad = (angle * Math.PI) / 180;
                    const x = 100 + 70 * Math.cos(rad);
                    const y = 100 + 70 * Math.sin(rad);
                    return (
                      <g key={area.id}>
                        <line
                          x1="100"
                          y1="100"
                          x2={x}
                          y2={y}
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="1"
                        />
                        <text
                          x={100 + 85 * Math.cos(rad)}
                          y={100 + 85 * Math.sin(rad)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-lg"
                        >
                          {area.emoji}
                        </text>
                      </g>
                    );
                  })}
                  {[2, 4, 6, 8, 10].map(r => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r * 7}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>

              <button
                onClick={() => setStep('scoring')}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-all active:scale-95"
                style={{
                  boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                }}
              >
                Начать оценку
              </button>
            </motion.div>
          )}

          {/* SCORING */}
          {step === 'scoring' && currentArea && (
            <motion.div
              key={`scoring-${currentAreaIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="rounded-[2rem] p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={18} className="text-white/60" />
              </button>

              {/* Progress */}
              <div className="flex gap-1 mb-6">
                {LIFE_AREAS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < currentAreaIndex ? 'bg-green-500' :
                      i === currentAreaIndex ? 'bg-indigo-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Area */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl mb-3"
                >
                  {currentArea.emoji}
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-1">{currentArea.name}</h3>
                <p className="text-white/50 text-sm">
                  Как ты оцениваешь эту сферу сейчас?
                </p>
              </div>

              {/* Score display */}
              <div className="text-center mb-6">
                <motion.div
                  key={currentScore}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-black mb-2"
                  style={{ color: currentArea.color }}
                >
                  {currentScore}
                </motion.div>
                <p className="text-white/60 text-sm">
                  {SCORE_LABELS.find(l => l.value === currentScore)?.label}
                </p>
              </div>

              {/* Slider */}
              <div className="mb-8 px-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentScore}
                  onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${currentArea.color} 0%, ${currentArea.color} ${(currentScore - 1) * 11.1}%, rgba(255,255,255,0.2) ${(currentScore - 1) * 11.1}%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-white/40">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              {/* Quick select */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[1, 3, 5, 7, 10].map(v => (
                  <button
                    key={v}
                    onClick={() => handleScoreChange(v)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      currentScore === v
                        ? 'text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                    style={{
                      background: currentScore === v ? currentArea.color : undefined,
                      boxShadow: currentScore === v ? `0 4px 15px ${currentArea.color}50` : undefined,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${currentArea.color} 0%, ${currentArea.color}cc 100%)`,
                  boxShadow: `0 8px 30px ${currentArea.color}40`,
                }}
              >
                {currentAreaIndex < LIFE_AREAS.length - 1 ? (
                  <>Далее <ChevronRight size={20} /></>
                ) : (
                  <>Результат <Sparkles size={20} /></>
                )}
              </button>
            </motion.div>
          )}

          {/* RESULT */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[2rem] p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={18} className="text-white/60" />
              </button>

              <h2 className="text-2xl font-black text-white text-center mb-6">
                Твой Баланс
              </h2>

              {/* Wheel visualization */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Grid circles */}
                  {[2, 4, 6, 8, 10].map(r => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r * 7}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Filled area */}
                  <motion.polygon
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    points={scores.map((s, i) => {
                      const angle = (i * 360) / scores.length - 90;
                      const rad = (angle * Math.PI) / 180;
                      const r = s.score * 7;
                      return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
                    }).join(' ')}
                    fill="url(#wheelGradient)"
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
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="1"
                        />
                        <motion.circle
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          cx={x}
                          cy={y}
                          r="6"
                          fill={s.color}
                          style={{ filter: `drop-shadow(0 0 5px ${s.color})` }}
                        />
                        <text
                          x={100 + 85 * Math.cos(rad)}
                          y={100 + 85 * Math.sin(rad)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-sm"
                        >
                          {s.emoji}
                        </text>
                      </g>
                    );
                  })}
                  
                  <defs>
                    <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div 
                  className="p-3 rounded-xl text-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div className="text-2xl font-black text-white">
                    {averageScore.toFixed(1)}
                  </div>
                  <div className="text-white/40 text-xs">Средний</div>
                </div>
                <div 
                  className="p-3 rounded-xl text-center"
                  style={{ background: `${strongestArea.color}20` }}
                >
                  <div className="text-xl">{strongestArea.emoji}</div>
                  <div className="text-white/40 text-xs">Сила</div>
                </div>
                <div 
                  className="p-3 rounded-xl text-center"
                  style={{ background: `${weakestArea.color}20` }}
                >
                  <div className="text-xl">{weakestArea.emoji}</div>
                  <div className="text-white/40 text-xs">Фокус</div>
                </div>
              </div>

              {/* Insight */}
              <div 
                className="p-4 rounded-xl mb-6"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <p className="text-white/80 text-sm">
                  💡 <strong>{weakestArea.name}</strong> — область для роста. 
                  Попробуй уделить ей больше внимания на этой неделе.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/10 text-white/70 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <RotateCcw size={18} /> Заново
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Check size={18} /> Готово
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default BalanceWheel;

