
import React from 'react';
import { User } from '../types';
import { Trophy, Shield, ChevronUp, Medal } from 'lucide-react';

interface LeaderboardViewProps {
  currentUser: User;
}

// Mock Data specifically for this view
const MOCK_LEADERBOARD = [
  { id: 'u2', name: 'Катя С.', xp: 1450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katya', isUp: true },
  { id: 'u1', name: 'Ты (Алекс)', xp: 1250, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', isUp: false },
  { id: 'u3', name: 'Макс Б.', xp: 980, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', isUp: false },
  { id: 'u4', name: 'Аня В.', xp: 850, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya', isUp: true },
  { id: 'u5', name: 'Дима К.', xp: 400, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dima', isUp: false },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  
  // Sort to ensure order (though mock is sorted)
  const sortedUsers = [...MOCK_LEADERBOARD].sort((a, b) => b.xp - a.xp);

  return (
    <div className="min-h-screen bg-[#020617] pb-40 animate-in fade-in duration-500 text-white">
       
       {/* LEAGUE HEADER - Updated pt-20 */}
       <div className="bg-gradient-to-b from-indigo-900/40 to-[#020617] px-6 pt-24 pb-10 text-center relative overflow-hidden border-b border-white/5">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-60 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col items-center">
               <div className="w-24 h-24 mb-4 relative">
                   <Shield size={96} className="text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]" fill="rgba(99,102,241,0.2)" />
                   <Trophy size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300 drop-shadow-md" fill="currentColor" />
               </div>
               
               <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-1">Серебряная Лига</h1>
               <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Топ 10 переходят в Золото</p>

               <div className="mt-6 bg-white/10 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 backdrop-blur-md">
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                   До конца сезона: 2 дня 14ч
               </div>
           </div>
       </div>

       {/* LIST */}
       <div className="px-4 -mt-4 relative z-20">
           <div className="bg-[#151925] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
               {sortedUsers.map((u, index) => {
                   const isMe = u.id === 'u1'; // Hardcoded mock ID check
                   const rank = index + 1;
                   const isTop3 = rank <= 3;
                   
                   return (
                       <div 
                        key={u.id} 
                        className={`
                            flex items-center gap-4 p-4 border-b border-white/5 transition-colors
                            ${isMe ? 'bg-indigo-600/20 border-l-4 border-l-indigo-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}
                        `}
                       >
                           {/* Rank */}
                           <div className="w-8 text-center font-black text-lg font-mono">
                               {rank === 1 ? <Medal className="text-yellow-400 mx-auto" /> : 
                                rank === 2 ? <Medal className="text-slate-300 mx-auto" /> :
                                rank === 3 ? <Medal className="text-amber-600 mx-auto" /> :
                                <span className="text-slate-500">{rank}</span>
                               }
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
                               <div className="text-[10px] text-slate-500 uppercase font-bold">
                                   {isTop3 ? 'В зоне повышения' : 'Стабильно'}
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
                       </div>
                   );
               })}
               
               <div className="p-4 text-center text-xs text-slate-500 font-bold uppercase tracking-widest border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                   Показать остальных
               </div>
           </div>
       </div>

    </div>
  );
};
