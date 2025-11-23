
import React, { useState } from 'react';
import { TASKS } from '../constants';
import { Task, LearningStyle, User } from '@/types';
import { Check, Lock, Star, Video, Headphones, Zap, Gamepad2, Dribbble, Palette, BrainCircuit, Eye, Hand, User as UserIcon, LayoutGrid, Music, Github } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';
import { TeenProfile } from './TeenProfile';

interface TeenDashboardProps {
  user: User;
  onTaskComplete: (task: Task) => void;
  onUpdateUserStyle?: (style: LearningStyle) => void;
  onUpdateInterest?: (interest: string) => void;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
  onOpenGitHubSync?: () => void;
}

type Tab = 'LEARN' | 'RELAX' | 'PROFILE';

const INTERESTS = [
  { id: 'Гейминг', icon: Gamepad2, color: 'bg-purple-500' },
  { id: 'Футбол', icon: Dribbble, color: 'bg-green-500' },
  { id: 'Арт', icon: Palette, color: 'bg-pink-500' },
  { id: 'IT', icon: BrainCircuit, color: 'bg-blue-500' },
];

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ 
  user, 
  onTaskComplete, 
  onUpdateUserStyle, 
  onUpdateInterest,
  onExportData,
  onImportData,
  onOpenGitHubSync
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('LEARN');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const userInterest = user.interest || 'Гейминг';

  const handleInterestChange = (newInterest: string) => {
    if (onUpdateInterest) {
      onUpdateInterest(newInterest);
    }
  };

  const getStyleBadge = () => {
    if (!user.learningStyle) return null;
    const config = {
        'VISUAL': { label: 'Visual', icon: Eye, color: 'bg-blue-500' },
        'AUDIO': { label: 'Audio', icon: Headphones, color: 'bg-purple-500' },
        'KINESTHETIC': { label: 'Doer', icon: Hand, color: 'bg-orange-500' },
    }[user.learningStyle];
    const Icon = config.icon;
    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.color} text-white shadow-md animate-in slide-in-from-top-2`}>
            <Icon size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">{config.label}</span>
        </div>
    );
  };

  return (
    <div className="h-full bg-slate-50 relative font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {activeTab === 'LEARN' && (
        <div className="min-h-full pb-32 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <div className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                         <div className="bg-yellow-400 rounded-full p-1 shadow-sm">
                            <Star fill="white" className="text-white" size={12} />
                         </div>
                         <span className="font-black text-slate-800 text-sm">{user.xp} XP</span>
                     </div>
                     {getStyleBadge()}
                 </div>
                 
                 <div className="flex items-center gap-2">
                     {onOpenGitHubSync && (
                         <button 
                            onClick={onOpenGitHubSync}
                            className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform hover:bg-slate-800 relative group"
                            title="GitHub Cloud Save"
                         >
                            <Github size={16} />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                         </button>
                     )}
                     <button onClick={() => setActiveTab('PROFILE')} className="w-9 h-9 bg-indigo-100 rounded-full border-2 border-white shadow-md overflow-hidden active:scale-95 transition-transform">
                         <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                     </button>
                 </div>
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                 {INTERESTS.map((item) => (
                     <button
                        key={item.id}
                        onClick={() => handleInterestChange(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                            userInterest === item.id 
                            ? `${item.color} text-white shadow-lg shadow-purple-500/20 scale-105` 
                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                     >
                         <item.icon size={14} />
                         {item.id}
                     </button>
                 ))}
             </div>
          </div>

          <div className="relative max-w-md mx-auto pt-8 pb-12 px-8">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40" style={{ minHeight: '900px' }}>
                <defs>
                  <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 190 40 Q 190 100 100 120 T 100 240 T 280 360 T 100 480 T 200 600"
                  fill="none" 
                  stroke="url(#roadGradient)" 
                  strokeWidth="40"
                  strokeLinecap="round"
                />
                 <path 
                  d="M 190 40 Q 190 100 100 120 T 100 240 T 280 360 T 100 480 T 200 600"
                  fill="none" 
                  stroke="white" 
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="15 25"
                  className="path-line opacity-50"
                />
            </svg>

            {TASKS.map((task, index) => {
              const isCompleted = user.completedTaskIds.includes(task.id);
              const isLocked = false; 
              const isNext = !isCompleted; 

              const TypeIcon = () => {
                 if (task.type === 'VIDEO') return <Video size={24} fill="currentColor" />;
                 if (task.type === 'AUDIO') return <Headphones size={24} fill="currentColor" />;
                 if (task.type === 'UPLOAD') return <LayoutGrid size={24} fill="currentColor" />;
                 if (task.type === 'ACTION') return <Zap size={24} fill="currentColor" />;
                 return <Star size={28} fill="currentColor" />;
              };

              return (
                <div 
                  key={task.id}
                  className="absolute w-32 flex flex-col items-center z-10 transition-all duration-500"
                  style={{ 
                    left: `${task.position.x}%`, 
                    top: `${task.position.y}px`,
                    transform: 'translateX(-50%)' 
                  }}
                >
                  <button
                    onClick={() => !isLocked && setSelectedTask(task)}
                    disabled={isLocked}
                    className={`
                        w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 relative group border-[5px]
                        ${isCompleted 
                            ? 'bg-amber-400 border-amber-200 text-white shadow-amber-500/40' 
                            : isLocked 
                                ? 'bg-slate-200 border-slate-100 text-slate-400' 
                                : 'bg-white border-indigo-100 text-indigo-600 shadow-indigo-500/30 animate-bounce-soft'
                        }
                    `}
                  >
                     {!isCompleted && !isLocked && (
                         <div className="absolute inset-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-100"></div>
                     )}
                     {!isCompleted && !isLocked && (
                         <div className="absolute inset-0 rounded-full border-2 border-indigo-500 opacity-20 animate-ping"></div>
                     )}

                     <div className="relative z-10 text-white">
                        {isCompleted ? <Check size={32} strokeWidth={4} /> : isLocked ? <Lock size={24} /> : <TypeIcon />}
                     </div>
                     
                     {isNext && !isCompleted && (
                         <div className="absolute -top-10 bg-indigo-600 px-3 py-1 rounded-xl font-bold text-white text-[10px] shadow-xl animate-pulse whitespace-nowrap z-20 border border-indigo-400">
                            +{task.xpReward} XP
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45"></div>
                         </div>
                     )}
                  </button>
                  
                  <div className={`mt-3 text-center px-4 py-2 rounded-2xl shadow-sm transition-all border backdrop-blur-sm ${
                      !isCompleted ? 'bg-white/90 border-indigo-100 scale-110 z-20 shadow-lg' : 'bg-white/60 border-white text-slate-500'
                  }`}>
                      <div className={`text-xs font-extrabold uppercase tracking-wide ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                      </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTask && (
            <TaskModal 
                task={selectedTask} 
                isOpen={!!selectedTask} 
                userInterest={userInterest}
                onClose={() => setSelectedTask(null)} 
                onComplete={() => {
                    onTaskComplete(selectedTask);
                    setSelectedTask(null);
                }} 
                onUpdateUserStyle={onUpdateUserStyle}
            />
          )}
        </div>
      )}

      {activeTab === 'RELAX' && (
        <div className="min-h-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <MeditationView />
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="min-h-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <TeenProfile 
                user={user} 
                onExportData={onExportData}
                onImportData={onImportData}
                onOpenGitHubSync={onOpenGitHubSync}
            />
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const BottomNav: React.FC<{ activeTab: Tab, setActiveTab: (t: Tab) => void }> = ({ activeTab, setActiveTab }) => (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 p-1.5 bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-full ring-1 ring-white/30">
            <NavButton 
                active={activeTab === 'LEARN'} 
                onClick={() => setActiveTab('LEARN')} 
                icon={LayoutGrid}
                label="Квесты" 
            />
            <NavButton 
                active={activeTab === 'RELAX'} 
                onClick={() => setActiveTab('RELAX')} 
                icon={Music}
                label="Чилл" 
            />
            <NavButton 
                active={activeTab === 'PROFILE'} 
                onClick={() => setActiveTab('PROFILE')} 
                icon={UserIcon}
                label="Профиль" 
            />
        </div>
    </div>
);

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ElementType, label: string }> = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick} 
        className={`relative px-6 py-3 rounded-full transition-all duration-300 flex flex-col items-center justify-center gap-1 group overflow-hidden ${active ? 'bg-white shadow-sm text-indigo-600' : 'hover:bg-white/30 text-slate-600'}`}
    >
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
            <Icon 
                size={22} 
                className={`${active ? 'fill-indigo-600' : ''}`}
                strokeWidth={active ? 2.5 : 2}
            />
        </div>
        {active && (
            <span className="text-[9px] font-black uppercase tracking-wider animate-in slide-in-from-bottom-1 duration-200 leading-none">
                {label}
            </span>
        )}
    </button>
);
