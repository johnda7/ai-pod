import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronRight, Calendar, Star, Heart, Lightbulb, Target, TrendingUp, Sparkles } from 'lucide-react';

/**
 * REFLECTION JOURNAL
 * Based on 4-H "Head, Heart, Hands, Health" model
 * Helps teenagers reflect on their learning and growth
 */

interface ReflectionJournalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

interface ReflectionEntry {
  id: string;
  date: string;
  type: 'daily' | 'weekly' | 'milestone';
  answers: {
    learned: string;      // Head - What did I learn?
    felt: string;         // Heart - How did I feel?
    did: string;          // Hands - What did I do?
    improved: string;     // Health - How did I improve?
  };
  mood: number;
  highlights: string[];
}

const REFLECTION_PROMPTS = {
  daily: {
    learned: 'Что нового я узнал сегодня?',
    felt: 'Какие эмоции я испытал?',
    did: 'Что полезного я сделал?',
    improved: 'Как я позаботился о себе?',
  },
  weekly: {
    learned: 'Главный урок этой недели?',
    felt: 'Как менялось моё настроение?',
    did: 'Какие цели я достиг?',
    improved: 'Что я хочу улучшить?',
  },
  milestone: {
    learned: 'Чему научил меня этот опыт?',
    felt: 'Что я чувствую, оглядываясь назад?',
    did: 'Что было самым сложным?',
    improved: 'Как я вырос?',
  },
};

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊'];

const HIGHLIGHT_OPTIONS = [
  { emoji: '🎯', label: 'Достиг цели' },
  { emoji: '📚', label: 'Узнал новое' },
  { emoji: '💪', label: 'Преодолел себя' },
  { emoji: '🤝', label: 'Помог другим' },
  { emoji: '🧘', label: 'Нашёл баланс' },
  { emoji: '⚡', label: 'Был продуктивен' },
];

