
import React, { useState, useEffect } from 'react';
import { UserRole, Task, User } from './types';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { initTelegramApp, getTelegramUser } from './services/telegramService';
import { getOrCreateUser, completeTask, refreshUserFromSupabase } from './services/db';
import { KatyaChat } from './components/KatyaChat';
import { Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { isSupabaseEnabled } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
      }, 300);
    };
    
    init();
  }, []);

  const handleTaskComplete = async (task: Task) => {
    if (!currentUser) return;
    if (currentUser.completedTaskIds.includes(task.id)) return;

    // Optimistic Update
    const updatedUser = {
      ...currentUser,
      xp: currentUser.xp + task.xpReward,
      coins: (currentUser.coins || 0) + (task.coinsReward || 0),
      completedTaskIds: [...currentUser.completedTaskIds, task.id],
      level: Math.floor((currentUser.xp + task.xpReward) / 500) + 1
    };
    
    setCurrentUser(updatedUser);

    // Sync DB
    await completeTask(currentUser.id, task);
    
    // Refresh from Supabase to ensure sync
    if (isSupabaseEnabled) {
      const refreshedUser = await refreshUserFromSupabase(currentUser.id);
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
      }
    }
  };

  // Simple loading - no boot sequence
  if (isLoadingData || !currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-purple-500/15 rounded-full blur-[100px]" />
        </div>
        
        {/* Loader */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-purple-500/20 border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="mt-6 text-white/50 text-sm font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  const telegramId = currentUser.telegramId ? currentUser.telegramId.toString() : 'Guest';

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-hidden animate-in fade-in duration-500">
      
      {/* CONNECTION STATUS - Minimal */}
      <div className="absolute top-14 left-4 z-50 flex gap-1.5 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        {isSupabaseEnabled ? (
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] text-green-400 font-medium"
            style={{
              background: 'rgba(34,197,94,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            <Wifi size={8} /> Sync
          </div>
        ) : (
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] text-yellow-400 font-medium"
            style={{
              background: 'rgba(234,179,8,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(234,179,8,0.2)',
            }}
          >
            <AlertCircle size={8} /> Local
          </div>
        )}
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
      <main className="flex-1 overflow-y-auto scroll-smooth bg-[#020617]">
        {currentUser.role === UserRole.TEEN && (
          <TeenDashboard 
            user={currentUser}
            onTaskComplete={handleTaskComplete}
            onUserUpdate={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
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
