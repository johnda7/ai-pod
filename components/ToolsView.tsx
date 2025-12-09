import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BarChart3, TreePine, Trophy, Flame, BookOpen, Zap, Star, Sparkles, Cloud, CheckCircle, Loader } from 'lucide-react';
import { syncToolsDataToSupabase, loadToolsDataFromSupabase } from '../services/db';
import { User } from '../types';

// 🚀 Lazy loading для тяжёлых компонентов
// ⚠️ ОПТИМИЗАЦИЯ: Убраны дубли (Помодоро, Life Skills, Планировщик, Рефлексия, Дневник Эмоций)
const BalanceWheel = lazy(() => import('./BalanceWheel').then(m => ({ default: m.BalanceWheel })));
const GoalsTool = lazy(() => import('./GoalsTool').then(m => ({ default: m.GoalsTool })));
const NotesTool = lazy(() => import('./NotesTool').then(m => ({ default: m.NotesTool })));
const HabitTracker = lazy(() => import('./HabitTracker').then(m => ({ default: m.HabitTracker })));
const ChallengeSystem = lazy(() => import('./ChallengeSystem').then(m => ({ default: m.ChallengeSystem })));
const FocusMode = lazy(() => import('./FocusMode').then(m => ({ default: m.FocusMode })));

// 🔄 Компонент загрузки
const ToolLoader = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader size={32} className="text-purple-400" />
    </motion.div>
  </div>
);

interface ToolsViewProps {
  user: User;
  onXpEarned?: (xp: number, coins: number) => void;
  onNavigateToSection?: (section: 'PATH' | 'TOOLS' | 'RELAX' | 'PROFILE') => void;
}

// 🚀 Изображения для инструментов
const TOOL_IMAGES: Record<string, string> = {
  focus: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&h=200&fit=crop&q=60',
  challenges: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=200&h=200&fit=crop&q=60',
  habits: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=200&h=200&fit=crop&q=60',
  goals: 'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=200&h=200&fit=crop&q=60',
  diary: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200&h=200&fit=crop&q=60',
  balance: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=200&fit=crop&q=60',
};

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  xpReward: number;
  isNew?: boolean;
  isHot?: boolean;
  category: 'featured' | 'productivity' | 'growth' | 'wellness';
}

// ✅ ОПТИМИЗИРОВАННЫЙ СПИСОК: 6 инструментов вместо 11
// Убраны: Помодоро (дубль), Life Skills (в уроки), Планировщик, Рефлексия (в Дневник), Дневник Эмоций (в Дневник)
const TOOLS: Tool[] = [
  {
    id: 'focus',
    name: 'Фокус',
    description: 'Вырасти дерево концентрации',
    icon: TreePine,
    color: '#22c55e',
    xpReward: 30,
    isHot: true,
    category: 'featured',
  },
  {
    id: 'challenges',
    name: 'Челленджи',
    description: 'Выполняй задания — получай награды',
    icon: Trophy,
    color: '#f59e0b',
    xpReward: 50,
    isHot: true,
    category: 'featured',
  },
  {
    id: 'habits',
    name: 'Привычки',
    description: 'Формируй полезные привычки',
    icon: Flame,
    color: '#ef4444',
    xpReward: 15,
    category: 'growth',
  },
  {
    id: 'goals',
    name: 'Цели',
    description: 'Отслеживай свой прогресс',
    icon: Target,
    color: '#f59e0b',
    xpReward: 25,
    category: 'growth',
  },
  {
    id: 'diary',
    name: 'Дневник',
    description: 'Записывай мысли, эмоции, рефлексию',
    icon: BookOpen,
    color: '#8b5cf6',
    xpReward: 15,
    isNew: true,
    category: 'wellness',
  },
  {
    id: 'balance',
    name: 'Колесо Баланса',
    description: 'Оцени сферы жизни',
    icon: BarChart3,
    color: '#6366f1',
    xpReward: 30,
    category: 'wellness',
  },
];

// Упрощённые категории
const CATEGORIES = [
  { id: 'all', name: 'Все', emoji: '✨' },
  { id: 'featured', name: 'Топ', emoji: '🔥' },
  { id: 'growth', name: 'Рост', emoji: '🌱' },
  { id: 'wellness', name: 'Баланс', emoji: '🧘' },
];

