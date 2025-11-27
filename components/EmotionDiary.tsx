import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, TrendingUp, Calendar, Heart, Zap, Flame } from 'lucide-react';

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
  { emoji: '😊', name: 'Радость', color: '#fbbf24', image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=150&h=150&fit=crop' },
  { emoji: '😌', name: 'Спокойствие', color: '#22c55e', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop' },
  { emoji: '🤔', name: 'Задумчивость', color: '#6366f1', image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=150&h=150&fit=crop' },
  { emoji: '😤', name: 'Раздражение', color: '#ef4444', image: 'https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?w=150&h=150&fit=crop' },
  { emoji: '😢', name: 'Грусть', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=150&h=150&fit=crop' },
  { emoji: '😰', name: 'Тревога', color: '#f97316', image: 'https://images.unsplash.com/photo-1475137979732-b349acb6b7e3?w=150&h=150&fit=crop' },
  { emoji: '😴', name: 'Усталость', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=150&h=150&fit=crop' },
  { emoji: '🤩', name: 'Восторг', color: '#ec4899', image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=150&h=150&fit=crop' },
  { emoji: '😐', name: 'Нейтрально', color: '#6b7280', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=150&h=150&fit=crop' },
  { emoji: '💪', name: 'Уверенность', color: '#14b8a6', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop' },
  { emoji: '🥰', name: 'Любовь', color: '#f43f5e', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=150&h=150&fit=crop' },
  { emoji: '😎', name: 'Крутость', color: '#0ea5e9', image: 'https://images.unsplash.com/photo-1492681290082-e932832941e6?w=150&h=150&fit=crop' },
];

const ENERGY_LEVELS = [
  { value: 1, emoji: '🔋', label: 'Почти ноль', color: '#ef4444' },
  { value: 2, emoji: '🪫', label: 'Мало сил', color: '#f97316' },
  { value: 3, emoji: '⚡', label: 'Нормально', color: '#eab308' },
  { value: 4, emoji: '💪', label: 'Много энергии', color: '#22c55e' },
  { value: 5, emoji: '🚀', label: 'Супер-заряд!', color: '#10b981' },
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

  useEffect(() => {
    const saved = localStorage.getItem('emotion_diary_entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      
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
            background: 'linear-gradient(180deg, #1a0a2e 0%, #2a1040 30%, #1a0a2e 100%)',
          }}
        />
        
        {/* Aurora effects */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1/2"
          style={{
            background: 'radial-gradient(ellipse at 30% 0%, rgba(236,72,153,0.25) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 right-0 w-1/2 h-1/2"
          style={{
            background: 'radial-gradient(ellipse at 100% 20%, rgba(139,92,246,0.2) 0%, transparent 60%)',
            filter: 'blur(50px)',
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
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
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-8 pb-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-xl overflow-hidden relative"
                style={{ boxShadow: '0 4px 20px rgba(236,72,153,0.3)' }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=100&h=100&fit=crop"
                  alt="Emotions"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-600/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Дневник Эмоций</h1>
                <p className="text-white/50 text-xs">
                  {streak > 0 ? `🔥 ${streak} дней подряд!` : 'Как ты сегодня?'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-20">
        <AnimatePresence mode="wait">
          {/* Step 1: Emotion Selection */}
          {step === 'emotion' && (
            <motion.div
              key="emotion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-white/80 mb-4 text-center">Какую эмоцию ты сейчас чувствуешь?</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {EMOTIONS.map((emotion) => (
                  <motion.button
                    key={emotion.name}
                    onClick={() => setSelectedEmotion(emotion)}
                    className="rounded-2xl overflow-hidden relative aspect-square"
                    style={{
                      border: selectedEmotion?.name === emotion.name
                        ? `3px solid ${emotion.color}`
                        : '3px solid transparent',
                      boxShadow: selectedEmotion?.name === emotion.name
                        ? `0 4px 20px ${emotion.color}50`
                        : 'none',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img 
                      src={emotion.image}
                      alt={emotion.name}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ background: `${emotion.color}80` }}
                    >
                      <span className="text-3xl mb-1">{emotion.emoji}</span>
                      <span className="text-white text-xs font-medium">{emotion.name}</span>
                    </div>
                    
                    {selectedEmotion?.name === emotion.name && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                      >
                        <Check size={14} style={{ color: emotion.color }} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                onClick={() => selectedEmotion && setStep('energy')}
                disabled={!selectedEmotion}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
                style={{
                  background: selectedEmotion
                    ? `linear-gradient(135deg, ${selectedEmotion.color} 0%, ${selectedEmotion.color}cc 100%)`
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: selectedEmotion ? `0 8px 32px ${selectedEmotion.color}40` : 'none',
                }}
                whileHover={selectedEmotion ? { scale: 1.02 } : {}}
                whileTap={selectedEmotion ? { scale: 0.98 } : {}}
              >
                Далее
              </motion.button>
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
              <p className="text-white/80 mb-4 text-center">Сколько у тебя энергии?</p>
              
              <div className="space-y-3 mb-6">
                {ENERGY_LEVELS.map((level) => (
                  <motion.button
                    key={level.value}
                    onClick={() => setSelectedEnergy(level.value)}
                    className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all"
                    style={{
                      background: selectedEnergy === level.value
                        ? `linear-gradient(135deg, ${level.color}30 0%, ${level.color}15 100%)`
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedEnergy === level.value ? level.color + '50' : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: selectedEnergy === level.value ? `0 4px 20px ${level.color}30` : 'none',
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="text-3xl">{level.emoji}</span>
                    <div className="flex-1 text-left">
                      <span className="text-white font-medium">{level.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-5 rounded-full transition-all"
                          style={{
                            background: i <= level.value ? level.color : 'rgba(255,255,255,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                onClick={() => setStep('note')}
                className="w-full py-4 rounded-2xl font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${ENERGY_LEVELS[selectedEnergy - 1].color} 0%, ${ENERGY_LEVELS[selectedEnergy - 1].color}cc 100%)`,
                  boxShadow: `0 8px 32px ${ENERGY_LEVELS[selectedEnergy - 1].color}40`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Далее
              </motion.button>
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
              <div 
                className="rounded-2xl p-4 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <p className="text-white/80 mb-1">{prompt}</p>
                <p className="text-white/40 text-xs">Техника "Я молодец!" от Кати 💜</p>
              </div>
              
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Напиши пару слов..."
                className="w-full h-32 p-4 rounded-2xl text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-4"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              
              {/* Quick responses */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Я молодец! 💪', 'Справился!', 'Было непросто', 'Отличный день'].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setNote(quick)}
                    className="px-3 py-2 rounded-xl text-white/60 text-sm transition-all"
                    style={{
                      background: note === quick ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${note === quick ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {quick}
                  </button>
                ))}
              </div>
              
              <motion.button
                onClick={handleComplete}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={20} />
                Сохранить
              </motion.button>
            </motion.div>
          )}
          
          {/* Step 4: Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-7xl mb-6"
              >
                {selectedEmotion?.emoji}
              </motion.div>
              
              <h3 className="text-3xl font-black text-white mb-3">
                Записано! ✨
              </h3>
              
              <p className="text-white/60 mb-6">
                Ты молодец, что следишь за своими эмоциями
              </p>
              
              <div 
                className="inline-flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-lg">+30 XP</span>
                </div>
                {streak > 0 && (
                  <>
                    <div className="w-px h-6 bg-white/20" />
                    <div className="flex items-center gap-2">
                      <Flame size={20} className="text-orange-400" />
                      <span className="text-orange-400 font-bold">+{Math.min(streak * 5, 50)} бонус</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Progress dots */}
        {step !== 'done' && (
          <div className="flex justify-center gap-2 mt-6">
            {['emotion', 'energy', 'note'].map((s, i) => (
              <motion.div
                key={s}
                className="h-2 rounded-full transition-all"
                style={{
                  width: step === s ? 24 : 8,
                  background: step === s 
                    ? 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                    : ['emotion', 'energy', 'note'].indexOf(step) > i 
                      ? '#22c55e' 
                      : 'rgba(255,255,255,0.2)',
                }}
                animate={{ width: step === s ? 24 : 8 }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmotionDiary;
