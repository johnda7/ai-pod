import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Target, BookHeart, Brain, Sparkles, ChevronRight, Clock, BarChart3, Heart, Calendar, FileText, Lightbulb, TreePine, Trophy, Flame, BookOpen, Zap, Star } from 'lucide-react';
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

interface Tool {
  id: string;
  name: string;
  description: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
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
    emoji: '🌲',
    icon: TreePine,
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-600',
    xpReward: 30,
    isHot: true,
    category: 'featured',
  },
  {
    id: 'challenges',
    name: 'Челленджи',
    description: 'Выполняй задания — получай награды',
    emoji: '🏆',
    icon: Trophy,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    xpReward: 50,
    isHot: true,
    category: 'featured',
  },
  {
    id: 'habits',
    name: 'Привычки',
    description: 'Формируй полезные привычки',
    emoji: '✅',
    icon: Flame,
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-600',
    xpReward: 15,
    isNew: true,
    category: 'growth',
  },
  {
    id: 'lifeskills',
    name: 'Life Skills',
    description: 'Навыки для реальной жизни',
    emoji: '🚀',
    icon: BookOpen,
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-600',
    xpReward: 40,
    isNew: true,
    category: 'growth',
  },
  {
    id: 'reflection',
    name: 'Рефлексия',
    description: 'Дневник самопознания',
    emoji: '📔',
    icon: BookHeart,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    xpReward: 25,
    isNew: true,
    category: 'wellness',
  },
  {
    id: 'pomodoro',
    name: 'Помодоро',
    description: 'Техника фокусировки 25/5',
    emoji: '🍅',
    icon: Timer,
    color: '#ef4444',
    gradient: 'from-red-500 to-orange-600',
    xpReward: 20,
    category: 'productivity',
  },
  {
    id: 'planner',
    name: 'Планировщик',
    description: 'Организуй свой день',
    emoji: '📝',
    icon: Calendar,
    color: '#22c55e',
    gradient: 'from-green-500 to-teal-600',
    xpReward: 15,
    category: 'productivity',
  },
  {
    id: 'goals',
    name: 'Цели',
    description: 'Отслеживай прогресс',
    emoji: '🎯',
    icon: Target,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-yellow-600',
    xpReward: 25,
    category: 'growth',
  },
  {
    id: 'notes',
    name: 'Заметки',
    description: 'Записывай мысли и идеи',
    emoji: '📓',
    icon: FileText,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-fuchsia-600',
    xpReward: 10,
    category: 'productivity',
  },
  {
    id: 'balance',
    name: 'Колесо Баланса',
    description: 'Оцени сферы жизни',
    emoji: '⚖️',
    icon: BarChart3,
    color: '#6366f1',
    gradient: 'from-indigo-500 to-blue-600',
    xpReward: 30,
    category: 'wellness',
  },
  {
    id: 'emotions',
    name: 'Дневник Эмоций',
    description: 'Отслеживай настроение',
    emoji: '💜',
    icon: Heart,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
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

// Статистика использования
const getToolStats = () => {
  const stats: Record<string, number | string> = {};
  
  try {
    // Pomodoro
    const pomodoroStats = localStorage.getItem('pomodoro_stats');
    if (pomodoroStats) {
      const parsed = JSON.parse(pomodoroStats);
      stats.pomodoro = parsed.totalTime || 0;
    }
    
    // Planner
    const plannerTasks = localStorage.getItem('planner_tasks');
    if (plannerTasks) {
      const parsed = JSON.parse(plannerTasks);
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = parsed.filter((t: any) => t.date === today);
      const completed = todayTasks.filter((t: any) => t.completed).length;
      stats.planner = todayTasks.length > 0 ? `${completed}/${todayTasks.length}` : 0;
    }
    
    // Goals
    const goals = localStorage.getItem('goals_tracker');
    if (goals) {
      const parsed = JSON.parse(goals);
      const completed = parsed.filter((g: any) => g.progress >= g.target).length;
      stats.goals = parsed.length > 0 ? `${completed}/${parsed.length}` : 0;
    }
    
    // Notes
    const notes = localStorage.getItem('notes_journal');
    if (notes) {
      const parsed = JSON.parse(notes);
      stats.notes = parsed.length || 0;
    }
    
    // Balance Wheel
    const balanceHistory = localStorage.getItem('balance_wheel_history');
    if (balanceHistory) {
      const parsed = JSON.parse(balanceHistory);
      stats.balance = parsed.length || 0;
    }
    
    // Emotion Diary
    const emotionEntries = localStorage.getItem('emotion_diary_entries');
    if (emotionEntries) {
      const parsed = JSON.parse(emotionEntries);
      stats.emotions = parsed.length || 0;
    }
    
    // Habits
    const habits = localStorage.getItem('habit_tracker_data');
    if (habits) {
      const parsed = JSON.parse(habits);
      stats.habits = parsed.length || 0;
    }
    
    // Reflection
    const reflection = localStorage.getItem('reflection_journal');
    if (reflection) {
      const parsed = JSON.parse(reflection);
      stats.reflection = parsed.length || 0;
    }
    
    // Focus
    const focusStreak = localStorage.getItem('focus_streak');
    if (focusStreak) {
      const parsed = JSON.parse(focusStreak);
      stats.focus = parsed.streak || 0;
    }
    
    // Life Skills
    const lifeSkills = localStorage.getItem('life_skills_progress');
    if (lifeSkills) {
      const parsed = JSON.parse(lifeSkills);
      stats.lifeskills = parsed.length || 0;
    }
  } catch (e) {
    console.error('Error loading stats:', e);
  }
  
  return stats;
};

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: `rgba(${Math.random() > 0.5 ? '99,102,241' : '139,92,246'}, ${0.3 + Math.random() * 0.3})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const ToolsView: React.FC<ToolsViewProps> = ({ user, onXpEarned }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const stats = getToolStats();

  const handleToolComplete = (toolId: string, xp: number, coins: number = 0) => {
    onXpEarned?.(xp, coins);
  };

  const getStatLabel = (toolId: string) => {
    const stat = stats[toolId];
    if (!stat) return null;
    
    switch (toolId) {
      case 'pomodoro':
        return `${stat} мин`;
      case 'planner':
        return typeof stat === 'string' ? `${stat} задач` : null;
      case 'goals':
        return typeof stat === 'string' ? `${stat} целей` : null;
      case 'notes':
        return `${stat} записей`;
      case 'balance':
        return `${stat} раз`;
      case 'emotions':
        return `${stat} записей`;
      case 'habits':
        return `${stat} привычек`;
      case 'reflection':
        return `${stat} записей`;
      case 'focus':
        return stat ? `${stat} 🔥` : null;
      case 'lifeskills':
        return `${stat} уроков`;
      default:
        return null;
    }
  };

  const filteredTools = selectedCategory === 'all' 
    ? TOOLS 
    : TOOLS.filter(t => t.category === selectedCategory);

  const featuredTools = TOOLS.filter(t => t.category === 'featured');

  return (
    <div className="min-h-screen pb-40 relative overflow-hidden">
      {/* iOS 26 LIQUID GLASS BACKGROUND - Enhanced */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1a 50%, #020617 100%)'
        }} />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-10 left-0 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-0 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-72 h-72 rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)' }}
          animate={{
            x: [0, 25, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        <FloatingParticles />
      </div>

      {/* Header - iOS 26 Liquid Glass */}
      <div className="sticky top-0 z-20 px-4 pt-14 pb-3">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[2rem]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.3) 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 15px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl relative z-10">🛠</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white tracking-tight">Полезное</h1>
              <p className="text-white/50 text-sm">{TOOLS.length} инструментов для роста</p>
            </div>
            
            {/* Daily XP indicator */}
            <motion.div 
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,88,12,0.1) 100%)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Zap size={14} className="text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">{user.xp}</span>
            </motion.div>
          </div>

          {/* Category Pills - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {CATEGORIES.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id 
                    ? 'text-white' 
                    : 'text-white/50 hover:text-white/70'
                }`}
                style={{
                  background: selectedCategory === cat.id 
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.4) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedCategory === cat.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: selectedCategory === cat.id ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
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

      {/* Featured Section - Large Cards */}
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
              
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                  onClick={() => setActiveTool(tool.id)}
                  onHoverStart={() => setHoveredTool(tool.id)}
                  onHoverEnd={() => setHoveredTool(null)}
                  className="relative rounded-[1.5rem] p-4 text-left overflow-hidden aspect-square"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}30 0%, ${tool.color}10 100%)`,
                    border: `1px solid ${tool.color}40`,
                    boxShadow: `0 8px 32px ${tool.color}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animated background gradient */}
                  <motion.div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${tool.color}40 0%, transparent 50%)`,
                    }}
                    animate={{
                      scale: hoveredTool === tool.id ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Hot badge */}
                  <motion.div 
                    className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(220,38,38,0.9) 100%)',
                      boxShadow: '0 2px 10px rgba(239,68,68,0.4)',
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span>🔥</span>
                    <span className="text-white">HOT</span>
                  </motion.div>
                  
                  {/* Shine effect */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-[1.5rem]" />
                  
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <motion.div 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${tool.gradient}`}
                      style={{
                        boxShadow: `0 8px 25px ${tool.color}50`,
                      }}
                      animate={{
                        rotate: hoveredTool === tool.id ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-3xl">{tool.emoji}</span>
                    </motion.div>
                    
                    <h3 className="text-white font-bold text-base mb-1">{tool.name}</h3>
                    <p className="text-white/50 text-xs flex-1 line-clamp-2">{tool.description}</p>
                    
                    {/* Stats row */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      {stat ? (
                        <span className="text-xs font-medium text-white/70">{stat}</span>
                      ) : (
                        <span className="text-xs text-white/40">Начни!</span>
                      )}
                      <span className="text-xs font-bold" style={{ color: tool.color }}>
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

      {/* Tools Grid */}
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
            
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                onClick={() => setActiveTool(tool.id)}
                onHoverStart={() => setHoveredTool(tool.id)}
                onHoverEnd={() => setHoveredTool(null)}
                className="w-full text-left rounded-[1.5rem] p-4 transition-all relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: `1px solid ${hoveredTool === tool.id ? tool.color + '50' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: hoveredTool === tool.id 
                    ? `0 8px 32px ${tool.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` 
                    : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Badges */}
                {tool.isNew && (
                  <motion.div 
                    className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      boxShadow: '0 2px 10px rgba(34,197,94,0.4)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <span className="text-white">NEW</span>
                  </motion.div>
                )}
                
                {/* Hover glow effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 20% 50%, ${tool.color}15 0%, transparent 50%)`,
                  }}
                />
                
                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-[1.5rem] pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {/* Icon */}
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${tool.gradient} shrink-0`}
                    style={{
                      boxShadow: `0 6px 20px ${tool.color}40`,
                    }}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="text-2xl">{tool.emoji}</span>
                  </motion.div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white mb-0.5">{tool.name}</h3>
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
                  <motion.div
                    animate={{ x: hoveredTool === tool.id ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={20} className="text-white/30" />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Tips Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-[1.5rem] p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Animated gradient */}
          <motion.div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 40%)',
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-start gap-3 relative z-10">
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