// Get tool statistics from localStorage
const getToolStats = () => {
  const stats: Record<string, number | string> = {};
  
  try {
    const habits = localStorage.getItem('habit_tracker_data');
    if (habits) stats.habits = JSON.parse(habits).length || 0;
    
    const focusStreak = localStorage.getItem('focus_streak');
    if (focusStreak) stats.focus = JSON.parse(focusStreak).streak || 0;
    
    const goals = localStorage.getItem('goals_tracker');
    if (goals) {
      const parsed = JSON.parse(goals);
      const completed = parsed.filter((g: any) => g.progress >= g.target).length;
      stats.goals = parsed.length > 0 ? `${completed}/${parsed.length}` : 0;
    }
    
    // Объединённая статистика Дневника
    const notes = localStorage.getItem('notes_journal_v2');
    const emotions = localStorage.getItem('emotion_diary_entries');
    const reflection = localStorage.getItem('reflection_journal');
    
    let diaryCount = 0;
    if (notes) diaryCount += JSON.parse(notes).length || 0;
    if (emotions) diaryCount += JSON.parse(emotions).length || 0;
    if (reflection) diaryCount += JSON.parse(reflection).length || 0;
    if (diaryCount > 0) stats.diary = diaryCount;
    
    const balance = localStorage.getItem('balance_wheel_history');
    if (balance) stats.balance = JSON.parse(balance).length || 0;
  } catch (e) {
    console.error('Error loading stats:', e);
  }
  
  return stats;
};

