import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Zap, Target, TrendingUp, Star, Calendar, Award } from 'lucide-react';

interface WeeklySummaryProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    lessonsCompleted: number;
    xpEarned: number;
    coinsEarned: number;
    streakDays: number;
    toolsUsed: number;
    meditationMinutes: number;
  };
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ isOpen, onClose, stats }) => {
  const achievements = [
    stats.lessonsCompleted >= 5 && { emoji: '📚', text: 'Прошёл 5+ уроков' },
    stats.xpEarned >= 500 && { emoji: '⚡', text: 'Заработал 500+ XP' },
    stats.streakDays >= 7 && { emoji: '🔥', text: '7 дней подряд' },
    stats.toolsUsed >= 10 && { emoji: '🛠', text: 'Использовал инструменты 10+ раз' },
    stats.meditationMinutes >= 30 && { emoji: '🧘', text: '30+ минут медитации' },
  ].filter(Boolean);

  const getGrade = () => {
    const score = 
      (stats.lessonsCompleted * 20) + 
      (stats.xpEarned / 10) + 
      (stats.streakDays * 30) + 
      (stats.toolsUsed * 5);
    
    if (score >= 500) return { grade: 'S', color: '#f59e0b', text: 'Легенда!' };
    if (score >= 300) return { grade: 'A', color: '#22c55e', text: 'Отлично!' };
    if (score >= 200) return { grade: 'B', color: '#3b82f6', text: 'Хорошо!' };
    if (score >= 100) return { grade: 'C', color: '#8b5cf6', text: 'Неплохо!' };
    return { grade: 'D', color: '#64748b', text: 'Можно лучше!' };
  };

  const grade = getGrade();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-6 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center z-50"
            >
              <X size={18} className="text-white" />
            </button>
            
            <div className="flex items-center justify-center gap-2 mb-3">
              <Calendar size={20} className="text-indigo-400" />
              <span className="text-white/60 text-sm font-medium">Итоги недели</span>
            </div>
            
            {/* Grade */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-3"
              style={{
                background: `linear-gradient(135deg, ${grade.color}40 0%, ${grade.color}20 100%)`,
                border: `3px solid ${grade.color}`,
                boxShadow: `0 0 40px ${grade.color}40`,
              }}
            >
              <span className="text-5xl font-black" style={{ color: grade.color }}>
                {grade.grade}
              </span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-xl font-bold"
            >
              {grade.text}
            </motion.p>
          </div>

          {/* Stats Grid */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-2xl text-center"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                <div className="text-3xl font-black text-indigo-400">{stats.lessonsCompleted}</div>
                <div className="text-white/40 text-xs mt-1 flex items-center justify-center gap-1">
                  <Target size={10} />
                  Уроков
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-2xl text-center"
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}
              >
                <div className="text-3xl font-black text-amber-400">{stats.xpEarned}</div>
                <div className="text-white/40 text-xs mt-1 flex items-center justify-center gap-1">
                  <Zap size={10} />
                  XP
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-2xl text-center"
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <div className="text-3xl font-black text-red-400 flex items-center justify-center gap-1">
                  {stats.streakDays}
                  <Flame size={20} />
                </div>
                <div className="text-white/40 text-xs mt-1">Streak</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-2xl text-center"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <div className="text-3xl font-black text-green-400">{stats.coinsEarned}</div>
                <div className="text-white/40 text-xs mt-1">🪙 Монет</div>
              </motion.div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award size={14} className="text-yellow-400" />
                  <span className="text-white/60 text-xs font-medium">Достижения недели</span>
                </div>
                <div className="space-y-2">
                  {achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-xl bg-yellow-500/10"
                    >
                      <span className="text-lg">{achievement && achievement.emoji}</span>
                      <span className="text-white/70 text-sm">{achievement && achievement.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Motivation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                border: '1px solid rgba(236,72,153,0.2)',
              }}
            >
              <p className="text-white/80 text-sm italic">
                "Каждый шаг вперёд — это победа. Продолжай в том же духе!"
              </p>
              <p className="text-pink-400/60 text-xs mt-2">— Катя</p>
            </motion.div>
          </div>

          {/* Close Button */}
          <div className="p-4 pt-0">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              Продолжить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeeklySummary;



