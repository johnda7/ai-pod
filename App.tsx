
import React, { useState, useEffect } from 'react';
import { UserRole, Task, User } from './types';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { User as UserIcon, Loader2 } from 'lucide-react';
import { initTelegramApp, getTelegramUser } from './services/telegramService';
import { getOrCreateUser, completeTask, updateUserProfile } from './services/db';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
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

  if (isLoading || !currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-sm font-medium animate-pulse">Connecting to Neural Net...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
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

// Import KatyaChat at the bottom to avoid circular dependency issues in some bundlers if structured differently,
// but here we keep it standard.
import { KatyaChat } from './components/KatyaChat';

export default App;
