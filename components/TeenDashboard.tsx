
import React, { useState, useEffect, useMemo } from 'react';
import { TASKS, SHOP_ITEMS, ACHIEVEMENTS } from '../constants';
import { Task, User, ShopItem } from '../types';
import { Check, Lock, Star, LayoutGrid, User as UserIcon, ShoppingBag, Heart, Zap, ShieldCheck, HelpCircle, ChevronRight, LogOut, Edit3, Sparkles, Gift, Target, Coins, Skull, Info, Award, Flame, Wrench, Trophy, Calendar, Play } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { ModernLessonView } from './ModernLessonView';
import { MemoryGame } from './MemoryGame';
import { ShopView } from './ShopView';
import { AchievementsView } from './AchievementsView';
import { ToolsView } from './ToolsView';
import { purchaseItem } from '../services/db';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { GameTutorial } from './GameTutorial';
import { Confetti, RewardPopup, Toast } from './Confetti';
import { DailyRewards } from './DailyRewards';
import { ActivityChart } from './ActivityChart';
import { DailyQuoteWidget } from './KatyaQuotes';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
  onUserUpdate?: (user: User) => void;
}

type Tab = 'LEARN' | 'TOOLS' | 'RELAX' | 'PROFILE';

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ user: initialUser, onTaskComplete, onUserUpdate }) => {
  const [user, setUser] = useState<User>(initialUser); // Local user state to reflect changes immediately
  const [activeTab, setActiveTab] = useState<Tab>('LEARN'); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const [isXpAnimating, setIsXpAnimating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShop, setShowShop] = useState(false);
  
  // New UI States
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState({ xp: 0, coins: 0 });
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // TikTok-style lesson mode (modern view)
  const [useTikTokMode, setUseTikTokMode] = useState(true); // Default to new modern view
  const [showModernLesson, setShowModernLesson] = useState(false);

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
      if (useTikTokMode) {
        setShowModernLesson(true);
      }
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

  // Check for daily rewards on mount
  useEffect(() => {
    const lastClaim = localStorage.getItem('daily_reward_last_claim');
    const today = new Date().toDateString();
    if (lastClaim !== today && user.completedTaskIds.length > 0) {
      // Show daily rewards after a delay
      const timer = setTimeout(() => setShowDailyRewards(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle daily reward claim
  const handleDailyRewardClaim = (day: number, xp: number, coins: number) => {
    setRewardData({ xp, coins });
    setShowReward(true);
    
    // Update user
    const updatedUser = {
      ...user,
      xp: user.xp + xp,
      coins: user.coins + coins,
      streak: user.streak + 1,
    };
    setUser(updatedUser);
    
    // Save to localStorage
    const users = JSON.parse(localStorage.getItem('ai_teenager_users_v6') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('ai_teenager_users_v6', JSON.stringify(users));
    }
    
    if (onUserUpdate) onUserUpdate(updatedUser);
  };

  // Show toast notification
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
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

    if (activeTab === 'PROFILE') {
        // Get Telegram user data if available - try multiple ways
        const tgWebApp = (window as any).Telegram?.WebApp;
        const tgUser = tgWebApp?.initDataUnsafe?.user;
        
        // Try to get name from different sources
        const telegramPhoto = tgUser?.photo_url;
        const telegramFirstName = tgUser?.first_name;
        const telegramUsername = tgUser?.username;
        const telegramId = tgUser?.id;
        
        // Priority: Telegram first_name > Telegram username > user.name from DB
        const displayName = telegramFirstName || telegramUsername || user.name;
        
        return (
            <div className="px-5 pt-24 pb-32 min-h-screen relative" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)' }}>
                
                {/* 1. HERO IDENTITY CARD - SIMPLIFIED */}
                <div className="relative w-full rounded-[2rem] overflow-hidden p-6 flex flex-col items-center text-center border border-white/10 mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                    {/* Static background gradient */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full opacity-30"
                          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }}
                        />
                    </div>

                    {/* Avatar - Telegram photo or default */}
                    <div className="relative z-10 mb-4">
                        <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-br from-indigo-500/50 to-purple-500/50 shadow-lg">
                            <img 
                              src={telegramPhoto || user.avatarUrl} 
                              className="w-full h-full rounded-full object-cover bg-[#0A0F1C]" 
                              alt="Profile" 
                            />
                            {/* Online Status */}
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#0A0F1C] rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Name & ID */}
                    <div className="relative z-10 mb-4">
                        <h2 className="text-2xl font-black text-white tracking-tight mb-1">{displayName}</h2>
                        {telegramId ? (
                          <p className="text-white/40 text-xs font-mono">@{telegramUsername || `id${telegramId}`}</p>
                        ) : (
                          <p className="text-white/40 text-xs">Игрок AI Pod</p>
                        )}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 mt-2">
                             <ShieldCheck size={12} className="text-indigo-400" />
                             <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Уровень {user.level}</span>
                        </div>
                    </div>

                    {/* Stats Grid - Compact */}
                    <div className="relative z-10 grid grid-cols-4 gap-2 w-full mb-4">
                        <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                            <div className="text-lg font-black text-white">{user.level}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">LVL</div>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                            <div className="text-lg font-black text-white">{user.xp}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">XP</div>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                            <div className="text-lg font-black text-yellow-400">{user.coins || 0}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">COINS</div>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                            <div className="text-lg font-black text-orange-400">{user.streak}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">DAYS</div>
                        </div>
                    </div>

                    {/* Level Progress - Simplified */}
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>Уровень {user.level}</span>
                            <span>{Math.round(levelProgress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                            <div 
                                style={{width: `${levelProgress}%`}} 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            ></div>
                        </div>
                    </div>
                </div>

                {/* SHOP BUTTON - Quick Access */}
                <button 
                    onClick={() => setShowShop(true)}
                    className="w-full mb-6 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(234,88,12,0.1) 100%)',
                      border: '1px solid rgba(234,179,8,0.3)',
                    }}
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <ShoppingBag size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-white font-bold">Магазин</div>
                        <div className="text-yellow-400/70 text-sm">Потрать свои {user.coins || 0} монет</div>
                    </div>
                    <ChevronRight size={20} className="text-yellow-400/50" />
                </button>

                {/* 2. ACHIEVEMENTS PREVIEW */}
                <div className="mb-6">
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

                {/* 3. INVENTORY - Compact with proper icons */}
                <div className="mb-6">
                    <div className="flex items-center justify-between px-1 mb-3">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-400"/> Инвентарь
                        </h3>
                        <span className="text-xs font-bold text-slate-500">{inventoryItems.length} шт</span>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                        {inventoryItems.length === 0 ? (
                          <div className="w-full py-4 text-center text-white/30 text-sm">
                            Пусто. Загляни в магазин!
                          </div>
                        ) : (
                          inventoryItems.map((item, idx) => {
                            // Правильные иконки для каждого предмета
                            const getItemIcon = (itemId: string | undefined) => {
                              switch(itemId) {
                                case 'hp_potion': return '❤️';
                                case 'streak_freeze': return '❄️';
                                case 'mystery_box': return '🎁';
                                case 'frame_gold': return '👑';
                                default: return '📦';
                              }
                            };
                            const getItemName = (itemId: string | undefined) => {
                              switch(itemId) {
                                case 'hp_potion': return 'HP';
                                case 'streak_freeze': return 'Заморозка';
                                case 'mystery_box': return 'Сюрприз';
                                case 'frame_gold': return 'Рамка';
                                default: return 'Предмет';
                              }
                            };
                            return (
                              <div key={idx} className="flex flex-col items-center">
                                <div className="w-14 h-14 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                  <span className="text-2xl">{getItemIcon(item?.id)}</span>
                                </div>
                                <span className="text-[9px] text-white/40 mt-1">{getItemName(item?.id)}</span>
                              </div>
                            );
                          })
                        )}
                    </div>
                </div>

                {/* 4. SETTINGS MENU - Simplified */}
                <div className="space-y-2">
                     {/* How to Play Button */}
                     <button 
                        onClick={() => setShowTutorial(true)}
                        className="w-full p-3 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98]"
                        style={{
                          background: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.2)',
                        }}
                     >
                         <div className="w-10 h-10 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                             <Info size={18} className="text-indigo-400" />
                         </div>
                         <div className="flex-1 text-left">
                             <div className="text-sm font-bold text-white">Как играть?</div>
                         </div>
                         <ChevronRight size={18} className="text-indigo-400/50" />
                     </button>

                     <button 
                        className="w-full p-3 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98]"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                     >
                         <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                             <HelpCircle size={18} className="text-white/50" />
                         </div>
                         <div className="flex-1 text-left">
                             <div className="text-sm font-bold text-white/80">Поддержка</div>
                         </div>
                         <ChevronRight size={18} className="text-white/30" />
                     </button>
                     
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
             
             {/* TOP BAR - iOS 26 LIQUID GLASS - COMPACT - LOWERED */}
             <div className="flex justify-between items-center mb-4 relative z-40 pt-20 sticky top-0 pb-3 -mx-4 px-4 transition-all duration-300">
                 {/* Glass background */}
                 <div 
                   className="absolute inset-0 -top-16"
                   style={{
                     background: 'linear-gradient(to bottom, rgba(10,15,28,1) 0%, rgba(10,15,28,0.95) 60%, transparent 100%)',
                   }}
                 />
                 
                 {/* Left side - HP & Streak */}
                 <div className="flex items-center gap-1.5 relative z-10">
                    {/* HP - Compact Glass Pill */}
                    <div 
                      className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5"
                      style={{
                        background: 'rgba(244,63,94,0.12)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(244,63,94,0.15)',
                      }}
                    >
                      <Heart size={12} fill="currentColor" className="text-rose-400" />
                      <span className="text-xs font-bold text-rose-300">{user.hp || 5}</span>
                    </div>
                    
                    {/* Streak - Compact */}
                    {user.streak > 0 && (
                      <div 
                        className="px-2.5 py-1.5 rounded-xl flex items-center gap-1"
                        style={{
                          background: 'rgba(249,115,22,0.12)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(249,115,22,0.15)',
                        }}
                      >
                        <Flame size={12} className="text-orange-400" />
                        <span className="text-xs font-bold text-orange-300">{user.streak}</span>
                      </div>
                    )}
                 </div>
                 
                 {/* Right side - XP & Coins */}
                 <div className="flex gap-1.5 items-center relative z-10">
                     {/* XP - Compact */}
                     <div 
                       className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5"
                       style={{
                         background: 'rgba(168,85,247,0.12)',
                         backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(168,85,247,0.15)',
                       }}
                     >
                       <Zap size={12} className="text-purple-400" />
                       <span className={`text-xs font-bold text-purple-300 ${isXpAnimating ? 'animate-pulse' : ''}`}>
                         {user.xp}
                       </span>
                     </div>
                     
                     {/* COINS - Clickable */}
                     <button 
                       onClick={() => setActiveTab('SHOP')}
                       className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                       style={{
                         background: 'rgba(234,179,8,0.15)',
                         backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(234,179,8,0.2)',
                       }}
                     >
                       <Coins size={12} className="text-yellow-400" />
                       <span className="text-xs font-bold text-yellow-300">{user.coins || 0}</span>
                     </button>
                 </div>
             </div>

             {/* WELCOME CARD - Compact */}
             {user.completedTaskIds.length === 0 && (
                 <div className="mb-4 mx-auto max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
                     <div 
                       className="relative overflow-hidden rounded-2xl p-4"
                       style={{
                         background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
                         backdropFilter: 'blur(30px)',
                         border: '1px solid rgba(99,102,241,0.15)',
                       }}
                     >
                         <div className="flex items-center gap-3">
                             <div className="text-3xl">👋</div>
                             <div className="flex-1">
                                 <h3 className="text-white font-bold text-sm">Привет, {user.name}!</h3>
                                 <p className="text-white/50 text-xs">С тобой всё нормально ✨</p>
                             </div>
                             <button 
                                 onClick={() => setShowTutorial(true)}
                                 className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-300 transition-all active:scale-95"
                                 style={{
                                   background: 'rgba(99,102,241,0.2)',
                                   border: '1px solid rgba(99,102,241,0.3)',
                                 }}
                             >
                                 Как играть?
                             </button>
                         </div>
                     </div>
                 </div>
             )}

             {/* DAILY QUESTS - Compact Glass Card */}
             <div className="mb-4 relative z-10 mx-auto max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                 <div 
                   className="relative overflow-hidden rounded-2xl p-4"
                   style={{
                     background: 'rgba(255,255,255,0.05)',
                     backdropFilter: 'blur(30px)',
                     border: '1px solid rgba(255,255,255,0.08)',
                   }}
                 >
                     <div className="flex items-center justify-between mb-3 relative z-10">
                         <div className="flex items-center gap-2">
                             <Target className="text-indigo-400" size={14} />
                             <span className="text-white/80 font-semibold text-xs">Цели дня</span>
             </div>
                         <span className="text-white/40 text-[10px] font-medium">
                             {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}
                         </span>
                     </div>
                     
                     {/* Compact quest list */}
                     <div className="space-y-2 relative z-10">
                         {dailyQuests.map((q) => (
                             <div 
                                 key={q.id} 
                                 className="flex items-center justify-between"
                             >
                                 <div className="flex items-center gap-2">
                                     <div className={`w-4 h-4 rounded-md flex items-center justify-center ${
                                         q.completed ? 'bg-green-500' : 'bg-white/10 border border-white/20'
                                     }`}>
                                         {q.completed && <Check size={10} className="text-white" strokeWidth={3} />}
                                     </div>
                                     <span className={`text-xs ${q.completed ? 'text-green-400' : 'text-white/60'}`}>
                                         {q.text}
                                     </span>
                                 </div>
                                 <span className="text-yellow-400 text-[10px] font-bold">+{q.reward}</span>
                             </div>
                         ))}
                     </div>
                     
                     {/* Mini progress bar */}
                     <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                         <div 
                             className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                             style={{ width: `${(dailyQuests.filter(q => q.completed).length / dailyQuests.length) * 100}%` }}
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
                    
                    // Иконки для каждого урока
                    const lessonIcons: Record<string, string> = {
                      't1': '🧠', 't2': '⚡', 't3': '🎯', 't4': '🔋', 't5': '😴',
                      't6': '👑', 't7': '🦥', 't8': '🧹', 't9': '❓', 't10': '🐸',
                      't11': '💪', 't12': '🏗️', 't13': '📈', 't14': '🎮', 't15': '🌊',
                      't16': '🍅', 't17': '🔬', 't18': '🧘', 't19': '👥', 't20': '📜', 't21': '🏆'
                    };
                    const lessonIcon = lessonIcons[task.id] || '📚';
                    
                    return (
                        <React.Fragment key={task.id}>
                           {/* WEEK DIVIDER - Enhanced */}
                            {isNewWeek && (
                                <div 
                                    className="absolute w-full text-center z-0"
                                   style={{ top: topPos - 60, left: '50%', transform: 'translateX(-50%)' }}
                                >
                                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                                     style={{
                                       background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                                       border: '1px solid rgba(99,102,241,0.2)',
                                     }}
                                   >
                                     <Flame size={10} className="text-orange-400" />
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
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
                                       relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 w-[165px]
                                       ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                                       ${isActive ? 'hover:scale-105 hover:shadow-xl' : ''}
                                   `}
                                   style={{
                                     background: isCompleted 
                                       ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.08) 100%)'
                                       : isActive 
                                         ? task.isBoss 
                                           ? 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0.1) 100%)'
                                           : 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.1) 100%)'
                                         : 'rgba(255,255,255,0.03)',
                                     backdropFilter: 'blur(20px)',
                                     border: isCompleted 
                                       ? '1px solid rgba(34,197,94,0.4)'
                                       : isActive 
                                         ? task.isBoss 
                                           ? '1px solid rgba(239,68,68,0.4)'
                                           : '1px solid rgba(99,102,241,0.35)'
                                         : '1px solid rgba(255,255,255,0.08)',
                                     boxShadow: isActive && !task.isBoss 
                                       ? '0 8px 32px rgba(99,102,241,0.2)' 
                                       : isActive && task.isBoss 
                                         ? '0 8px 32px rgba(239,68,68,0.2)'
                                         : 'none',
                                   }}
                               >
                                   {/* Shine effect for active */}
                                    {isActive && (
                                     <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                       <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
                                     </div>
                                    )}

                                   {/* Icon Circle with emoji */}
                                    <div className={`
                                       w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all relative
                                        ${isCompleted 
                                           ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                            : isLocked 
                                               ? 'bg-white/5' 
                                                : task.isBoss 
                                                   ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                                                   : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                                        }
                                    `}
                                    style={{
                                      boxShadow: isActive 
                                        ? task.isBoss 
                                          ? '0 4px 20px rgba(239,68,68,0.4)' 
                                          : '0 4px 20px rgba(99,102,241,0.4)'
                                        : 'none'
                                    }}
                                    >
                                        {isCompleted 
                                           ? <Check size={22} strokeWidth={3} className="text-white" /> 
                                            : isLocked 
                                               ? <Lock size={16} className="text-white/30" /> 
                                                : task.isBoss
                                                   ? <Skull size={22} className="text-white" />
                                                   : <span className="text-xl">{lessonIcon}</span>
                                        }
                                    </div>
                                    
                                   {/* Text */}
                                   <div className="flex-1 text-left min-w-0 relative z-10">
                                       <span className={`text-[11px] font-bold leading-tight block truncate ${
                                           isCompleted ? 'text-green-400' : isActive ? 'text-white' : 'text-white/30'
                                       }`}>
                                           {task.title}
                                       </span>
                                       <div className="flex items-center gap-1.5 mt-0.5">
                                         <Zap size={10} className={isCompleted ? 'text-green-400/60' : isActive ? 'text-yellow-400' : 'text-white/20'} />
                                         <span className={`text-[9px] font-medium ${
                                             isCompleted ? 'text-green-400/60' : isActive ? 'text-yellow-400' : 'text-white/20'
                                         }`}>
                                             +{task.xpReward} XP
                                         </span>
                                       </div>
                                        </div>

                                   {/* Active indicator with glow */}
                                   {isActive && !task.isBoss && (
                                       <div className="absolute -right-1 -top-1">
                                         <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
                                         <div className="absolute inset-0 w-3 h-3 rounded-full bg-indigo-400 animate-ping opacity-75" />
                                       </div>
                                   )}
                                   {task.isBoss && isActive && (
                                       <div className="absolute -right-1 -top-1">
                                         <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                         <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
                                        </div>
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
    <div className="h-full relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #0d1424 50%, #0f172a 100%)' }}>
      
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
      {/* Modern TikTok-style lesson view */}
      {selectedTask && useTikTokMode && showModernLesson && (
        <ModernLessonView
            task={selectedTask}
            isOpen={showModernLesson}
            onClose={() => {
              setShowModernLesson(false);
              setSelectedTask(null);
            }}
            onComplete={() => {
                onTaskComplete(selectedTask);
                setShowModernLesson(false);
                setSelectedTask(null);
            }}
        />
      )}
      
      {/* Classic lesson view */}
      {selectedTask && (!useTikTokMode || !showModernLesson) && (
        <TaskModal 
            task={selectedTask} 
            isOpen={!!selectedTask && !showModernLesson} 
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

      {/* NEW UI COMPONENTS */}
      
      {/* Confetti Animation */}
      <Confetti isActive={showConfetti} />
      
      {/* Reward Popup */}
      <RewardPopup 
        xp={rewardData.xp}
        coins={rewardData.coins}
        isVisible={showReward}
        onComplete={() => setShowReward(false)}
      />
      
      {/* Toast Notifications */}
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      {/* Daily Rewards Modal */}
      <DailyRewards
        isOpen={showDailyRewards}
        onClose={() => setShowDailyRewards(false)}
        onClaim={handleDailyRewardClaim}
        currentStreak={user.streak}
      />
      
      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-[80] bg-[#020617] overflow-y-auto">
          <button 
            onClick={() => setShowShop(false)}
            className="fixed top-6 right-6 z-[90] w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
          <ShopView user={user} onBuy={handleBuyItem} />
        </div>
      )}
    </div>
  );
};
