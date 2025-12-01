
import React, { useState, useEffect } from 'react';
import { UserRole, Task, User } from './types';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { ParentZone } from './components/ParentZone';
import { initTelegramApp, getTelegramUser } from './services/telegramService';
import { getOrCreateUser, completeTask, refreshUserFromSupabase } from './services/db';
import { KatyaChat } from './components/KatyaChat';
import { Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { isSupabaseEnabled } from './services/supabaseClient';

// 🔀 Определяем режим по URL
const getAppMode = (): 'teen' | 'parent' => {
  const path = window.location.pathname;
  const hash = window.location.hash;
  
  // Проверяем /parent или #parent
  if (path.includes('/parent') || hash.includes('parent')) {
    return 'parent';
  }
  return 'teen';
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [appMode] = useState<'teen' | 'parent'>(getAppMode());

  // --- INITIALIZATION (Optimized - no delay) ---
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      // 1. Initialize Telegram (fast)
      initTelegramApp();
      
      // 2. Get User immediately
          const tgUser = getTelegramUser();
          
          try {
            const user = await getOrCreateUser(tgUser);
        if (mounted) {
            setCurrentUser(user);
          setIsLoadingData(false);
        }
          } catch (e) {
            console.error("Failed to load user", e);
        if (mounted) setIsLoadingData(false);
          }
    };
    
    init();
    
    return () => { mounted = false; };
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

  // Skeleton Loading - instant perceived performance (Perplexity Principle #4)
  if (isLoadingData || !currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#020617] relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-purple-500/15 rounded-full blur-[100px]" />
        </div>
        
        {/* Skeleton UI - looks like real app */}
        <div className="relative z-10 flex-1 p-4 space-y-4">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
              <div className="w-16 h-4 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-6 rounded-full bg-white/5 animate-pulse" />
              <div className="w-16 h-6 rounded-full bg-white/5 animate-pulse" />
            </div>
          </div>
          
          {/* Welcome card skeleton */}
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="w-32 h-5 rounded bg-white/10" />
                <div className="w-48 h-3 rounded bg-white/5" />
              </div>
            </div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-3 rounded-xl bg-white/5 animate-pulse">
                <div className="w-8 h-8 mx-auto rounded-full bg-white/10 mb-2" />
                <div className="w-8 h-4 mx-auto rounded bg-white/10" />
              </div>
            ))}
          </div>
          
          {/* Lessons skeleton */}
          <div className="space-y-2 mt-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 rounded bg-white/10" />
                  <div className="w-20 h-3 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tab bar skeleton */}
        <div className="flex justify-around py-3 border-t border-white/10 bg-black/20 backdrop-blur-xl">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const telegramId = currentUser.telegramId ? currentUser.telegramId.toString() : 'Guest';

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-hidden animate-in fade-in duration-500">
      
      {/* CONNECTION STATUS - Hidden in production */}

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
        {/* 👨‍👩‍👧 РОДИТЕЛЬСКИЙ РЕЖИМ - отдельный вход */}
        {appMode === 'parent' ? (
          <ParentZone isOpen={true} onClose={() => window.location.href = '/'} />
        ) : (
          <>
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
          </>
        )}
      </main>

      {/* AI Assistant (Only for Teen mode) */}
      {appMode === 'teen' && currentUser.role === UserRole.TEEN && <KatyaChat />}
    </div>
  );
};

export default App;
