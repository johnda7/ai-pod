import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, TrendingUp, Calendar, Zap, Flame } from 'lucide-react';
import { useSyncTool } from '../hooks/useSyncTool';

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

// 🎨 iOS 26 LIQUID GLASS - градиенты вместо фото, без наезжающих элементов
const EMOTIONS = [
  { emoji: '😊', name: 'Радость', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
  { emoji: '😌', name: 'Спокойствие', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
  { emoji: '🤔', name: 'Задумчивость', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
  { emoji: '😤', name: 'Раздражение', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  { emoji: '😢', name: 'Грусть', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { emoji: '😰', name: 'Тревога', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
  { emoji: '😴', name: 'Усталость', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  { emoji: '🤩', name: 'Восторг', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  { emoji: '😐', name: 'Нейтрально', color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' },
  { emoji: '💪', name: 'Уверенность', color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },
  { emoji: '🥰', name: 'Любовь', color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' },
  { emoji: '😎', name: 'Крутость', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' },
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
  // 🔄 useSyncTool вместо ручной синхронизации (-30 строк!)
  const { data: entries, setData: setEntries } = useSyncTool<EmotionEntry[]>([], {
    storageKey: 'emotion_diary_entries',
    debounceMs: 1000
  });
  
  // Режим: история или запись
  const [mode, setMode] = useState<'history' | 'record'>('history');
  const [step, setStep] = useState<'emotion' | 'energy' | 'note' | 'done'>('emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(3);
  const [note, setNote] = useState('');
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  
  // Проверяем записана ли сегодняшняя эмоция
  const todayEntry = useMemo(() => {
    const today = new Date().toDateString();
    return entries.find(e => new Date(e.date).toDateString() === today);
  }, [entries]);
  
  // Статистика эмоций за последние 7 дней
  const weekStats = useMemo(() => {
    const week = entries.slice(0, 7);
    const emotionCounts: Record<string, number> = {};
    week.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    return emotionCounts;
  }, [entries]);
  
  // Генерируем календарь на месяц
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const entry = entries.find(e => new Date(e.date).toDateString() === dateStr);
      days.push({
        date: date,
        dayNum: date.getDate(),
        entry: entry || null,
        isToday: i === 0
      });
    }
    return days;
  }, [entries]);
  
  // Вычисляем streak на лету
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let currentStreak = 0;
      
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date).toDateString();
        if (i === 0 && (entryDate === today || entryDate === yesterday)) {
          currentStreak++;
        } else if (i > 0) {
        const prevDate = new Date(entries[i - 1].date);
        const currDate = new Date(entries[i].date);
          const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
          if (diff <= 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    return currentStreak;
  }, [entries]);

  const handleComplete = () => {
    if (!selectedEmotion) return;
    
    const newEntry: EmotionEntry = {
      date: new Date().toISOString(),
      emotion: selectedEmotion.name,
      emoji: selectedEmotion.emoji,
      note,
      energy: selectedEnergy,
    };
    
    // useSyncTool автоматически синхронизирует!
    setEntries(prev => [newEntry, ...prev]);
    
    const baseXP = 30;
    const streakBonus = Math.min(streak * 5, 50);
    const totalXP = baseXP + streakBonus;
    
    setStep('done');
    setTimeout(() => {
      onComplete(totalXP);
      // Возвращаемся в историю через 2 секунды
      setTimeout(() => {
        setMode('history');
        setStep('emotion');
        setSelectedEmotion(null);
        setNote('');
      }, 500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto"
    >
      {/* 🎨 iOS 26 LIQUID GLASS Background - pointer-events-none! */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          }}
        />
        
        {/* Aurora effects - уменьшенные и не блокирующие клики */}
        <motion.div
          className="absolute top-0 left-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ 
            x: [0, 30, 0], 
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{ 
            x: [0, -20, 0], 
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
            }}
            animate={{ 
              opacity: [0.2, 0.6, 0.2],
              y: [0, -15, 0],
            }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* 🎨 iOS 26 LIQUID GLASS Header - без картинки */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 rounded-[24px]"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Gradient emoji icon вместо фото */}
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 24px rgba(236,72,153,0.4)' 
                }}
              >
                <span className="text-3xl">💜</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Дневник Эмоций</h1>
                <p className="text-white/50 text-xs">
                  {streak > 0 ? `🔥 ${streak} дней подряд!` : 'Как ты сегодня?'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {mode === 'record' && (
                <button
                  onClick={() => {
                    setMode('history');
                    setStep('emotion');
                    setSelectedEmotion(null);
                    setNote('');
                  }}
                  className="px-3 h-10 rounded-xl flex items-center justify-center text-white/70 text-sm"
                  style={{ 
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  ← Назад
                </button>
              )}
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <X size={20} className="text-white/80" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-20">
        <AnimatePresence mode="wait">
          {/* ИСТОРИЯ - главный экран */}
          {mode === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Стрик и статистика */}
              <div 
                className="p-4 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">🔥</div>
                    <div>
                      <div className="text-3xl font-black text-white">{streak}</div>
                      <div className="text-white/60 text-sm">дней подряд</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{entries.length}</div>
                    <div className="text-white/60 text-sm">всего записей</div>
                  </div>
                </div>
                
                {/* Прогресс до 21 дня */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Цель: 21 день</span>
                    <span>{Math.min(streak, 21)}/21</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(streak / 21 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Календарь эмоций */}
              <div 
                className="p-4 rounded-2xl mb-4"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Последние 30 дней
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                        day.isToday ? 'ring-2 ring-purple-500' : ''
                      }`}
                      style={{
                        background: day.entry 
                          ? EMOTIONS.find(e => e.name === day.entry?.emotion)?.color + '40'
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {day.entry ? (
                        <span className="text-base">{day.entry.emoji}</span>
                      ) : (
                        <span className="text-white/30">{day.dayNum}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Кнопка записи */}
              <motion.button
                onClick={() => {
                  if (todayEntry) return;
                  setMode('record');
                  setStep('emotion');
                }}
                disabled={!!todayEntry}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mb-4"
                style={{
                  background: todayEntry 
                    ? 'rgba(34,197,94,0.3)' 
                    : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  boxShadow: todayEntry ? 'none' : '0 8px 32px rgba(139,92,246,0.4)',
                }}
                whileHover={!todayEntry ? { scale: 1.02 } : {}}
                whileTap={!todayEntry ? { scale: 0.98 } : {}}
              >
                {todayEntry ? (
                  <>
                    <Check size={20} />
                    Сегодня записано: {todayEntry.emoji} {todayEntry.emotion}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Записать эмоцию сегодня
                  </>
                )}
              </motion.button>
              
              {/* История записей */}
              {entries.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Последние записи
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {entries.slice(0, 10).map((entry, i) => {
                      const emotion = EMOTIONS.find(e => e.name === entry.emotion);
                      const entryDate = new Date(entry.date);
                      const isToday = entryDate.toDateString() === new Date().toDateString();
                      const isYesterday = entryDate.toDateString() === new Date(Date.now() - 86400000).toDateString();
                      
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl flex items-center gap-3"
                          style={{
                            background: `${emotion?.color}15`,
                            border: `1px solid ${emotion?.color}30`,
                          }}
                        >
                          <span className="text-2xl">{entry.emoji}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{entry.emotion}</div>
                            <div className="text-white/50 text-xs">
                              {isToday ? 'Сегодня' : isYesterday ? 'Вчера' : entryDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              {entry.note && ` • ${entry.note.slice(0, 30)}${entry.note.length > 30 ? '...' : ''}`}
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => (
                              <div 
                                key={n}
                                className="w-1 h-3 rounded-full"
                                style={{ background: n <= entry.energy ? emotion?.color : 'rgba(255,255,255,0.1)' }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {entries.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📔</div>
                  <p className="text-white/60">Начни отслеживать свои эмоции!</p>
                  <p className="text-white/40 text-sm">Записывай каждый день и смотри прогресс</p>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Step 1: Emotion Selection */}
          {mode === 'record' && step === 'emotion' && (
            <motion.div
              key="emotion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-white/80 mb-4 text-center">Какую эмоцию ты сейчас чувствуешь?</p>
              
              {/* 🎨 iOS 26 LIQUID GLASS - градиенты вместо фото */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {EMOTIONS.map((emotion) => (
                  <motion.button
                    key={emotion.name}
                    onClick={() => setSelectedEmotion(emotion)}
                    className="rounded-2xl relative aspect-square flex flex-col items-center justify-center"
                    style={{
                      background: emotion.gradient,
                      border: selectedEmotion?.name === emotion.name
                        ? '3px solid white'
                        : '3px solid transparent',
                      boxShadow: selectedEmotion?.name === emotion.name
                        ? `0 8px 32px ${emotion.color}60`
                        : `0 4px 16px ${emotion.color}30`,
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-4xl mb-1">{emotion.emoji}</span>
                    <span className="text-white text-xs font-semibold">{emotion.name}</span>
                    
                    {selectedEmotion?.name === emotion.name && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
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
          {mode === 'record' && step === 'energy' && (
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
          {mode === 'record' && step === 'note' && (
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
          {mode === 'record' && step === 'done' && (
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
        {mode === 'record' && step !== 'done' && (
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
