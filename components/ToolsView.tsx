import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, Target, BookHeart, Brain, Sparkles, ChevronRight, Clock, BarChart3, Heart, Calendar, FileText, Lightbulb } from 'lucide-react';
import { User } from '../types';
import { PomodoroTimer } from './PomodoroTimer';
import { BalanceWheel } from './BalanceWheel';
import { EmotionDiary } from './EmotionDiary';
import { PlannerTool } from './PlannerTool';
import { GoalsTool } from './GoalsTool';
import { NotesTool } from './NotesTool';

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
}

const TOOLS: Tool[] = [
  {
    id: 'pomodoro',
    name: 'Помодоро',
    description: 'Техника фокусировки 25/5',
    emoji: '🍅',
    icon: Timer,
    color: '#ef4444',
    gradient: 'from-red-500 to-orange-500',
    xpReward: 20,
  },
  {
    id: 'planner',
    name: 'Планировщик',
    description: 'Организуй свой день',
    emoji: '📝',
    icon: Calendar,
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-500',
    xpReward: 15,
    isNew: true,
  },
  {
    id: 'goals',
    name: 'Цели',
    description: 'Отслеживай прогресс',
    emoji: '🎯',
    icon: Target,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    xpReward: 25,
    isNew: true,
  },
  {
    id: 'notes',
    name: 'Заметки',
    description: 'Записывай мысли и идеи',
    emoji: '📓',
    icon: FileText,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-500',
    xpReward: 10,
    isNew: true,
  },
  {
    id: 'balance',
    name: 'Колесо Баланса',
    description: 'Оцени сферы жизни',
    emoji: '⚖️',
    icon: BarChart3,
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-500',
    xpReward: 30,
  },
  {
    id: 'emotions',
    name: 'Дневник Эмоций',
    description: 'Отслеживай настроение',
    emoji: '💜',
    icon: Heart,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
    xpReward: 25,
  },
];

// Статистика использования
const getToolStats = () => {
  const stats: Record<string, number | string> = {};
  
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
  
  return stats;
};

export const ToolsView: React.FC<ToolsViewProps> = ({ user, onXpEarned }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const stats = getToolStats();

  const handleToolComplete = (toolId: string, xp: number) => {
    onXpEarned?.(xp, 0);
  };

  const getStatLabel = (toolId: string) => {
    const stat = stats[toolId];
    if (!stat) return 'Начни!';
    
    switch (toolId) {
      case 'pomodoro':
        return `${stat} мин`;
      case 'planner':
        return typeof stat === 'string' ? `${stat} задач` : 'Начни!';
      case 'goals':
        return typeof stat === 'string' ? `${stat} целей` : 'Начни!';
      case 'notes':
        return `${stat} записей`;
      case 'balance':
        return `${stat} раз`;
      case 'emotions':
        return `${stat} записей`;
      default:
        return 'Начни!';
    }
  };

  return (
    <div className="min-h-screen pb-40 relative">
      {/* iOS 26 LIQUID GLASS BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0c1222 0%, #020617 50%, #0a0f1a 100%)'
        }} />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-60 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-14 pb-4">
        <div 
          className="p-5 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-3xl">🛠</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Полезное</h1>
              <p className="text-white/50 text-sm">Инструменты для продуктивности</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            const stat = getStatLabel(tool.id);
            
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setActiveTool(tool.id)}
                className="w-full text-left rounded-3xl p-5 transition-all active:scale-[0.98] hover:scale-[1.01] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: `1px solid ${tool.color}30`,
                  boxShadow: `0 8px 32px ${tool.color}15, inset 0 1px 0 rgba(255,255,255,0.08)`,
                }}
              >
                {/* NEW badge */}
                {tool.isNew && (
                  <div 
                    className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: 'white',
                    }}
                  >
                    New
                  </div>
                )}
                
                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {/* Icon */}
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${tool.gradient}`}
                    style={{
                      boxShadow: `0 8px 25px ${tool.color}40`,
                    }}
                  >
                    <span className="text-3xl">{tool.emoji}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{tool.name}</h3>
                    <p className="text-white/50 text-sm">{tool.description}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2">
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded-lg"
                        style={{
                          background: `${tool.color}20`,
                          color: tool.color,
                        }}
                      >
                        {stat}
                      </span>
                      <span className="text-xs text-white/30">
                        +{tool.xpReward} XP
                      </span>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight size={24} className="text-white/30" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-3xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="text-white font-bold mb-1">Совет от Кати</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Начни день с планирования! Запиши 3 главные задачи и сфокусируйся на них. 
                Используй Помодоро для глубокой работы.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tool Modals */}
      <PomodoroTimer 
        isOpen={activeTool === 'pomodoro'} 
        onClose={() => setActiveTool(null)}
        onSessionComplete={(type, duration) => {
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
    </div>
  );
};

export default ToolsView;
