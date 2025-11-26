import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Clock, Star, Zap, Target, Check, ChevronRight, Gift } from 'lucide-react';

interface ChallengeSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number, coins: number) => void;
  userXp: number;
  completedLessons: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'daily' | 'weekly' | 'special';
  requirement: {
    type: 'lessons' | 'xp' | 'streak' | 'tools' | 'meditation';
    value: number;
  };
  reward: {
    xp: number;
    coins: number;
  };
  expiresAt?: number;
  progress?: number;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'd1',
    title: 'Утренний старт',
    description: 'Заверши 1 урок до 12:00',
    emoji: '🌅',
    type: 'daily',
    requirement: { type: 'lessons', value: 1 },
    reward: { xp: 30, coins: 15 },
  },
  {
    id: 'd2',
    title: 'Фокус дня',
    description: 'Используй Помодоро 2 раза',
    emoji: '🍅',
    type: 'daily',
    requirement: { type: 'tools', value: 2 },
    reward: { xp: 25, coins: 10 },
  },
  {
    id: 'd3',
    title: 'Момент тишины',
    description: 'Проведи 5 минут в медитации',
    emoji: '🧘',
    type: 'daily',
    requirement: { type: 'meditation', value: 5 },
    reward: { xp: 20, coins: 10 },
  },
];

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'w1',
    title: 'Недельный марафон',
    description: 'Заверши 5 уроков за неделю',
    emoji: '🏃',
    type: 'weekly',
    requirement: { type: 'lessons', value: 5 },
    reward: { xp: 150, coins: 75 },
  },
  {
    id: 'w2',
    title: 'XP охотник',
    description: 'Набери 500 XP за неделю',
    emoji: '⚡',
    type: 'weekly',
    requirement: { type: 'xp', value: 500 },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 'w3',
    title: 'Огненная серия',
    description: 'Поддержи streak 7 дней',
    emoji: '🔥',
    type: 'weekly',
    requirement: { type: 'streak', value: 7 },
    reward: { xp: 200, coins: 100 },
  },
];

const SPECIAL_CHALLENGES: Challenge[] = [
  {
    id: 's1',
    title: 'Первые шаги',
    description: 'Заверши свой первый урок',
    emoji: '👣',
    type: 'special',
    requirement: { type: 'lessons', value: 1 },
    reward: { xp: 50, coins: 25 },
  },
  {
    id: 's2',
    title: 'Исследователь',
    description: 'Попробуй все инструменты',
    emoji: '🔍',
    type: 'special',
    requirement: { type: 'tools', value: 6 },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 's3',
    title: 'Мастер мотивации',
    description: 'Набери 1000 XP',
    emoji: '👑',
    type: 'special',
    requirement: { type: 'xp', value: 1000 },
    reward: { xp: 250, coins: 125 },
  },
];

export const ChallengeSystem: React.FC<ChallengeSystemProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  userXp,
  completedLessons 
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Load completed challenges
  useEffect(() => {
    const saved = localStorage.getItem('completed_challenges');
    if (saved) {
      setCompletedChallenges(JSON.parse(saved));
    }
  }, []);

  // Save completed challenges
  useEffect(() => {
    localStorage.setItem('completed_challenges', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  const getChallengeProgress = (challenge: Challenge): number => {
    switch (challenge.requirement.type) {
      case 'lessons':
        return Math.min(completedLessons, challenge.requirement.value);
      case 'xp':
        return Math.min(userXp, challenge.requirement.value);
      default:
        return 0;
    }
  };

  const isChallengeComplete = (challenge: Challenge): boolean => {
    return getChallengeProgress(challenge) >= challenge.requirement.value;
  };

  const isClaimed = (challengeId: string): boolean => {
    return completedChallenges.includes(challengeId);
  };

  const claimReward = (challenge: Challenge) => {
    if (!isChallengeComplete(challenge) || isClaimed(challenge.id)) return;
    
    setClaimingId(challenge.id);
    
    setTimeout(() => {
      setCompletedChallenges([...completedChallenges, challenge.id]);
      onComplete(challenge.reward.xp, challenge.reward.coins);
      setClaimingId(null);
    }, 1000);
  };

  const getChallenges = () => {
    switch (activeTab) {
      case 'daily': return DAILY_CHALLENGES;
      case 'weekly': return WEEKLY_CHALLENGES;
      case 'special': return SPECIAL_CHALLENGES;
    }
  };

  const tabs = [
    { id: 'daily', label: 'Дневные', emoji: '☀️' },
    { id: 'weekly', label: 'Недельные', emoji: '📅' },
    { id: 'special', label: 'Особые', emoji: '⭐' },
  ];

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
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />
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
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(234,88,12,0.2) 100%)',
                  }}
                >
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Челленджи</h1>
                  <p className="text-white/50 text-xs">Выполняй задания — получай награды!</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                      : 'bg-white/5 text-white/50'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-220px)]">
          <div className="space-y-3">
            {getChallenges().map((challenge, index) => {
              const progress = getChallengeProgress(challenge);
              const isComplete = isChallengeComplete(challenge);
              const claimed = isClaimed(challenge.id);
              const isClaiming = claimingId === challenge.id;
              const progressPercent = Math.min((progress / challenge.requirement.value) * 100, 100);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl p-4 ${claimed ? 'opacity-60' : ''}`}
                  style={{
                    background: isComplete && !claimed
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)'
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${
                      isComplete && !claimed 
                        ? 'rgba(34,197,94,0.3)' 
                        : 'rgba(255,255,255,0.1)'
                    }`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: claimed 
                          ? 'rgba(34,197,94,0.2)'
                          : 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,88,12,0.1) 100%)',
                      }}
                    >
                      {claimed ? (
                        <Check size={24} className="text-green-400" />
                      ) : (
                        <span className="text-2xl">{challenge.emoji}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold mb-1">{challenge.title}</h4>
                      <p className="text-white/50 text-sm mb-2">{challenge.description}</p>
                      
                      {/* Progress Bar */}
                      {!claimed && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/40">{progress}/{challenge.requirement.value}</span>
                            <span className={isComplete ? 'text-green-400' : 'text-white/40'}>
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              className={`h-full rounded-full ${
                                isComplete ? 'bg-green-500' : 'bg-amber-500'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Reward */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Zap size={12} className="text-yellow-400" />
                          <span className="text-yellow-400 font-medium">+{challenge.reward.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-yellow-400">🪙</span>
                          <span className="text-yellow-400 font-medium">+{challenge.reward.coins}</span>
                        </div>
                      </div>
                    </div>

                    {/* Claim Button */}
                    {isComplete && !claimed && (
                      <button
                        onClick={() => claimReward(challenge)}
                        disabled={isClaiming}
                        className="px-4 py-2 rounded-xl font-medium text-white text-sm shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        }}
                      >
                        {isClaiming ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Gift size={16} />
                          </motion.div>
                        ) : (
                          'Забрать'
                        )}
                      </button>
                    )}
                    
                    {claimed && (
                      <div className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                        Получено
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Совет</h4>
                <p className="text-white/60 text-xs">
                  Дневные челленджи обновляются каждый день в полночь. 
                  Не пропускай — получай больше наград!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeSystem;

