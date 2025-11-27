import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Target, Trophy, Flame, ChevronRight, Trash2, Check, Edit3 } from 'lucide-react';

interface GoalsToolProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  target: number;
  unit: string;
  deadline?: string;
  createdAt: number;
  color: string;
}

const CATEGORIES = [
  { id: 'study', name: 'Учёба', emoji: '📚', color: '#6366f1' },
  { id: 'health', name: 'Здоровье', emoji: '💪', color: '#22c55e' },
  { id: 'hobby', name: 'Хобби', emoji: '🎨', color: '#f59e0b' },
  { id: 'social', name: 'Общение', emoji: '👥', color: '#ec4899' },
  { id: 'personal', name: 'Личное', emoji: '⭐', color: '#8b5cf6' },
  { id: 'other', name: 'Другое', emoji: '🎯', color: '#64748b' },
];

const TEMPLATES = [
  { title: 'Читать книги', target: 12, unit: 'книг', category: 'study' },
  { title: 'Заниматься спортом', target: 30, unit: 'тренировок', category: 'health' },
  { title: 'Медитировать', target: 30, unit: 'дней', category: 'health' },
  { title: 'Учить английский', target: 100, unit: 'уроков', category: 'study' },
  { title: 'Рисовать', target: 50, unit: 'рисунков', category: 'hobby' },
];

