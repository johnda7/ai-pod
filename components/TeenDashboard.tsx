import React, { useState } from 'react';
import { TASKS } from '../constants';
import { Task } from '../types';
import { Check, Lock, Star, Play, Music, Headphones, Zap, Video, Gamepad2, Dribbble, Palette, BrainCircuit } from 'lucide-react';
import { MeditationView } from './MeditationView';
import { TaskModal } from './TaskModal';

interface TeenDashboardProps {
  xp: number;
  completedTaskIds: string[];
  onTaskComplete: (task: Task) => void;
}

type Tab = 'LEARN' | 'RELAX' | 'PROFILE';

const INTERESTS = [
  { id: 'Гейминг', icon: Gamepad2, color: 'bg-purple-500' },
  { id: 'Футбол', icon: Dribbble, color: 'bg-green-500' },
  { id: 'Арт', icon: Palette, color: 'bg-pink-500' },
  { id: 'IT', icon: BrainCircuit, color: 'bg-blue-500' },
];

export const TeenDashboard: React.FC<TeenDashboardProps> = ({ xp, completedTaskIds, onTaskComplete }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LEARN');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userInterest, setUserInterest] = useState<string>('Гейминг');

  if (activeTab === 'RELAX') {
    return (
        <>
            <MeditationView />
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 pb-24 relative overflow-hidden">
      {/* Adaptive Interest Selector */}
      <div className="bg-white p-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
         <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                 <div className="bg-yellow-400 rounded-lg p-1">
                    <Star fill="white" className="text-white" size={16} />
                 </div>
                 <span className="font-black text-slate-800 text-lg">{xp} XP</span>
             </div>
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Моя Тема</div>
         </div>
         
         {/* Interest Chips */}
         <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
             {INTERESTS.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => setUserInterest(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                        userInterest === item.id 
                        ? `${item.color} text-white shadow-md scale-105` 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                 >
                     <item.icon size={14} />
                     {item.id}
                 </button>
             ))}
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

        {TASKS.map((task, index) => {
          const isCompleted = completedTaskIds.includes(task.id);
          const isLocked = index > 0 && !completedTaskIds.includes(TASKS[index-1].id);
          const isActive = !isCompleted && !isLocked;

          const TypeIcon = () => {
             if (task.type === 'VIDEO') return <Video size={24} fill="currentColor" />;
             if (task.type === 'AUDIO') return <Headphones size={24} fill="currentColor" />;
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
              {/* Node Circle */}
              <button
                onClick={() => !isLocked && setSelectedTask(task)}
                disabled={isLocked}
                className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-[0_6px_0_0_rgba(0,0,0,0.2)] transition-all active:translate-y-1.5 active:shadow-none relative group border-4 border-white
                    ${isCompleted ? 'bg-amber-400 text-amber-900' : 
                      isLocked ? 'bg-slate-200 text-slate-400 shadow-[0_6px_0_0_#cbd5e1]' : 
                      'bg-indigo-500 text-white animate-bounce-soft shadow-[0_6px_0_0_#3730a3] hover:bg-indigo-400'}
                `}
              >
                 {isCompleted ? <Check size={32} strokeWidth={4} /> : isLocked ? <Lock size={24} /> : <TypeIcon />}
                 
                 {/* "Start" Bubble for active */}
                 {isActive && (
                     <div className="absolute -top-12 bg-white px-3 py-1.5 rounded-xl font-bold text-indigo-600 text-xs shadow-xl animate-bounce whitespace-nowrap z-20 border-2 border-indigo-100">
                        Играть!
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-indigo-100 rotate-45"></div>
                     </div>
                 )}
              </button>
              
              {/* Title label */}
              <div className={`mt-3 text-center px-3 py-1.5 rounded-xl shadow-md transition-all border border-slate-100 ${isActive ? 'bg-white scale-110 z-20' : 'bg-white/80 backdrop-blur'}`}>
                  <div className={`text-sm font-bold leading-none ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                  </div>
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
            userInterest={userInterest}
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

const BottomNav: React.FC<{ activeTab: Tab, setActiveTab: (t: Tab) => void }> = ({ activeTab, setActiveTab }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-around z-30 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavButton 
            active={activeTab === 'LEARN'} 
            onClick={() => setActiveTab('LEARN')} 
            icon={<Play size={28} fill={activeTab === 'LEARN' ? "currentColor" : "none"} />} 
            label="Мир" 
        />
        <NavButton 
            active={activeTab === 'RELAX'} 
            onClick={() => setActiveTab('RELAX')} 
            icon={<Music size={28} fill={activeTab === 'RELAX' ? "currentColor" : "none"} />} 
            label="Чилл" 
        />
    </div>
);

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all active:scale-95 ${active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
    >
        {icon}
        <span className="text-[10px] font-extrabold uppercase tracking-wide">{label}</span>
    </button>
);