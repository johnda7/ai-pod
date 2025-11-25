
import React, { useState, useEffect } from 'react';
import { UserRole, Task, User } from './types';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { initTelegramApp, getTelegramUser } from './services/telegramService';
import { getOrCreateUser, completeTask } from './services/db';
import { KatyaChat } from './components/KatyaChat';
import { Terminal, Zap, ShieldCheck, Wifi, User as UserIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { isSupabaseEnabled } from './services/supabaseClient';

// --- BOOT SEQUENCE COMPONENT ---
const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootLines = [
    "ЗАГРУЗКА НЕЙРОСЕТИ...",
    "ПОИСК TELEGRAM ID...",
    "ПОДКЛЮЧЕНИЕ К SUPABASE...",
    "СИНХРОНИЗАЦИЯ ПРОФИЛЯ...",
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
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 30);

    return () => {
      clearInterval(lineInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center text-indigo-500 font-mono p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="z-10 w-full max-w-xs">
         <div className="flex justify-center mb-10 relative">
             <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-30 animate-pulse"></div>
             <Terminal size={80} className="text-indigo-400 relative z-10" />
         </div>

         <div className="bg-[#0A0F1C] border border-indigo-500/30 rounded-2xl p-6 mb-8 shadow-2xl min-h-[180px]">
            {lines.map((line, i) => (
              <div key={i} className="text-xs sm:text-sm mb-3 text-emerald-400 animate-in fade-in slide-in-from-left-2 duration-300 font-bold tracking-wide">
                <span className="text-indigo-600 mr-2">{">"}</span>
                {line}
              </div>
            ))}
            <div className="w-2 h-4 bg-emerald-500 animate-pulse inline-block ml-2"></div>
         </div>

         <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
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
      // 1. Initialize Telegram
      initTelegramApp();
      
      // 2. Get User (Delay slightly to ensure TG is ready)
      setTimeout(async () => {
          const tgUser = getTelegramUser();
          
          try {
            console.log("App Init: Fetching user...");
            const user = await getOrCreateUser(tgUser);
            console.log("App Init: User loaded:", user);
            setCurrentUser(user);
          } catch (e) {
            console.error("Failed to load user", e);
          } finally {
            setIsLoadingData(false);
          }
      }, 500);
    };
    
    init();
  }, []);

  const handleTaskComplete = async (task: Task) => {
    if (!currentUser) return;
    if (currentUser.completedTaskIds.includes(task.id)) return;

    // Optimistic Update
    setCurrentUser(prev => prev ? ({
      ...prev,
      xp: prev.xp + task.xpReward,
      coins: (prev.coins || 0) + (task.coinsReward || 0),
      completedTaskIds: [...prev.completedTaskIds, task.id],
      level: Math.floor((prev.xp + task.xpReward) / 500) + 1
    }) : null);

    // Sync DB
    await completeTask(currentUser.id, task);
  };

  if (isBooting) {
     return <BootSequence onComplete={() => setIsBooting(false)} />;
  }

  if (isLoadingData || !currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <RefreshCw className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-xs font-mono text-slate-500">Синхронизация...</p>
      </div>
    );
  }

  // Debug Info
  const isGuest = currentUser.id.startsWith('guest_');

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-in fade-in duration-700">
      
      {/* CONNECTION STATUS & IDENTITY INDICATOR */}
      <div className="absolute top-2 left-2 z-50 flex flex-col gap-1 pointer-events-none opacity-80">
        <div className="flex gap-2">
            {isSupabaseEnabled ? (
                 <div className="flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[8px] text-green-400 font-bold border border-green-500/20">
                    <Wifi size={8} /> CLOUD
                 </div>
            ) : (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[8px] text-yellow-400 font-bold border border-yellow-500/20">
                    <AlertCircle size={8} /> LOCAL
                 </div>
            )}
        </div>
        
        {/* IDENTITY BADGE */}
        <div className={`flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[8px] font-bold border ${isGuest ? 'text-slate-300 border-white/10' : 'text-blue-300 border-blue-500/30'}`}>
            <UserIcon size={8} /> 
            {isGuest ? 'GUEST MODE' : `TG: ${currentUser.name}`}
        </div>
      </div>

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

      {/* AI