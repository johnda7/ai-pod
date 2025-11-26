
import React, { useState, useEffect, useMemo } from 'react';
import { TASKS, SHOP_ITEMS, ACHIEVEMENTS } from '../constants';
import { Task, User, ShopItem } from '../types';
import { Check, Lock, Star, LayoutGrid, User as UserIcon, ShoppingBag, Heart, Zap, ShieldCheck, HelpCircle, ChevronRight, LogOut, Edit3, Sparkles, Gift, Target, Coins, Skull, Info, Award, Flame, Wrench } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { MemoryGame } from './MemoryGame';
import { ShopView } from './ShopView';
import { AchievementsView } from './AchievementsView';
import { ToolsView } from './ToolsView';
import { purchaseItem } from '../services/db';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { GameTutorial } from './GameTutorial';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
  onUserUpdate?: (user: User) => void; // Callback to update parent
}

type Tab = 'LEARN' | 'TOOLS' | 'RELAX' | 'SHOP' | 'PROFILE';

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

  // Обработка награды от игр
  const handleGameReward = (xp: number, coins: number, bonus?: string) => {
    const updatedUser = {
      ...user,
      xp: user.xp + xp,
      coins: user.coins + coins,
      level: Math.floor((user.xp + xp) / 100) + 1,
    };
    
    // Добавляем бонусный предмет в инвентарь
    if (bonus && !updatedUser.inventory.includes(bonus)) {
      updatedUser.inventory = [...updatedUser.inventory, bonus];
    }
    
    setUser(updatedUser);
    localStorage.setItem('ai_pod_user', JSON.stringify(updatedUser));
    onUserUpdate?.(updatedUser);
    
    // Анимация XP
    setIsXpAnimating(true);
    setTimeout(() => setIsXpAnimating(false), 500);
  };

  const renderContent = () => {
    if (activeTab === 'TOOLS') return <ToolsView user={user} onXpEarned={handleGameReward} />;
    if (activeTab === 'RELAX') return <MeditationView />;
    if (activeTab === 'SHOP') return <ShopView user={user} onBuy={handleBuyItem} onRefreshUser={refreshUserData} />;

    if (activeTab === 'PROFILE') {
        return (
            <div className="min-h-screen relative animate-in fade-in duration-500">
                {/* iOS 26 LIQUID GLASS BACKGROUND */}
                <div className="fixed inset-0 -z-10">
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, #0c1222 0%, #020617 50%, #0a0f1a 100%)'
                  }} />
                  <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
                  <div className="absolute top-60 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
                  <div className="absolute bottom-40 left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
                </div>
                
                <div className="px-4 pt-16 pb-32">
                
                {/* 1. HERO IDENTITY CARD - iOS 26 LIQUID GLASS */}
                <div 
                  className="relative w-full rounded-[2.5rem] overflow-hidden p-6 flex flex-col items-center text-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-[2.5rem] pointer-events-none" />

                    {/* Edit Button */}
                    <button 
                      className="absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 z-20"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                        <Edit3 size={16} className="text-white/70" />
                    </button>

                    {/* Avatar */}
                    <div className="relative z-10 mb-4">
                        <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl animate-pulse"></div>
                        <div 
                          className="relative w-24 h-24 rounded-3xl p-1"
                          style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.5) 100%)',
                            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
                          }}
                        >
                            <img 
                              src={user.avatarUrl} 
                              className="w-full h-full rounded-[1.2rem] object-cover" 
                              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}
                              alt="Profile" 
                            />
                            {/* Online Status */}
                            <div 
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                boxShadow: '0 0 15px rgba(34,197,94,0.6)',
                              }}
                            >
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Name & Badge */}
                    <div className="relative z-10 mb-5">
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">{user.name}</h2>
                        <div 
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)',
                            border: '1px solid rgba(99,102,241,0.25)',
                          }}
                        >
                             <ShieldCheck size={14} className="text-indigo-400" />
                             <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{user.role === 'TEEN' ? 'Ученик' : 'Админ'}</span>
                        </div>
                    </div>

                    {/* Stats Grid - iOS 26 Glass Cards */}
                    <div className="relative z-10 grid grid-cols-3 gap-3 w-full mb-5">
                        {[
                          { value: user.level, label: 'Уровень', color: 'indigo' },
                          { value: user.xp, label: 'Опыт', color: 'purple' },
                          { value: user.streak, label: 'Дней', color: 'orange' },
                        ].map((stat, idx) => (
                          <div 
                            key={idx}
                            className="flex flex-col items-center p-3 rounded-2xl transition-all hover:scale-105"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                            <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">{stat.label}</div>
                        </div>
                        ))}
                    </div>

                    {/* Level Progress */}
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between text-[10px] font-bold text-white/40 mb-2 uppercase tracking-wider">
                            <span>Уровень {user.level}</span>
                            <span>{Math.round(levelProgress)}%</span>
                        </div>
                        <div 
                          className="h-2.5 w-full rounded-full overflow-hidden"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                            <div 
                                style={{
                                  width: `${levelProgress}%`,
                                  background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                                  boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                                }} 
                                className="h-full rounded-full transition-all duration-500"
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 2. ACHIEVEMENTS PREVIEW - iOS 26 LIQUID GLASS */}
                <div 
                  className="mb-6 rounded-3xl p-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(234,179,8,0.3) 0%, rgba(245,158,11,0.2) 100%)',
                                border: '1px solid rgba(234,179,8,0.25)',
                              }}
                            >
                              <Trophy size={18} className="text-yellow-400" />
                            </div>
                            <span className="text-white font-bold">Достижения</span>
                        </div>
                        <span 
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.1) 100%)',
                            border: '1px solid rgba(234,179,8,0.2)',
                            color: '#fbbf24',
                          }}
                        >
                            {ACHIEVEMENTS.filter(a => {
                                if (a.requirement.type === 'TASKS_COMPLETED') return user.completedTaskIds.length >= a.requirement.value;
                                if (a.requirement.type === 'STREAK_DAYS') return user.streak >= a.requirement.value;
                                if (a.requirement.type === 'XP_EARNED') return user.xp >= a.requirement.value;
                                return false;
                            }).length} / {ACHIEVEMENTS.length}
                        </span>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {ACHIEVEMENTS.slice(0, 5).map((achievement, idx) => {
                            const isUnlocked = 
                                (achievement.requirement.type === 'TASKS_COMPLETED' && user.completedTaskIds.length >= achievement.requirement.value) ||
                                (achievement.requirement.type === 'STREAK_DAYS' && user.streak >= achievement.requirement.value) ||
                                (achievement.requirement.type === 'XP_EARNED' && user.xp >= achievement.requirement.value);
                            
                            return (
                                <div 
                                    key={achievement.id}
                                    className="w-16 h-16 shrink-0 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all hover:scale-110"
                                    style={{
                                      background: isUnlocked 
                                        ? 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(245,158,11,0.1) 100%)'
                                        : 'rgba(255,255,255,0.05)',
                                      border: isUnlocked 
                                        ? '1px solid rgba(234,179,8,0.3)'
                                        : '1px solid rgba(255,255,255,0.05)',
                                      boxShadow: isUnlocked 
                                        ? '0 4px 15px rgba(234,179,8,0.2)'
                                        : 'none',
                                    }}
                                >
                                    <span className={`text-xl ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                                        {achievement.icon}
                                    </span>
                                    {isUnlocked && (
                                        <div 
                                          className="absolute top-1 right-1 w-4 h-4 rounded-md flex items-center justify-center"
                                          style={{
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            boxShadow: '0 0 8px rgba(34,197,94,0.5)',
                                          }}
                                        >
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
        <div className="relative min-h-screen overflow-x-hidden">
             {/* iOS 26 LIQUID GLASS BACKGROUND */}
             <div className="fixed inset-0 -z-10">
               {/* Gradient mesh background */}
               <div className="absolute inset-0" style={{
                 background: 'linear-gradient(135deg, #0c1222 0%, #020617 50%, #0a0f1a 100%)'
               }} />
               {/* Animated orbs */}
               <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
               <div className="absolute top-60 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
               <div className="absolute bottom-40 left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
             </div>
             
             {/* TOP BAR - iOS 26 LIQUID GLASS */}
             <div className="sticky top-0 z-40 pt-12 pb-4 px-4">
                 <div 
                   className="flex justify-between items-center p-3 rounded-2xl"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                     backdropFilter: 'blur(40px) saturate(180%)',
                     WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                     border: '1px solid rgba(255,255,255,0.15)',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                   }}
                 >
                   {/* Left side - HP & Streak */}
                 <div className="flex items-center gap-2">
                    {/* HP */}
                      <div 
                        className="px-3 py-2 rounded-xl flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.1) 100%)',
                          border: '1px solid rgba(244,63,94,0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                      >
                        <Heart size={14} fill="currentColor" className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-sm font-bold text-rose-300">{user.hp || 5}</span>
                      </div>
                      
                      {/* Streak */}
                      {user.streak > 0 && (
                        <div 
                          className="px-3 py-2 rounded-xl flex items-center gap-2"
                          style={{
                            background: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.1) 100%)',
                            border: '1px solid rgba(249,115,22,0.2)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                          }}
                        >
                          <Flame size={14} className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                          <span className="text-sm font-bold text-orange-300">{user.streak}</span>
                        </div>
                      )}
                   </div>
                   
                   {/* Right side - XP & Coins */}
                   <div className="flex gap-2 items-center">
                       {/* XP */}
                       <div 
                         className="px-3 py-2 rounded-xl flex items-center gap-2"
                         style={{
                           background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.1) 100%)',
                           border: '1px solid rgba(168,85,247,0.2)',
                           boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                         }}
                       >
                         <Zap size={14} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                         <span className={`text-sm font-bold text-purple-300 ${isXpAnimating ? 'animate-pulse' : ''}`}>
                           {user.xp}
                         </span>
                       </div>
                       
                       {/* COINS - Clickable */}
                       <button 
                         onClick={() => setActiveTab('SHOP')}
                         className="px-3 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 hover:scale-105"
                         style={{
                           background: 'linear-gradient(135deg, rgba(234,179,8,0.25) 0%, rgba(234,179,8,0.15) 100%)',
                           border: '1px solid rgba(234,179,8,0.3)',
                           boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 15px rgba(234,179,8,0.2)',
                         }}
                       >
                         <Coins size={14} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                         <span className="text-sm font-bold text-yellow-300">{user.coins || 0}</span>
                       </button>
                    </div>
                 </div>
             </div>

             <div className="px-4 pb-40">

             {/* WELCOME CARD - iOS 26 LIQUID GLASS */}
             {user.completedTaskIds.length === 0 && (
                 <div className="mb-6 mx-auto max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
                     <div 
                       className="relative overflow-hidden rounded-3xl p-5"
                       style={{
                         background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                         backdropFilter: 'blur(40px) saturate(180%)',
                         WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                         border: '1px solid rgba(255,255,255,0.12)',
                         boxShadow: '0 8px 32px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                       }}
                     >
                         {/* Gradient shine */}
                         <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl" />
                         
                         <div className="flex items-center gap-4 relative z-10">
                             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center border border-white/10">
                               <span className="text-3xl">👋</span>
                             </div>
                             <div className="flex-1">
                                 <h3 className="text-white font-bold text-base">Привет, {user.name}!</h3>
                                 <p className="text-white/60 text-sm">С тобой всё нормально ✨</p>
                             </div>
                             <button 
                                 onClick={() => setShowTutorial(true)}
                                 className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 hover:scale-105"
                                 style={{
                                   background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.3) 100%)',
                                   border: '1px solid rgba(255,255,255,0.15)',
                                   boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                                 }}
                             >
                                 Как играть?
                             </button>
                         </div>
                     </div>
                 </div>
             )}

             {/* DAILY QUESTS - iOS 26 LIQUID GLASS */}
             <div className="mb-6 relative z-10 mx-auto max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                 <div 
                   className="relative overflow-hidden rounded-3xl p-5"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                     backdropFilter: 'blur(40px) saturate(180%)',
                     WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                     border: '1px solid rgba(255,255,255,0.1)',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                   }}
                 >
                     {/* Gradient shine */}
                     <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/3 to-transparent rounded-t-3xl" />
                     
                     <div className="flex items-center justify-between mb-4 relative z-10">
                         <div className="flex items-center gap-3">
                             <div 
                               className="w-10 h-10 rounded-xl flex items-center justify-center"
                               style={{
                                 background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                                 border: '1px solid rgba(255,255,255,0.1)',
                               }}
                             >
                               <Target className="text-indigo-400" size={18} />
                             </div>
                             <div>
                               <span className="text-white font-bold text-sm block">Цели дня</span>
                               <span className="text-white/40 text-xs">
                                   {dailyQuests.filter(q => q.completed).length} из {dailyQuests.length} выполнено
                               </span>
                 </div>
             </div>
                     </div>
                     
                     {/* Quest list with glass cards */}
                     <div className="space-y-2 relative z-10">
                         {dailyQuests.map((q) => (
                             <div 
                                 key={q.id} 
                                 className="flex items-center justify-between p-3 rounded-xl transition-all"
                                 style={{
                                   background: q.completed 
                                     ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 100%)'
                                     : 'rgba(255,255,255,0.03)',
                                   border: q.completed 
                                     ? '1px solid rgba(34,197,94,0.2)'
                                     : '1px solid rgba(255,255,255,0.05)',
                                 }}
                             >
                                 <div className="flex items-center gap-3">
                                     <div 
                                       className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                         q.completed 
                                           ? 'bg-green-500 shadow-lg shadow-green-500/30' 
                                           : 'bg-white/10 border border-white/20'
                                       }`}
                                     >
                                         {q.completed && <Check size={14} className="text-white" strokeWidth={3} />}
                                     </div>
                                     <span className={`text-sm font-medium ${q.completed ? 'text-green-400' : 'text-white/70'}`}>
                                         {q.text}
                                     </span>
                                 </div>
                                 <div 
                                   className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                   style={{
                                     background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.1) 100%)',
                                     color: '#fbbf24',
                                   }}
                                 >
                                   +{q.reward}
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     {/* Progress bar with glow */}
                     <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden relative">
                         <div 
                             className="h-full rounded-full transition-all duration-500"
                             style={{ 
                               width: `${(dailyQuests.filter(q => q.completed).length / dailyQuests.length) * 100}%`,
                               background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                               boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                             }}
                         />
                     </div>
                 </div>
             </div>

             {/* LESSON PATH - Modern Glass Cards */}
             <div className="relative mx-auto max-w-sm pb-8" style={{ minHeight: mapHeight }}>
               
               {/* SVG Path - Subtle */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" overflow="visible">
                    <path 
                       d={`M 192 40 
                           ${TASKS.map((_, i) => {
                              const y = START_PADDING + (i * ITEM_SPACING) - 50;
                               const x = i % 2 === 0 ? 280 : 100; 
                               return `L ${x} ${y}`;
                           }).join(" ")}
                        `}
                        fill="none" 
                        stroke="url(#pathGradient)" 
                       strokeWidth="2"
                       strokeDasharray="6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                       className="opacity-20"
                    />
                    <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                           <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>

                {TASKS.map((task, index) => {
                    const isCompleted = user.completedTaskIds.includes(task.id);
                    // ВРЕМЕННО: Все уроки открыты для просмотра (убрать после тестирования)
                    const isLocked = false; // index > 0 && !user.completedTaskIds.includes(TASKS[index-1].id);
                    const isActive = !isCompleted && !isLocked;

                   const topPos = START_PADDING + (index * ITEM_SPACING) - 50;
                   const leftPos = index % 2 === 0 ? '65%' : '35%'; 
                    
                    const isNewWeek = index === 0 || task.week > TASKS[index - 1].week;
                    
                    return (
                        <React.Fragment key={task.id}>
                           {/* WEEK DIVIDER - iOS 26 Glass Badge */}
                            {isNewWeek && (
                                <div 
                                    className="absolute z-20"
                                   style={{ top: topPos - 65, left: '50%', transform: 'translateX(-50%)' }}
                                >
                                   <div 
                                     className="px-4 py-2 rounded-full"
                                     style={{
                                       background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                                       backdropFilter: 'blur(20px)',
                                       border: '1px solid rgba(255,255,255,0.1)',
                                       boxShadow: '0 4px 20px rgba(99,102,241,0.2)',
                                     }}
                                   >
                                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                                            Неделя {task.week}
                                     </span>
                                    </div>
                                </div>
                            )}

                            <div 
                               className="absolute z-10"
                                style={{ top: topPos, left: leftPos, transform: 'translate(-50%, -50%)' }}
                            >
                                <button
                                    onClick={() => handleTaskClick(task, isLocked)}
                                    disabled={isLocked}
                                    className={`
                                       relative flex items-center gap-3 p-4 rounded-3xl transition-all duration-300 w-[175px]
                                       ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                                       ${isActive ? 'hover:scale-105 hover:shadow-2xl' : ''}
                                   `}
                                   style={{
                                     background: isCompleted 
                                       ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.08) 100%)'
                                       : isActive 
                                         ? task.isBoss 
                                           ? 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0.1) 100%)'
                                           : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)'
                                         : 'rgba(255,255,255,0.03)',
                                     backdropFilter: 'blur(40px) saturate(180%)',
                                     WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                                     border: isCompleted 
                                       ? '1px solid rgba(34,197,94,0.3)'
                                       : isActive 
                                         ? task.isBoss 
                                           ? '1px solid rgba(239,68,68,0.35)'
                                           : '1px solid rgba(255,255,255,0.15)'
                                         : '1px solid rgba(255,255,255,0.05)',
                                     boxShadow: isActive 
                                       ? task.isBoss 
                                         ? '0 8px 32px rgba(239,68,68,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                                         : '0 8px 32px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                       : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                                   }}
                               >
                                   {/* Shine effect */}
                                   <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl pointer-events-none" />
                                   
                                   {/* Icon Circle */}
                                    <div 
                                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all relative"
                                      style={{
                                        background: isCompleted 
                                          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                            : isLocked 
                                            ? 'rgba(255,255,255,0.05)'
                                                : task.isBoss 
                                              ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                                              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        boxShadow: isActive 
                                          ? task.isBoss 
                                            ? '0 4px 20px rgba(239,68,68,0.4)'
                                            : '0 4px 20px rgba(99,102,241,0.4)'
                                          : 'none',
                                      }}
                                    >
                                        {isCompleted 
                                           ? <Check size={24} strokeWidth={3} className="text-white drop-shadow-lg" /> 
                                            : isLocked 
                                               ? <Lock size={18} className="text-white/30" /> 
                                                : task.isBoss
                                                   ? <Skull size={24} className="text-white drop-shadow-lg" />
                                                   : <span className="text-white font-black text-xl drop-shadow-lg">{index + 1}</span>
                                        }
                                    </div>
                                    
                                   {/* Text */}
                                   <div className="flex-1 text-left min-w-0 relative z-10">
                                       <span className={`text-xs font-bold leading-tight block truncate ${
                                           isCompleted ? 'text-green-400' : isActive ? 'text-white' : 'text-white/30'
                                       }`}>
                                           {task.title}
                                       </span>
                                       <div className="flex items-center gap-1 mt-1">
                                         <Zap size={10} className={isCompleted ? 'text-green-400/60' : isActive ? 'text-purple-400' : 'text-white/20'} />
                                         <span className={`text-[10px] font-medium ${
                                             isCompleted ? 'text-green-400/60' : isActive ? 'text-purple-300' : 'text-white/20'
                                         }`}>
                                             +{task.xpReward} XP
                                         </span>
                                       </div>
                                        </div>

                                   {/* Active indicator - Glowing dot */}
                                   {isActive && !task.isBoss && (
                                       <div 
                                         className="absolute -right-1 -top-1 w-4 h-4 rounded-full animate-pulse"
                                         style={{
                                           background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                           boxShadow: '0 0 15px rgba(99,102,241,0.6)',
                                         }}
                                       />
                                   )}
                                   {task.isBoss && isActive && (
                                       <div 
                                         className="absolute -right-1 -top-1 w-4 h-4 rounded-full animate-pulse"
                                         style={{
                                           background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                                           boxShadow: '0 0 15px rgba(239,68,68,0.6)',
                                         }}
                                       />
                                    )}
                                </button>
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
                  { id: 'TOOLS', icon: Wrench, label: 'Полезное' },
                  { id: 'RELAX', icon: Star, label: 'Чилл' },
                  { id: 'PROFILE', icon: UserIcon, label: 'Профиль' },
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
