import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Target, BookHeart, ChevronRight, BarChart3, Heart, Calendar, FileText, TreePine, Trophy, Flame, BookOpen, Zap, Star, Sparkles } from 'lucide-react';
import { User } from '../types';
import { PomodoroTimer } from './PomodoroTimer';
import { BalanceWheel } from './BalanceWheel';
import { EmotionDiary } from './EmotionDiary';
import { PlannerTool } from './PlannerTool';
import { GoalsTool } from './GoalsTool';
import { NotesTool } from './NotesTool';
import { HabitTracker } from './HabitTracker';
import { ChallengeSystem } from './ChallengeSystem';
import { FocusMode } from './FocusMode';
import { ReflectionJournal } from './ReflectionJournal';
import { LifeSkillsModule } from './LifeSkillsModule';

interface ToolsViewProps {
  user: User;
  onXpEarned?: (xp: number, coins: number) => void;
}

// High-quality images for each tool
const TOOL_IMAGES: Record<string, string> = {
  focus: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop', // Beautiful tree
  challenges: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=400&h=400&fit=crop', // Trophy/achievement
  habits: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop', // Checklist
  lifeskills: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop', // Galaxy/growth
  reflection: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop', // Journal
  pomodoro: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400&h=400&fit=crop', // Clock
  planner: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=400&fit=crop', // Calendar
  goals: 'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=400&h=400&fit=crop', // Target/arrow
  notes: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop', // Notebook
  balance: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop', // Balance/meditation
  emotions: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop', // Peaceful
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

const TOOLS: Tool[] = [
  {
    id: 'focus',
    name: 'Режим Фокуса',
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
    isNew: true,
    category: 'growth',
  },
  {
    id: 'lifeskills',
    name: 'Life Skills',
    description: 'Навыки для реальной жизни',
    icon: BookOpen,
    color: '#6366f1',
    xpReward: 40,
    isNew: true,
    category: 'growth',
  },
  {
    id: 'reflection',
    name: 'Рефлексия',
    description: 'Дневник самопознания',
    icon: BookHeart,
    color: '#8b5cf6',
    xpReward: 25,
    isNew: true,
    category: 'wellness',
  },
  {
    id: 'pomodoro',
    name: 'Помодоро',
    description: 'Техника фокусировки 25/5',
    icon: Timer,
    color: '#ef4444',
    xpReward: 20,
    category: 'productivity',
  },
  {
    id: 'planner',
    name: 'Планировщик',
    description: 'Организуй свой день',
    icon: Calendar,
    color: '#22c55e',
    xpReward: 15,
    category: 'productivity',
  },
  {
    id: 'goals',
    name: 'Цели',
    description: 'Отслеживай прогресс',
    icon: Target,
    color: '#f59e0b',
    xpReward: 25,
    category: 'growth',
  },
  {
    id: 'notes',
    name: 'Заметки',
    description: 'Записывай мысли и идеи',
    icon: FileText,
    color: '#8b5cf6',
    xpReward: 10,
    category: 'productivity',
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
  {
    id: 'emotions',
    name: 'Дневник Эмоций',
    description: 'Отслеживай настроение',
    icon: Heart,
    color: '#ec4899',
    xpReward: 25,
    category: 'wellness',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Все', emoji: '✨' },
  { id: 'featured', name: 'Топ', emoji: '🔥' },
  { id: 'productivity', name: 'Продуктивность', emoji: '⚡' },
  { id: 'growth', name: 'Рост', emoji: '🌱' },
  { id: 'wellness', name: 'Баланс', emoji: '🧘' },
];

// Get tool statistics from localStorage
const getToolStats = () => {
  const stats: Record<string, number | string> = {};
  
  try {
    const pomodoroStats = localStorage.getItem('pomodoro_stats');
    if (pomodoroStats) stats.pomodoro = JSON.parse(pomodoroStats).totalTime || 0;
    
    const habits = localStorage.getItem('habit_tracker_data');
    if (habits) stats.habits = JSON.parse(habits).length || 0;
    
    const reflection = localStorage.getItem('reflection_journal');
    if (reflection) stats.reflection = JSON.parse(reflection).length || 0;
    
    const focusStreak = localStorage.getItem('focus_streak');
    if (focusStreak) stats.focus = JSON.parse(focusStreak).streak || 0;
    
    const lifeSkills = localStorage.getItem('life_skills_progress');
    if (lifeSkills) stats.lifeskills = JSON.parse(lifeSkills).length || 0;
    
    const goals = localStorage.getItem('goals_tracker');
    if (goals) {
      const parsed = JSON.parse(goals);
      const completed = parsed.filter((g: any) => g.progress >= g.target).length;
      stats.goals = parsed.length > 0 ? `${completed}/${parsed.length}` : 0;
    }
    
    const notes = localStorage.getItem('notes_journal');
    if (notes) stats.notes = JSON.parse(notes).length || 0;
    
    const balance = localStorage.getItem('balance_wheel_history');
    if (balance) stats.balance = JSON.parse(balance).length || 0;
    
    const emotions = localStorage.getItem('emotion_diary_entries');
    if (emotions) stats.emotions = JSON.parse(emotions).length || 0;
  } catch (e) {
    console.error('Error loading stats:', e);
  }
  
  return stats;
};

export const ToolsView: React.FC<ToolsViewProps> = ({ user, onXpEarned }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const stats = getToolStats();

  const handleToolComplete = (toolId: string, xp: number, coins: number = 0) => {
    onXpEarned?.(xp, coins);
  };

  const getStatLabel = (toolId: string) => {
    const stat = stats[toolId];
    if (!stat) return null;
    
    const labels: Record<string, string> = {
      pomodoro: `${stat} мин`,
      habits: `${stat} привычек`,
      reflection: `${stat} записей`,
      focus: `${stat} 🔥`,
      lifeskills: `${stat} уроков`,
      goals: typeof stat === 'string' ? stat : null,
      notes: `${stat} записей`,
      balance: `${stat} раз`,
      emotions: `${stat} записей`,
    } as Record<string, string>;
    
    return labels[toolId] || null;
  };

  const filteredTools = selectedCategory === 'all' 
    ? TOOLS 
    : TOOLS.filter(t => t.category === selectedCategory);

  const featuredTools = TOOLS.filter(t => t.category === 'featured');

  return (
    <div className="min-h-screen pb-40 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)' }}>
      {/* Static background - optimized for performance */}
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

      {/* Header - MORE PADDING FOR TELEGRAM */}
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
            {/* Tool icon with image */}
            <div 
              className="w-14 h-14 rounded-2xl overflow-hidden relative"
              style={{
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
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
            
            {/* XP Badge */}
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

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {CATEGORIES.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
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

      {/* Featured Section - Large Cards with Images */}
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
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                  onClick={() => setActiveTool(tool.id)}
                  className="relative rounded-[1.5rem] overflow-hidden aspect-[4/5]"
                  style={{
                    boxShadow: `0 8px 32px ${tool.color}30`,
                  }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background Image */}
                  <img 
                    src={TOOL_IMAGES[tool.id]}
                    alt={tool.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${tool.color}90 100%)`,
                    }}
                  />
                  
                  {/* Glass overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)',
                    }}
                  />
                  
                  {/* Hot badge */}
                  <motion.div 
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.95) 0%, rgba(220,38,38,0.95) 100%)',
                      boxShadow: '0 4px 15px rgba(239,68,68,0.5)',
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span>🔥</span>
                    <span className="text-white">HOT</span>
                  </motion.div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">{tool.name}</h3>
                    <p className="text-white/80 text-xs mb-2 drop-shadow">{tool.description}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      {stat ? (
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-lg"
                          style={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          {stat}
                        </span>
                      ) : (
                        <span className="text-white/60 text-xs">Начни!</span>
                      )}
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={{
                          background: 'rgba(245,158,11,0.3)',
                          color: '#fbbf24',
                        }}
                      >
                        +{tool.xpReward} XP
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
        
        <div className="space-y-3">
          {(selectedCategory === 'all' ? TOOLS.filter(t => t.category !== 'featured') : filteredTools).map((tool, index) => {
            const stat = getStatLabel(tool.id);
            const Icon = tool.icon;
            
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                onClick={() => setActiveTool(tool.id)}
                className="w-full text-left rounded-[1.5rem] overflow-hidden relative group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Image thumbnail */}
                  <div 
                    className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative"
                    style={{
                      boxShadow: `0 4px 15px ${tool.color}30`,
                    }}
                  >
                    <img 
                      src={TOOL_IMAGES[tool.id]}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${tool.color}40 0%, ${tool.color}20 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon size={24} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{tool.name}</h3>
                      {tool.isNew && (
                        <span 
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                          style={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            color: 'white',
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm truncate">{tool.description}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-1.5">
                      {stat ? (
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-lg"
                          style={{
                            background: `${tool.color}20`,
                            color: tool.color,
                          }}
                        >
                          {stat}
                        </span>
                      ) : (
                        <span className="text-xs text-white/30">Начни!</span>
                      )}
                      <span className="text-xs text-white/30 flex items-center gap-1">
                        <Zap size={10} className="text-amber-400" />
                        +{tool.xpReward}
                      </span>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight size={20} className="text-white/30 group-hover:text-white/50 transition-colors" />
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
          {/* Background image */}
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=200&fit=crop"
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
                Попробуй "Режим Фокуса" — вырасти своё дерево концентрации! 
                Чем дольше фокусируешься, тем больше оно растёт 🌲
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tool Modals */}
      <AnimatePresence>
        <FocusMode
          isOpen={activeTool === 'focus'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp, coins) => handleToolComplete('focus', xp, coins)}
        />
        
        <ChallengeSystem
          isOpen={activeTool === 'challenges'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp, coins) => handleToolComplete('challenges', xp, coins)}
          userXp={user.xp}
          completedLessons={user.completedTaskIds.length}
        />
        
        <HabitTracker
          isOpen={activeTool === 'habits'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp) => handleToolComplete('habits', xp)}
        />
        
        <LifeSkillsModule
          isOpen={activeTool === 'lifeskills'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp, coins) => handleToolComplete('lifeskills', xp, coins)}
        />
        
        <ReflectionJournal
          isOpen={activeTool === 'reflection'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp) => handleToolComplete('reflection', xp)}
        />
        
        <PomodoroTimer 
          isOpen={activeTool === 'pomodoro'} 
          onClose={() => setActiveTool(null)}
          onSessionComplete={(type) => {
            if (type === 'work') {
              handleToolComplete('pomodoro', 20);
            }
          }}
        />
        
        <PlannerTool
          isOpen={activeTool === 'planner'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp) => handleToolComplete('planner', xp)}
        />
        
        <GoalsTool
          isOpen={activeTool === 'goals'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp) => handleToolComplete('goals', xp)}
        />
        
        <NotesTool
          isOpen={activeTool === 'notes'}
          onClose={() => setActiveTool(null)}
          onComplete={(xp) => handleToolComplete('notes', xp)}
        />
        
        <BalanceWheel 
          isOpen={activeTool === 'balance'} 
          onClose={() => setActiveTool(null)}
          onComplete={() => handleToolComplete('balance', 30)}
        />
        
        <EmotionDiary 
          isOpen={activeTool === 'emotions'} 
          onClose={() => setActiveTool(null)}
          onComplete={(xp) => handleToolComplete('emotions', xp)}
        />
      </AnimatePresence>
    </div>
  );
};

export default ToolsView;