export const ReflectionJournal: React.FC<ReflectionJournalProps> = ({ isOpen, onClose, onComplete }) => {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entryType, setEntryType] = useState<'daily' | 'weekly' | 'milestone'>('daily');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    learned: '',
    felt: '',
    did: '',
    improved: '',
  });
  const [mood, setMood] = useState(3);
  const [highlights, setHighlights] = useState<string[]>([]);

  // Load entries
  useEffect(() => {
    const saved = localStorage.getItem('reflection_journal');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save entries
  useEffect(() => {
    localStorage.setItem('reflection_journal', JSON.stringify(entries));
  }, [entries]);

  const prompts = REFLECTION_PROMPTS[entryType];
  const steps = ['learned', 'felt', 'did', 'improved', 'mood', 'highlights'];

  const saveEntry = () => {
    const newEntry: ReflectionEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: entryType,
      answers,
      mood,
      highlights,
    };
    
    setEntries([newEntry, ...entries]);
    resetForm();
    onComplete(25); // XP for reflection
  };

  const resetForm = () => {
    setShowNewEntry(false);
    setCurrentStep(0);
    setAnswers({ learned: '', felt: '', did: '', improved: '' });
    setMood(3);
    setHighlights([]);
  };

  const toggleHighlight = (emoji: string) => {
    if (highlights.includes(emoji)) {
      setHighlights(highlights.filter(h => h !== emoji));
    } else {
      setHighlights([...highlights, emoji]);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const todayHasEntry = entries.some(e => {
    const entryDate = new Date(e.date).toDateString();
    return entryDate === new Date().toDateString();
  });

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
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-16 pb-4">
          <div 
            className="p-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.2) 100%)',
                  }}
                >
                  <span className="text-2xl">📔</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Дневник рефлексии</h1>
                  <p className="text-white/50 text-xs">{entries.length} записей</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-160px)]">
          {!showNewEntry ? (
            <>
              {/* Today's Status */}
              {!todayHasEntry && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 100%)',
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-purple-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">Время для рефлексии!</p>
                      <p className="text-white/50 text-xs">Запиши свои мысли о сегодняшнем дне</p>
                    </div>
                    <button
                      onClick={() => setShowNewEntry(true)}
                      className="px-4 py-2 rounded-xl font-medium text-white text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      }}
                    >
                      Начать
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Entries List */}
              {entries.length === 0 ? (
                <div 
                  className="rounded-3xl p-6 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span className="text-5xl mb-4 block">📔</span>
                  <h3 className="text-white font-bold text-lg mb-2">Начни свой дневник</h3>
                  <p className="text-white/40 text-sm">
                    Рефлексия помогает лучше понять себя и расти
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-2xl p-4"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-white/40" />
                          <span className="text-white/60 text-sm">{formatDate(entry.date)}</span>
                        </div>
                        <span className="text-2xl">{MOOD_EMOJIS[entry.mood]}</span>
                      </div>
                      
                      {entry.answers.learned && (
                        <p className="text-white/80 text-sm mb-2 line-clamp-2">
                          💡 {entry.answers.learned}
                        </p>
                      )}
                      
                      {entry.highlights.length > 0 && (
                        <div className="flex gap-1">
                          {entry.highlights.map((h, i) => (
                            <span key={i} className="text-lg">{h}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* New Entry Form */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Entry Type Selection */}
              {currentStep === 0 && (
                <div className="mb-6">
                  <h3 className="text-white/60 text-sm mb-3">Тип записи</h3>
                  <div className="flex gap-2">
                    {[
                      { id: 'daily', label: 'День', emoji: '☀️' },
                      { id: 'weekly', label: 'Неделя', emoji: '📅' },
                      { id: 'milestone', label: 'Веха', emoji: '🏆' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setEntryType(type.id as typeof entryType)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          entryType === type.id 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/5 text-white/50'
                        }`}
                      >
                        <span>{type.emoji}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="flex gap-1 mb-6">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`flex-1 h-1 rounded-full ${
                      i <= currentStep ? 'bg-purple-500' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Questions */}
              {currentStep < 4 && (
                <div>
                  <h2 className="text-white font-bold text-xl mb-4">
                    {currentStep === 0 && '🧠 ' + prompts.learned}
                    {currentStep === 1 && '💜 ' + prompts.felt}
                    {currentStep === 2 && '🤲 ' + prompts.did}
                    {currentStep === 3 && '🌱 ' + prompts.improved}
                  </h2>
                  
                  <textarea
                    value={answers[steps[currentStep] as keyof typeof answers] || ''}
                    onChange={(e) => setAnswers({
                      ...answers,
                      [steps[currentStep]]: e.target.value,
                    })}
                    placeholder="Напиши свои мысли..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 resize-none"
                    autoFocus
                  />
                </div>
              )}

              {/* Mood Selection */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-white font-bold text-xl mb-6 text-center">
                    Как ты себя чувствуешь?
                  </h2>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    {MOOD_EMOJIS.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => setMood(i)}
                        className={`w-14 h-14 rounded-2xl text-3xl transition-all ${
                          mood === i 
                            ? 'bg-purple-500/30 ring-2 ring-purple-500 scale-110' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-white font-bold text-xl mb-4 text-center">
                    Что было особенным?
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {HIGHLIGHT_OPTIONS.map((option) => (
                      <button
                        key={option.emoji}
                        onClick={() => toggleHighlight(option.emoji)}
                        className={`p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                          highlights.includes(option.emoji)
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                        style={{ border: '1px solid' }}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-white/70 text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (currentStep === 0) {
                      resetForm();
                    } else {
                      setCurrentStep(currentStep - 1);
                    }
                  }}
                  className="flex-1 py-4 rounded-2xl font-medium text-white bg-white/10"
                >
                  {currentStep === 0 ? 'Отмена' : 'Назад'}
                </button>
                <button
                  onClick={() => {
                    if (currentStep === 5) {
                      saveEntry();
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  className="flex-1 py-4 rounded-2xl font-medium text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  }}
                >
                  {currentStep === 5 ? 'Сохранить' : 'Далее'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Button */}
        {!showNewEntry && !todayHasEntry && entries.length > 0 && (
          <div className="fixed bottom-24 left-4 right-4 z-40">
            <button
              onClick={() => setShowNewEntry(true)}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              }}
            >
              <Plus size={20} />
              Новая запись
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ReflectionJournal;



