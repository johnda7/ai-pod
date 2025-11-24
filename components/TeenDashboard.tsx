
import React, { useState, useEffect } from 'react';
import { TASKS } from '../constants';
import { Task, User } from '../types';
import { Check, Lock, Star, LayoutGrid, User as UserIcon, Music, Database, Zap, Shield, QrCode, Brain, Play, Hexagon, Sparkles } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { MemoryGame } from './MemoryGame';
import { isSupabaseEnabled } from '../services/supabaseClient';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
}

type Tab = 'LEARN' | 'RELAX' | 'PROFILE';

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ user, onTaskComplete }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LEARN'); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGameOpen, setIsGameOpen] = useState(false);
  
  // Animation state for XP update
  const [prevXp, setPrevXp] = useState(user.xp);
  const [isXpAnimating, setIsXpAnimating] = useState(false);

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
      // Create a dummy task for the game completion
      const gameTask: Task = {
          id: `game_${Date.now()}`,
          week: 0,
          title: 'Нейро-Тренировка',
          description: 'Успешная калибровка',
          xpReward: xp,
          type: 'ACTION',
          learningStyle: 'VISUAL',
          position: { x: 0, y: 0 }
      };
      onTaskComplete(gameTask);
  };

  // Calculate Level Progress
  const nextLevelXp = user.level * 500;
  const prevLevelXp = (user.level - 1) * 500;
  const levelProgress = Math.min(100, Math.max(0, ((user.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  const renderContent = () => {
    if (activeTab === 'RELAX') {
      return <MeditationView />;
    }

    if (activeTab === 'PROFILE') {
        return (
            <div className="px-6 pt-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* HEADER CARD - ID STYLE */}
                <div className="relative overflow-hidden rounded-3xl bg-[#151925] border border-white/10 p-6 shadow-2xl mb-6">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/30 blur-[60px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/20 blur-[60px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative w-24 h-24 rounded-full p-0.5 bg-[#151925]">
                                <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#151925] p-1 rounded-full">
                                <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#151925] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-white tracking-tight truncate mb-1">{user.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                                    Уровень {user.level}
                                </span>
                                {user.telegramId && (
                                    <span className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                        ID: {user.telegramId}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Level Progress Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Прокачка</span>
                             <span className="text-[10px] font-bold text-indigo-300">{Math.round(levelProgress)}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.6)] relative"
                                style={{ width: `${levelProgress}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div>
                            </div>
                        </div>
                        <div className="text-right mt-2">
                             <span className="text-[10px] text-slate-500 font-medium font-mono">{user.xp} / {nextLevelXp} XP</span>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <h3 className="text-white font-bold text-lg mb-4 px-1 flex items-center gap-2">
                    <Database size={18} className="text-indigo-400" />
                    Статистика
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#1E2332] border border-white/5 p-5 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-lg hover:border-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1 border border-amber-500/20">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div className="text-3xl font-black text-white">{user.streak}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Дней подряд</div>
                    </div>
                    <div className="bg-[#1E2332] border border-white/5 p-5 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-lg hover:border-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-1 border border-purple-500/20">
                            <Shield size={24} fill="currentColor" />
                        </div>
                        <div className="text-3xl font-black text-white">{user.completedTaskIds.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Миссий выполнено</div>
                    </div>
                </div>

                {/* CLOUD STATUS */}
                <div className="bg-[#151925] border border-white/5 rounded-3xl p-5 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSupabaseEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/20 text-slate-500'}`}>
                            <Hexagon size={20} />
                        </div>
                        <div>
                            <div className="text-base font-bold text-white">Облако данных</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">
                                {isSupabaseEnabled ? 'Синхронизация активна' : 'Локальный режим'}
                            </div>
                        </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${isSupabaseEnabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-600'}`}></div>
                </div>
                
                <div className="flex justify-center opacity-50">
                   <p className="text-[10px] text-slate-600 font-mono uppercase">ID ПОЛЬЗОВАТЕЛЯ: {user.id.slice(0,8)}</p>
                </div>
            </div>
        );
    }

    // Default: LEARN Tab (The Game Map)
    return (
        <div className="relative pt-6 pb-40 px-4 min-h-screen overflow-x-hidden">
             
             {/* Animated Background Particles */}
             <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-30 animate-ping" style={{animationDuration: '3s'}}></div>
                <div className="absolute bottom-40 left-1/2 w-1 h-1 bg-purple-400 rounded-full opacity-20"></div>
             </div>

             {/* Top Bar: XP and Daily Challenge */}
             <div className="flex justify-between items-center mb-8 relative z-20 px-2">
                 <div>
                    <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            КАРТА ПУТИ
                        </span>
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Сезон 1: Дофамин</p>
                 </div>
                 
                 <div className="flex gap-3 items-center">
                     {/* Mini Game Button */}
                     <button 
                        onClick={() => setIsGameOpen(true)}
                        className="w-12 h-12 rounded-2xl bg-[#1E2332] border border-rose-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:scale-105 transition-transform group relative"
                     >
                         <Brain size={24} className="text-rose-400 group-hover:text-rose-300" />
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0A0F1C] animate-pulse"></div>
                     </button>

                     <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                         <div className={`transition-transform duration-300 ${isXpAnimating ? 'scale-125 rotate-12' : ''}`}>
                             <Star size={18} fill="currentColor" className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                         </div>
                         <div className={`text-lg font-black font-mono ${isXpAnimating ? 'text-yellow-300' : 'text-white'}`}>
                             {user.xp}
                         </div>
                     </div>
                 </div>
             </div>

             {/* THE GAME PATH */}
             <div className="relative mx-auto max-w-sm">
                
                {/* SVG Path Background */}
                <svg className="absolute top-0 left-0 w-full h-[1200px] pointer-events-none z-0" overflow="visible">
                    <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="10%" stopColor="#6366f1" stopOpacity="0.5" />
                            <stop offset="90%" stopColor="#a855f7" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Connector Lines */}
                    <path 
                        d="M 192 40 C 192 100, 80 150, 80 250 C 80 350, 304 400, 304 500 C 304 600, 192 650, 192 750 C 192 850, 80 900, 80 1000"
                        fill="none" 
                        stroke="url(#pathGradient)" 
                        strokeWidth="4"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        className="opacity-60"
                    />
                    
                    {/* Tech Markers along the path */}
                    <circle cx="80" cy="250" r="3" fill="#6366f1" className="animate-pulse" />
                    <circle cx="304" cy="500" r="3" fill="#a855f7" className="animate-pulse" />
                    <circle cx="192" cy="750" r="3" fill="#ec4899" className="animate-pulse" />
                </svg>

                {/* WEEK 1 MARKER */}
                <div className="relative mb-12 text-center z-10">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30"></div>
                        <div className="relative z-10 bg-[#0A0F1C]/80 backdrop-blur border border-indigo-500/50 px-6 py-3 rounded-2xl shadow-2xl">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] block mb-1">Сектор 01</span>
                            <span className="text-base font-black text-white">ПРОБУЖДЕНИЕ</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-[1100px]">
                    {TASKS.map((task, index) => {
                        const isCompleted = user.completedTaskIds.includes(task.id);
                        const isLocked = index > 0 && !user.completedTaskIds.includes(TASKS[index-1].id);
                        const isActive = !isCompleted && !isLocked;

                        let topPos = 40;
                        let leftPos = '50%';
                        let transform = 'translate(-50%, 0)';

                        if (index === 0) { topPos = 40; leftPos = '50%'; }
                        else if (index === 1) { topPos = 250; leftPos = '21%'; } 
                        else if (index === 2) { topPos = 500; leftPos = '79%'; } 
                        else if (index === 3) { topPos = 750; leftPos = '50%'; } 
                        else if (index === 4) { topPos = 950; leftPos = '21%'; }
                        else if (index === 5) { topPos = 1150; leftPos = '79%'; }

                        return (
                            <div 
                                key={task.id}
                                className="absolute flex flex-col items-center z-10 group"
                                style={{ top: topPos, left: leftPos, transform }}
                            >
                                {/* Task Node */}
                                <button
                                    onClick={() => handleTaskClick(task, isLocked)}
                                    disabled={isLocked}
                                    className={`
                                        relative flex items-center justify-center transition-all duration-500
                                        ${isLocked ? 'grayscale opacity-50 cursor-not-allowed w-20 h-20' : 'cursor-pointer hover:scale-110 w-28 h-28'}
                                    `}
                                >
                                    {/* Active State Ring */}
                                    {!isLocked && !isCompleted && (
                                        <div className="absolute inset-0 border-2 border-indigo-400/50 rounded-3xl rotate-45 animate-[spin_10s_linear_infinite]"></div>
                                    )}
                                    {!isLocked && !isCompleted && (
                                        <div className="absolute inset-0 border-2 border-purple-400/30 rounded-3xl rotate-[22.5deg] scale-110"></div>
                                    )}

                                    {/* Glow behind */}
                                    {!isLocked && (
                                        <div className={`absolute inset-0 rounded-full blur-2xl ${isCompleted ? 'bg-emerald-500/30' : 'bg-indigo-500/50 animate-pulse'}`}></div>
                                    )}

                                    {/* Main Shape */}
                                    <div className={`
                                        w-full h-full rounded-3xl rotate-45 flex items-center justify-center border shadow-2xl z-10 transition-all backdrop-blur-sm
                                        ${isCompleted 
                                            ? 'bg-[#1E2332] border-emerald-500' 
                                            : isLocked 
                                                ? 'bg-[#0A0F1C] border-white/10' 
                                                : 'bg-gradient-to-br from-indigo-600/90 to-purple-700/90 border-indigo-300 shadow-[0_0_30px_rgba(79,70,229,0.4)]'
                                        }
                                    `}>
                                         {/* Icon (Counter-rotated) */}
                                         <div className="-rotate-45">
                                            {isCompleted 
                                                ? <Check size={36} strokeWidth={4} className="text-emerald-400 drop-shadow-md" /> 
                                                : isLocked 
                                                    ? <Lock size={24} className="text-slate-500" /> 
                                                    : task.type === 'VIDEO' ? <Play size={32} className="text-white fill-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
                                                    : <div className="text-white drop-shadow-md font-black text-3xl font-mono">{index + 1}</div>
                                            }
                                         </div>
                                    </div>
                                </button>
                                
                                {/* Label */}
                                <div className={`
                                    mt-12 px-5 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 text-center min-w-[160px] relative
                                    ${isActive 
                                        ? 'bg-white/10 border-indigo-400/50 text-white transform scale-100 opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                                        : isLocked
                                            ? 'bg-[#0A0F1C]/80 border-white/5 text-slate-600 scale-90 opacity-0 group-hover:opacity-100 transition-opacity'
                                            : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
                                    }
                                `}>
                                    {isActive && <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full"></div>}
                                    {isActive && <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full"></div>}
                                    {isActive && <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full"></div>}
                                    {isActive && <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full"></div>}

                                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-80">
                                        {isCompleted ? "ДОСТУП РАЗРЕШЕН" : isLocked ? "ЗАБЛОКИРОВАНО" : "НОВАЯ МИССИЯ"}
                                    </span>
                                    <span className="text-sm font-bold whitespace-nowrap leading-tight block">
                                        {task.title}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
        </div>
    );
  };

  return (
    <div className="h-full relative overflow-hidden text-white bg-[#020617]">
      
      <div className="h-full overflow-y-auto scroll-smooth scrollbar-hide">
         {renderContent()}
      </div>

      {/* DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-bottom-10 duration-500 delay-200">
        <div className="relative group">
            {/* Dock Glow */}
            <div className="absolute -inset-1 bg-indigo-500/20 blur-xl rounded-[3rem] transition-opacity opacity-70"></div>
            
            <div className="relative flex items-center justify-between gap-1 p-2 bg-[#151925]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl ring-1 ring-white/5">
                
                <button 
                    onClick={() => setActiveTab('LEARN')}
                    className={`
                      h-14 flex-1 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all duration-300 font-bold text-[10px] relative overflow-hidden
                      ${activeTab === 'LEARN' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    {activeTab === 'LEARN' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                    <LayoutGrid size={20} strokeWidth={2.5} />
                    <span className="uppercase tracking-wide">Путь</span>
                </button>

                <button 
                    onClick={() => setActiveTab('RELAX')}
                    className={`
                      h-14 flex-1 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all duration-300 font-bold text-[10px] relative overflow-hidden
                      ${activeTab === 'RELAX' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    {activeTab === 'RELAX' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                    <Sparkles size={20} strokeWidth={2.5} />
                    <span className="uppercase tracking-wide">Релакс</span>
                </button>

                <button 
                    onClick={() => setActiveTab('PROFILE')}
                    className={`
                      h-14 flex-1 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all duration-300 font-bold text-[10px] relative overflow-hidden
                      ${activeTab === 'PROFILE' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    {activeTab === 'PROFILE' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                    <UserIcon size={20} strokeWidth={2.5} />
                    <span className="uppercase tracking-wide">Профиль</span>
                </button>
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
