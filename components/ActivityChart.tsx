import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Calendar, Zap } from 'lucide-react';

interface ActivityChartProps {
  completedTaskIds: string[];
  xp: number;
  streak: number;
}

// Generate activity data for the last 7 days
const generateActivityData = (completedTaskIds: string[]) => {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const today = new Date().getDay();
  
  // Simulate activity based on completed tasks
  return days.map((day, index) => {
    // Create some variation based on completed tasks count
    const baseActivity = completedTaskIds.length > 0 ? Math.random() * 60 + 20 : 0;
    const activity = index === (today === 0 ? 6 : today - 1) 
      ? Math.min(100, baseActivity + 30) // Today is more active
      : baseActivity;
    
    return {
      day,
      value: Math.round(activity),
      isToday: index === (today === 0 ? 6 : today - 1),
    };
  });
};

export const ActivityChart: React.FC<ActivityChartProps> = ({ 
  completedTaskIds, 
  xp, 
  streak 
}) => {
  const activityData = useMemo(() => generateActivityData(completedTaskIds), [completedTaskIds]);
  const maxValue = Math.max(...activityData.map(d => d.value), 1);

  // Calculate stats
  const totalLessons = completedTaskIds.length;
  const avgActivity = Math.round(activityData.reduce((a, b) => a + b.value, 0) / 7);
  const weeklyXp = Math.round(xp * 0.3); // Estimate weekly XP

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
            border: '1px solid rgba(34,197,94,0.2)',
          }}
        >
          <div className="text-2xl font-black text-green-400">{totalLessons}</div>
          <div className="text-[9px] text-white/40 font-medium uppercase">Уроков</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
            {streak}
            <Flame size={16} className="text-orange-400" />
          </div>
          <div className="text-[9px] text-white/40 font-medium uppercase">Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div className="text-2xl font-black text-indigo-400 flex items-center justify-center gap-1">
            {weeklyXp}
            <Zap size={14} className="text-yellow-400" />
          </div>
          <div className="text-[9px] text-white/40 font-medium uppercase">XP/нед</div>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-400" />
            <span className="text-white/70 text-xs font-medium">Активность за неделю</span>
          </div>
          <span className="text-white/40 text-[10px]">{avgActivity}% средняя</span>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-20">
          {activityData.map((data, index) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.value / maxValue) * 100}%` }}
                transition={{ delay: 0.5 + index * 0.05, duration: 0.5, ease: 'easeOut' }}
                className={`w-full rounded-t-lg min-h-[4px] ${
                  data.isToday 
                    ? 'bg-gradient-to-t from-indigo-500 to-purple-500' 
                    : 'bg-gradient-to-t from-white/10 to-white/20'
                }`}
                style={{
                  boxShadow: data.isToday ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                }}
              />
              <span className={`text-[9px] font-medium ${
                data.isToday ? 'text-indigo-400' : 'text-white/30'
              }`}>
                {data.day}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.05) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-purple-400" />
            <span className="text-white/70 text-xs font-medium">Недельная цель</span>
          </div>
          <span className="text-purple-400 text-xs font-bold">{Math.min(totalLessons, 7)}/7 уроков</span>
        </div>
        
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalLessons / 7) * 100, 100)}%` }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          />
        </div>
        
        {totalLessons >= 7 && (
          <div className="flex items-center gap-1.5 mt-2 text-green-400">
            <span className="text-sm">🎉</span>
            <span className="text-xs font-medium">Цель достигнута!</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActivityChart;



