
import React, { useState, useEffect } from 'react';
import { TASKS, KATYA_IMAGE_URL } from '../constants';
import { Task, User } from '../types';
import { Check, Lock, Star, LayoutGrid, User as UserIcon, Music, Database, Wifi, Zap, Shield, ChevronRight } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { isSupabaseEnabled } from '../services/supabaseClient';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
}

type Tab = 'LEARN' | 'RELAX' | 'PROFILE';

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ user, onTaskComplete }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LEARN'); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
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
                
                {/* HEADER CARD */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1E2332] to-[#0A0F1C] border border-white/10 p-6 shadow-2xl mb-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                                <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover border-4 border-[#0A0F1C]" alt="Profile" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#0A0F1C] p-1 rounded-full">
                                <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#0A0F1C] animate-pulse"></div>
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-black text-white tracking-tight mb-1">{user.name}</h2>
                        <p className="text-slate-400 text-sm font-medium mb-6">{user.role === 'TEEN' ? 'Игрок' : user.role}</p>

                        {/* LEVEL PROGRESS */}
                        <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Уровень {user.level}</span>
                                <span className="text-xs font-bold text-slate-400">{user.xp} / {nextLevelXp} XP</span>
                            </div>
                            <div className="w-full h-3 bg-[#0A0F1C] rounded-full overflow-hidden relative">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${levelProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <h3 className="text-white font-bold text-lg mb-4 px-2">Статистика</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#1E2332]/50 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mb-1">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div className="text-2xl font-black text-white">{user.streak}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Дней подряд</div>
                    </div>
                    <div className="bg-[#1E2332]/50 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-1">
                            <Shield size={20} fill="currentColor" />
                        </div>
                        <div className="text-2xl font-black text-white">{user.completedTaskIds.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Заданий</div>
                    </div>
                </div>

                {/* SYSTEM STATUS (Compact) */}
                <div className="bg-[#1E2332]/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSupabaseEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}>
                            <Database size={14} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Supabase Cloud</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                                {isSupabaseEnabled ? 'Connected' : 'Offline Mode'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isSupabaseEnabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                    </div>
                </div>
                
                <div className="text-center mt-6">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest opacity-50">ID: {user.id.slice(0, 6)}</p>
                </div>
            </div>
        );
    }

    // Default: LEARN Tab (The Game Map)
    return (
        <div className="relative pt-6 pb-40 px-4 min-h-screen">
             
             {/* Top Bar: Just XP */}
             <div className="flex justify-between items-center mb-8 relative z-20 px-2">
                 <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Мой Путь</h1>
                    <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Сезон 1</p>
                 </div>
                 
                 <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                     <Star size={16} fill="currentColor" className="text-yellow-400" />
                     <div className={`text-lg font-black ${isXpAnimating ? 'text-yellow-400 scale-110' : 'text-white'} transition-all duration-300`}>
                         {user.xp}
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
                            Start • Пробуждение
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
                                        ${isLocked ? 'grayscale opacity-60 cursor-not-allowed w-16 h-16' : 'cursor-pointer hover:scale-110 w-20 h-20'}
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
                                                ? <Check size={28} strokeWidth={4} className="text-emerald-400 drop-shadow-md" /> 
                                                : isLocked 
                                                    ? <Lock size={20} className="text-slate-500" /> 
                                                    : <div className="text-white drop-shadow-md font-black text-lg">{index + 1}</div>
                                            }
                                         </div>
                                    </div>
                                </button>
                                
                                {/* Label */}
                                <div className={`
                                    mt-6 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 text-center min-w-[100px]
                                    ${isActive 
                                        ? 'bg-white/10 border-white/30 text-white transform scale-100 opacity-100 shadow-lg' 
                                        : isLocked
                                            ? 'bg-[#0A0F1C]/50 border-white/5 text-slate-600 scale-90 opacity-0 group-hover:opacity-100 transition-opacity'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    }
                                `}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                                        {isCompleted ? "Выполнено" : isLocked ? "Закрыто" : "Текущее"}
                                    </span>
                                    <span className="text-sm font-bold whitespace-nowrap">
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
    </div>
  );
};
