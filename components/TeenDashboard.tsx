
import React, { useState, useEffect } from 'react';
import { TASKS, KATYA_IMAGE_URL } from '../constants';
import { Task, User } from '../types';
import { Check, Lock, Star, Gamepad2, Dribbble, Palette, BrainCircuit, LayoutGrid, User as UserIcon, Music, Play } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { updateUserProfile } from '../services/db';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
}

type Tab = 'LEARN' | 'RELAX' | 'PROFILE';

const INTERESTS = [
  { id: 'Гейминг', icon: Gamepad2, color: 'from-purple-500 to-indigo-600' },
  { id: 'Футбол', icon: Dribbble, color: 'from-green-500 to-emerald-600' },
  { id: 'Арт', icon: Palette, color: 'from-pink-500 to-rose-600' },
  { id: 'IT', icon: BrainCircuit, color: 'from-blue-500 to-cyan-600' },
];

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ user, onTaskComplete }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LEARN'); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Local state for immediate feedback on interest change
  const [localInterest, setLocalInterest] = useState(user.interest);

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

  const handleInterestChange = (newInterest: string) => {
    setLocalInterest(newInterest);
    // Save to DB
    updateUserProfile({ ...user, interest: newInterest });
  };

  const handleTaskClick = (task: Task, isLocked: boolean) => {
      if (isLocked) return; // Strictly ignore clicks on locked tasks
      setSelectedTask(task);
  };

  const renderContent = () => {
    if (activeTab === 'RELAX') {
      return <MeditationView />;
    }

    if (activeTab === 'PROFILE') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] pb-32 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mb-6 group cursor-pointer">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
                    <div className="relative w-32 h-32 bg-[#1E2332] rounded-full p-1 border border-white/10 shadow-2xl overflow-hidden">
                       <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0A0F1C]"></div>
                </div>
                
                <h2 className="text-3xl font-black text-white mb-1 tracking-tight text-glow">{user.name}</h2>
                <div className="flex items-center gap-2 mb-8">
                     <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md">
                        Level {user.level}
                     </span>
                     <span className="text-slate-400 text-sm font-medium">{user.xp} XP</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs px-4">
                    <div className="glass-panel p-5 rounded-3xl text-center hover:bg-white/5 transition-colors">
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-cyan-400 mb-1">{user.streak}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Дней подряд</div>
                    </div>
                    <div className="glass-panel p-5 rounded-3xl text-center hover:bg-white/5 transition-colors">
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-orange-400 mb-1">{user.completedTaskIds.length}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Задания</div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: LEARN Tab (The Game Map)
    return (
        <div className="relative pt-6 pb-40 px-4 min-h-screen">
             
             {/* Header: Interest & XP */}
             <div className="flex justify-between items-center mb-6 relative z-20">
                 <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3">
                     <div className={`text-xl font-black ${isXpAnimating ? 'text-yellow-400 scale-125' : 'text-white'} transition-all duration-300`}>
                         {user.xp}
                     </div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP Points</span>
                 </div>

                 {/* Interest Dropdown */}
                 <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[50vw] pr-2">
                    {INTERESTS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleInterestChange(item.id)}
                            className={`p-2 rounded-full transition-all duration-300 ${
                                localInterest === item.id 
                                ? `bg-gradient-to-tr ${item.color} text-white shadow-lg shadow-indigo-500/30 scale-100 ring-2 ring-white/20` 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            <item.icon size={18} />
                        </button>
                    ))}
                 </div>
             </div>

             {/* LIVE EVENT CARD WITH KATYA */}
             <div className="mb-10 relative group cursor-pointer animate-in slide-in-from-top-4 duration-700">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 <div className="relative glass-panel rounded-[2rem] p-1 overflow-hidden">
                     <div className="bg-[#0A0F1C]/80 backdrop-blur-xl rounded-[1.8rem] p-5 flex items-center justify-between">
                         <div>
                             <div className="flex items-center gap-2 mb-2">
                                 <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                 </span>
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Live эфир</span>
                             </div>
                             <h3 className="text-white font-bold text-lg leading-tight mb-1">Стрим с Катей</h3>
                             <p className="text-slate-400 text-xs">Через 20 минут</p>
                         </div>
                         
                         {/* Katya's Photo in Live Card */}
                         <div className="relative w-14 h-14">
                             <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                             <img 
                                src={KATYA_IMAGE_URL} 
                                className="w-full h-full rounded-full object-cover border-2 border-white/20 shadow-lg" 
                                alt="Katya" 
                             />
                             <div className="absolute -bottom-1 -right-1 bg-red-500 w-5 h-5 rounded-full border-2 border-[#0A0F1C] flex items-center justify-center">
                                 <Play size={8} fill="white" className="text-white ml-0.5" />
                             </div>
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
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
                            <stop offset="20%" stopColor="#818cf8" stopOpacity="1" />
                            <stop offset="80%" stopColor="#c084fc" stopOpacity="1" />
                            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <path 
                        d="M 192 40 C 192 100, 80 150, 80 250 C 80 350, 304 400, 304 500 C 304 600, 192 650, 192 750 C 192 850, 80 900, 80 1000"
                        fill="none" 
                        stroke="url(#pathGradient)" 
                        strokeWidth="4"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        className="opacity-60"
                    />
                    <path 
                        d="M 192 40 C 192 100, 80 150, 80 250 C 80 350, 304 400, 304 500 C 304 600, 192 650, 192 750 C 192 850, 80 900, 80 1000"
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="4 12"
                        strokeOpacity="0.2"
                    />
                </svg>

                {/* WEEK 1 */}
                <div className="relative mb-8 text-center z-10">
                    <span className="bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-lg">
                        Неделя 1 • Пробуждение
                    </span>
                </div>

                <div className="relative h-[1100px]">
                    {TASKS.map((task, index) => {
                        const isCompleted = user.completedTaskIds.includes(task.id);
                        // STRICT LOCKING: Locked if previous task not in completed list (and not first task)
                        const isLocked = index > 0 && !user.completedTaskIds.includes(TASKS[index-1].id);
                        const isActive = !isCompleted && !isLocked;

                        let topPos = 40;
                        let leftPos = '50%';
                        let transform = 'translate(-50%, 0)';

                        if (index === 0) { topPos = 40; leftPos = '50%'; }
                        else if (index === 1) { topPos = 250; leftPos = '21%'; } // Curve Left
                        else if (index === 2) { topPos = 500; leftPos = '79%'; } // Curve Right
                        else if (index === 3) { topPos = 750; leftPos = '50%'; } // Center
                        else if (index === 4) { topPos = 950; leftPos = '21%'; }
                        else if (index === 5) { topPos = 1150; leftPos = '79%'; }

                        return (
                            <div 
                                key={task.id}
                                className="absolute flex flex-col items-center z-10 group"
                                style={{ top: topPos, left: leftPos, transform }}
                            >
                                <button
                                    onClick={() => handleTaskClick(task, isLocked)}
                                    disabled={isLocked}
                                    className={`
                                        w-20 h-20 rounded-full flex items-center justify-center relative transition-all duration-500
                                        ${isLocked ? 'grayscale opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                                    `}
                                >
                                    {/* Orb Background */}
                                    <div className={`
                                        absolute inset-0 rounded-full border-2 
                                        ${isCompleted 
                                            ? 'bg-emerald-900/80 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                                            : isLocked 
                                                ? 'bg-[#1E2332] border-white/10' 
                                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.6)] animate-pulse'
                                        }
                                    `}></div>

                                    {/* Glass Shine */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-50"></div>
                                    <div className="absolute top-2 left-4 w-4 h-2 bg-white/40 blur-sm rounded-full transform -rotate-12"></div>

                                    {/* Icon */}
                                    <div className="relative z-10 text-white drop-shadow-md">
                                        {isCompleted 
                                            ? <Check size={32} strokeWidth={4} className="text-emerald-400" /> 
                                            : isLocked 
                                                ? <Lock size={24} className="text-slate-500" /> 
                                                : <Star size={32} fill="currentColor" className="text-yellow-300" />
                                        }
                                    </div>

                                    {/* Active "Ripples" only for current task */}
                                    {isActive && (
                                        <>
                                           <div className="absolute -inset-4 border border-indigo-500/30 rounded-full animate-ping"></div>
                                           <div className="absolute -inset-8 border border-indigo-500/10 rounded-full animate-[ping_2s_infinite]"></div>
                                        </>
                                    )}
                                </button>
                                
                                <div className={`
                                    mt-4 px-4 py-2 rounded-2xl backdrop-blur-md border transition-all duration-300
                                    ${isActive 
                                        ? 'bg-white/10 border-white/30 text-white transform scale-100 opacity-100' 
                                        : isLocked
                                            ? 'bg-[#0A0F1C]/50 border-white/5 text-slate-500 scale-90 opacity-70'
                                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    }
                                `}>
                                    <span className="text-xs font-bold whitespace-nowrap">
                                        {isCompleted ? "Выполнено" : task.title}
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
    <div className="h-full relative overflow-hidden text-white">
      
      <div className="h-full overflow-y-auto scroll-smooth pb-32">
         {renderContent()}
      </div>

      {/* DOCK */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto animate-in slide-in-from-bottom-10 duration-500 delay-200">
        <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-[3rem] group-hover:bg-indigo-500/30 transition-colors"></div>
            
            <div className="relative flex items-center justify-between gap-1 p-2 bg-[#1E2332]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">
                
                <button 
                    onClick={() => setActiveTab('LEARN')}
                    className={`
                      w-14 h-14 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all duration-300
                      ${activeTab === 'LEARN' 
                        ? 'bg-white text-black shadow-lg shadow-white/10 scale-100' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 scale-95'}
                    `}
                >
                    <LayoutGrid size={22} strokeWidth={activeTab === 'LEARN' ? 2.5 : 2} />
                    {activeTab === 'LEARN' && <div className="w-1 h-1 bg-black rounded-full"></div>}
                </button>

                <button 
                    onClick={() => setActiveTab('RELAX')}
                    className={`
                      w-14 h-14 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all duration-300
                      ${activeTab === 'RELAX' 
                        ? 'bg-white text-black shadow-lg shadow-white/10 scale-100' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 scale-95'}
                    `}
                >
                    <Music size={22} strokeWidth={activeTab === 'RELAX' ? 2.5 : 2} />
                    {activeTab === 'RELAX' && <div className="w-1 h-1 bg-black rounded-full"></div>}
                </button>

                <button 
                    onClick={() => setActiveTab('PROFILE')}
                    className={`
                      w-14 h-14 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all duration-300
                      ${activeTab === 'PROFILE' 
                        ? 'bg-white text-black shadow-lg shadow-white/10 scale-100' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 scale-95'}
                    `}
                >
                    <UserIcon size={22} strokeWidth={activeTab === 'PROFILE' ? 2.5 : 2} />
                    {activeTab === 'PROFILE' && <div className="w-1 h-1 bg-black rounded-full"></div>}
                </button>
            </div>
        </div>
      </div>

      {selectedTask && (
        <TaskModal 
            task={selectedTask} 
            isOpen={!!selectedTask} 
            userInterest={localInterest}
            // Pass completions to modal to determine mode (Edit vs Review)
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
