import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Flame, Trophy, Star, Zap, Target, Calendar, TrendingUp } from 'lucide-react';

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
  streak: number;
  completedDays: string[]; // ISO date strings
  createdAt: number;
  goal: number; // days per week
}

const HABIT_PRESETS = [
  { name: 'Медитация', emoji: '🧘', color: '#8b5cf6' },
  { name: 'Спорт', emoji: '💪', color: '#22c55e' },
  { name: 'Чтение', emoji: '📚', color: '#3b82f6' },
  { name: 'Вода', emoji: '💧', color: '#06b6d4' },
  { name: 'Сон 8ч', emoji: '😴', color: '#6366f1' },
  { name: 'Без соцсетей', emoji: '📵', color: '#ef4444' },
  { name: 'Учёба', emoji: '📖', color: '#f59e0b' },
  { name: 'Прогулка', emoji: '🚶', color: '#10b981' },
];

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const HabitTracker: React.FC<HabitTrackerProps> = ({ isOpen, onClose, onComplete }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<typeof HABIT_PRESETS[0] | null>(null);

  // Load habits
  useEffect(() => {
    const saved = localStorage.getItem('habit_tracker_data');
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  }, []);

  // Save habits
  useEffect(() => {
    localStorage.setItem('habit_tracker_data', JSON.stringify(habits));
  }, [habits]);

  const today = new Date().toISOString().split('T')[0];

  const addHabit = () => {
    if (!newHabitName.trim() && !selectedPreset) return;
    
    const preset = selectedPreset || HABIT_PRESETS[0];
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim() || preset.name,
      emoji: preset.emoji,
      color: preset.color,
      streak: 0,
      completedDays: [],
      createdAt: Date.now(),
      goal: 7,
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setSelectedPreset(null);
    setShowAddForm(false);
    onComplete(10);
  };

  const toggleHabitToday = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const isCompleted = habit.completedDays.includes(today);
      let newCompletedDays: string[];
      let newStreak = habit.streak;
      
      if (isCompleted) {
        // Remove today
        newCompletedDays = habit.completedDays.filter(d => d !== today);
        newStreak = Math.max(0, newStreak - 1);
      } else {
        // Add today
        newCompletedDays = [...habit.completedDays, today];
        
        // Check if yesterday was completed for streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (habit.completedDays.includes(yesterdayStr) || habit.streak === 0) {
          newStreak = habit.streak + 1;
        }
        
        onComplete(5); // XP for completing habit
      }
      
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-14 pb-4">
          <div 
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
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.2) 100%)',
                  }}
                >
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Привычки</h1>
                  <p className="text-white/50 text-xs">{completedToday}/{habits.length} сегодня</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex-1 p-3 rounded-xl bg-green-500/15 text-center">
                <div className="text-xl font-bold text-green-400 flex items-center justify-center gap-1">
                  {completedToday}
                  <Check size={16} />
                </div>
                <div className="text-white/40 text-[10px]">Сегодня</div>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-orange-500/15 text-center">
                <div className="text-xl font-bold text-orange-400 flex items-center justify-center gap-1">
                  {totalStreak}
                  <Flame size={16} />
                </div>
                <div className="text-white/40 text-[10px]">Streak</div>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-indigo-500/15 text-center">
                <div className="text-xl font-bold text-indigo-400">{habits.length}</div>
                <div className="text-white/40 text-[10px]">Привычек</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-240px)]">
          {habits.length === 0 && !showAddForm ? (
            <div 
              className="rounded-3xl p-6 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span className="text-5xl mb-4 block">🎯</span>
              <h3 className="text-white font-bold text-lg mb-2">Создай первую привычку!</h3>
              <p className="text-white/40 text-sm">21 день — и она станет частью тебя</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompletedToday = habit.completedDays.includes(today);
                
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4"
                    style={{
                      background: isCompletedToday 
                        ? `linear-gradient(135deg, ${habit.color}20 0%, ${habit.color}10 100%)`
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isCompletedToday ? habit.color + '40' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isCompletedToday ? '' : 'border-2 border-dashed border-white/20'
                        }`}
                        style={{
                          background: isCompletedToday ? habit.color : 'transparent',
                        }}
                      >
                        {isCompletedToday ? (
                          <Check size={24} className="text-white" strokeWidth={3} />
                        ) : (
                          <span className="text-2xl opacity-50">{habit.emoji}</span>
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{habit.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {habit.streak > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 flex items-center gap-1">
                              <Flame size={10} /> {habit.streak} дней
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <span className="text-2xl">{habit.emoji}</span>
                    </div>

                    {/* Week Progress */}
                    <div className="flex gap-1">
                      {weekDays.map((day) => {
                        const isCompleted = habit.completedDays.includes(day.date);
                        return (
                          <div key={day.date} className="flex-1 text-center">
                            <div 
                              className={`w-full aspect-square rounded-lg flex items-center justify-center mb-1 ${
                                isCompleted 
                                  ? '' 
                                  : day.isToday 
                                    ? 'border border-dashed border-white/30' 
                                    : 'bg-white/5'
                              }`}
                              style={{
                                background: isCompleted ? habit.color : undefined,
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
                background: 'linear-gradient(to top, #020617 0%, #020617 80%, transparent 100%)',
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
                
                {/* Presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {HABIT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setNewHabitName(preset.name);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                        selectedPreset?.name === preset.name 
                          ? 'ring-2 ring-white/50' 
                          : ''
                      }`}
                      style={{
                        background: `${preset.color}30`,
                        color: preset.color,
                      }}
                    >
                      <span>{preset.emoji}</span>
                      {preset.name}
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
                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={addHabit}
                    disabled={!newHabitName.trim() && !selectedPreset}
                    className="flex-1 py-3 rounded-xl font-medium text-white disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
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
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
              }}
            >
              <Plus size={20} />
              Добавить привычку
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default HabitTracker;

