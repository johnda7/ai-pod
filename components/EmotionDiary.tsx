import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, TrendingUp, Calendar, Heart, Zap, Cloud, Sun, Moon, Star } from 'lucide-react';

interface EmotionEntry {
  date: string;
  emotion: string;
  emoji: string;
  note: string;
  energy: number;
}

interface EmotionDiaryProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

const EMOTIONS = [
  { emoji: '😊', name: 'Радость', color: '#fbbf24' },
  { emoji: '😌', name: 'Спокойствие', color: '#22c55e' },
  { emoji: '🤔', name: 'Задумчивость', color: '#6366f1' },
  { emoji: '😤', name: 'Раздражение', color: '#ef4444' },
  { emoji: '😢', name: 'Грусть', color: '#3b82f6' },
  { emoji: '😰', name: 'Тревога', color: '#f97316' },
  { emoji: '😴', name: 'Усталость', color: '#8b5cf6' },
  { emoji: '🤩', name: 'Восторг', color: '#ec4899' },
  { emoji: '😐', name: 'Нейтрально', color: '#6b7280' },
  { emoji: '💪', name: 'Уверенность', color: '#14b8a6' },
  { emoji: '🥰', name: 'Любовь', color: '#f43f5e' },
  { emoji: '😎', name: 'Крутость', color: '#0ea5e9' },
];

const ENERGY_LEVELS = [
  { value: 1, emoji: '🔋', label: 'Почти ноль' },
  { value: 2, emoji: '🪫', label: 'Мало сил' },
  { value: 3, emoji: '⚡', label: 'Нормально' },
  { value: 4, emoji: '💪', label: 'Много энергии' },
  { value: 5, emoji: '🚀', label: 'Супер-заряд!' },
];

const PROMPTS = [
  'Что сегодня было хорошего?',
  'За что ты благодарен(а) сегодня?',
  'Что тебя порадовало?',
  'Какой момент дня был лучшим?',
  'Что ты сделал(а) классного?',
];

export const EmotionDiary: React.FC<EmotionDiaryProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'emotion' | 'energy' | 'note' | 'done'>('emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(3);
  const [note, setNote] = useState('');
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [streak, setStreak] = useState(0);

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emotion_diary_entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      
      // Calculate streak
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let currentStreak = 0;
      
      for (let i = 0; i < parsed.length; i++) {
        const entryDate = new Date(parsed[i].date).toDateString();
        if (i === 0 && (entryDate === today || entryDate === yesterday)) {
          currentStreak++;
        } else if (i > 0) {
          const prevDate = new Date(parsed[i - 1].date);
          const currDate = new Date(parsed[i].date);
          const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
          if (diff <= 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      setStreak(currentStreak);
    }
  }, []);

  const handleComplete = () => {
    if (!selectedEmotion) return;
    
    const newEntry: EmotionEntry = {
      date: new Date().toISOString(),
      emotion: selectedEmotion.name,
      emoji: selectedEmotion.emoji,
      note,
      energy: selectedEnergy,
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('emotion_diary_entries', JSON.stringify(updatedEntries));
    
    // Calculate XP (bonus for streak)
    const baseXP = 30;
    const streakBonus = Math.min(streak * 5, 50);
    const totalXP = baseXP + streakBonus;
    
    setStep('done');
    setTimeout(() => {
      onComplete(totalXP);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-md rounded-[2rem] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 25px 80px rgba(99,102,241,0.3)',
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Дневник Эмоций</h2>
            <p className="text-white/50 text-sm">
              {streak > 0 ? `🔥 ${streak} дней подряд!` : 'Как ты сегодня?'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Emotion Selection */}
            {step === 'emotion' && (
              <motion.div
                key="emotion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-white/80 mb-4">Какую эмоцию ты сейчас чувствуешь?</p>
                
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.name}
                      onClick={() => setSelectedEmotion(emotion)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        selectedEmotion?.name === emotion.name
                          ? 'scale-110 ring-2 ring-white/50'
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        background: selectedEmotion?.name === emotion.name
                          ? `${emotion.color}30`
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <span className="text-2xl">{emotion.emoji}</span>
                      <span className="text-[9px] text-white/60">{emotion.name}</span>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => selectedEmotion && setStep('energy')}
                  disabled={!selectedEmotion}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all ${
                    selectedEmotion
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-white/30'
                  }`}
                >
                  Далее
                </button>
              </motion.div>
            )}
            
            {/* Step 2: Energy Level */}
            {step === 'energy' && (
              <motion.div
                key="energy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-white/80 mb-4">Сколько у тебя энергии?</p>
                
                <div className="space-y-2 mb-6">
                  {ENERGY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSelectedEnergy(level.value)}
                      className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                        selectedEnergy === level.value
                          ? 'bg-indigo-600/30 ring-2 ring-indigo-500/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{level.emoji}</span>
                      <div className="flex-1 text-left">
                        <span className="text-white font-medium">{level.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-2 h-4 rounded-full ${
                              i <= level.value ? 'bg-indigo-500' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setStep('note')}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-wider bg-indigo-600 text-white transition-all"
                >
                  Далее
                </button>
              </motion.div>
            )}
            
            {/* Step 3: Note */}
            {step === 'note' && (
              <motion.div
                key="note"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-white/80 mb-2">{prompt}</p>
                <p className="text-white/40 text-xs mb-4">Техника "Я молодец!" от Кати 💜</p>
                
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Напиши пару слов..."
                  className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-4"
                />
                
                {/* Quick responses */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Я молодец! 💪', 'Справился!', 'Было непросто', 'Отличный день'].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => setNote(quick)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleComplete}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-all"
                >
                  Сохранить ✨
                </button>
              </motion.div>
            )}
            
            {/* Step 4: Done */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-4"
                >
                  {selectedEmotion?.emoji}
                </motion.div>
                
                <h3 className="text-2xl font-black text-white mb-2">
                  Записано! ✨
                </h3>
                
                <p className="text-white/60 mb-4">
                  Ты молодец, что следишь за своими эмоциями
                </p>
                
                <div className="flex justify-center gap-4">
                  <div className="bg-white/10 rounded-xl px-4 py-2">
                    <span className="text-yellow-400 font-bold">+30 XP</span>
                  </div>
                  {streak > 0 && (
                    <div className="bg-white/10 rounded-xl px-4 py-2">
                      <span className="text-orange-400 font-bold">🔥 +{Math.min(streak * 5, 50)} бонус</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Progress dots */}
        {step !== 'done' && (
          <div className="flex justify-center gap-2 pb-6">
            {['emotion', 'energy', 'note'].map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === s ? 'bg-indigo-500 w-6' : 
                  ['emotion', 'energy', 'note'].indexOf(step) > i ? 'bg-green-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmotionDiary;