export const GoalsTool: React.FC<GoalsToolProps> = ({ isOpen, onClose, onComplete }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('personal');
  const [newTarget, setNewTarget] = useState('10');
  const [newUnit, setNewUnit] = useState('раз');
  const [newDeadline, setNewDeadline] = useState('');

  // Load goals
  useEffect(() => {
    const saved = localStorage.getItem('goals_tracker');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  // Save goals
  useEffect(() => {
    localStorage.setItem('goals_tracker', JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (!newTitle.trim()) return;
    
    const category = CATEGORIES.find(c => c.id === newCategory);
    
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory,
      progress: 0,
      target: parseInt(newTarget) || 10,
      unit: newUnit,
      deadline: newDeadline || undefined,
      createdAt: Date.now(),
      color: category?.color || '#6366f1',
    };
    
    setGoals([...goals, newGoal]);
    resetForm();
    onComplete(15);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewCategory('personal');
    setNewTarget('10');
    setNewUnit('раз');
    setNewDeadline('');
    setShowAddForm(false);
  };

  const updateProgress = (id: string, delta: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        const newProgress = Math.max(0, Math.min(goal.target, goal.progress + delta));
        
        // Award XP for progress
        if (delta > 0) {
          onComplete(5);
        }
        
        // Award bonus for completing goal
        if (newProgress === goal.target && goal.progress < goal.target) {
          onComplete(50);
        }
        
        return { ...goal, progress: newProgress };
      }
      return goal;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    setSelectedGoal(null);
  };

  const useTemplate = (template: typeof TEMPLATES[0]) => {
    setNewTitle(template.title);
    setNewTarget(template.target.toString());
    setNewUnit(template.unit);
    setNewCategory(template.category);
    setShowAddForm(true);
  };

  const completedGoals = goals.filter(g => g.progress >= g.target).length;
  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.progress / g.target * 100), 0) / goals.length)
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-24 pb-4">
          <div 
            className="p-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(234,88,12,0.2) 100%)',
                  }}
                >
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Мои Цели</h1>
                  <p className="text-white/50 text-xs">
                    {completedGoals}/{goals.length} выполнено
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Stats */}
            {goals.length > 0 && (
              <div className="flex gap-3 mt-4">
                <div 
                  className="flex-1 rounded-xl p-3 text-center"
                  style={{ background: 'rgba(245,158,11,0.15)' }}
                >
                  <div className="text-2xl font-bold text-amber-400">{goals.length}</div>
                  <div className="text-white/40 text-xs">Целей</div>
                </div>
                <div 
                  className="flex-1 rounded-xl p-3 text-center"
                  style={{ background: 'rgba(34,197,94,0.15)' }}
                >
                  <div className="text-2xl font-bold text-green-400">{completedGoals}</div>
                  <div className="text-white/40 text-xs">Выполнено</div>
                </div>
                <div 
                  className="flex-1 rounded-xl p-3 text-center"
                  style={{ background: 'rgba(99,102,241,0.15)' }}
                >
                  <div className="text-2xl font-bold text-indigo-400">{totalProgress}%</div>
                  <div className="text-white/40 text-xs">Прогресс</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-220px)]">
          {goals.length === 0 && !showAddForm ? (
            <>
              {/* Empty State */}
              <div 
                className="rounded-3xl p-6 text-center mb-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-5xl mb-4 block">🎯</span>
                <h3 className="text-white font-bold text-lg mb-2">Поставь свою первую цель!</h3>
                <p className="text-white/40 text-sm">
                  Цели помогают фокусироваться и достигать большего
                </p>
              </div>

              {/* Templates */}
              <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                Популярные цели
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((template, i) => {
                  const category = CATEGORIES.find(c => c.id === template.category);
                  return (
                    <button
                      key={i}
                      onClick={() => useTemplate(template)}
                      className="rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <span className="text-2xl">{category?.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{template.title}</div>
                        <div className="text-white/40 text-xs">{template.target} {template.unit}</div>
                      </div>
                      <ChevronRight size={18} className="text-white/30" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Goals List */
            <div className="space-y-3">
              {goals.map((goal) => {
                const category = CATEGORIES.find(c => c.id === goal.category);
                const percentage = Math.round((goal.progress / goal.target) * 100);
                const isComplete = goal.progress >= goal.target;
                
                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl p-4"
                    style={{
                      background: isComplete 
                        ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isComplete ? 'rgba(34,197,94,0.3)' : `${goal.color}30`}`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${goal.color}20` }}
                      >
                        {isComplete ? (
                          <Trophy size={24} className="text-green-400" />
                        ) : (
                          <span className="text-2xl">{category?.emoji}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold truncate">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-white/40 text-xs truncate">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="text-xs px-2 py-0.5 rounded-md"
                            style={{ background: `${goal.color}20`, color: goal.color }}
                          >
                            {category?.name}
                          </span>
                          {goal.deadline && (
                            <span className="text-white/30 text-xs">
                              до {new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} className="text-white/40" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">{goal.progress} / {goal.target} {goal.unit}</span>
                        <span style={{ color: goal.color }}>{percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className="h-full rounded-full"
                          style={{ background: isComplete ? '#22c55e' : goal.color }}
                        />
                      </div>
                    </div>

                    {/* Progress Buttons */}
                    {!isComplete && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateProgress(goal.id, -1)}
                          disabled={goal.progress === 0}
                          className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium disabled:opacity-30"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateProgress(goal.id, 1)}
                          className="flex-1 py-2 rounded-xl text-white text-sm font-medium"
                          style={{ background: goal.color }}
                        >
                          +1 {goal.unit.slice(0, -1) || goal.unit}
                        </button>
                        <button
                          onClick={() => updateProgress(goal.id, 5)}
                          className="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm font-medium"
                        >
                          +5
                        </button>
                      </div>
                    )}

                    {isComplete && (
                      <div className="flex items-center justify-center gap-2 py-2 text-green-400">
                        <Trophy size={16} />
                        <span className="text-sm font-bold">Цель достигнута!</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Goal Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl overflow-y-auto"
            >
              <div className="px-4 pt-20 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Новая цель</h2>
                  <button
                    onClick={resetForm}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="text-white/50 text-xs font-medium mb-2 block">Название цели</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Например: Прочитать 10 книг"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="text-white/50 text-xs font-medium mb-2 block">Описание (необязательно)</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Зачем тебе эта цель?"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 resize-none"
                  />
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="text-white/50 text-xs font-medium mb-2 block">Категория</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setNewCategory(cat.id)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          newCategory === cat.id ? '' : 'opacity-50'
                        }`}
                        style={{
                          background: `${cat.color}20`,
                          border: `1px solid ${newCategory === cat.id ? cat.color : 'transparent'}`,
                        }}
                      >
                        <span className="text-xl block mb-1">{cat.emoji}</span>
                        <span className="text-white text-xs">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target */}
                <div className="mb-4">
                  <label className="text-white/50 text-xs font-medium mb-2 block">Цель</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center"
                    />
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="книг, дней, раз..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="mb-6">
                  <label className="text-white/50 text-xs font-medium mb-2 block">Дедлайн (необязательно)</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={addGoal}
                  disabled={!newTitle.trim()}
                  className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
                  }}
                >
                  Создать цель
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Button */}
        {!showAddForm && (
          <div className="fixed bottom-24 left-4 right-4 z-40">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
              }}
            >
              <Plus size={20} />
              Добавить цель
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default GoalsTool;



