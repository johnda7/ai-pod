import React, { useState } from 'react';
import { TASKS } from '../constants';
import { Task } from '../types';
import { Check, Lock, Star, Play, Music, Headphones, Zap, Video } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';

interface TeenDashboardProps {
  xp: number;
  completedTaskIds: string[];
  onTaskComplete: (task: Task) => void;
}

type Tab = 'LEARN' | 'RELAX' | 'PROFILE';

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ xp, completedTaskIds, onTaskComplete }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LEARN');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (activeTab === 'RELAX') {
    return (
        <>
            <MeditationView />
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
  }

  const sortedTasks = [...TASKS]; 

  return (
    <div className="min-h-full bg-slate-50 pb-24 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center shadow-sm border-b border-slate-100">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm animate-pulse">
                <Star fill="white" className="text-white" size={16} />
             </div>
             <span className="font-extrabold text-slate-700">{xp} XP</span>
         </div>
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center shadow-sm">
                <Zap fill="white" className="text-white" size={16} />
             </div>
             <span className="font-extrabold text-slate-700">12 Дней</span>
         </div>
      </div>

      {/* Path UI */}
      <div className="relative max-w-md mx-auto pt-8 pb-12 px-8">
        {/* SVG Path Line Background */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20" style={{ minHeight: '900px' }}>
            <path 
              d="M 190 40 Q 190 100 100 120 T 100 240 T 280 360 T 100 480 T 200 600"
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="40"
              strokeLinecap="round"
            />
             <path 
              d="M 190 40 Q 190 100 100 120 T 100 240 T 280 360 T 100 480 T 200 600"
              fill="none" 
              stroke="white" 
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="20 30"
              className="path-line"
            />
        </svg>

        {sortedTasks.map((task, index) => {
          const isCompleted = completedTaskIds.includes(task.id);
          const isLocked = index > 0 && !completedTaskIds.includes(sortedTasks[index-1].id);
          const isActive = !isCompleted && !isLocked;

          const TypeIcon = () => {
             if (task.type === 'VIDEO') return <Video size={24} fill="currentColor" />;
             if (task.type === 'AUDIO') return <Headphones size={24} fill="currentColor" />;
             return <Star size={28} fill="currentColor" />;
          };

          return (
            <div 
              key={task.id}
              className="absolute w-28 flex flex-col items-center z-10 transition-all duration-500"
              style={{ 
                left: `${task.position.x}%`, 
                top: `${task.position.y}px`,
                transform: 'translateX(-50%)' 
              }}
            >
              {/* Node Circle */}
              <button
                onClick={() => !isLocked && setSelectedTask(task)}
                disabled={isLocked}
                className={`
                    w-20 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_6px_0_0_rgba(0,0,0,0.2)] transition-all active:translate-y-1.5 active:shadow-none relative group
                    ${isCompleted ? 'bg-amber-400 text-amber-900' : 
                      isLocked ? 'bg-slate-200 text-slate-400 shadow-[0_6px_0_0_#cbd5e1]' : 
                      'bg-indigo-500 text-white animate-bounce-soft shadow-[0_6px_0_0_#3730a3] hover:bg-indigo-400'}
                `}
              >
                 {isCompleted ? <Check size={32} strokeWidth={4} /> : isLocked ? <Lock size={24} /> : <TypeIcon />}
                 
                 {/* "Start" Bubble for active */}
                 {isActive && (
                     <div className="absolute -top-10 bg-white px-3 py-1 rounded-xl font-bold text-indigo-600 text-xs shadow-md animate-bounce whitespace-nowrap z-20">
                        Нажми!
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                     </div>
                 )}
              </button>
              
              {/* Title label */}
              <div className={`mt-3 text-center px-2 py-1 rounded-lg shadow-sm transition-all ${isActive ? 'bg-white scale-110' : 'bg-white/60 backdrop-blur'}`}>
                  <div className={`text-sm font-bold leading-none ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                  </div>
                  {!isLocked && (
                      <div className="text-[10px] text-indigo-600 mt-0.5 font-bold uppercase tracking-wide">
                          {task.type === 'VIDEO' ? 'Урок' : task.type === 'QUIZ' ? 'Игра' : 'Задание'}
                      </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Interactive Game/Lesson Modal */}
      {selectedTask && (
        <TaskModal 
            task={selectedTask} 
            isOpen={!!selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onComplete={() => {
                onTaskComplete(selectedTask);
                // Keep it open slightly to show win state? TaskModal handles it internally then closes
            }} 
        />
      )}
    </div>
  );
};

const BottomNav: React.FC<{ activeTab: Tab, setActiveTab: (t: Tab) => void }> = ({ activeTab, setActiveTab }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-around z-30 safe-area-pb">
        <NavButton 
            active={activeTab === 'LEARN'} 
            onClick={() => setActiveTab('LEARN')} 
            icon={<Play size={24} fill={activeTab === 'LEARN' ? "currentColor" : "none"} />} 
            label="Путь" 
        />
        <NavButton 
            active={activeTab === 'RELAX'} 
            onClick={() => setActiveTab('RELAX')} 
            icon={<Music size={24} fill={activeTab === 'RELAX' ? "currentColor" : "none"} />} 
            label="Релакс" 
        />
    </div>
);

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
    >
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </button>
);