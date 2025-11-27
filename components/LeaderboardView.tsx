
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Trophy, Shield, ChevronUp, Medal, Crown, Flame, Star, Zap, Users, Gift, Coins, Percent, Sparkles } from 'lucide-react';
import { supabase, isSupabaseEnabled } from '../services/supabaseClient';

// Призы для топ-10
const PRIZES = [
  { place: 1, coins: 500, discount: 20, badge: '🏆', title: 'Чемпион', color: 'from-yellow-400 to-amber-500' },
  { place: 2, coins: 300, discount: 15, badge: '🥈', title: 'Серебро', color: 'from-slate-300 to-slate-400' },
  { place: 3, coins: 200, discount: 10, badge: '🥉', title: 'Бронза', color: 'from-amber-600 to-orange-600' },
  { place: 4, coins: 100, discount: 5, badge: '⭐', title: 'Топ-5', color: 'from-indigo-400 to-purple-500' },
  { place: 5, coins: 100, discount: 5, badge: '⭐', title: 'Топ-5', color: 'from-indigo-400 to-purple-500' },
  { place: 6, coins: 50, discount: 0, badge: '✨', title: 'Топ-10', color: 'from-slate-500 to-slate-600' },
  { place: 7, coins: 50, discount: 0, badge: '✨', title: 'Топ-10', color: 'from-slate-500 to-slate-600' },
  { place: 8, coins: 50, discount: 0, badge: '✨', title: 'Топ-10', color: 'from-slate-500 to-slate-600' },
  { place: 9, coins: 50, discount: 0, badge: '✨', title: 'Топ-10', color: 'from-slate-500 to-slate-600' },
  { place: 10, coins: 50, discount: 0, badge: '✨', title: 'Топ-10', color: 'from-slate-500 to-slate-600' },
];

interface LeaderboardViewProps {
  currentUser: User;
}

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  avatar: string;
  streak: number;
  level: number;
  isUp?: boolean;
}

