import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Trash2, Calendar, Clock, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface PlannerToolProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  date: string;
  time?: string;
  createdAt: number;
}

const PRIORITY_COLORS = {
  low: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#22c55e', label: 'Лёгкая' },
  medium: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', label: 'Средняя' },
  high: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', label: 'Важная' },
};

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export const PlannerTool: React.FC<PlannerToolProps> = ({ isOpen, onClose, onComplete }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'list' | 'calendar'>('list');

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('planner_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority: selectedPriority,
      date: selectedDate,
      time: selectedTime || undefined,
      createdAt: Date.now(),
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setSelectedTime('');
    setShowAddForm(false);
    
    // Award XP for adding task
    onComplete(5);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        if (newCompleted) {
          onComplete(10); // Award XP for completing
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.date === date);
  };

  const todayTasks = getTasksForDate(new Date().toISOString().split('T')[0]);
  const completedToday = todayTasks.filter(t => t.completed).length;

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];
    
    // Add empty cells for days before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    
    return days;
  };

  const formatDateForCalendar = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-${String(day).padStart(2, '0')}`;
  };

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
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-8 pb-4">
          <div 
            className="p-4 rounded-3xl flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.2) 100%)',
                }}
              >
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Планировщик</h1>
                <p className="text-white/50 text-xs">
                  {completedToday}/{todayTasks.length} на сегодня
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
        </div>

        {/* View Toggle */}
        <div className="px-4 mb-4">
          <div 
            className="flex p-1 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {[
              { id: 'list', label: 'Список', icon: '📋' },
              { id: 'calendar', label: 'Календарь', icon: '📅' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id as 'list' | 'calendar')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  view === v.id 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'text-white/50'
                }`}
              >
                <span>{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-200px)]">
          {view === 'list' ? (
            <>
              {/* Today's Tasks */}
              <div className="mb-6">
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Star size={12} /> Сегодня
                </h3>
                
                {todayTasks.length === 0 ? (
                  <div 
                    className="rounded-2xl p-6 text-center"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span className="text-4xl mb-3 block">🌟</span>
                    <p className="text-white/40 text-sm">Нет задач на сегодня</p>
                    <p className="text-white/30 text-xs mt-1">Добавь первую задачу!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{
                          background: task.completed 
                            ? 'rgba(34,197,94,0.1)' 
                            : PRIORITY_COLORS[task.priority].bg,
                          border: `1px solid ${task.completed ? 'rgba(34,197,94,0.3)' : PRIORITY_COLORS[task.priority].border}`,
                        }}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            task.completed 
                              ? 'bg-green-500' 
                              : 'bg-white/10 border border-white/20'
                          }`}
                        >
                          {task.completed && <Check size={14} className="text-white" />}
                        </button>
                        
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${task.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                            {task.text}
                          </p>
                          {task.time && (
                            <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                              <Clock size={10} /> {task.time}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} className="text-white/40" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Tasks */}
              {tasks.filter(t => t.date !== new Date().toISOString().split('T')[0]).length > 0 && (
                <div>
                  <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar size={12} /> Другие дни
                  </h3>
                  <div className="space-y-2">
                    {tasks
                      .filter(t => t.date !== new Date().toISOString().split('T')[0])
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((task) => (
                        <motion.div
                          key={task.id}
                          className="rounded-2xl p-4 flex items-center gap-3"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-green-500' 
                                : 'bg-white/10 border border-white/20'
                            }`}
                          >
                            {task.completed && <Check size={14} className="text-white" />}
                          </button>
                          
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${task.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                              {task.text}
                            </p>
                            <p className="text-white/30 text-xs mt-1">
                              {new Date(task.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              {task.time && ` в ${task.time}`}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} className="text-white/40" />
                          </button>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Calendar View */
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
                >
                  <ChevronLeft size={20} className="text-white/50" />
                </button>
                
                <h3 className="text-white font-bold">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
                >
                  <ChevronRight size={20} className="text-white/50" />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-white/30 text-xs font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, i) => {
                  if (!day) return <div key={i} />;
                  
                  const dateStr = formatDateForCalendar(day);
                  const dayTasks = getTasksForDate(dateStr);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                        isSelected 
                          ? 'bg-green-500/30 border border-green-500/50' 
                          : isToday 
                            ? 'bg-white/10 border border-white/20' 
                            : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className={`text-sm ${isSelected || isToday ? 'text-white font-bold' : 'text-white/60'}`}>
                        {day}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {dayTasks.slice(0, 3).map((_, j) => (
                            <div 
                              key={j} 
                              className="w-1 h-1 rounded-full bg-green-400" 
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Date Tasks */}
              <div className="mt-6">
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                  {new Date(selectedDate).toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long',
                    weekday: 'long'
                  })}
                </h3>
                
                {getTasksForDate(selectedDate).length === 0 ? (
                  <div 
                    className="rounded-2xl p-4 text-center"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <p className="text-white/40 text-sm">Нет задач</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getTasksForDate(selectedDate).map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl p-3 flex items-center gap-3"
                        style={{
                          background: task.completed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${task.completed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            task.completed ? 'bg-green-500' : 'bg-white/10 border border-white/20'
                          }`}
                        >
                          {task.completed && <Check size={12} className="text-white" />}
                        </button>
                        <span className={`text-sm flex-1 ${task.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Task Button */}
        <div className="fixed bottom-24 left-4 right-4 z-40">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
              }}
            >
              <Plus size={20} />
              Добавить задачу
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Что нужно сделать?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm mb-3"
                autoFocus
              />
              
              {/* Priority */}
              <div className="flex gap-2 mb-3">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedPriority === p 
                        ? '' 
                        : 'opacity-50'
                    }`}
                    style={{
                      background: PRIORITY_COLORS[p].bg,
                      border: `1px solid ${PRIORITY_COLORS[p].border}`,
                      color: PRIORITY_COLORS[p].text,
                    }}
                  >
                    {PRIORITY_COLORS[p].label}
                  </button>
                ))}
              </div>
              
              {/* Date & Time */}
              <div className="flex gap-2 mb-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 font-medium text-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={addTask}
                  disabled={!newTaskText.trim()}
                  className="flex-1 py-3 rounded-xl font-medium text-sm text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  }}
                >
                  Добавить
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlannerTool;



