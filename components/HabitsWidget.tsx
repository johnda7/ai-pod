import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Plus, AlertTriangle, Calendar } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  streak: number;
  completedDays: string[];
}

interface HabitsWidgetProps {
  onOpenHabits: () => void;
  onXpReward?: (xp: number) => void;
}

/**
 * 📊 Виджет привычек для главной страницы
 * - Показывает прогресс за сегодня
 * - Показывает текущий стрик
 * - Предупреждает о потерянном стрике
 */
export const HabitsWidget: React.FC<HabitsWidgetProps> = ({ onOpenHabits, onXpReward }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [brokenStreak, setBrokenStreak] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const saved = localStorage.getItem('habit_tracker_data');
    if (saved) {
      const parsed: Habit[] = JSON.parse(saved);
      setHabits(parsed);
      
      // Проверяем сломанный стрик
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const hadStreakYesterday = parsed.some(h => 
        h.streak > 0 && 
        !h.completedDays.includes(yesterdayStr) && 
        !h.completedDays.includes(today)
      );
      
      setBrokenStreak(hadStreakYesterday);
    }
  }, [today]);

  const completedToday = habits.filter(h => h.completedDays.includes(today)).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const weekProgress = getWeekProgress();

  function getWeekProgress() {
    if (habits.length === 0) return 0;
    const weekDays = getLastWeekDays();
    let completed = 0;
    const total = habits.length * 7;
    
    weekDays.forEach(day => {
      habits.forEach(habit => {
        if (habit.completedDays.includes(day)) {
          completed++;
        }
      });
    });
    
    return Math.round((completed / total) * 100);
  }

  function getLastWeekDays() {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  // Если нет привычек - не показываем виджет
  if (habits.length === 0) {
    return (
      <motion.button
        onClick={onOpenHabits}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-4 rounded-2xl text-left"
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.2)' }}
          >
            <Plus size={20} className="text-green-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Создай первую привычку</h4>
            <p className="text-white/40 text-xs">21 день → новая версия тебя</p>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
        border: '1px solid rgba(34,197,94,0.2)',
      }}
    >
      {/* Header */}
      <button 
        onClick={onOpenHabits}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-green-400" />
            <span className="text-white font-bold text-sm">Привычки</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs">{completedToday}/{habits.length} сегодня</span>
            {totalStreak > 0 && (
              <span className="flex items-center gap-1 text-orange-400 text-xs font-bold">
                <Flame size={12} /> {totalStreak}
              </span>
            )}
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-2 rounded-full overflow-hidden mb-2"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${weekProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{
              background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
              boxShadow: '0 0 10px rgba(34,197,94,0.5)',
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-white/40">Прогресс недели</span>
          <span className="text-green-400 font-bold">{weekProgress}%</span>
        </div>
      </button>

      {/* Quick habits */}
      <div className="px-4 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {habits.slice(0, 4).map((habit, index) => {
          const isCompletedToday = habit.completedDays.includes(today);
          return (
            <motion.div
              key={habit.id}
              className="flex-shrink-0 w-16 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-1 relative overflow-hidden"
                animate={isCompletedToday ? { 
                  boxShadow: [
                    `0 4px 15px ${habit.color}30`,
                    `0 4px 25px ${habit.color}50`,
                    `0 4px 15px ${habit.color}30`
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: isCompletedToday ? habit.color : 'rgba(255,255,255,0.05)',
                }}
              >
                {/* Shimmer effect on completed */}
                {isCompletedToday && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                )}
                {isCompletedToday ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <Check size={20} className="text-white" />
                  </motion.div>
                ) : (
                  <motion.span 
                    className="text-xl"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  >
                    {habit.emoji}
                  </motion.span>
                )}
              </motion.div>
              <span className="text-white/50 text-[10px] truncate block">{habit.name}</span>
            </motion.div>
          );
        })}
        
        {habits.length > 4 && (
          <div className="flex-shrink-0 w-12 text-center">
            <div 
              className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-1"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <span className="text-white/50 text-sm">+{habits.length - 4}</span>
            </div>
          </div>
        )}
      </div>

      {/* Broken streak warning */}
      <AnimatePresence>
        {brokenStreak && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3"
          >
            <div 
              className="p-3 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <AlertTriangle size={16} className="text-red-400" />
              <div className="flex-1">
                <span className="text-red-400 text-xs font-medium">Стрик под угрозой!</span>
                <p className="text-white/40 text-[10px]">Выполни привычку сегодня</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenHabits(); }}
                className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                style={{ background: 'rgba(239,68,68,0.3)' }}
              >
                Спасти
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HabitsWidget;

