




import React, { useState, useEffect } from 'react';
import { TASKS } from '../constants';
import { Task, User, ShopItem } from '../types';
import { Check, Lock, Star, LayoutGrid, User as UserIcon, ShoppingBag, Trophy, Heart, Zap, Shield, Skull, Coins, Target, MapPin } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { MemoryGame } from './MemoryGame';
import { ShopView } from './ShopView';
import { LeaderboardView } from './LeaderboardView';
import { isSupabaseEnabled } from '../services/supabaseClient';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
}

type Tab = 'LEARN' | 'RELAX' | 'SHOP' | 'LEADERBOARD' | 'PROFILE';

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ user, onTaskComplete }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LEARN'); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const [isXpAnimating, setIsXpAnimating] = useState(false);
  
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
      const gameTask: Task = {
          id: `game_${Date.now()}`,
          week: 0,
          title: 'Нейро-Тренировка',
          description: 'Успешная калибровка',
          xpReward: xp,
          coinsReward: Math.floor(xp / 2),
          isLocked: false,
          slides: []
      };
      onTaskComplete(gameTask);
  };

  const handleBuyItem = (item: ShopItem) => {
      // Logic to handle buying would normally call a parent function or API
      // For visual demo, we assume App parent handles state updates via db services,
      // but here we'd optimistically update if we had `onUpdateUser`.
      // For now, just an alert or visual feedback could be added.
      alert(`Куплено: ${item.name}! (В демо-режиме монеты не списываются)`);
  };

  const nextLevelXp = user.level * 500;
  const prevLevelXp = (user.level - 1) * 500;
  const levelProgress = Math.min(100, Math.max(0, ((user.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  const renderContent = () => {
    if (activeTab === 'RELAX') return <MeditationView />;
    if (activeTab === 'SHOP') return <ShopView user={user} onBuy={handleBuyItem} />;
    if (activeTab === 'LEADERBOARD') return <LeaderboardView currentUser={user} />;

    if (activeTab === 'PROFILE') {
        return (
            <div className="px-6 pt-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* HEADER CARD */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#151925] border border-white/10 p-8 shadow-2xl mb-8">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/30 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="relative group mb-4">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000"></div>
                            <div className="relative w-28 h-28 rounded-full p-1 bg-[#151925]">
                                <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">{user.name}</h2>
                        
                        <div className="flex gap-2 mb-6">
                            <span className="px-4 py-1.5 rounded-xl bg-indigo-500/20 text-sm font-bold text-indigo-300 border border-indigo-500/30">
                                Уровень {user.level}
                            </span>
                        </div>

                        {/* Level Progress */}
                        <div className="w-full bg-black/40 h-4 rounded-full overflow-hidden border border-white/5 relative mb-2">
                             <div 
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                style={{ width: `${levelProgress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                            </div>
                        </div>
                        <div className="flex justify-between w-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>0%</span>
                            <span>{user.xp} / {nextLevelXp} XP</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#1E2332] border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                            <Zap size={28} fill="currentColor" />
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{user.streak}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Дней подряд</div>
                        </div>
                    </div>
                    <div className="bg-[#1E2332] border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <Shield size={28} fill="currentColor" />
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{user.completedTaskIds.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Миссий выполнено</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- GAME MAP LOGIC ---
    const mapHeight = TASKS.length * 200 + 300; // 200px per task + padding

    return (
        <div className="relative pt-2 pb-40 px-4 min-h-screen overflow-x-hidden">
             
             {/* TOP BAR */}
             <div className="flex justify-between items-start mb-2 relative z-20 pt-2 backdrop-blur-md sticky top-0 pb-2 -mx-4 px-6 bg-[#020617]/90 border-b border-white/5">
                 <div className="flex items-center gap-2">
                    {/* HP */}
                    <div className="flex flex-col items-center">
                        <div className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-2 border border-white/10 bg-white/5 shadow-lg mb-1">
                            <Heart size={20} fill="currentColor" className="text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                            <span className="text-white font-black font-mono">{user.hp || 5}</span>
                        </div>
                    </div>
                 </div>
                 
                 <div className="flex gap-2 items-center">
                     {/* COINS */}
                     <div className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-2 border border-white/10 bg-white/5 shadow-lg cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setActiveTab('SHOP')}>
                         <Coins size={20} fill="currentColor" className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                         <div className="text-lg font-black font-mono text-white">
                             {user.coins || 0}
                         </div>
                     </div>
                 </div>
             </div>

             {/* DAILY QUESTS WIDGET */}
             <div className="mb-10 relative z-10 mx-auto max-w-sm">
                 <div className="bg-[#151925] rounded-3xl p-5 border border-white/5 shadow-xl">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                             <Target className="text-indigo-400" size={18} /> Ежедневные цели
                         </h3>
                         <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">12:45:01</span>
                     </div>
                     <div className="space-y-3">
                         {dailyQuests.map(q => (
                             <div key={q.id} className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${q.completed ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                         {q.completed && <Check size={12} className="text-white" />}
                                     </div>
                                     <span className={`text-sm font-medium ${q.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{q.text}</span>
                                 </div>
                                 <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                                     +{q.reward} <Coins size={10} fill="currentColor" />
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

             {/* GAME PATH CONTAINER */}
             <div className="relative mx-auto max-w-sm" style={{ height: mapHeight }}>
                
                {/* START MARKER */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center">
                    <div className="inline-block px-6 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                        Старт
                    </div>
                </div>

                {/* SVG Path (Zig Zag) */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" overflow="visible">
                    <path 
                        d={`M 192 80 
                           ${TASKS.map((_, i) => {
                               const y = 200 + (i * 200);
                               const x = i % 2 === 0 ? 300 : 80; // Zig Zag
                               return `L ${x} ${y}`;
                           }).join(" ")}
                        `}
                        fill="none" 
                        stroke="url(#pathGradient)" 
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-40"
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
                    // Unlock logic: First is open, others depend on previous
                    const isLocked = index > 0 && !user.completedTaskIds.includes(TASKS[index-1].id);
                    const isActive = !isCompleted && !isLocked;

                    const topPos = 200 + (index * 200);
                    const leftPos = index % 2 === 0 ? '75%' : '25%'; // 75% right, 25% left
                    
                    // WEEK SEPARATOR LOGIC
                    const isNewWeek = index === 0 || task.week > TASKS[index - 1].week;
                    
                    return (
                        <React.Fragment key={task.id}>
                            {/* WEEK DIVIDER */}
                            {isNewWeek && (
                                <div 
                                    className="absolute w-full text-center z-0"
                                    style={{ top: topPos - 100, left: '50%', transform: 'translateX(-50%)' }}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent absolute"></div>
                                        <div className="bg-[#020617] px-4 relative z-10 text-xs font-black uppercase tracking-[0.3em] text-slate-500 border border-white/10 py-1 rounded-full">
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
                                        ${isLocked ? 'grayscale opacity-60 cursor-not-allowed scale-90' : 'cursor-pointer hover:scale-110 active:scale-95'}
                                        ${task.isBoss ? 'w-28 h-28' : 'w-24 h-24'}
                                    `}
                                >
                                    {/* Boss Effect */}
                                    {task.isBoss && !isLocked && !isCompleted && (
                                        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40 animate-pulse"></div>
                                    )}

                                    {/* Main Circle */}
                                    <div className={`
                                        w-full h-full rounded-[2.5rem] flex items-center justify-center border-b-8 shadow-xl transition-all
                                        ${isCompleted 
                                            ? 'bg-emerald-600 border-emerald-800' 
                                            : isLocked 
                                                ? 'bg-slate-800 border-slate-900' 
                                                : task.isBoss 
                                                    ? 'bg-red-500 border-red-700' 
                                                    : 'bg-indigo-500 border-indigo-700'
                                        }
                                    `}>
                                        {isCompleted 
                                            ? <Check size={32} strokeWidth={4} className="text-white drop-shadow-md" /> 
                                            : isLocked 
                                                ? <Lock size={24} className="text-slate-500" /> 
                                                : task.isBoss
                                                    ? <Skull size={32} className="text-white animate-pulse" />
                                                    : <div className="text-white drop-shadow-md font-black text-3xl font-mono">{index + 1}</div>
                                        }
                                    </div>
                                    
                                    {/* Stars for completed */}
                                    {isCompleted && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-full border-2 border-white shadow-sm">
                                            <Star size={12} fill="currentColor" />
                                        </div>
                                    )}
                                </button>
                                
                                {/* Label */}
                                <div className={`
                                    mt-4 px-4 py-2 rounded-xl backdrop-blur-md border text-center min-w-[140px]
                                    ${isActive 
                                        ? task.isBoss ? 'bg-red-950/80 border-red-500/50 text-white' : 'bg-indigo-950/80 border-indigo-500/50 text-white' 
                                        : 'bg-[#0A0F1C]/80 border-white/5 text-slate-500'
                                    }
                                `}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-0.5">
                                        Уровень {index + 1}
                                    </span>
                                    <span className={`text-xs font-bold leading-tight block ${task.isBoss ? 'text-red-300' : ''}`}>
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
      
      <div className="h-full overflow-y-auto scroll-smooth scrollbar-hide">
         {renderContent()}
      </div>

      {/* DOCK BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[420px] animate-in slide-in-from-bottom-20 duration-700 delay-200">
        <div className="relative group">
            <div className="absolute -inset-1 bg-indigo-500/20 blur-2xl rounded-[3rem] opacity-70"></div>
            
            <div className="relative flex items-center justify-between gap-1 p-2 bg-[#151925]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl ring-1 ring-white/5">
                
                {[
                  { id: 'LEARN', icon: LayoutGrid, label: 'Путь' },
                  { id: 'LEADERBOARD', icon: Trophy, label: 'Топ' },
                  { id: 'SHOP', icon: ShoppingBag, label: 'Магазин' },
                  { id: 'RELAX', icon: Star, label: 'Релакс' },
                  { id: 'PROFILE', icon: UserIcon, label: 'Я' },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`
                            h-14 flex-1 rounded-[1.8rem] flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative overflow-hidden
                            ${isActive 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'}
                            `}
                        >
                            <Icon size={20} strokeWidth={isActive ? 3 : 2.5} />
                            {isActive && <span className="text-[9px] font-black uppercase tracking-wide">{tab.label}</span>}
                        </button>
                    );
                })}
            </div>
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