import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Flame, Calendar, Trash2, Trophy, AlertCircle } from 'lucide-react';
import { useSyncTool } from '../hooks/useSyncTool';
import { SyncIndicator } from './SyncIndicator';
import { hapticSuccess, hapticMedium } from '../services/telegramService';

interface HabitTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  image: string;
  streak: number;
  completedDays: string[];
  createdAt: number;
  goal: number;
}

// 🚀 ОПТИМИЗАЦИЯ: уменьшены размеры изображений + качество
const HABIT_PRESETS = [
  { name: 'Медитация', emoji: '🧘', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop&q=50' },
  { name: 'Спорт', emoji: '💪', color: '#22c55e', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&q=50' },
  { name: 'Чтение', emoji: '📚', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=100&h=100&fit=crop&q=50' },
  { name: 'Вода', emoji: '💧', color: '#06b6d4', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=100&h=100&fit=crop&q=50' },
  { name: 'Сон 8ч', emoji: '😴', color: '#6366f1', image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=100&h=100&fit=crop&q=50' },
  { name: 'Без соцсетей', emoji: '📵', color: '#ef4444', image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=100&h=100&fit=crop&q=50' },
  { name: 'Учёба', emoji: '📖', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop&q=50' },
  { name: 'Прогулка', emoji: '🚶', color: '#10b981', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100&h=100&fit=crop&q=50' },
];

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// 💪 Мотивационные сообщения
const getMotivationMessage = (streak: number, bestStreak: number, completedToday: number, totalHabits: number) => {
  if (totalHabits === 0) return { text: 'Создай первую привычку! 🌱', color: '#22c55e' };
  
  const daysToRecord = bestStreak - streak + 1;
  
  if (completedToday === totalHabits && totalHabits > 0) {
    return { text: '🔥 Все привычки выполнены! Ты огонь!', color: '#f59e0b' };
  }
  
  if (streak > 0 && streak === bestStreak) {
    return { text: '🏆 Ты на своём рекорде! Не останавливайся!', color: '#eab308' };
  }
  
  if (streak > 0 && daysToRecord <= 3 && daysToRecord > 0) {
    return { text: `⭐ Ещё ${daysToRecord} ${daysToRecord === 1 ? 'день' : 'дня'} до рекорда!`, color: '#a855f7' };
  }
  
  if (streak >= 7) {
    return { text: '💎 Неделя подряд! Ты легенда!', color: '#6366f1' };
  }
  
  if (streak >= 3) {
    return { text: '🚀 Отличный прогресс! Держи темп!', color: '#22c55e' };
  }
  
  if (completedToday > 0) {
    return { text: '✨ Хорошее начало! Продолжай!', color: '#3b82f6' };
  }
  
  return { text: '👋 Выполни привычку сегодня!', color: '#64748b' };
};

export const HabitTracker: React.FC<HabitTrackerProps> = ({ isOpen, onClose, onComplete }) => {
  // 🔄 Используем useSyncTool вместо ручной синхронизации (-40 строк!)
  const { data: habits, setData: setHabits, syncStatus } = useSyncTool<Habit[]>([], {
    storageKey: 'habit_tracker_data',
    debounceMs: 1000
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<typeof HABIT_PRESETS[0] | null>(null);
  
  // 🎯 Подтверждение выполнения привычки
  const [confirmingHabit, setConfirmingHabit] = useState<Habit | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const addHabit = () => {
    if (!newHabitName.trim() && !selectedPreset) return;
    
    const preset = selectedPreset || HABIT_PRESETS[0];
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim() || preset.name,
      emoji: preset.emoji,
      color: preset.color,
      image: preset.image,
      streak: 0,
      completedDays: [],
      createdAt: Date.now(),
      goal: 7,
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setSelectedPreset(null);
    setShowAddForm(false);
    // ❌ Убрано: onComplete(10) - XP не даётся за создание, только за выполнение!
  };

  // 🎯 Открыть подтверждение выполнения
  const openConfirmation = (habit: Habit) => {
    const isCompleted = habit.completedDays.includes(today);
    if (isCompleted) {
      // Если уже выполнено - отменяем без подтверждения
      undoHabitToday(habit.id);
    } else {
      // Если не выполнено - открываем подтверждение
      hapticMedium();
      setConfirmingHabit(habit);
    }
  };
  
  // ✅ Подтвердить выполнение привычки
  const confirmHabitComplete = () => {
    if (!confirmingHabit) return;
    
    hapticSuccess();
    setHabits(habits.map(habit => {
      if (habit.id !== confirmingHabit.id) return habit;
      
      const newCompletedDays = [...habit.completedDays, today];
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = habit.streak;
      if (habit.completedDays.includes(yesterdayStr) || habit.streak === 0) {
        newStreak = habit.streak + 1;
      }
      
      return { ...habit, completedDays: newCompletedDays, streak: newStreak };
    }));
    
    onComplete(5);
    setConfirmingHabit(null);
  };
  
  // ↩️ Отменить выполнение
  const undoHabitToday = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const newCompletedDays = habit.completedDays.filter(d => d !== today);
      const newStreak = Math.max(0, habit.streak - 1);
      
      return { ...habit, completedDays: newCompletedDays, streak: newStreak };
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const getWeekDays = () => {
    const days: { date: string; label: string; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1],
        isToday: i === 0,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const completedToday = habits.filter(h => h.completedDays.includes(today)).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  
  // 🏆 Лучший streak (сохраняем в localStorage)
  const bestStreakKey = 'habit_tracker_best_streak';
  const savedBestStreak = parseInt(localStorage.getItem(bestStreakKey) || '0', 10);
  const currentBestStreak = Math.max(savedBestStreak, totalStreak);
  
  // Обновляем рекорд если нужно
  if (totalStreak > savedBestStreak) {
    localStorage.setItem(bestStreakKey, totalStreak.toString());
  }
  
  // 💪 Мотивационное сообщение
  const motivation = getMotivationMessage(totalStreak, currentBestStreak, completedToday, habits.length);
  
  // Прогресс за неделю
  const getWeekProgress = () => {
    if (habits.length === 0) return { completed: 0, total: 0, percentage: 0 };
    let totalCompleted = 0;
    const totalPossible = habits.length * 7; // 7 дней * количество привычек
    
    weekDays.forEach(day => {
      habits.forEach(habit => {
        if (habit.completedDays.includes(day.date)) {
          totalCompleted++;
        }
      });
    });
    
    return {
      completed: totalCompleted,
      total: totalPossible,
      percentage: Math.round((totalCompleted / totalPossible) * 100)
    };
  };
  
  const weekProgress = getWeekProgress();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
              background: 'linear-gradient(180deg, #0a1a0f 0%, #0f2518 30%, #0a0a1a 100%)',
            }}
          />
          
          {/* Aurora effects */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 30% 0%, rgba(34,197,94,0.2) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 right-0 w-1/2 h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 100% 20%, rgba(16,185,129,0.15) 0%, transparent 60%)',
              filter: 'blur(50px)',
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />

          {/* Stars */}
          {[...Array(15)].map((_, i) => (
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
        <div className="sticky top-0 z-30 px-4 pt-4 pb-4">
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-xl overflow-hidden relative"
                  style={{ boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=100&h=100&fit=crop"
                    alt="Habits"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-600/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Привычки</h1>
                  <div className="flex items-center gap-2">
                  <p className="text-white/50 text-xs">{completedToday}/{habits.length} сегодня</p>
                    <SyncIndicator status={syncStatus} />
                  </div>
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

            {/* Week Progress Bar */}
            <div 
              className="mb-4 p-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-green-400" />
                  <span className="text-white/70 text-xs font-medium">Прогресс недели</span>
                </div>
                <span className="text-green-400 font-bold text-sm">{weekProgress.percentage}%</span>
              </div>
              <div 
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${weekProgress.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                    boxShadow: '0 0 15px rgba(34,197,94,0.5)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/30 text-[10px]">{weekProgress.completed} из {weekProgress.total} выполнено</span>
                <span className="text-white/30 text-[10px]">Цель: 100%</span>
              </div>
            </div>

            {/* 💪 Motivation Message */}
            <div 
              className="mb-3 p-3 rounded-xl text-center"
              style={{
                background: `${motivation.color}15`,
                border: `1px solid ${motivation.color}30`,
              }}
            >
              <span className="text-sm font-medium" style={{ color: motivation.color }}>
                {motivation.text}
              </span>
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              <div 
                className="flex-1 p-3 rounded-xl text-center"
                style={{ 
                  background: 'rgba(34,197,94,0.1)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(34,197,94,0.2)' 
                }}
              >
                <div className="text-xl font-bold text-green-400 flex items-center justify-center gap-1">
                  {completedToday}
                  <Check size={14} />
                </div>
                <div className="text-white/40 text-[10px]">Сегодня</div>
              </div>
              <div 
                className="flex-1 p-3 rounded-xl text-center"
                style={{ 
                  background: 'rgba(249,115,22,0.1)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(249,115,22,0.2)' 
                }}
              >
                <div className="text-xl font-bold text-orange-400 flex items-center justify-center gap-1">
                  {totalStreak}
                  <Flame size={14} />
                </div>
                <div className="text-white/40 text-[10px]">Streak</div>
              </div>
              <div 
                className="flex-1 p-3 rounded-xl text-center"
                style={{ 
                  background: 'rgba(234,179,8,0.1)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(234,179,8,0.2)' 
                }}
              >
                <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                  {currentBestStreak}
                  <Trophy size={14} />
                </div>
                <div className="text-white/40 text-[10px]">Рекорд</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 pb-40 overflow-y-auto h-[calc(100vh-240px)]">
          {habits.length === 0 && !showAddForm ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=200&h=200&fit=crop"
                  alt="Start"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Создай первую привычку!</h3>
              <p className="text-white/40 text-sm">21 день — и она станет частью тебя</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit, index) => {
                const isCompletedToday = habit.completedDays.includes(today);
                
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: isCompletedToday 
                        ? `linear-gradient(135deg, ${habit.color}20 0%, ${habit.color}10 100%)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      border: `1px solid ${isCompletedToday ? habit.color + '40' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {/* Header with image */}
                    <div className="flex items-center gap-3 p-4">
                      <button
                        onClick={() => openConfirmation(habit)}
                        className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0"
                        style={{
                          boxShadow: isCompletedToday ? `0 4px 15px ${habit.color}40` : 'none',
                        }}
                      >
                        <img 
                          src={habit.image}
                          alt={habit.name}
                          className="w-full h-full object-cover"
                        />
                        <div 
                          className="absolute inset-0 flex items-center justify-center transition-all"
                          style={{
                            background: isCompletedToday ? habit.color : 'rgba(0,0,0,0.5)',
                          }}
                        >
                          {isCompletedToday ? (
                            <Check size={24} className="text-white" strokeWidth={3} />
                          ) : (
                            <span className="text-2xl">{habit.emoji}</span>
                          )}
                        </div>
                      </button>
                      
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{habit.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {habit.streak > 0 && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1"
                              style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c' }}
                            >
                              <Flame size={10} /> {habit.streak} дней
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} className="text-white/40 hover:text-red-400" />
                      </button>
                    </div>

                    {/* Week Progress */}
                    <div className="flex gap-1.5 px-4 pb-4">
                      {weekDays.map((day) => {
                        const isCompleted = habit.completedDays.includes(day.date);
                        return (
                          <div key={day.date} className="flex-1 text-center">
                            <div 
                              className="w-full aspect-square rounded-lg flex items-center justify-center mb-1 transition-all"
                              style={{
                                background: isCompleted 
                                  ? habit.color 
                                  : day.isToday 
                                    ? 'rgba(255,255,255,0.1)' 
                                    : 'rgba(255,255,255,0.03)',
                                border: day.isToday && !isCompleted ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                                boxShadow: isCompleted ? `0 2px 8px ${habit.color}50` : 'none',
                              }}
                            >
                              {isCompleted && <Check size={12} className="text-white" />}
                            </div>
                            <span className={`text-[9px] ${day.isToday ? 'text-white font-bold' : 'text-white/30'}`}>
                              {day.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 z-50 p-4 pb-8"
              style={{
                background: 'linear-gradient(to top, #0a0a1a 0%, #0a0a1a 80%, transparent 100%)',
              }}
            >
              <div 
                className="rounded-3xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <h3 className="text-white font-bold mb-3">Новая привычка</h3>
                
                {/* Presets with images */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {HABIT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setNewHabitName(preset.name);
                      }}
                      className="aspect-square rounded-xl overflow-hidden relative transition-all"
                      style={{
                        border: selectedPreset?.name === preset.name 
                          ? `2px solid ${preset.color}` 
                          : '2px solid transparent',
                        boxShadow: selectedPreset?.name === preset.name 
                          ? `0 4px 15px ${preset.color}40` 
                          : 'none',
                      }}
                    >
                      <img 
                        src={preset.image}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `${preset.color}60` }}
                      >
                        <span className="text-2xl">{preset.emoji}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Или введи своё название..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 mb-4"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 rounded-xl font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={addHabit}
                    disabled={!newHabitName.trim() && !selectedPreset}
                    className="flex-1 py-3 rounded-xl font-medium text-white disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      boxShadow: '0 4px 15px rgba(34,197,94,0.4)',
                    }}
                  >
                    Создать
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Button */}
        {!showAddForm && (
          <div className="fixed bottom-24 left-4 right-4 z-40">
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              Добавить привычку
            </motion.button>
          </div>
        )}

        {/* 🎯 Confirmation Modal */}
        <AnimatePresence>
          {confirmingHabit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setConfirmingHabit(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {/* Header */}
                <div className="p-6 text-center">
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden relative"
                    style={{ boxShadow: `0 8px 32px ${confirmingHabit.color}40` }}
                  >
                    <img 
                      src={confirmingHabit.image}
                      alt={confirmingHabit.name}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: `${confirmingHabit.color}80` }}
                    >
                      <span className="text-4xl">{confirmingHabit.emoji}</span>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{confirmingHabit.name}</h3>
                  <p className="text-white/50 text-sm">Ты действительно выполнил(а) эту привычку сегодня?</p>
                </div>

                {/* Stats */}
                <div className="px-6 pb-4">
                  <div 
                    className="flex items-center justify-center gap-6 p-4 rounded-2xl mb-4"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                        {confirmingHabit.streak}
                        <Flame size={18} />
                      </div>
                      <div className="text-white/40 text-xs">Текущий streak</div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                        +5
                        <span className="text-sm">XP</span>
                      </div>
                      <div className="text-white/40 text-xs">Награда</div>
                    </div>
                  </div>
                  
                  {/* Warning */}
                  <div 
                    className="p-3 rounded-xl mb-4 flex items-start gap-3"
                    style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}
                  >
                    <AlertCircle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-yellow-300/80 text-xs">
                      Будь честен(на) с собой! Привычки работают только когда ты действительно их выполняешь. 💪
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                  <motion.button
                    onClick={() => setConfirmingHabit(null)}
                    className="flex-1 py-4 rounded-2xl font-medium text-white/50"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    onClick={confirmHabitComplete}
                    className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${confirmingHabit.color} 0%, ${confirmingHabit.color}cc 100%)`,
                      boxShadow: `0 8px 32px ${confirmingHabit.color}40`,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Check size={20} />
                    Да, выполнил(а)!
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default HabitTracker;
