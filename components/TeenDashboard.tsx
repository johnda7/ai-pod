
import React, { useState, useEffect, useMemo } from 'react';
import { TASKS, SHOP_ITEMS, ACHIEVEMENTS } from '../constants';
import { Task, User, ShopItem } from '../types';
import { Check, Lock, Star, LayoutGrid, User as UserIcon, ShoppingBag, Trophy, Heart, Zap, ShieldCheck, HelpCircle, ChevronRight, LogOut, Edit3, Sparkles, Gift, Target, Coins, Skull, Info, Award, Flame } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { MemoryGame } from './MemoryGame';
import { ShopView } from './ShopView';
import { LeaderboardView } from './LeaderboardView';
import { AchievementsView } from './AchievementsView';
import { purchaseItem } from '../services/db'; // Import real purchase logic
import { isSupabaseEnabled } from '../services/supabaseClient';
import { GameTutorial } from './GameTutorial';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
  onUserUpdate?: (user: User) => void; // Callback to update parent
}

type Tab = 'LEARN' | 'RELAX' | 'SHOP' | 'LEADERBOARD' | 'PROFILE';

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ user: initialUser, onTaskComplete, onUserUpdate }) => {
  const [user, setUser] = useState<User>(initialUser); // Local user state to reflect changes immediately
  const [activeTab, setActiveTab] = useState<Tab>('LEARN'); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const [isXpAnimating, setIsXpAnimating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Show tutorial for new users
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ai_pod_tutorial_seen');
    if (!hasSeenTutorial && user.completedTaskIds.length === 0) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('ai_pod_tutorial_seen', 'true');
  };
  
  // Sync local state if prop changes (e.g. from parent refresh)
  useEffect(() => {
      setUser(initialUser);
  }, [initialUser]);

  // Daily Quests State (Mock for now)
  const [dailyQuests, setDailyQuests] = useState([
      { id: 1, text: 'Закончи 1 урок', completed: user.completedTaskIds.length > 0, reward: 50 },
      { id: 2, text: 'Сделай паузу', completed: false, reward: 30 },
      { id: 3, text: 'Зайди в магазин', completed: false, reward: 20 }
  ]);

  useEffect(() => {
    if (user.xp !== prevXp) {
        setIsXpAnimating(true);
        const timer = setTimeout(() => setIsXpAnimating(false), 1000);
        setPrevXp(user.xp);
        return () => clearTimeout(timer);
    }
  }, [user.xp, prevXp]);

  const handleTaskClick = (task: Task, isLocked: boolean) => {
      if (isLocked) return; 
      setSelectedTask(task);
  };

  const handleGameComplete = (xp: number) => {
      setIsGameOpen(false);
  };

  // Refresh user data from localStorage
  const refreshUserData = () => {
      const users = JSON.parse(localStorage.getItem('ai_teenager_users_v6') || '[]');
      const updatedUser = users.find((u: User) => u.id === user.id);
      if (updatedUser) {
          setUser(updatedUser);
          if (onUserUpdate) {
              onUserUpdate(updatedUser);
          }
      }
  };

  // REAL PURCHASE LOGIC
  const handleBuyItem = async (item: ShopItem) => {
      const success = await purchaseItem(user.id, item);
      
      if (success) {
          // Small delay to ensure localStorage is updated
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Reload user from storage to get accurate state
          refreshUserData();
      } else {
          // Fallback if validation failed inside purchaseItem
          alert("Недостаточно монет или предмет уже куплен!");
      }
  };

  const nextLevelXp = user.level * 500;
  const prevLevelXp = (user.level - 1) * 500;
  const levelProgress = Math.min(100, Math.max(0, ((user.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  const inventoryItems = user.inventory.map(id => SHOP_ITEMS.find(item => item.id === id)).filter(Boolean);

  const renderContent = () => {
    if (activeTab === 'RELAX') return <MeditationView />;
    if (activeTab === 'SHOP') return <ShopView user={user} onBuy={handleBuyItem} onRefreshUser={refreshUserData} />;
    if (activeTab === 'LEADERBOARD') return <LeaderboardView currentUser={user} />;

    if (activeTab === 'PROFILE') {
        return (
            <div className="px-5 pt-28 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-screen relative">
                
                {/* 1. HERO IDENTITY CARD (Liquid Glass) */}
                <div className="relative w-full rounded-[3rem] overflow-hidden p-8 flex flex-col items-center text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 mb-8 group">
                    
                    {/* Dynamic Animated Background */}
                    <div className="absolute inset-0 bg-[#0A0F1C]">
                        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[80px] animate-[spin_15s_linear_infinite] opacity-70"></div>
                        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-blue-500/10 rounded-full blur-[60px]"></div>
                        {/* Noise Texture */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    </div>

                    {/* Edit Button */}
                    <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md z-20">
                        <Edit3 size={18} />
                    </button>

                    {/* Avatar with Glow Rings */}
                    <div className="relative z-10 mt-2 mb-5">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                        <div className="relative w-28 h-28 rounded-full p-1.5 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                            <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover bg-[#0A0F1C]" alt="Profile" />
                            
                            {/* Online Status */}
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#0A0F1C] rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Name & Badge */}
                    <div className="relative z-10 mb-8">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-1 drop-shadow-lg">{user.name}</h2>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                             <ShieldCheck size={12} className="text-indigo-400" />
                             <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">{user.role === 'TEEN' ? 'Cadet' : 'Admin'}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="relative z-10 grid grid-cols-3 gap-4 w-full mb-8">
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-2xl font-black text-white">{user.level}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">LVL</div>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-2xl font-black text-white">{user.xp}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">XP</div>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-2xl font-black text-white">{user.streak}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">DAYS</div>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            <span>Уровень {user.level}</span>
                            <span>{Math.round(levelProgress)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                            <div 
                                style={{width: `${levelProgress}%`}} 
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full"
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 2. ACHIEVEMENTS PREVIEW */}
                <div className="mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-75">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Trophy size={18} className="text-yellow-400"/> Достижения
                        </h3>
                        <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">
                            {ACHIEVEMENTS.filter(a => {
                                if (a.requirement.type === 'TASKS_COMPLETED') return user.completedTaskIds.length >= a.requirement.value;
                                if (a.requirement.type === 'STREAK_DAYS') return user.streak >= a.requirement.value;
                                if (a.requirement.type === 'XP_EARNED') return user.xp >= a.requirement.value;
                                return false;
                            }).length} / {ACHIEVEMENTS.length}
                        </span>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
                        {ACHIEVEMENTS.slice(0, 5).map((achievement, idx) => {
                            const isUnlocked = 
                                (achievement.requirement.type === 'TASKS_COMPLETED' && user.completedTaskIds.length >= achievement.requirement.value) ||
                                (achievement.requirement.type === 'STREAK_DAYS' && user.streak >= achievement.requirement.value) ||
                                (achievement.requirement.type === 'XP_EARNED' && user.xp >= achievement.requirement.value);
                            
                            return (
                                <div 
                                    key={achievement.id}
                                    className={`w-20 h-20 shrink-0 rounded-[1.2rem] flex flex-col items-center justify-center relative overflow-hidden ${
                                        isUnlocked 
                                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                                            : 'bg-slate-800/50 border border-white/5'
                                    }`}
                                >
                                    <span className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                                        {achievement.icon}
                                    </span>
                                    {isUnlocked && (
                                        <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check size={10} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        
                        {/* View All Button */}
                        <button 
                            onClick={() => setShowAchievements(true)}
                            className="w-20 h-20 shrink-0 rounded-[1.2rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            <Award size={20} />
                            <span className="text-[9px] font-bold uppercase">Все</span>
                        </button>
                    </div>
                </div>

                {/* 3. INVENTORY SHELF */}
                <div className="mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-400"/> Инвентарь
                        </h3>
                        <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg">{inventoryItems.length}</span>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
                        {/* New Slot Button */}
                        <button 
                            onClick={() => setActiveTab('SHOP')}
                            className="w-20 h-20 shrink-0 rounded-[1.2rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            <ShoppingBag size={20} />
                            <span className="text-[9px] font-bold uppercase">Магазин</span>
                        </button>

                        {/* Items */}
                        {inventoryItems.map((item, idx) => (
                             <div key={idx} className="w-20 h-20 shrink-0 rounded-[1.2rem] bg-[#151925] border border-white/10 flex items-center justify-center relative group overflow-hidden shadow-lg">
                                 <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                 <div className="relative z-10 text-2xl group-hover:scale-110 transition-transform">
                                     {item?.type === 'POWERUP' ? <Zap className="text-yellow-400" /> : <Gift className="text-purple-400" />}
                                 </div>
                                 <div className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400 uppercase">{item?.id === 'hp_potion' ? 'HP' : 'ITEM'}</div>
                             </div>
                        ))}
                        
                        {/* Empty Slots Filler */}
                        {[1,2,3].map(i => (
                             <div key={`empty-${i}`} className="w-20 h-20 shrink-0 rounded-[1.2rem] bg-black/20 border border-white/5 flex items-center justify-center">
                                 <div className="w-2 h-2 rounded-full bg-white/5"></div>
                             </div>
                        ))}
                    </div>
                </div>

                {/* 3. SETTINGS MENU */}
                <div className="space-y-3 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                     {/* How to Play Button */}
                     <button 
                        onClick={() => setShowTutorial(true)}
                        className="w-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md border border-indigo-500/30 p-4 rounded-[1.5rem] flex items-center gap-4 transition-all hover:from-indigo-500/30 hover:to-purple-500/30 active:scale-[0.98] group"
                     >
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                             <Info size={20} />
                         </div>
                         <div className="flex-1 text-left">
                             <div className="text-sm font-bold text-white">Как играть?</div>
                             <div className="text-xs text-indigo-300">Туториал по механикам</div>
                         </div>
                         <Sparkles size={18} className="text-indigo-400" />
                     </button>

                     {[
                         { icon: ShieldCheck, label: 'Настройки аккаунта', badge: null },
                         { icon: HelpCircle, label: 'Поддержка', badge: null },
                     ].map((item, idx) => (
                         <button 
                            key={idx}
                            className="w-full bg-[#151925]/80 backdrop-blur-md border border-white/5 p-4 rounded-[1.5rem] flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98] group"
                         >
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                                 <item.icon size={20} />
                             </div>
                             <div className="flex-1 text-left">
                                 <div className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">{item.label}</div>
                             </div>
                             {item.badge && (
                                 <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-red-500/40">
                                     {item.badge}
                                 </div>
                             )}
                             <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                         </button>
                     ))}
                     
                     <button className="w-full mt-6 p-4 rounded-[1.5rem] border border-red-500/20 text-red-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all active:scale-95">
                         <LogOut size={18} />
                         Выйти из аккаунта
                     </button>
                </div>

            </div>
        );
    }

    // --- GAME MAP LOGIC ---
    const ITEM_SPACING = 140; 
    const START_PADDING = 150;
    const END_PADDING = 250;
    const mapHeight = (TASKS.length * ITEM_SPACING) + START_PADDING + END_PADDING; 

    return (
        <div className="relative pt-2 pb-40 px-4 min-h-screen overflow-x-hidden">
             
             {/* TOP BAR - iOS 26 LIQUID GLASS */}
             <div className="flex justify-between items-center mb-6 relative z-40 pt-28 sticky top-0 pb-4 -mx-4 px-5 transition-all duration-300">
                 {/* Glass background */}
                 <div 
                   className="absolute inset-0 -top-20"
                   style={{
                     background: 'linear-gradient(to bottom, rgba(2,6,23,1) 0%, rgba(2,6,23,0.95) 60%, transparent 100%)',
                   }}
                 />
                 
                 {/* Left side - HP & Streak */}
                 <div className="flex items-center gap-2 relative z-10">
                    {/* HP - Liquid Glass */}
                    <div 
                      className="px-3 py-2 rounded-2xl flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(244,63,94,0.05) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(244,63,94,0.2)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                      }}
                    >
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Heart 
                            key={i} 
                            size={12} 
                            fill={i < (user.hp || 5) ? "currentColor" : "none"}
                            className={`${i < (user.hp || 5) ? 'text-rose-400' : 'text-slate-600'} transition-all`}
                          />
                        ))}
                        </div>
                    </div>
                    
                    {/* Streak */}
                    {user.streak > 0 && (
                      <div 
                        className="px-3 py-2 rounded-2xl flex items-center gap-1.5"
                        style={{
                          background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(249,115,22,0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                      >
                        <span className="text-base">🔥</span>
                        <span className="text-white font-bold text-sm">{user.streak}</span>
                      </div>
                    )}
                 </div>
                 
                 {/* Right side - Coins & XP */}
                 <div className="flex gap-2 items-center relative z-10">
                     {/* XP - Liquid Glass */}
                     <div 
                       className="px-3 py-2 rounded-2xl flex items-center gap-2"
                       style={{
                         background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)',
                         backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(168,85,247,0.2)',
                         boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                       }}
                     >
                       <Star size={12} fill="currentColor" className="text-purple-400" />
                       <span className={`text-sm font-bold text-white ${isXpAnimating ? 'animate-pulse text-purple-300' : ''}`}>
                         {user.xp}
                       </span>
                     </div>
                     
                     {/* COINS - Clickable Liquid Glass */}
                     <button 
                       onClick={() => setActiveTab('SHOP')}
                       className="px-3 py-2 rounded-2xl flex items-center gap-2 transition-all active:scale-95 hover:brightness-110"
                       style={{
                         background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.08) 100%)',
                         backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(234,179,8,0.25)',
                         boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                       }}
                     >
                       <Coins size={12} fill="currentColor" className="text-yellow-400" />
                       <span className="text-sm font-bold text-white">{user.coins || 0}</span>
                     </button>
                 </div>
             </div>

             {/* WELCOME MESSAGE - For new users - LIQUID GLASS */}
             {user.completedTaskIds.length === 0 && (
                 <div className="mb-6 mx-auto max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
                     <div 
                       className="relative overflow-hidden rounded-3xl p-5"
                       style={{
                         background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                         backdropFilter: 'blur(40px)',
                         border: '1px solid rgba(99,102,241,0.2)',
                         boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                       }}
                     >
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl"></div>
                         <div className="relative z-10">
                             <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                                 <span className="text-2xl">👋</span> Привет, {user.name}!
                             </h3>
                             <p className="text-white/70 text-sm leading-relaxed">
                                 С тобой всё нормально. Начни своё путешествие и стань лучшей версией себя!
                             </p>
                             <button 
                                 onClick={() => setShowTutorial(true)}
                                 className="mt-4 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
                                 style={{
                                   background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 100%)',
                                   boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                                 }}
                             >
                                 <Info size={16} /> Как играть?
                             </button>
                         </div>
                     </div>
                 </div>
             )}

             {/* DAILY QUESTS WIDGET - LIQUID GLASS */}
             <div className="mb-6 relative z-10 mx-auto max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                 <div 
                   className="relative overflow-hidden rounded-3xl p-5"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                     backdropFilter: 'blur(40px)',
                     border: '1px solid rgba(255,255,255,0.1)',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                   }}
                 >
                     {/* Background decoration */}
                     <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl"></div>
                     
                     <div className="flex items-center justify-between mb-4 relative z-10">
                         <h3 className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                             <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                 <Target className="text-indigo-400" size={14} />
                             </div>
                             Ежедневные цели
                         </h3>
                         <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-1 rounded-lg">
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                             Обновление в 00:00
                         </div>
                     </div>
                     <div className="space-y-3 relative z-10">
                         {dailyQuests.map((q, idx) => (
                             <div 
                                 key={q.id} 
                                 className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                     q.completed 
                                         ? 'bg-green-500/10 border border-green-500/20' 
                                         : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                 }`}
                                 style={{ animationDelay: `${idx * 100}ms` }}
                             >
                                 <div className="flex items-center gap-3">
                                     <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                         q.completed 
                                             ? 'bg-green-500 shadow-lg shadow-green-500/30' 
                                             : 'bg-slate-800 border border-slate-700'
                                     }`}>
                                         {q.completed && <Check size={14} className="text-white" strokeWidth={3} />}
                                     </div>
                                     <span className={`text-sm font-medium ${q.completed ? 'text-green-300' : 'text-slate-200'}`}>
                                         {q.text}
                                     </span>
                                 </div>
                                 <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                                     q.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                 }`}>
                                     +{q.reward} <Coins size={10} fill="currentColor" />
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     {/* Progress bar */}
                     <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                         <div className="flex justify-between text-[10px] text-slate-400 mb-2 uppercase tracking-wider font-bold">
                             <span>Прогресс</span>
                             <span>{dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}</span>
                         </div>
                         <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                 style={{ width: `${(dailyQuests.filter(q => q.completed).length / dailyQuests.length) * 100}%` }}
                             ></div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* GAME PATH CONTAINER */}
             <div className="relative mx-auto max-w-sm" style={{ height: mapHeight }}>
                
                {/* START MARKER */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                        Старт
                    </div>
                </div>

                {/* SVG Path (Dynamic) */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" overflow="visible">
                    <path 
                        d={`M 192 80 
                           ${TASKS.map((_, i) => {
                               const y = START_PADDING + (i * ITEM_SPACING);
                               const x = i % 2 === 0 ? 280 : 100; 
                               return `L ${x} ${y}`;
                           }).join(" ")}
                        `}
                        fill="none" 
                        stroke="url(#pathGradient)" 
                        strokeWidth="4"
                        strokeDasharray="8 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-30"
                    />
                    <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>

                {TASKS.map((task, index) => {
                    const isCompleted = user.completedTaskIds.includes(task.id);
                    // Unlock logic: First is open, others depend on previous
                    const isLocked = index > 0 && !user.completedTaskIds.includes(TASKS[index-1].id);
                    const isActive = !isCompleted && !isLocked;

                    const topPos = START_PADDING + (index * ITEM_SPACING);
                    const leftPos = index % 2 === 0 ? '70%' : '30%'; 
                    
                    // WEEK SEPARATOR LOGIC
                    const isNewWeek = index === 0 || task.week > TASKS[index - 1].week;
                    
                    return (
                        <React.Fragment key={task.id}>
                            {/* WEEK DIVIDER */}
                            {isNewWeek && (
                                <div 
                                    className="absolute w-full text-center z-0"
                                    style={{ top: topPos - (ITEM_SPACING / 1.5), left: '50%', transform: 'translateX(-50%)' }}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute"></div>
                                        <div className="bg-[#020617] px-3 relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border border-white/5 py-1 rounded-full">
                                            Неделя {task.week}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div 
                                className="absolute flex flex-col items-center z-10 group"
                                style={{ top: topPos, left: leftPos, transform: 'translate(-50%, -50%)' }}
                            >
                                <button
                                    onClick={() => handleTaskClick(task, isLocked)}
                                    disabled={isLocked}
                                    className={`
                                        relative flex items-center justify-center transition-all duration-500
                                        ${isLocked ? 'grayscale opacity-50 cursor-not-allowed scale-95' : 'cursor-pointer hover:scale-110 active:scale-95'}
                                        ${task.isBoss ? 'w-24 h-24' : 'w-20 h-20'}
                                    `}
                                >
                                    {/* Boss Effect */}
                                    {task.isBoss && !isLocked && !isCompleted && (
                                        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40 animate-pulse"></div>
                                    )}
                                    
                                    {/* Active Glow */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 animate-pulse"></div>
                                    )}

                                    {/* Main Circle */}
                                    <div className={`
                                        w-full h-full rounded-[2rem] flex items-center justify-center border-b-[6px] shadow-xl transition-all relative z-10
                                        ${isCompleted 
                                            ? 'bg-emerald-600 border-emerald-800' 
                                            : isLocked 
                                                ? 'bg-slate-800 border-slate-900' 
                                                : task.isBoss 
                                                    ? 'bg-red-600 border-red-800' 
                                                    : 'bg-indigo-600 border-indigo-800'
                                        }
                                    `}>
                                        {isCompleted 
                                            ? <Check size={28} strokeWidth={4} className="text-white drop-shadow-md" /> 
                                            : isLocked 
                                                ? <Lock size={20} className="text-slate-500" /> 
                                                : task.isBoss
                                                    ? <Skull size={28} className="text-white animate-pulse" />
                                                    : <div className="text-white drop-shadow-md font-black text-2xl font-mono">{index + 1}</div>
                                        }
                                    </div>
                                    
                                    {/* Stars for completed */}
                                    {isCompleted && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 p-1 rounded-full border-2 border-white shadow-sm z-20">
                                            <Star size={10} fill="currentColor" />
                                        </div>
                                    )}
                                </button>
                                
                                {/* Label */}
                                <div className={`
                                    mt-3 px-3 py-1.5 rounded-lg backdrop-blur-md border text-center min-w-[120px] max-w-[140px] transition-all
                                    ${isActive 
                                        ? task.isBoss ? 'bg-red-950/80 border-red-500/50 text-white scale-105' : 'bg-indigo-950/80 border-indigo-500/50 text-white scale-105' 
                                        : 'bg-[#0A0F1C]/80 border-white/5 text-slate-500'
                                    }
                                `}>
                                    <span className={`text-[10px] font-bold leading-tight block ${task.isBoss ? 'text-red-300' : ''}`}>
                                        {task.title}
                                    </span>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
             </div>
        </div>
    );
  };

  return (
    <div className="h-full relative overflow-hidden text-white bg-[#020617]">
      
      {/* Tutorial Modal */}
      <GameTutorial isOpen={showTutorial} onClose={handleCloseTutorial} />
      
      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 z-[80] bg-[#020617] overflow-y-auto">
          <button 
            onClick={() => setShowAchievements(false)}
            className="fixed top-6 right-6 z-[90] w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
          <AchievementsView user={user} />
        </div>
      )}
      
      <div className="h-full overflow-y-auto scroll-smooth scrollbar-hide">
         {renderContent()}
      </div>

      {/* DOCK BAR - iOS 26 LIQUID GLASS STYLE */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px] animate-in slide-in-from-bottom-20 duration-700 delay-200">
        <div 
          className="relative flex items-center justify-between p-1.5 rounded-[2rem]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
          }}
        >
          {[
            { id: 'LEARN', icon: LayoutGrid, label: 'Путь' },
            { id: 'LEADERBOARD', icon: Trophy, label: 'Топ' },
            { id: 'SHOP', icon: ShoppingBag, label: 'Магазин' },
            { id: 'RELAX', icon: Star, label: 'Чилл' },
            { id: 'PROFILE', icon: UserIcon, label: 'Я' },
          ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`
                  h-12 flex-1 rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden
                  ${isActive ? 'text-white' : 'text-white/50 hover:text-white/70 active:scale-95'}
                `}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.9) 100%)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                } : {}}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="relative z-10" />
                {isActive && (
                  <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5 relative z-10 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    {tab.label}
                  </span>
                )}
                        </button>
                    );
                })}
        </div>
      </div>

      {/* MODALS */}
      {selectedTask && (
        <TaskModal 
            task={selectedTask} 
            isOpen={!!selectedTask} 
            userInterest={user.interest}
            isPreviouslyCompleted={user.completedTaskIds.includes(selectedTask.id)}
            onClose={() => setSelectedTask(null)} 
            onComplete={() => {
                onTaskComplete(selectedTask);
                setSelectedTask(null);
            }} 
        />
      )}

      {isGameOpen && (
          <MemoryGame 
            isOpen={isGameOpen}
            onClose={() => setIsGameOpen(false)}
            onComplete={handleGameComplete}
          />
      )}
    </div>
  );
};
