
import React, { useState, useEffect } from 'react';
import { UserRole, Task, User } from './types';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { RoleSelector } from './components/RoleSelector';
import { KatyaChat } from './components/KatyaChat';
import { User as UserIcon, Settings, Loader2 } from 'lucide-react';
import { initTelegramApp, getTelegramUser } from './services/telegramService';
import { getOrCreateUser, completeTask, updateUserProfile } from './services/db';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const handleRoleChange = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    // In a real app, we might not want to save role change to DB for teens, 
    // but for this demo it helps testing.
    updateUserProfile(updated); 
  };

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
       // Rollback logic would go here
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
      {/* Top Bar - Simplified for App Look */}
      {currentUser.role !== UserRole.TEEN && (
         <header className="flex-none bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm z-30">
            <h1 className="font-bold text-lg text-slate-800">AI Teenager</h1>
            <button onClick={() => setIsProfileOpen(true)}>
                <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full bg-slate-200" alt="Profile" />
            </button>
         </header>
      )}

      {/* Dev Tool: Role Switcher (Visible in Profile for simplicity) */}
      <div className="absolute top-0 left-0 z-50 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
         {/* Hidden trigger for dev */}
      </div>

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

      {/* AI Assistant */}
      {currentUser.role === UserRole.TEEN && <KatyaChat />}

      {/* Settings / Profile Drawer */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsProfileOpen(false)}
          ></div>
          <div className="relative w-72 bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 p-6 flex flex-col">
             <div className="flex items-center gap-4 mb-8">
                 <img src={currentUser.avatarUrl} className="w-16 h-16 rounded-full" alt="" />
                 <div>
                     <h3 className="font-bold text-lg">{currentUser.name}</h3>
                     <p className="text-sm text-slate-500">{currentUser.role}</p>
                 </div>
             </div>
             
             <div className="space-y-2 flex-1">
                 <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left font-medium text-slate-700">
                     <UserIcon size={20} className="text-slate-400" /> Профиль
                 </button>
                 <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left font-medium text-slate-700">
                     <Settings size={20} className="text-slate-400" /> Настройки
                 </button>
             </div>

             {/* Dev Role Switcher */}
             <div className="border-t border-slate-100 pt-4">
                 <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Смена роли (Dev)</p>
                 <RoleSelector currentRole={currentUser.role} onRoleChange={handleRoleChange} />
             </div>
          </div>
        </div>
      )}
      
      {/* Overlay button for profile in Teen mode */}
      {currentUser.role === UserRole.TEEN && (
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm"
          >
              <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
          </button>
      )}
    </div>
  );
};

export default App;
