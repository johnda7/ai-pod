import React, { useState } from 'react';
import { UserRole, Task, User, LearningStyle } from './types';
import { MOCK_USER } from './constants';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { RoleSelector } from './components/RoleSelector';
import { KatyaChat } from './components/KatyaChat';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';

const App: React.FC = () => {
  console.log('🚀 App component loaded');
  console.log('MOCK_USER:', MOCK_USER);
  
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
  };

  const handleTaskComplete = (task: Task) => {
    if (currentUser.completedTaskIds.includes(task.id)) return;
    setCurrentUser(prev => ({
      ...prev,
      xp: prev.xp + task.xpReward,
      completedTaskIds: [...prev.completedTaskIds, task.id]
    }));
  };

  const handleUpdateUserStyle = (style: LearningStyle) => {
    setCurrentUser(prev => ({ ...prev, learningStyle: style }));
  };

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

      {/* Dev Tool: Role Switcher (Only visible in profile or strictly top for dev) */}
      <div className="absolute top-0 left-0 z-50 opacity-0 hover:opacity-100 transition-opacity">
         <RoleSelector currentRole={currentUser.role} onRoleChange={handleRoleChange} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-50">
        {currentUser.role === UserRole.TEEN && (
          <TeenDashboard 
            xp={currentUser.xp} 
            completedTaskIds={currentUser.completedTaskIds}
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

             {/* Dev Role Switcher moved here for access */}
             <div className="border-t border-slate-100 pt-4">
                 <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Режим отладки</p>
                 <RoleSelector currentRole={currentUser.role} onRoleChange={handleRoleChange} />
             </div>
          </div>
        </div>
      )}
      
      {/* Overlay button for profile in Teen mode if needed, currently integrated in TeenDashboard Header */}
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