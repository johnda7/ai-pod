import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, Check, Clock, Flame } from 'lucide-react';

interface DailyRewardsProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: (day: number, xp: number, coins: number) => void;
  currentStreak: number;
}

interface DayReward {
  day: number;
  xp: number;
  coins: number;
  emoji: string;
  isSpecial?: boolean;
}

const REWARDS: DayReward[] = [
  { day: 1, xp: 10, coins: 5, emoji: '🎁' },
  { day: 2, xp: 15, coins: 10, emoji: '⭐' },
  { day: 3, xp: 20, coins: 15, emoji: '💎' },
  { day: 4, xp: 25, coins: 20, emoji: '🔥' },
  { day: 5, xp: 30, coins: 25, emoji: '💫' },
  { day: 6, xp: 40, coins: 30, emoji: '🌟' },
  { day: 7, xp: 100, coins: 50, emoji: '👑', isSpecial: true },
];

export const DailyRewards: React.FC<DailyRewardsProps> = ({ 
  isOpen, 
  onClose, 
  onClaim,
  currentStreak 
}) => {
  const [claimedToday, setClaimedToday] = useState(false);
  const [claimingDay, setClaimingDay] = useState<number | null>(null);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);

  useEffect(() => {
    // Check if already claimed today
    const saved = localStorage.getItem('daily_reward_last_claim');
    if (saved) {
      const today = new Date().toDateString();
      setLastClaimDate(saved);
      setClaimedToday(saved === today);
    }
  }, [isOpen]);

  const handleClaim = (reward: DayReward) => {
    if (claimedToday) return;
    
    setClaimingDay(reward.day);
    
    setTimeout(() => {
      const today = new Date().toDateString();
      localStorage.setItem('daily_reward_last_claim', today);
      setClaimedToday(true);
      setClaimingDay(null);
      onClaim(reward.day, reward.xp, reward.coins);
    }, 1000);
  };

  const currentDay = Math.min(currentStreak % 7 || 7, 7);
  const canClaimDay = claimedToday ? -1 : currentDay;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
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
            boxShadow: '0 25px 80px rgba(99,102,241,0.3)',
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
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-colors z-50"
            >
              <X size={18} className="text-white" />
            </button>
            
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-3"
            >
              🎁
            </motion.div>
            
            <h2 className="text-2xl font-black text-white mb-1">Ежедневные награды</h2>
            <p className="text-white/60 text-sm">Заходи каждый день за бонусами!</p>
            
            {/* Streak counter */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Flame size={20} className="text-orange-400" />
              <span className="text-white font-bold">{currentStreak} дней подряд</span>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1.5">
              {REWARDS.map((reward) => {
                const isPast = reward.day < currentDay && !claimedToday;
                const isCurrent = reward.day === canClaimDay;
                const isFuture = reward.day > currentDay || (claimedToday && reward.day >= currentDay);
                const isClaiming = claimingDay === reward.day;
                
                return (
                  <motion.button
                    key={reward.day}
                    whileHover={isCurrent ? { scale: 1.1 } : {}}
                    whileTap={isCurrent ? { scale: 0.95 } : {}}
                    onClick={() => isCurrent && handleClaim(reward)}
                    disabled={!isCurrent}
                    className={`
                      relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all
                      ${isCurrent ? 'cursor-pointer' : 'cursor-default'}
                      ${reward.isSpecial ? 'col-span-1' : ''}
                    `}
                    style={{
                      background: isCurrent 
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : isPast 
                          ? 'rgba(34,197,94,0.2)'
                          : 'rgba(255,255,255,0.05)',
                      border: isCurrent 
                        ? '2px solid rgba(255,255,255,0.3)'
                        : isPast 
                          ? '1px solid rgba(34,197,94,0.3)'
                          : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: isCurrent ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
                    }}
                  >
                    {/* Day number */}
                    <span className={`text-[8px] font-bold ${
                      isCurrent ? 'text-white' : isPast ? 'text-green-400' : 'text-white/40'
                    }`}>
                      День {reward.day}
                    </span>
                    
                    {/* Emoji/Icon */}
                    <span className={`text-lg ${isFuture ? 'grayscale opacity-50' : ''}`}>
                      {isPast ? '✅' : reward.emoji}
                    </span>
                    
                    {/* Claiming animation */}
                    {isClaiming && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        className="absolute inset-0 flex items-center justify-center bg-indigo-500 rounded-xl"
                      >
                        <Sparkles size={20} className="text-white" />
                      </motion.div>
                    )}
                    
                    {/* Current indicator */}
                    {isCurrent && !isClaiming && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Current reward details */}
            {!claimedToday && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                <p className="text-white/60 text-xs mb-2">Награда за день {currentDay}:</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400">⚡</span>
                    <span className="text-white font-bold">+{REWARDS[currentDay - 1].xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400">🪙</span>
                    <span className="text-white font-bold">+{REWARDS[currentDay - 1].coins}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {claimedToday && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl text-center"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <span className="text-green-400 font-medium text-sm">Награда получена!</span>
                </div>
                <p className="text-white/40 text-xs mt-1 flex items-center justify-center gap-1">
                  <Clock size={10} />
                  Приходи завтра за новой наградой
                </p>
              </motion.div>
            )}
          </div>

          {/* Claim Button */}
          {!claimedToday && (
            <div className="p-4 pt-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleClaim(REWARDS[currentDay - 1])}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}
              >
                <Gift size={20} />
                Забрать награду
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyRewards;



