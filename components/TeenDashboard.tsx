
import React, { useState, useEffect } from 'react';
import { TASKS } from '../constants';
import { Task, User } from '../types';
import { Check, Lock, Star, LayoutGrid, User as UserIcon, Music, Database, Zap, Shield, QrCode, Brain, Play } from 'lucide-react';
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
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                                <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-[#151925]" alt="Profile" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#151925] p-1 rounded-full">
                                <div className="bg-emerald-500 w-3 h-3 rounded-full border-2 border-[#151925]"></div>
                            </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-white tracking-tight truncate">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-indigo-300 uppercase tracking-wider border border-white/5">
                                    Уровень {user.level}
                                </span>
                                {user.telegramId && (
                                    <span className="text-[10px] text-slate-500 font-mono truncate">
                                        ID: {user.telegramId}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Level Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Прогресс уровня</span>
                             <span className="text-[10px] font-bold text-white">{Math.round(levelProgress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                style={{ width: `${levelProgress}%` }}
                            ></div>
                        </div>
                        <div className="text-right mt-1">
                             <span className="text-[10px] text-slate-600 font-medium">{user.xp} / {nextLevelXp} XP</span>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <h3 className="text-white font-bold text-lg mb-4 px-1 flex items-center gap-2">
                    <QrCode size={18} className="text-indigo-400" />
                    Данные
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#1E2332] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div className="text-2xl font-black text-white">{user.streak}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Серия дней</div>
                    </div>
                    <div className="bg-[#1E2332] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-1">
                            <Shield size={20} fill="currentColor" />
                        </div>
                        <div className="text-2xl font-black text-white">{user.completedTaskIds.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Заданий</div>
                    </div>
                </div>

                {/* CLOUD STATUS */}
                <div className="bg-[#151925] border border-white/5 rounded-2xl p-4 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSupabaseEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/20 text-slate-500'}`}>
                            <Database size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Синхронизация</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {isSupabaseEnabled ? 'Облако подключено' : 'Локальный режим'}
                            </div>
                        </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isSupabaseEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-600'}`}></div>
                </div>
                
                <div className="flex justify-center">
                   <p className="text-[10px] text-slate-700 font-mono">v1.0.3 • Motivation Edition</p>
                </div>
            </div>
        );
    }

    // Default: LEARN Tab (The Game Map)
    return (
        <div className="relative pt-6 pb-40 px-4 min-h-screen">
             
             {/* Top Bar: XP and Daily Challenge */}
             <div className="flex justify-between items-center mb-8 relative z-20 px-2">
                 <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Мой Путь</h1>
                    <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Сезон 1: Мотивация</p>
                 </div>
                 
                 <div className="flex gap-2">
                     {/* Mini Game Button */}
                     <button 
                        onClick={() => setIsGameOpen(true)}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-105 transition-transform animate-pulse"
                     >
                         <Brain size={20} className="text-white" />
                     </button>

                     <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                         <Star size={16} fill="currentColor" className="text-yellow-400" />
                         <div className={`text-lg font-black ${isXpAnimating ? 'text-yellow-400 scale-110' : 'text-white'} transition-all duration-300`}>
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
                            <stop offset="10%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="90%" stopColor="#a855f7" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Main Glowing Path */}
                    <path 
                        d="M 192 40 C 192 100, 80 150, 80 250 C 80 350, 304 400, 304 500 C 304 600, 192 650, 192 750 C 192 850, 80 900, 80 1000"
                        fill="none" 
                        stroke="url(#pathGradient)" 
                        strokeWidth="6"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        className="opacity-40"
                    />
                    
                    {/* Dashed Center Line */}
                    <path 
                        d="M 192 40 C 192 100, 80 150, 80 250 C 80 350, 304 400, 304 500 C 304 600, 192 650, 192 750 C 192 850, 80 900, 80 1000"
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="0 15"
                        strokeLinejoin="round"
                        strokeOpacity="0.4"
                    />
                </svg>

                {/* WEEK 1 MARKER */}
                <div className="relative mb-12 text-center z-10">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40"></div>
                        <span className="relative z-10 bg-[#0A0F1C] text-indigo-300 border border-indigo-500/50 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl">
                            Chapter 1 • Dopamine
                        </span>
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
                                        ${isLocked ? 'grayscale opacity-60 cursor-not-allowed w-16 h-16' : 'cursor-pointer hover:scale-110 w-24 h-24'}
                                    `}
                                >
                                    {/* Glow behind active/completed */}
                                    {!isLocked && (
                                        <div className={`absolute inset-0 rounded-full blur-xl ${isCompleted ? 'bg-emerald-500/40' : 'bg-indigo-500/60 animate-pulse'}`}></div>
                                    )}

                                    {/* Main Circle */}
                                    <div className={`
                                        w-full h-full rounded-2xl rotate-45 flex items-center justify-center border shadow-2xl z-10 transition-all
                                        ${isCompleted 
                                            ? 'bg-[#1E2332] border-emerald-500' 
                                            : isLocked 
                                                ? 'bg-[#0A0F1C] border-white/10' 
                                                : 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-300'
                                        }
                                    `}>
                                         {/* Icon (Counter-rotated) */}
                                         <div className="-rotate-45">
                                            {isCompleted 
                                                ? <Check size={32} strokeWidth={4} className="text-emerald-400 drop-shadow-md" /> 
                                                : isLocked 
                                                    ? <Lock size={20} className="text-slate-500" /> 
                                                    : task.type === 'VIDEO' ? <Play size={28} className="text-white fill-white" />
                                                    : <div className="text-white drop-shadow-md font-black text-xl">{index + 1}</div>
                                            }
                                         </div>
                                    </div>
                                </button>
                                
                                {/* Label */}
                                <div className={`
                                    mt-8 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 text-center min-w-[120px]
                                    ${isActive 
                                        ? 'bg-white/10 border-white/30 text-white transform scale-100 opacity-100 shadow-lg' 
                                        : isLocked
                                            ? 'bg-[#0A0F1C]/50 border-white/5 text-slate-600 scale-90 opacity-0 group-hover:opacity-100 transition-opacity'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    }
                                `}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                                        {isCompleted ? "Взломано" : isLocked ? "Закрыто" : "Доступно"}
                                    </span>
                                    <span className="text-sm font-bold whitespace-nowrap leading-tight">
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
      
      <div className="h-full overflow-y-auto scroll-smooth">
         {renderContent()}
      </div>

      {/* DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto animate-in slide-in-from-bottom-10 duration-500 delay-200">
        <div className="relative group">
            <div className="absolute inset-0 bg-white/5 blur-xl rounded-[3rem] transition-colors"></div>
            
            <div className="relative flex items-center justify-between gap-2 p-2 bg-[#151925]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl ring-1 ring-black/50">
                
                <button 
                    onClick={() => setActiveTab('LEARN')}
                    className={`
                      h-12 px-6 rounded-[2rem] flex items-center gap-2 transition-all duration-300 font-bold text-sm
                      ${activeTab === 'LEARN' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    <LayoutGrid size={18} />
                    {activeTab === 'LEARN' && <span>Путь</span>}
                </button>

                <button 
                    onClick={() => setActiveTab('RELAX')}
                    className={`
                      h-12 px-6 rounded-[2rem] flex items-center gap-2 transition-all duration-300 font-bold text-sm
                      ${activeTab === 'RELAX' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    <Music size={18} />
                    {activeTab === 'RELAX' && <span>Chill</span>}
                </button>

                <button 
                    onClick={() => setActiveTab('PROFILE')}
                    className={`
                      h-12 px-6 rounded-[2rem] flex items-center gap-2 transition-all duration-300 font-bold text-sm
                      ${activeTab === 'PROFILE' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    <UserIcon size={18} />
                    {activeTab === 'PROFILE' && <span>Я</span>}
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
