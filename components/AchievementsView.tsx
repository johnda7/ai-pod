import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ACHIEVEMENTS } from '../constants';
import { User, Achievement } from '../types';
import { Trophy, Star, Flame, Zap, Lock, Gift, CheckCircle, Sparkles } from 'lucide-react';

interface AchievementsViewProps {
  user: User;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ user }) => {
  // Calculate which achievements are unlocked
  const achievementStatus = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      let isUnlocked = false;
      let progress = 0;
      
      switch (achievement.requirement.type) {
        case 'TASKS_COMPLETED':
          progress = user.completedTaskIds.length;
          isUnlocked = progress >= achievement.requirement.value;
          break;
        case 'STREAK_DAYS':
          progress = user.streak;
          isUnlocked = progress >= achievement.requirement.value;
          break;
        case 'XP_EARNED':
          progress = user.xp;
          isUnlocked = progress >= achievement.requirement.value;
          break;
        case 'COINS_EARNED':
          progress = user.coins;
          isUnlocked = progress >= achievement.requirement.value;
          break;
        case 'BOSS_DEFEATED':
          // Count boss tasks completed
          const bossIds = ['t6', 't14', 't19']; // Boss task IDs
          progress = user.completedTaskIds.filter(id => bossIds.includes(id)).length;
          isUnlocked = progress >= achievement.requirement.value;
          break;
        case 'WEEK_COMPLETED':
          // Check if all tasks of week 1 are completed
          const week1Tasks = ['t1', 't2', 't3', 't4', 't5', 't6'];
          progress = user.completedTaskIds.filter(id => week1Tasks.includes(id)).length;
          isUnlocked = progress >= week1Tasks.length;
          break;
      }
      
      return {
        ...achievement,
        isUnlocked,
        progress,
        progressPercent: Math.min(100, (progress / achievement.requirement.value) * 100)
      };
    });
  }, [user]);

  const unlockedCount = achievementStatus.filter(a => a.isUnlocked).length;
  const totalCount = achievementStatus.length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'LEARNING': return <Star className="w-4 h-4" />;
      case 'STREAK': return <Flame className="w-4 h-4" />;
      case 'SPECIAL': return <Zap className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LEARNING': return 'from-yellow-500 to-orange-500';
      case 'STREAK': return 'from-orange-500 to-red-500';
      case 'SPECIAL': return 'from-purple-500 to-pink-500';
      default: return 'from-indigo-500 to-purple-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] pb-40 pt-28 px-4">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Достижения</h1>
        <p className="text-slate-400">
          Разблокировано: <span className="text-yellow-400 font-bold">{unlockedCount}</span> / {totalCount}
        </p>
        
        {/* Progress bar */}
        <div className="mt-4 max-w-xs mx-auto">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div className="space-y-4">
        {achievementStatus.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`relative overflow-hidden rounded-2xl border p-4 ${
              achievement.isUnlocked 
                ? 'bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-yellow-500/30' 
                : 'bg-slate-900/50 border-white/5'
            }`}
          >
            {/* Unlocked glow */}
            {achievement.isUnlocked && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl" />
            )}
            
            <div className="flex items-center gap-4 relative z-10">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                achievement.isUnlocked 
                  ? `bg-gradient-to-br ${getCategoryColor(achievement.category)} shadow-lg` 
                  : 'bg-slate-800 border border-white/10'
              }`}>
                {achievement.isUnlocked ? (
                  <span>{achievement.icon}</span>
                ) : (
                  <Lock className="w-6 h-6 text-slate-600" />
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold ${achievement.isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                    {achievement.title}
                  </h3>
                  {achievement.isUnlocked && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <p className={`text-sm ${achievement.isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                  {achievement.description}
                </p>
                
                {/* Progress bar for locked achievements */}
                {!achievement.isUnlocked && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{achievement.progress} / {achievement.requirement.value}</span>
                      <span>{Math.round(achievement.progressPercent)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${achievement.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reward */}
              <div className="text-right">
                {achievement.isUnlocked ? (
                  <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                    <Sparkles className="w-4 h-4" />
                    Получено
                  </div>
                ) : (
                  <div className="space-y-1">
                    {achievement.reward.xp && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Star className="w-3 h-3" /> +{achievement.reward.xp} XP
                      </div>
                    )}
                    {achievement.reward.coins && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Gift className="w-3 h-3" /> +{achievement.reward.coins}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsView;