export const ToolsView: React.FC<ToolsViewProps> = ({ user, onXpEarned, onNavigateToSection }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  
  const stats = useMemo(() => getToolStats(), [activeTool]);

  // Загрузка данных из Supabase при первом рендере
  useEffect(() => {
    if (user?.id) {
      loadToolsDataFromSupabase(user.id);
    }
  }, [user?.id]);

  // Синхронизация при закрытии инструмента
  useEffect(() => {
    if (!activeTool && user?.id) {
      setSyncStatus('syncing');
      syncToolsDataToSupabase(user.id).then(() => {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      });
    }
  }, [activeTool, user?.id]);

  const handleToolComplete = (toolId: string, xp: number, coins: number = 0) => {
    onXpEarned?.(xp, coins);
    
    // Трекинг использования инструментов для челленджей
    const today = new Date().toDateString();
    const lastToolsDate = localStorage.getItem('tools_used_date');
    
    if (lastToolsDate !== today) {
      localStorage.setItem('tools_used_date', today);
      localStorage.setItem('tools_used_today', '1');
    } else {
      const current = parseInt(localStorage.getItem('tools_used_today') || '0', 10);
      localStorage.setItem('tools_used_today', String(current + 1));
    }
    
    localStorage.setItem('last_tool_used', toolId);
  };

  const getStatLabel = (toolId: string) => {
    const stat = stats[toolId];
    if (!stat) return null;
    
    const labels: Record<string, string> = {
      habits: `${stat} привычек`,
      focus: `${stat} 🔥`,
      goals: typeof stat === 'string' ? stat : null,
      diary: `${stat} записей`,
      balance: `${stat} раз`,
    } as Record<string, string>;
    
    return labels[toolId] || null;
  };

  const filteredTools = selectedCategory === 'all' 
    ? TOOLS 
    : TOOLS.filter(t => t.category === selectedCategory);

  const featuredTools = TOOLS.filter(t => t.category === 'featured');

  return (
    <div className="min-h-screen pb-40 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)' }}>
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-[400px] h-[300px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute top-20 right-0 w-[350px] h-[250px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[2rem]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-14 h-14 rounded-2xl overflow-hidden relative"
              style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop"
                alt="Tools"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/60 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white tracking-tight">Полезное</h1>
              <p className="text-white/50 text-sm">{TOOLS.length} инструментов для роста</p>
            </div>
            
            {/* Sync & XP Badge */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {syncStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="p-2 rounded-xl"
                    style={{
                      background: syncStatus === 'synced' ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)',
                    }}
                  >
                    {syncStatus === 'syncing' ? (
                      <Cloud size={16} className="text-indigo-400 animate-pulse" />
                    ) : (
                      <CheckCircle size={16} className="text-green-400" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(234,88,12,0.15) 100%)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  boxShadow: '0 4px 15px rgba(245,158,11,0.2)',
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Zap size={14} className="text-amber-400" />
                <span className="text-amber-400 font-bold text-sm">{user.xp}</span>
              </motion.div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {CATEGORIES.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
                style={{
                  background: selectedCategory === cat.id 
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.4) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedCategory === cat.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.5)',
                  boxShadow: selectedCategory === cat.id ? '0 4px 15px rgba(99,102,241,0.25)' : 'none',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Featured Section */}
      {selectedCategory === 'all' && (
        <div className="px-4 pt-2 pb-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-3"
          >
            <Star size={16} className="text-amber-400" />
            <span className="text-white/70 text-sm font-medium">Рекомендуем</span>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-3">
            {featuredTools.map((tool, index) => {
              const stat = getStatLabel(tool.id);
              const Icon = tool.icon;
              
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setActiveTool(tool.id)}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3]"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img 
                    src={TOOL_IMAGES[tool.id]}
                    alt={tool.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)' }}
                  />
                  
                  <div 
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                    style={{ background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(10px)' }}
                  >
                    <span>🔥</span>
                    <span className="text-white">HOT</span>
                  </div>
                  
                  <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                    
                    <h3 className="text-white font-bold text-sm mb-0.5">{tool.name}</h3>
                    <p className="text-white/60 text-[10px] mb-1.5 line-clamp-1">{tool.description}</p>
                    
                    <div className="flex items-center justify-between">
                      {stat ? (
                        <span 
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
                        >
                          {stat}
                        </span>
                      ) : (
                        <span className="text-white/40 text-[10px]">Начни!</span>
                      )}
                      <span 
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(245,158,11,0.25)', color: '#fbbf24' }}
                      >
                        +{tool.xpReward}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tools List */}
      <div className="px-4 py-2">
        {selectedCategory === 'all' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-3"
          >
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-white/70 text-sm font-medium">Все инструменты</span>
          </motion.div>
        )}
        
        <div className="space-y-2">
          {(selectedCategory === 'all' ? TOOLS.filter(t => t.category !== 'featured') : filteredTools).map((tool, index) => {
            const stat = getStatLabel(tool.id);
            const Icon = tool.icon;
            
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setActiveTool(tool.id)}
                className="w-full text-left rounded-xl overflow-hidden relative"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3 p-3">
                  <div 
                    className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative"
                    style={{
                      background: `linear-gradient(135deg, ${tool.color}30 0%, ${tool.color}10 100%)`,
                      border: `1px solid ${tool.color}30`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon size={20} style={{ color: tool.color }} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">{tool.name}</h3>
                      {tool.isNew && (
                        <span 
                          className="px-1 py-0.5 rounded text-[8px] font-bold"
                          style={{ background: '#22c55e', color: 'white' }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs truncate">{tool.description}</p>
                  </div>
                  
                  <div 
                    className="px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}
                  >
                    <Zap size={10} />
                    +{tool.xpReward}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-[1.5rem] overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300&h=100&fit=crop&q=40"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative p-5 flex items-start gap-3">
            <motion.div 
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              💡
            </motion.div>
            <div>
              <h4 className="text-white font-bold mb-1">Совет от Кати</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Начни с "Фокуса" — вырасти дерево концентрации! 
                А потом заполни "Дневник" — это поможет понять себя лучше 🌲
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tool Modals - только нужные! */}
      <Suspense fallback={<ToolLoader />}>
        <AnimatePresence>
          {activeTool === 'focus' && (
            <FocusMode
              isOpen={true}
              onClose={() => setActiveTool(null)}
              onComplete={(xp, coins) => handleToolComplete('focus', xp, coins)}
            />
          )}
          
          {activeTool === 'challenges' && (
            <ChallengeSystem
              isOpen={true}
              onClose={() => setActiveTool(null)}
              onComplete={(xp, coins) => handleToolComplete('challenges', xp, coins)}
              userXp={user.xp}
              completedLessons={user.completedTaskIds.length}
              userStreak={user.streak || 0}
              onNavigateToSection={(section) => {
                setActiveTool(null);
                onNavigateToSection?.(section);
              }}
            />
          )}
          
          {activeTool === 'habits' && (
            <HabitTracker
              isOpen={true}
              onClose={() => setActiveTool(null)}
              onComplete={(xp) => handleToolComplete('habits', xp)}
            />
          )}
          
          {activeTool === 'goals' && (
            <GoalsTool
              isOpen={true}
              onClose={() => setActiveTool(null)}
              onComplete={(xp) => handleToolComplete('goals', xp)}
            />
          )}
          
          {/* Дневник = бывшие Заметки (включает функционал эмоций и рефлексии) */}
          {activeTool === 'diary' && (
            <NotesTool
              isOpen={true}
              onClose={() => setActiveTool(null)}
              onComplete={(xp) => handleToolComplete('diary', xp)}
            />
          )}
          
          {activeTool === 'balance' && (
            <BalanceWheel 
              isOpen={true}
              onClose={() => setActiveTool(null)}
              onComplete={() => handleToolComplete('balance', 30)}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default ToolsView;