// Fallback mock data
const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: 'u2', name: 'Катя С.', xp: 1450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katya', streak: 7, level: 3, isUp: true },
  { id: 'u1', name: 'Ты', xp: 1250, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You', streak: 3, level: 2, isUp: false },
  { id: 'u3', name: 'Макс Б.', xp: 980, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', streak: 5, level: 2, isUp: false },
  { id: 'u4', name: 'Аня В.', xp: 850, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya', streak: 2, level: 2, isUp: true },
  { id: 'u5', name: 'Дима К.', xp: 400, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dima', streak: 1, level: 1, isUp: false },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  const [showPrizes, setShowPrizes] = useState(false);

  // Fetch leaderboard from Supabase
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!isSupabaseEnabled()) {
        // Use mock data with current user
        const mockWithUser = [...MOCK_LEADERBOARD];
        const userIndex = mockWithUser.findIndex(u => u.id === 'u1');
        if (userIndex !== -1) {
          mockWithUser[userIndex] = {
            ...mockWithUser[userIndex],
            name: currentUser.name || 'Ты',
            xp: currentUser.xp,
            avatar: currentUser.avatarUrl,
            streak: currentUser.streak,
            level: currentUser.level,
          };
        }
        setLeaderboardData(mockWithUser.sort((a, b) => b.xp - a.xp));
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, xp, avatar_url, streak, level')
          .eq('role', 'TEEN')
          .order('xp', { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedData: LeaderboardUser[] = data.map((u, idx) => ({
            id: u.id,
            name: u.id === currentUser.id ? 'Ты' : (u.name || 'Студент'),
            xp: u.xp || 0,
            avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
            streak: u.streak || 0,
            level: u.level || 1,
            isUp: Math.random() > 0.5, // Random for demo
          }));
          setLeaderboardData(formattedData);
        } else {
          // No data, use mock
          setLeaderboardData(MOCK_LEADERBOARD);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setLeaderboardData(MOCK_LEADERBOARD);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUser]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...leaderboardData].sort((a, b) => b.xp - a.xp);
  }, [leaderboardData]);

  // Find current user's rank
  const currentUserRank = sortedUsers.findIndex(u => u.id === currentUser.id || u.name === 'Ты') + 1;

  const getLeagueInfo = () => {
    const totalXp = currentUser.xp;
    if (totalXp >= 5000) return { name: 'Алмазная', color: 'from-cyan-400 to-blue-500', icon: '💎' };
    if (totalXp >= 2500) return { name: 'Золотая', color: 'from-yellow-400 to-amber-500', icon: '🥇' };
    if (totalXp >= 1000) return { name: 'Серебряная', color: 'from-slate-300 to-slate-400', icon: '🥈' };
    return { name: 'Бронзовая', color: 'from-amber-600 to-orange-700', icon: '🥉' };
  };

  const league = getLeagueInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] pb-40 animate-in fade-in duration-500 text-white">
       
       {/* LEAGUE HEADER */}
       <div className="bg-gradient-to-b from-indigo-900/40 to-[#020617] px-6 pt-4 pb-10 text-center relative overflow-hidden border-b border-white/5">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-60 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none"></div>
           
           <motion.div 
             className="relative z-10 flex flex-col items-center"
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
           >
               <div className="w-24 h-24 mb-4 relative">
                   <div className={`w-full h-full rounded-3xl bg-gradient-to-br ${league.color} flex items-center justify-center shadow-lg`}>
                     <span className="text-4xl">{league.icon}</span>
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#020617] rounded-full flex items-center justify-center border-2 border-indigo-500">
                     <Trophy size={20} className="text-yellow-400" />
                   </div>
               </div>
               
               <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-1">{league.name} Лига</h1>
               <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">
                 {currentUserRank > 0 ? `Ты на ${currentUserRank} месте` : 'Топ 10 переходят выше'}
               </p>

               {/* Time filters */}
               <div className="mt-6 flex gap-2">
                 {(['week', 'month', 'all'] as const).map(filter => (
                   <button
                     key={filter}
                     onClick={() => setTimeFilter(filter)}
                     className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                       timeFilter === filter 
                         ? 'bg-indigo-500 text-white' 
                         : 'bg-white/10 text-white/60 hover:bg-white/20'
                     }`}
                   >
                     {filter === 'week' ? 'Неделя' : filter === 'month' ? 'Месяц' : 'Всё время'}
                   </button>
                 ))}
               </div>

               {/* Prizes button */}
               <motion.button
                 onClick={() => setShowPrizes(true)}
                 className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-sm font-bold text-black shadow-lg hover:scale-105 transition-transform"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 <Gift size={16} />
                 Призы недели
                 <Sparkles size={14} />
               </motion.button>
           </motion.div>
       </div>

       {/* Prizes Modal */}
       <AnimatePresence>
         {showPrizes && (
           <motion.div
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setShowPrizes(false)}
           >
             <motion.div
               className="bg-[#151925] border border-white/10 rounded-3xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               onClick={e => e.stopPropagation()}
             >
               <div className="text-center mb-6">
                 <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center">
                   <Trophy size={32} className="text-black" />
                 </div>
                 <h2 className="text-2xl font-black text-white">Призы недели</h2>
                 <p className="text-slate-400 text-sm mt-1">Попади в топ-10 и получи награды!</p>
               </div>

               <div className="space-y-3">
                 {PRIZES.map((prize, idx) => (
                   <motion.div
                     key={prize.place}
                     className={`flex items-center gap-3 p-3 rounded-2xl border ${
                       idx < 3 ? 'bg-gradient-to-r ' + prize.color + ' border-transparent' : 'bg-white/5 border-white/10'
                     }`}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.05 }}
                   >
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                       idx < 3 ? 'bg-black/20' : 'bg-white/10'
                     }`}>
                       {prize.badge}
                     </div>
                     <div className="flex-1">
                       <div className={`font-bold ${idx < 3 ? 'text-black' : 'text-white'}`}>
                         {prize.place} место
                       </div>
                       <div className={`text-xs ${idx < 3 ? 'text-black/70' : 'text-slate-400'}`}>
                         {prize.title}
                       </div>
                     </div>
                     <div className="text-right">
                       <div className={`flex items-center gap-1 font-bold ${idx < 3 ? 'text-black' : 'text-yellow-400'}`}>
                         <Coins size={14} /> {prize.coins}
                       </div>
                       {prize.discount > 0 && (
                         <div className={`flex items-center gap-1 text-xs ${idx < 3 ? 'text-black/70' : 'text-green-400'}`}>
                           <Percent size={12} /> -{prize.discount}%
                         </div>
                       )}
                     </div>
                   </motion.div>
                 ))}
               </div>

               <div className="mt-6 p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl">
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                     <Star size={20} className="text-white" />
                   </div>
                   <div>
                     <div className="font-bold text-white text-sm">Бонус за модуль!</div>
                     <p className="text-indigo-200 text-xs mt-1">
                       Топ-5 за весь модуль получают скидку на следующий месяц обучения! 🎓
                     </p>
                   </div>
                 </div>
               </div>

               <button
                 onClick={() => setShowPrizes(false)}
                 className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-white transition-colors"
               >
                 Понятно!
               </button>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* TOP 3 PODIUM */}
       {sortedUsers.length >= 3 && (
         <div className="px-4 -mt-4 mb-6 relative z-20">
           <div className="flex justify-center items-end gap-2">
             {/* 2nd place */}
             <motion.div 
               className="flex flex-col items-center"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
             >
               <img src={sortedUsers[1]?.avatar} className="w-14 h-14 rounded-full border-2 border-slate-400 mb-2" alt="" />
               <div className="w-20 h-16 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-xl flex flex-col items-center justify-center">
                 <span className="text-xl">🥈</span>
                 <span className="text-[10px] font-bold text-white/80">{sortedUsers[1]?.xp} XP</span>
               </div>
             </motion.div>
             
             {/* 1st place */}
             <motion.div 
               className="flex flex-col items-center -mt-4"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
             >
               <Crown className="w-6 h-6 text-yellow-400 mb-1" />
               <img src={sortedUsers[0]?.avatar} className="w-16 h-16 rounded-full border-2 border-yellow-400 mb-2" alt="" />
               <div className="w-24 h-20 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-xl flex flex-col items-center justify-center relative">
                 <span className="text-2xl">🥇</span>
                 <span className="text-xs font-bold text-white">{sortedUsers[0]?.xp} XP</span>
                 {/* Prize badge */}
                 <div className="absolute -top-2 -right-2 bg-green-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                   <Coins size={10} /> 500
                 </div>
               </div>
             </motion.div>
             
             {/* 3rd place */}
             <motion.div 
               className="flex flex-col items-center"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
             >
               <img src={sortedUsers[2]?.avatar} className="w-14 h-14 rounded-full border-2 border-amber-600 mb-2" alt="" />
               <div className="w-20 h-14 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-xl flex flex-col items-center justify-center">
                 <span className="text-xl">🥉</span>
                 <span className="text-[10px] font-bold text-white/80">{sortedUsers[2]?.xp} XP</span>
               </div>
             </motion.div>
           </div>
       </div>
       )}

       {/* LIST */}
       <div className="px-4 relative z-20">
           <div className="bg-[#151925] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
               {sortedUsers.slice(3).map((u, index) => {
                   const isMe = u.id === currentUser.id || u.name === 'Ты';
                   const rank = index + 4; // Start from 4 since top 3 are in podium
                   
                   return (
                       <motion.div 
                        key={u.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            flex items-center gap-4 p-4 border-b border-white/5 transition-colors
                            ${isMe ? 'bg-indigo-600/20 border-l-4 border-l-indigo-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}
                        `}
                       >
                           {/* Rank */}
                           <div className="w-8 text-center font-black text-lg font-mono text-slate-500">
                               {rank}
                           </div>

                           {/* Avatar */}
                           <div className="relative">
                               <img src={u.avatar} className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white/10 object-cover" alt="" />
                               {isMe && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#151925] rounded-full"></div>}
                           </div>

                           {/* Info */}
                           <div className="flex-1 min-w-0">
                               <div className={`font-bold truncate ${isMe ? 'text-indigo-300' : 'text-white'}`}>
                                   {u.name}
                               </div>
                               <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                   <span className="flex items-center gap-1">
                                     <Flame size={10} className="text-orange-400" /> {u.streak} дн.
                                   </span>
                                   <span className="flex items-center gap-1">
                                     <Star size={10} className="text-yellow-400" /> Ур. {u.level}
                                   </span>
                               </div>
                           </div>

                           {/* XP */}
                           <div className="text-right">
                               <div className="font-black text-white">{u.xp} XP</div>
                               {u.isUp && (
                                   <div className="flex items-center justify-end text-[10px] text-green-400 font-bold">
                                       <ChevronUp size={10} /> +1
                                   </div>
                               )}
                           </div>
                       </motion.div>
                   );
               })}
               
               {sortedUsers.length <= 3 && (
                 <div className="p-8 text-center">
                   <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                   <p className="text-slate-500 text-sm">Пока мало участников</p>
                   <p className="text-slate-600 text-xs">Пригласи друзей!</p>
               </div>
               )}
           </div>
       </div>

    </div>
  );
};
