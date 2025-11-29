import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, Trash2, Edit3, Save, Tag, Clock, Sparkles, BookOpen, Cloud, CheckCircle } from 'lucide-react';
import { syncToolsDataToSupabase, loadToolsDataFromSupabase } from '../services/db';
import { getTelegramUser } from '../services/telegramService';

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
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
}

const NOTE_COLORS = [
  { id: 'purple', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', accent: '#8b5cf6' },
  { id: 'blue', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', accent: '#3b82f6' },
  { id: 'green', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', accent: '#22c55e' },
  { id: 'amber', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', accent: '#f59e0b' },
  { id: 'pink', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', accent: '#ec4899' },
  { id: 'cyan', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', accent: '#06b6d4' },
];

const PROMPTS = [
  "Что тебя сегодня вдохновило?",
  "За что ты благодарен?",
  "Какая мысль не даёт покоя?",
  "Что ты узнал нового?",
  "О чём ты мечтаешь?",
  "Что тебя беспокоит?",
];

export const NotesTool: React.FC<NotesToolProps> = ({ isOpen, onClose, onComplete }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Editor state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('purple');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Load notes
  useEffect(() => {
    const loadData = async () => {
      const saved = localStorage.getItem('notes_journal');
      if (saved) setNotes(JSON.parse(saved));
      
      const tgUser = getTelegramUser();
      if (tgUser?.id) {
        await loadToolsDataFromSupabase(tgUser.id.toString());
        const fresh = localStorage.getItem('notes_journal');
        if (fresh) setNotes(JSON.parse(fresh));
      }
    };
    loadData();
  }, []);

  // Save notes with Supabase sync
  useEffect(() => {
    if (notes.length === 0) return;
    localStorage.setItem('notes_journal', JSON.stringify(notes));
    
    const syncToCloud = async () => {
      const tgUser = getTelegramUser();
      if (tgUser?.id) {
        setSyncStatus('syncing');
        const success = await syncToolsDataToSupabase(tgUser.id.toString());
        setSyncStatus(success ? 'synced' : 'idle');
        if (success) setTimeout(() => setSyncStatus('idle'), 2000);
      }
    };
    const timeoutId = setTimeout(syncToCloud, 1000);
    return () => clearTimeout(timeoutId);
  }, [notes]);

  const saveNote = () => {
    if (!noteContent.trim()) return;
    
    const color = NOTE_COLORS.find(c => c.id === noteColor) || NOTE_COLORS[0];
    
    if (editingNote) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { 
              ...note, 
              title: noteTitle.trim() || 'Без названия',
              content: noteContent.trim(),
              tags: noteTags,
              color: noteColor,
              updatedAt: Date.now(),
            }
          : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteTitle.trim() || 'Без названия',
        content: noteContent.trim(),
        tags: noteTags,
        color: noteColor,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };
      setNotes([newNote, ...notes]);
      onComplete(10);
    }
    
    resetEditor();
  };

  const resetEditor = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteColor('purple');
    setNoteTags([]);
    setNewTag('');
    setEditingNote(null);
    setShowEditor(false);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setNoteTags(note.tags);
    setShowEditor(true);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
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

  const usePrompt = (prompt: string) => {
    setNoteContent(prompt + '\n\n');
    setShowEditor(true);
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
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
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-4 pb-4">
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
                  <p className="text-white/50 text-xs">{notes.length} записей</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по заметкам..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-200px)]">
          {notes.length === 0 && !showEditor ? (
            <>
              {/* Empty State */}
              <div 
                className="rounded-3xl p-6 text-center mb-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-5xl mb-4 block">📝</span>
                <h3 className="text-white font-bold text-lg mb-2">Твой личный дневник</h3>
                <p className="text-white/40 text-sm">
                  Записывай мысли, идеи и всё важное
                </p>
              </div>

              {/* Prompts */}
              <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={12} /> Идеи для записей
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => usePrompt(prompt)}
                    className="rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                    style={{
                      background: NOTE_COLORS[i % NOTE_COLORS.length].bg,
                      border: `1px solid ${NOTE_COLORS[i % NOTE_COLORS.length].border}`,
                    }}
                  >
                    <span className="text-white/80 text-sm">{prompt}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Notes Grid */
            <div className="grid grid-cols-2 gap-3">
              {filteredNotes.map((note) => {
                const color = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
                
                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => editNote(note)}
                    className="rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden"
                    style={{
                      background: color.bg,
                      border: `1px solid ${color.border}`,
                      minHeight: '140px',
                    }}
                  >
                    {note.isPinned && (
                      <div className="absolute top-2 right-2 text-xs">📌</div>
                    )}
                    
                    <h4 className="text-white font-bold text-sm mb-2 line-clamp-1">
                      {note.title}
                    </h4>
                    
                    <p className="text-white/60 text-xs line-clamp-4 mb-3">
                      {note.content}
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
        </div>

        {/* Editor */}
        <AnimatePresence>
          {showEditor && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-0 z-50 bg-[#020617] overflow-y-auto"
            >
              <div className="px-4 pt-20 pb-8">
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
                      <button
                        onClick={() => {
                          deleteNote(editingNote.id);
                          resetEditor();
                        }}
                        className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"
                      >
                        <Trash2 size={18} className="text-red-400" />
                      </button>
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

                {/* Color Picker */}
                <div className="flex gap-2 mb-4">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setNoteColor(color.id)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        noteColor === color.id ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ background: color.accent }}
                    />
                  ))}
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Заголовок"
                  className="w-full bg-transparent text-white text-xl font-bold placeholder-white/30 mb-4 outline-none"
                />

                {/* Content */}
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Начни писать..."
                  className="w-full bg-transparent text-white/80 placeholder-white/30 outline-none resize-none min-h-[300px]"
                  autoFocus
                />

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

        {/* Add Button */}
        {!showEditor && (
          <div className="fixed bottom-24 left-4 right-4 z-40">
            <button
              onClick={() => setShowEditor(true)}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
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



