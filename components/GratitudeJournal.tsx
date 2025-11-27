import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, Plus, X, Check, Calendar, 
  Smile, Meh, Frown, Sun, Cloud, CloudRain,
  Star, Send, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad';
  gratitude: string[];
  wins: string[];
}

interface GratitudeJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOODS = [
  { id: 'great', icon: Sun, label: 'Отлично', color: 'from-yellow-400 to-orange-400', emoji: '😊' },
  { id: 'good', icon: Smile, label: 'Хорошо', color: 'from-green-400 to-emerald-400', emoji: '🙂' },
  { id: 'okay', icon: Cloud, label: 'Нормально', color: 'from-blue-400 to-cyan-400', emoji: '😐' },
  { id: 'bad', icon: CloudRain, label: 'Не очень', color: 'from-slate-400 to-slate-500', emoji: '😔' },
];

export const GratitudeJournal: React.FC<GratitudeJournalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'new' | 'view'>('list');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // New entry state
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);
  const [winItems, setWinItems] = useState<string[]>(['']);

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gratitude_journal');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, [isOpen]);

  // Save entries
  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('gratitude_journal', JSON.stringify(newEntries));
  };

  // Check if today's entry exists
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);

  // Save new entry
  const handleSaveEntry = () => {
    if (!selectedMood) return;
    
    const filteredGratitude = gratitudeItems.filter(g => g.trim());
    const filteredWins = winItems.filter(w => w.trim());
    
    if (filteredGratitude.length === 0) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: today,
      mood: selectedMood as JournalEntry['mood'],
      gratitude: filteredGratitude,
      wins: filteredWins,
    };

    // Replace today's entry or add new
    const filtered = entries.filter(e => e.date !== today);
    saveEntries([newEntry, ...filtered]);
    
    // Reset and go back
    setSelectedMood(null);
    setGratitudeItems(['', '', '']);
    setWinItems(['']);
    setCurrentView('list');
  };

  // Delete entry
  const handleDeleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
    setSelectedEntry(null);
    setCurrentView('list');
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('ru-RU', options);
  };

  // Get streak
  const getStreak = () => {
    let streak = 0;
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-[90] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <motion.div 
        className="relative w-full max-w-lg h-[85vh] rounded-t-[2rem] overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 px-5 pt-4 pb-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            {currentView !== 'list' && (
              <button 
                onClick={() => { setCurrentView('list'); setSelectedEntry(null); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-white font-bold text-lg">
                {currentView === 'new' ? 'Новая запись' : currentView === 'view' ? formatDate(selectedEntry?.date || '') : 'Дневник'}
              </h2>
              <p className="text-white/50 text-xs">Техника «Я молодец!» от Кати</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto pb-32 px-5">
          <AnimatePresence mode="wait">
            {/* LIST VIEW */}
            {currentView === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="pt-4"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div 
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.05) 100%)',
                      border: '1px solid rgba(234,179,8,0.2)',
                    }}
                  >
                    <div className="text-3xl font-bold text-yellow-400">{getStreak()}</div>
                    <div className="text-white/50 text-xs">Дней подряд 🔥</div>
                  </div>
                  <div 
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)',
                      border: '1px solid rgba(168,85,247,0.2)',
                    }}
                  >
                    <div className="text-3xl font-bold text-purple-400">{entries.length}</div>
                    <div className="text-white/50 text-xs">Всего записей</div>
                  </div>
                </div>

                {/* Today's entry or create button */}
                {!todayEntry ? (
                  <button
                    onClick={() => setCurrentView('new')}
                    className="w-full p-5 rounded-2xl mb-6 flex items-center gap-4 transition-all active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Plus size={24} className="text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold">Записать сегодня</div>
                      <div className="text-indigo-300 text-sm">За что ты благодарен?</div>
                    </div>
                    <Sparkles className="ml-auto text-indigo-400" size={20} />
                  </button>
                ) : (
                  <div 
                    className="p-4 rounded-2xl mb-6 border border-green-500/30 bg-green-500/10"
                  >
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <Check size={16} />
                      Сегодня уже записано! Молодец 🎉
                    </div>
                  </div>
                )}

                {/* Past entries */}
                <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">История</h3>
                <div className="space-y-3">
                  {entries.length === 0 ? (
                    <div className="text-center py-8 text-white/30">
                      <Heart size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Пока нет записей</p>
                      <p className="text-sm">Начни вести дневник!</p>
                    </div>
                  ) : (
                    entries.map((entry) => {
                      const mood = MOODS.find(m => m.id === entry.mood);
                      return (
                        <button
                          key={entry.id}
                          onClick={() => { setSelectedEntry(entry); setCurrentView('view'); }}
                          className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/5 active:scale-[0.98] text-left"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mood?.color} flex items-center justify-center text-xl`}>
                            {mood?.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">{formatDate(entry.date)}</div>
                            <div className="text-white/50 text-sm truncate">
                              {entry.gratitude[0]}...
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-white/30" />
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* NEW ENTRY VIEW */}
            {currentView === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="pt-4 space-y-6"
              >
                {/* Mood selector */}
                <div>
                  <h3 className="text-white font-medium mb-3">Как ты себя чувствуешь?</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          selectedMood === mood.id ? 'ring-2 ring-white/50 scale-105' : ''
                        }`}
                        style={{
                          background: selectedMood === mood.id 
                            ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                            : 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-white/70 text-xs">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gratitude */}
                <div>
                  <h3 className="text-white font-medium mb-1">За что ты благодарен сегодня?</h3>
                  <p className="text-white/50 text-sm mb-3">Напиши 3 вещи, даже самые маленькие</p>
                  <div className="space-y-2">
                    {gratitudeItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...gratitudeItems];
                            newItems[idx] = e.target.value;
                            setGratitudeItems(newItems);
                          }}
                          placeholder="Например: хорошая погода"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wins - "Я молодец" */}
                <div>
                  <h3 className="text-white font-medium mb-1">За что ты сегодня молодец? ⭐</h3>
                  <p className="text-white/50 text-sm mb-3">Техника Кати: запиши свои победы</p>
                  <div className="space-y-2">
                    {winItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-400" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...winItems];
                            newItems[idx] = e.target.value;
                            setWinItems(newItems);
                          }}
                          placeholder="Я молодец, потому что..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setWinItems([...winItems, ''])}
                      className="text-indigo-400 text-sm flex items-center gap-1 hover:text-indigo-300"
                    >
                      <Plus size={14} /> Добавить ещё
                    </button>
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSaveEntry}
                  disabled={!selectedMood || gratitudeItems.filter(g => g.trim()).length === 0}
                  className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.9) 100%)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  <Send size={18} />
                  Сохранить запись
                </button>
              </motion.div>
            )}

            {/* VIEW ENTRY */}
            {currentView === 'view' && selectedEntry && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="pt-4 space-y-6"
              >
                {/* Mood */}
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${MOODS.find(m => m.id === selectedEntry.mood)?.color} flex items-center justify-center text-4xl mb-3`}>
                    {MOODS.find(m => m.id === selectedEntry.mood)?.emoji}
                  </div>
                  <div className="text-white/50 text-sm">
                    {MOODS.find(m => m.id === selectedEntry.mood)?.label}
                  </div>
                </div>

                {/* Gratitude */}
                <div 
                  className="p-4 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Heart size={14} className="text-pink-400" />
                    Благодарности
                  </h3>
                  <ul className="space-y-2">
                    {selectedEntry.gratitude.map((g, idx) => (
                      <li key={idx} className="text-white flex items-start gap-2">
                        <span className="text-indigo-400">{idx + 1}.</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Wins */}
                {selectedEntry.wins.length > 0 && (
                  <div 
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'rgba(234,179,8,0.1)',
                      border: '1px solid rgba(234,179,8,0.2)',
                    }}
                  >
                    <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Star size={14} className="text-yellow-400" />
                      Я молодец
                    </h3>
                    <ul className="space-y-2">
                      {selectedEntry.wins.map((w, idx) => (
                        <li key={idx} className="text-white flex items-start gap-2">
                          <Star size={14} className="text-yellow-400 mt-1 flex-shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  className="w-full py-3 rounded-xl text-red-400 text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Удалить запись
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};



