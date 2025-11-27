import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Clock, Star, Zap, Target, Check, ChevronRight, Gift, Sparkles } from 'lucide-react';

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
  image: string;
  type: 'daily' | 'weekly' | 'special';
  requirement: {
    type: 'lessons' | 'xp' | 'streak' | 'tools' | 'meditation';
    value: number;
  };
  reward: {
    xp: number;
    coins: number;
  };
  progress?: number;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'd1',
    title: 'Утренний старт',
    description: 'Заверши 1 урок до 12:00',
    emoji: '🌅',
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&h=200&fit=crop',
    type: 'daily',
    requirement: { type: 'lessons', value: 1 },
    reward: { xp: 30, coins: 15 },
  },
  {
    id: 'd2',
    title: 'Фокус дня',
    description: 'Используй Помодоро 2 раза',
    emoji: '🍅',
    image: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=300&h=200&fit=crop',
    type: 'daily',
    requirement: { type: 'tools', value: 2 },
    reward: { xp: 25, coins: 10 },
  },
  {
    id: 'd3',
    title: 'Момент тишины',
    description: 'Проведи 5 минут в медитации',
    emoji: '🧘',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1461896836934- voices-of-the-dead?w=300&h=200&fit=crop',
    type: 'weekly',
    requirement: { type: 'lessons', value: 5 },
    reward: { xp: 150, coins: 75 },
  },
  {
    id: 'w2',
    title: 'XP охотник',
    description: 'Набери 500 XP за неделю',
    emoji: '⚡',
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=300&h=200&fit=crop',
    type: 'weekly',
    requirement: { type: 'xp', value: 500 },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 'w3',
    title: 'Огненная серия',
    description: 'Поддержи streak 7 дней',
    emoji: '🔥',
    image: 'https://images.unsplash.com/photo-1475552113915-6fcb52652ba2?w=300&h=200&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&h=200&fit=crop',
    type: 'special',
    requirement: { type: 'lessons', value: 1 },
    reward: { xp: 50, coins: 25 },
  },
  {
    id: 's2',
    title: 'Исследователь',
    description: 'Попробуй все инструменты',
    emoji: '🔍',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop',
    type: 'special',
    requirement: { type: 'tools', value: 6 },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 's3',
    title: 'Мастер мотивации',
    description: 'Набери 1000 XP',
    emoji: '👑',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&h=200&fit=crop',
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

  useEffect(() => {
    const saved = localStorage.getItem('completed_challenges');
    if (saved) {
      setCompletedChallenges(JSON.parse(saved));
    }
  }, []);

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
    { id: 'daily', label: 'Дневные', emoji: '☀️', count: DAILY_CHALLENGES.filter(c => !isClaimed(c.id) && isChallengeComplete(c)).length },
    { id: 'weekly', label: 'Недельные', emoji: '📅', count: WEEKLY_CHALLENGES.filter(c => !isClaimed(c.id) && isChallengeComplete(c)).length },
    { id: 'special', label: 'Особые', emoji: '⭐', count: SPECIAL_CHALLENGES.filter(c => !isClaimed(c.id) && isChallengeComplete(c)).length },
  ];

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
              background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0f2a 50%, #0a0a1a 100%)',
            }}
          />
          
          {/* Aurora effects */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 30% 0%, rgba(245,158,11,0.2) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 right-0 w-1/2 h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 100% 20%, rgba(234,88,12,0.15) 0%, transparent 60%)',
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
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-24 pb-4">
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
                  style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=100&h=100&fit=crop"
                    alt="Trophy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-600/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Челленджи</h1>
                  <p className="text-white/50 text-xs">Выполняй задания — получай награды!</p>
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

            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 relative"
                  style={{
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                      : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                    boxShadow: activeTab === tab.id ? '0 4px 15px rgba(245,158,11,0.4)' : 'none',
                  }}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: '#22c55e', color: 'white' }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 pb-40 overflow-y-auto h-[calc(100vh-220px)]">
          <div className="space-y-4">
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
                  className={`rounded-2xl overflow-hidden ${claimed ? 'opacity-60' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: `1px solid ${isComplete && !claimed ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isComplete && !claimed ? '0 4px 20px rgba(34,197,94,0.2)' : 'none',
                  }}
                >
                  {/* Image Header */}
                  <div className="h-24 relative">
                    <img 
                      src={challenge.image}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Status badge */}
                    {claimed ? (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-green-500/90 text-white text-xs font-bold flex items-center gap-1">
                        <Check size={12} />
                        Получено
                      </div>
                    ) : isComplete ? (
                      <motion.div 
                        className="absolute top-3 right-3 px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1"
                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Gift size={12} />
                        Забери!
                      </motion.div>
                    ) : null}
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{challenge.emoji}</span>
                        <h4 className="text-white font-bold">{challenge.title}</h4>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <p className="text-white/60 text-sm mb-3">{challenge.description}</p>
                    
                    {/* Progress Bar */}
                    {!claimed && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/40">{progress}/{challenge.requirement.value}</span>
                          <span className={isComplete ? 'text-green-400 font-bold' : 'text-white/40'}>
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full rounded-full"
                            style={{
                              background: isComplete 
                                ? 'linear-gradient(90deg, #22c55e, #10b981)'
                                : 'linear-gradient(90deg, #f59e0b, #ea580c)',
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Reward & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-yellow-500/10">
                          <Zap size={12} className="text-yellow-400" />
                          <span className="text-yellow-400 font-medium">+{challenge.reward.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-yellow-500/10">
                          <span className="text-yellow-400">🪙</span>
                          <span className="text-yellow-400 font-medium">+{challenge.reward.coins}</span>
                        </div>
                      </div>

                      {isComplete && !claimed && (
                        <motion.button
                          onClick={() => claimReward(challenge)}
                          disabled={isClaiming}
                          className="px-4 py-2 rounded-xl font-medium text-white text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            boxShadow: '0 4px 15px rgba(34,197,94,0.4)',
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isClaiming ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles size={16} />
                            </motion.div>
                          ) : (
                            'Забрать'
                          )}
                        </motion.button>
                      )}
                    </div>
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
