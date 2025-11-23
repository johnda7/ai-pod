
import React, { useState, useEffect } from 'react';
import { UserRole, Task, User, LearningStyle, ChatMessage } from './types';
import { MOCK_USER } from './constants';
import { TeenDashboard } from './components/TeenDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CuratorDashboard } from './components/CuratorDashboard';
import { RoleSelector } from './components/RoleSelector';
import { KatyaChat } from './components/KatyaChat';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { User as UserIcon, Settings, RefreshCw, Github } from 'lucide-react';

const STORAGE_KEY = 'ai_teen_v5_stable';

const memoryStorage: Record<string, string> = {};

const safeStorage = {
  get: (key: string): any | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (e) {
      const item = memoryStorage[key];
      return item ? JSON.parse(item) : null;
    }
    return null;
  },
  set: (key: string, value: any) => {
    const stringValue = JSON.stringify(value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, stringValue);
      }
    } catch (e) {
      memoryStorage[key] = stringValue;
    }
  },
  remove: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      delete memoryStorage[key];
    }
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = safeStorage.get(STORAGE_KEY);
    if (saved && saved.id && saved.role) {
      return saved;
    }
    return MOCK_USER;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  useEffect(() => {
    safeStorage.set(STORAGE_KEY, currentUser);
  }, [currentUser]);

  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#ffffff');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#f8fafc');
      }
    } catch (e) {}
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
  };

  const handleTaskComplete = (task: Task) => {
    if (currentUser.completedTaskIds.includes(task.id)) return;
    try {
       window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch(e) {}

    setCurrentUser(prev => ({
      ...prev,
      xp: prev.xp + task.xpReward,
      completedTaskIds: [...prev.completedTaskIds, task.id]
    }));
  };

  const handleUpdateLearningStyle = (style: LearningStyle) => {
    setCurrentUser(prev => ({ ...prev, learningStyle: style }));
  };

  const handleUpdateInterest = (interest: string) => {
    setCurrentUser(prev => ({ ...prev, interest }));
  };

  const handleResetProgress = () => {
    const confirmed = window.confirm ? window.confirm("Сбросить весь прогресс?") : true;
    if (confirmed) {
      safeStorage.remove(STORAGE_KEY);
      safeStorage.remove('katya_chat_history');
      setCurrentUser(MOCK_USER);
      window.location.reload();
    }
  };

  const handleExportData = () => {
    try {
      const dataToSave = {
        version: '1.0',
        user: currentUser,
        chatHistory: safeStorage.get('katya_chat_history') || [],
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI-Teenager-Backup-${new Date().getDate()}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      alert("Ошибка экспорта.");
    }
  };

  const handleImportData = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);
        if (parsed.user && parsed.user.id) {
            safeStorage.set(STORAGE_KEY, parsed.user);
            if (parsed.chatHistory) {
              safeStorage.set('katya_chat_history', parsed.chatHistory);
            }
            setCurrentUser(parsed.user);
            alert("✅ Прогресс восстановлен!");
            setTimeout(() => setIsProfileOpen(false), 500);
        } else {
          alert("❌ Неверный формат файла.");
        }
      } catch (e) {
        alert("❌ Ошибка чтения файла.");
      }
    };
    reader.readAsText(file);
  };

  const handleSyncComplete = (data: { user: User; chatHistory: ChatMessage[] }) => {
     safeStorage.set(STORAGE_KEY, data.user);
     if (data.chatHistory) {
        safeStorage.set('katya_chat_history', data.chatHistory);
     }
     setCurrentUser(data.user);
     window.location.reload(); 
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 z-50 opacity-0 hover:opacity-100 transition-opacity p-2 pointer-events-none hover:pointer-events-auto">
         <RoleSelector currentRole={currentUser.role} onRoleChange={handleRoleChange} />
      </div>

      <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-50 overscroll-none safe-area-inset-bottom">
        {currentUser.role === UserRole.TEEN && (
          <TeenDashboard 
            user={currentUser}
            onTaskComplete={handleTaskComplete}
            onUpdateUserStyle={handleUpdateLearningStyle}
            onUpdateInterest={handleUpdateInterest}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onOpenGitHubSync={() => setIsGitHubModalOpen(true)}
          />
        )}
        {currentUser.role === UserRole.PARENT && (
          <ParentDashboard student={currentUser} />
        )}
        {currentUser.role === UserRole.CURATOR && (
          <CuratorDashboard />
        )}
      </main>

      {currentUser.role === UserRole.TEEN && <KatyaChat user={currentUser} />}

      <GitHubSyncModal 
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        currentUser={currentUser}
        chatHistory={safeStorage.get('katya_chat_history') || []}
        onSyncComplete={handleSyncComplete}
      />

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
          <div className="relative w-80 bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 p-6 flex flex-col">
             <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-slate-800">Меню</h2>
                <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <Settings size={20} className="text-slate-500" />
                </button>
             </div>
             
             <div className="space-y-2 flex-1">
                 <button 
                    onClick={() => { setIsProfileOpen(false); setIsGitHubModalOpen(true); }}
                    className="w-full flex items-center gap-3 p-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors text-left font-medium"
                 >
                     <Github size={20} /> GitHub Cloud Save
                 </button>
                 
                 <div className="pt-4 mt-4 border-t border-slate-100">
                    <button onClick={handleResetProgress} className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl transition-colors text-left font-medium hover:bg-red-100">
                        <RefreshCw size={20} /> Сброс прогресса
                    </button>
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
