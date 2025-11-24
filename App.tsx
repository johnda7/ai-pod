
import React, { useState, useEffect } from 'react';
import { UserRole, Task, User } from './types';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { initTelegramApp, getTelegramUser } from './services/telegramService';
import { getOrCreateUser, completeTask } from './services/db';
import { KatyaChat } from './components/KatyaChat';
import { Terminal, Zap, ShieldCheck, Wifi } from 'lucide-react';

// --- BOOT SEQUENCE COMPONENT ---
const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootLines = [
    "ИНИЦИАЛИЗАЦИЯ НЕЙРОСЕТИ...",
    "ПРОВЕРКА БИОРИТМОВ...",
    "УСТАНОВКА ЗАЩИЩЕННОГО СОЕДИНЕНИЯ...",
    "ЗАГРУЗКА ПРОТОКОЛОВ МОТИВАЦИИ...",
    "ДОСТУП РАЗРЕШЕН."
  ];

  useEffect(() => {
    let currentLine = 0;
    const lineInterval = setInterval(() => {
      if (currentLine < bootLines.length) {
        setLines(prev => [...prev, bootLines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(lineInterval);
        setTimeout(onComplete, 500);
      }
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => {
      clearInterval(lineInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center text-indigo-500 font-mono p-8 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="z-10 w-full max-w-xs">
         <div className="flex justify-center mb-8 relative">
             <div className="absolute inset-0 bg-indigo-500 blur-[40px] opacity-20 animate-pulse"></div>
             <Terminal size={64} className="text-indigo-400 relative z-10" />
         </div>

         <div className="bg-[#0A0F1C] border border-indigo-500/30 rounded-2xl p-4 mb-6 shadow-lg min-h-[160px]">
            {lines.map((line, i) => (
              <div key={i} className="text-xs sm:text-sm mb-2 text-emerald-400 animate-in fade-in slide-in-from-left-2 duration-300 font-bold">
                <span className="text-indigo-600 mr-2">{">"}</span>
                {line}
              </div>
            ))}
            <div className="w-2 h-4 bg-emerald-500 animate-pulse inline-block ml-2"></div>
         </div>

         {/* Loading Bar */}
         <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
         </div>
         <div className="flex justify-between mt-2 text-[10px] text-indigo-400/60 uppercase tracking-widest font-bold">
            <span>Система v2.0</span>
            <span>{progress}%</span>
         </div>
      </div>
      
      {/* Footer Stats */}
      <div className="absolute bottom-8 flex gap-6 text-slate-600">
         <div className="flex items-center gap-1">
            <ShieldCheck size={14} /> <span className="text-[10px] font-bold">ЗАЩИЩЕНО</span>
         </div>
         <div className="flex items-center gap-1">
            <Wifi size={14} /> <span className="text-[10px] font-bold">ОНЛАЙН</span>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      // 1. Tell Telegram we are ready
      initTelegramApp();
      
      // 2. Get Telegram User Data (if available)
      const tgUser = getTelegramUser();
      
      // 3. Load User from "Database"
      try {
        const user = await getOrCreateUser(tgUser);
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    init();
  }, []);

  const handleTaskComplete = async (task: Task) => {
    if (!currentUser) return;
    if (currentUser.completedTaskIds.includes(task.id)) return;

    // Optimistic Update (UI updates immediately)
    setCurrentUser(prev => prev ? ({
      ...prev,
      xp: prev.xp + task.xpReward,
      completedTaskIds: [...prev.completedTaskIds, task.id]
    }) : null);

    // DB Update
    try {
       await completeTask(currentUser.id, task);
    } catch (e) {
       console.error("Sync error", e);
    }
  };

  if (isBooting) {
     return <BootSequence onComplete={() => setIsBooting(false)} />;
  }

  if (isLoadingData || !currentUser) {
    // Fallback simple loader just in case data takes longer than boot animation
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Zap className="animate-bounce text-yellow-400 mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-in fade-in duration-700">
      {/* Top Bar - Only for Non-Teen Roles */}
      {currentUser.role !== UserRole.TEEN && (
         <header className="flex-none bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm z-30">
            <h1 className="font-bold text-lg text-slate-800">AI Teenager</h1>
            <div className="flex items-center gap-2">
                <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full bg-slate-200" alt="Profile" />
            </div>
         </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-50">
        {currentUser.role === UserRole.TEEN && (
          <TeenDashboard 
            user={currentUser}
            onTaskComplete={handleTaskComplete} 
          />
        )}
        {currentUser.role === UserRole.PARENT && (
          <ParentDashboard />
        )}
        {currentUser.role === UserRole.CURATOR && (
          <CuratorDashboard />
        )}
      </main>

      {/* AI Assistant (Only for Teen) */}
      {currentUser.role === UserRole.TEEN && <KatyaChat />}
    </div>
  );
};

export default App;
