import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Search, Trash2, Save, Tag, Clock, Sparkles, 
  Pin, Star, Filter, ChevronDown, Bold, Italic, List, 
  CheckSquare, Quote, Hash, Smile, Flame, Award, Target,
  BookOpen, Lightbulb, Brain, ListTodo, GraduationCap,
  Calendar, TrendingUp, Zap
} from 'lucide-react';
import { useSyncTool } from '../hooks/useSyncTool';

interface NotesToolProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  category: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isFavorite: boolean;
  template?: string;
}

interface NotesStats {
  totalNotes: number;
  streak: number;
  lastNoteDate: string;
  totalXP: number;
  notesToday: number;
}

// 🎨 Расширенная цветовая палитра
const NOTE_COLORS = [
  { id: 'purple', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', accent: '#8b5cf6', name: 'Идеи' },
  { id: 'blue', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', accent: '#3b82f6', name: 'Учёба' },
  { id: 'green', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', accent: '#22c55e', name: 'Цели' },
  { id: 'amber', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', accent: '#f59e0b', name: 'Задачи' },
  { id: 'pink', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', accent: '#ec4899', name: 'Дневник' },
  { id: 'cyan', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', accent: '#06b6d4', name: 'Списки' },
  { id: 'slate', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', accent: '#94a3b8', name: 'Разное' },
  { id: 'red', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', accent: '#ef4444', name: 'Важно' },
];

// 📋 Шаблоны для подростков
const TEMPLATES = [
  {
    id: 'idea',
    name: 'Быстрая идея',
    emoji: '💡',
    icon: Lightbulb,
    color: 'purple',
    content: `💡 ИДЕЯ\n\n[Твоя идея здесь]\n\nПочему это круто:\n- \n\nЧто нужно чтобы реализовать:\n- `,
  },
  {
    id: 'goal',
    name: 'Цель',
    emoji: '🎯',
    icon: Target,
    color: 'green',
    content: `🎯 ЦЕЛЬ\n\nЧто хочу: \nКогда: \nПочему важно: \n\nПервый шаг:`,
  },
  {
    id: 'journal',
    name: 'Дневник',
    emoji: '📔',
    icon: BookOpen,
    color: 'pink',
    content: `📔 ДНЕВНИК • ${new Date().toLocaleDateString('ru-RU')}\n\nНастроение: \n\nЧто произошло:\n\n\nЧто понял:\n\n\nЗа что благодарен:`,
  },
  {
    id: 'todo',
    name: 'Список дел',
    emoji: '✅',
    icon: ListTodo,
    color: 'amber',
    content: `✅ СПИСОК ДЕЛ\n\nСрочно:\n☐ \n\nВажно:\n☐ \n\nХорошо бы:\n☐ `,
  },
  {
    id: 'study',
    name: 'Конспект',
    emoji: '📚',
    icon: GraduationCap,
    color: 'blue',
    content: `📚 КОНСПЕКТ\n\nТема: \nДата: ${new Date().toLocaleDateString('ru-RU')}\n\nГлавное:\n\n\nЗапомнить:\n\n\nВопросы:`,
  },
  {
    id: 'braindump',
    name: 'Выгрузка мыслей',
    emoji: '💭',
    icon: Brain,
    color: 'cyan',
    content: `💭 ВЫГРУЗКА МЫСЛЕЙ\n\nВсё что в голове:\n\n\n\n---\nЧто из этого важно:`,
  },
];

// 😊 Эмодзи для быстрого выбора
const QUICK_EMOJIS = ['💡', '🎯', '📔', '✅', '📚', '💭', '🔥', '⭐', '❤️', '🚀', '💪', '🧠', '✨', '🎨', '🎵', '💬'];

// 🎯 Фильтры
const FILTERS = [
  { id: 'all', name: 'Все', icon: List },
  { id: 'pinned', name: 'Закреплённые', icon: Pin },
  { id: 'favorites', name: 'Избранные', icon: Star },
  { id: 'recent', name: 'Недавние', icon: Clock },
];

export const NotesTool: React.FC<NotesToolProps> = ({ isOpen, onClose, onComplete }) => {
  // 🔄 Синхронизация заметок
  const { data: notes, setData: setNotes } = useSyncTool<Note[]>([], {
    storageKey: 'notes_journal_v2',
    debounceMs: 1000
  });
  
  // 📊 Статистика
  const { data: stats, setData: setStats } = useSyncTool<NotesStats>({
    totalNotes: 0,
    streak: 0,
    lastNoteDate: '',
    totalXP: 0,
    notesToday: 0,
  }, {
    storageKey: 'notes_stats',
    debounceMs: 500
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  
  // Editor state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('purple');
  const [noteEmoji, setNoteEmoji] = useState('📝');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // 📅 Проверка streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (stats.lastNoteDate && stats.lastNoteDate !== today) {
      const lastDate = new Date(stats.lastNoteDate);
      const daysDiff = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        // Streak потерян
        setStats(prev => ({ ...prev, streak: 0 }));
      }
    }
  }, [stats.lastNoteDate]);

  // 🎮 Начисление XP
  const awardXP = useCallback((amount: number, reason: string) => {
    setEarnedXP(amount);
    setShowXPAnimation(true);
    setStats(prev => ({ ...prev, totalXP: prev.totalXP + amount }));
    onComplete(amount);
    
    setTimeout(() => setShowXPAnimation(false), 2000);
  }, [onComplete, setStats]);

  // 💾 Сохранение заметки
  const saveNote = useCallback(() => {
    if (!noteContent.trim()) return;
    
    const today = new Date().toDateString();
    const isFirstNoteToday = stats.lastNoteDate !== today;
    
    if (editingNote) {
      // Обновление существующей заметки
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { 
              ...note, 
              title: noteTitle.trim() || 'Без названия',
              content: noteContent.trim(),
              tags: noteTags,
              color: noteColor,
              emoji: noteEmoji,
              updatedAt: Date.now(),
            }
          : note
      ));
    } else {
      // Создание новой заметки
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteTitle.trim() || 'Без названия',
        content: noteContent.trim(),
        tags: noteTags,
        color: noteColor,
        category: noteColor,
        emoji: noteEmoji,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
        isFavorite: false,
      };
      setNotes([newNote, ...notes]);
      
      // 🎮 Геймификация
      let xpEarned = 5; // Базовый XP за заметку
      
      // Первая заметка за день
      if (isFirstNoteToday) {
        xpEarned += 10;
        const newStreak = stats.streak + 1;
        
        setStats(prev => ({
          ...prev,
          streak: newStreak,
          lastNoteDate: today,
          notesToday: 1,
          totalNotes: prev.totalNotes + 1,
        }));
        
        // Бонус за streak milestones
        if (newStreak === 7) xpEarned += 30;
        if (newStreak === 30) xpEarned += 100;
        if (newStreak === 100) xpEarned += 300;
      } else {
        setStats(prev => ({
          ...prev,
          notesToday: prev.notesToday + 1,
          totalNotes: prev.totalNotes + 1,
        }));
      }
      
      // Бонус за milestones количества заметок
      const totalNotes = stats.totalNotes + 1;
      if (totalNotes === 10) xpEarned += 20;
      if (totalNotes === 50) xpEarned += 50;
      if (totalNotes === 100) xpEarned += 100;
      
      awardXP(xpEarned, 'Новая заметка');
    }
    
    resetEditor();
  }, [noteContent, noteTitle, noteTags, noteColor, noteEmoji, editingNote, notes, stats, setNotes, setStats, awardXP]);

  const resetEditor = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteColor('purple');
    setNoteEmoji('📝');
    setNoteTags([]);
    setNewTag('');
    setEditingNote(null);
    setShowEditor(false);
    setShowMarkdownPreview(false);
    setShowEmojiPicker(false);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setNoteEmoji(note.emoji || '📝');
    setNoteTags(note.tags);
    setShowEditor(true);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    setStats(prev => ({ ...prev, totalNotes: Math.max(0, prev.totalNotes - 1) }));
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const toggleFavorite = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const addTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags([...noteTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNoteTags(noteTags.filter(t => t !== tag));
  };

  const useTemplate = (template: typeof TEMPLATES[0]) => {
    setNoteContent(template.content);
    setNoteColor(template.color);
    setNoteEmoji(template.emoji);
    setNoteTitle(template.name);
    setShowTemplates(false);
    setShowEditor(true);
  };

  const insertFormatting = (format: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = noteContent;
    
    let newText = '';
    switch (format) {
      case 'bold':
        newText = text.slice(0, start) + '**' + text.slice(start, end) + '**' + text.slice(end);
        break;
      case 'italic':
        newText = text.slice(0, start) + '*' + text.slice(start, end) + '*' + text.slice(end);
        break;
      case 'list':
        newText = text.slice(0, start) + '\n- ' + text.slice(start);
        break;
      case 'checkbox':
        newText = text.slice(0, start) + '\n☐ ' + text.slice(start);
        break;
      case 'quote':
        newText = text.slice(0, start) + '\n> ' + text.slice(start);
        break;
      case 'heading':
        newText = text.slice(0, start) + '\n## ' + text.slice(start);
        break;
      default:
        return;
    }
    setNoteContent(newText);
  };

  // 🔍 Фильтрация заметок
  const filteredNotes = useMemo(() => {
    let result = [...notes];
    
    // Применяем фильтр
    switch (activeFilter) {
      case 'pinned':
        result = result.filter(n => n.isPinned);
        break;
      case 'favorites':
        result = result.filter(n => n.isFavorite);
        break;
      case 'recent':
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        result = result.filter(n => n.updatedAt > weekAgo);
        break;
    }
    
    // Применяем поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Сортировка: закреплённые сверху, потом по дате
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, searchQuery, activeFilter]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  // 📝 Простой Markdown рендеринг
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-3 mb-1">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-2 mb-1">$1</h3>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^☐ (.*$)/gm, '<div class="flex items-center gap-2 ml-2"><span class="opacity-50">☐</span> $1</div>')
      .replace(/^☑ (.*$)/gm, '<div class="flex items-center gap-2 ml-2"><span class="text-green-400">☑</span> <s class="opacity-50">$1</s></div>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-white/20 pl-3 italic opacity-70">$1</blockquote>')
      .replace(/\n/g, '<br/>');
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px]" />
        </div>

        {/* XP Animation */}
        <AnimatePresence>
          {showXPAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(168,85,247,0.9) 100%)',
                boxShadow: '0 8px 32px rgba(139,92,246,0.5)',
              }}
            >
              <div className="flex items-center gap-2 text-white font-bold">
                <Zap size={20} className="text-yellow-300" />
                +{earnedXP} XP
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-4 pb-3">
          <div 
            className="p-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.2) 100%)',
                  }}
                >
                  <span className="text-2xl">📓</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Заметки</h1>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-white/50">{notes.length} записей</span>
                    {stats.streak > 0 && (
                      <span className="flex items-center gap-1 text-orange-400">
                        <Flame size={12} /> {stats.streak} дн
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Stats Badge */}
                <div 
                  className="px-3 py-1.5 rounded-xl flex items-center gap-2"
                  style={{ background: 'rgba(139,92,246,0.2)' }}
                >
                  <Award size={14} className="text-purple-400" />
                  <span className="text-white/80 text-sm font-medium">{stats.totalXP}</span>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по заметкам..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm"
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors ${
                  activeFilter !== 'all' ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/50'
                }`}
              >
                <Filter size={16} />
                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex gap-2 flex-wrap"
                >
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setActiveFilter(filter.id);
                        setShowFilters(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                        activeFilter === filter.id
                          ? 'bg-purple-500/30 text-purple-300'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <filter.icon size={12} />
                      {filter.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-200px)]">
          {notes.length === 0 && !showEditor && !showTemplates ? (
            <>
              {/* Empty State */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-6 text-center mb-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-5xl mb-4 block">📝</span>
                <h3 className="text-white font-bold text-lg mb-2">Твой личный дневник</h3>
                <p className="text-white/40 text-sm mb-4">
                  Записывай мысли, идеи, цели и всё важное
                </p>
                
                {/* Streak Motivation */}
                <div className="flex items-center justify-center gap-2 text-orange-400 text-sm">
                  <Flame size={16} />
                  <span>Веди дневник каждый день и получай бонусы!</span>
                </div>
              </motion.div>

              {/* Templates */}
              <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={12} /> Начни с шаблона
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((template, i) => (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => useTemplate(template)}
                    className="rounded-2xl p-4 text-left transition-all active:scale-[0.98] relative overflow-hidden"
                    style={{
                      background: NOTE_COLORS.find(c => c.id === template.color)?.bg,
                      border: `1px solid ${NOTE_COLORS.find(c => c.id === template.color)?.border}`,
                    }}
                  >
                    <span className="text-2xl mb-2 block">{template.emoji}</span>
                    <span className="text-white font-medium text-sm">{template.name}</span>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            /* Notes Grid */
            <>
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-3">🔍</span>
                  <p className="text-white/40">Ничего не найдено</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredNotes.map((note, index) => {
                    const color = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
                    
                    return (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => editNote(note)}
                        className="rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden group"
                        style={{
                          background: color.bg,
                          border: `1px solid ${color.border}`,
                          minHeight: '140px',
                        }}
                      >
                        {/* Color accent line */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                          style={{ background: color.accent }}
                        />
                        
                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {note.isPinned && <span className="text-xs">📌</span>}
                          {note.isFavorite && <span className="text-xs">⭐</span>}
                        </div>
                        
                        {/* Emoji */}
                        <span className="text-lg mb-1 block">{note.emoji || '📝'}</span>
                        
                        <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">
                          {note.title}
                        </h4>
                        
                        <p className="text-white/60 text-xs line-clamp-3 mb-3">
                          {note.content.replace(/[#*☐☑>\[\]]/g, '').slice(0, 100)}
                        </p>
                        
                        <div className="absolute bottom-3 left-4 right-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white/30 text-[10px] flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(note.updatedAt)}
                            </span>
                            
                            {note.tags.length > 0 && (
                              <span 
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ background: color.accent + '30', color: color.accent }}
                              >
                                #{note.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Templates Modal */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 flex items-end"
              onClick={() => setShowTemplates(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-h-[70vh] bg-[#1a1a2e] rounded-t-3xl p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">Выбери шаблон</h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => useTemplate(template)}
                      className="rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                      style={{
                        background: NOTE_COLORS.find(c => c.id === template.color)?.bg,
                        border: `1px solid ${NOTE_COLORS.find(c => c.id === template.color)?.border}`,
                      }}
                    >
                      <span className="text-2xl mb-2 block">{template.emoji}</span>
                      <span className="text-white font-medium text-sm">{template.name}</span>
                    </button>
                  ))}
                </div>
                
                {/* Quick note without template */}
                <button
                  onClick={() => {
                    setShowTemplates(false);
                    setShowEditor(true);
                  }}
                  className="w-full mt-4 py-3 rounded-xl bg-white/5 text-white/60 text-sm"
                >
                  Или начни с чистого листа
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor */}
        <AnimatePresence>
          {showEditor && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-0 z-50 bg-[#020617] overflow-y-auto"
            >
              <div className="px-4 pt-4 pb-8">
                {/* Editor Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={resetEditor}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
                  >
                    <X size={20} className="text-white" />
                  </button>
                  
                  <div className="flex gap-2">
                    {editingNote && (
                      <>
                        <button
                          onClick={() => togglePin(editingNote.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            editingNote.isPinned ? 'bg-amber-500/20' : 'bg-white/10'
                          }`}
                        >
                          <Pin size={18} className={editingNote.isPinned ? 'text-amber-400' : 'text-white/50'} />
                        </button>
                        <button
                          onClick={() => toggleFavorite(editingNote.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            editingNote.isFavorite ? 'bg-yellow-500/20' : 'bg-white/10'
                          }`}
                        >
                          <Star size={18} className={editingNote.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-white/50'} />
                        </button>
                        <button
                          onClick={() => {
                            deleteNote(editingNote.id);
                            resetEditor();
                          }}
                          className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={saveNote}
                      disabled={!noteContent.trim()}
                      className="px-4 py-2 rounded-xl font-medium text-white flex items-center gap-2 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      }}
                    >
                      <Save size={16} />
                      Сохранить
                    </button>
                  </div>
                </div>

                {/* Color & Emoji Picker */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setNoteColor(color.id)}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          noteColor === color.id ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        style={{ background: color.accent }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl"
                  >
                    {noteEmoji}
                  </button>
                </div>

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex flex-wrap gap-2">
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setNoteEmoji(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-white/10 transition-colors ${
                              noteEmoji === emoji ? 'bg-white/20' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 mb-4 p-2 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
                  <button
                    onClick={() => insertFormatting('bold')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
                  >
                    <Bold size={16} className="text-white/50" />
                  </button>
                  <button
                    onClick={() => insertFormatting('italic')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
                  >
                    <Italic size={16} className="text-white/50" />
                  </button>
                  <button
                    onClick={() => insertFormatting('heading')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
                  >
                    <Hash size={16} className="text-white/50" />
                  </button>
                  <button
                    onClick={() => insertFormatting('list')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
                  >
                    <List size={16} className="text-white/50" />
                  </button>
                  <button
                    onClick={() => insertFormatting('checkbox')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
                  >
                    <CheckSquare size={16} className="text-white/50" />
                  </button>
                  <button
                    onClick={() => insertFormatting('quote')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
                  >
                    <Quote size={16} className="text-white/50" />
                  </button>
                  
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  
                  <button
                    onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                    className={`px-3 h-8 rounded-lg flex items-center justify-center text-xs ${
                      showMarkdownPreview ? 'bg-purple-500/30 text-purple-300' : 'hover:bg-white/10 text-white/50'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Заголовок"
                  className="w-full bg-transparent text-white text-xl font-bold placeholder-white/30 mb-4 outline-none"
                />

                {/* Content / Preview */}
                {showMarkdownPreview ? (
                  <div 
                    className="w-full min-h-[300px] text-white/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(noteContent) }}
                  />
                ) : (
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Начни писать..."
                    className="w-full bg-transparent text-white/80 placeholder-white/30 outline-none resize-none min-h-[300px] leading-relaxed"
                    autoFocus
                  />
                )}

                {/* Tags */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={14} className="text-white/40" />
                    <span className="text-white/40 text-xs">Теги</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {noteTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg bg-white/10 text-white/70 text-sm flex items-center gap-2"
                      >
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-white/40 hover:text-white">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Добавить тег..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions */}
        {!showEditor && (
          <div className="fixed bottom-24 left-4 right-4 z-40 flex gap-3">
            {/* Templates Button */}
            <button
              onClick={() => setShowTemplates(true)}
              className="flex-1 py-4 rounded-2xl font-medium text-white/80 flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Sparkles size={18} />
              Шаблоны
            </button>
            
            {/* New Note Button */}
            <button
              onClick={() => setShowEditor(true)}
              className="flex-[2] py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              }}
            >
              <Plus size={20} />
              Новая заметка
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotesTool;
