import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, X, Check, Volume2, VolumeX } from 'lucide-react';

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete?: (type: 'work' | 'break', duration: number) => void;
}

type TimerPhase = 'work' | 'shortBreak' | 'longBreak';
type TimerState = 'idle' | 'running' | 'paused';

interface TimerSettings {
  workDuration: number;      // в минутах
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

const PHASE_CONFIG = {
  work: {
    label: 'Фокус',
    emoji: '🧠',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    message: 'Время сосредоточиться',
  },
  shortBreak: {
    label: 'Перерыв',
    emoji: '☕',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-600',
    message: 'Отдохни немного',
  },
  longBreak: {
    label: 'Большой перерыв',
    emoji: '🌟',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    message: 'Ты молодец! Хороший отдых',
  },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
}) => {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Получить длительность текущей фазы
  const getPhaseDuration = useCallback((p: TimerPhase) => {
    switch (p) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  }, [settings]);

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Прогресс (0-1)
  const progress = 1 - (timeLeft / getPhaseDuration(phase));

  // Воспроизвести звук
  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  // Переключение фазы
  const switchPhase = useCallback(() => {
    playSound();
    
    if (phase === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      setTotalFocusTime(prev => prev + settings.workDuration);
      onSessionComplete?.('work', settings.workDuration);
      
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setPhase('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setPhase('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      onSessionComplete?.('break', phase === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration);
      setPhase('work');
      setTimeLeft(settings.workDuration * 60);
    }
    
    setState('idle');
  }, [phase, completedSessions, settings, playSound, onSessionComplete]);

  // Таймер
  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            switchPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, switchPhase]);

  // Управление
  const handleStart = () => setState('running');
  const handlePause = () => setState('paused');
  const handleReset = () => {
    setState('idle');
    setTimeLeft(getPhaseDuration(phase));
  };
  const handleSkip = () => switchPhase();

  // Загрузка статистики из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro_stats');
    if (saved) {
      const stats = JSON.parse(saved);
      setCompletedSessions(stats.sessions || 0);
      setTotalFocusTime(stats.totalTime || 0);
    }
  }, []);

  // Сохранение статистики
  useEffect(() => {
    localStorage.setItem('pomodoro_stats', JSON.stringify({
      sessions: completedSessions,
      totalTime: totalFocusTime,
    }));
  }, [completedSessions, totalFocusTime]);

  if (!isOpen) return null;

  const config = PHASE_CONFIG[phase];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${config.color}15 0%, #020617 50%, #0a0f1a 100%)`,
        }}
      />

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleWk4dJGhk4N6dnqQpJyQfXZtb3+JjIiDgH18gIWIiYmHhYKBgYSGh4eGhYSEhIWGhoaFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhQ==" type="audio/wav" />
      </audio>

      {/* Main Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.emoji}</span>
            <div>
              <h2 className="text-xl font-black text-white">{config.label}</h2>
              <p className="text-white/50 text-sm">{config.message}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-all hover:bg-white/20"
            >
              {soundEnabled ? (
                <Volume2 size={18} className="text-white/60" />
              ) : (
                <VolumeX size={18} className="text-white/40" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-all hover:bg-white/20"
            >
              <X size={18} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Background circle */}
          <svg className="w-64 h-64 -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke={config.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress)}
              style={{
                filter: `drop-shadow(0 0 10px ${config.color}80)`,
              }}
              initial={false}
              animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress) }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black text-white tabular-nums"
              style={{
                textShadow: `0 0 30px ${config.color}50`,
              }}
            >
              {formatTime(timeLeft)}
            </motion.span>
            
            {/* Session indicators */}
            <div className="flex gap-2 mt-4">
              {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < (completedSessions % settings.sessionsUntilLongBreak)
                      ? 'bg-gradient-to-br ' + config.gradient + ' shadow-lg'
                      : 'bg-white/20'
                  }`}
                  style={{
                    boxShadow: i < (completedSessions % settings.sessionsUntilLongBreak) 
                      ? `0 0 10px ${config.color}60` 
                      : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
          >
            <RotateCcw size={22} className="text-white/70" />
          </button>

          {/* Play/Pause */}
          <motion.button
            onClick={state === 'running' ? handlePause : handleStart}
            whileTap={{ scale: 0.95 }}
            className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all bg-gradient-to-br ${config.gradient}`}
            style={{
              boxShadow: `0 8px 30px ${config.color}50`,
            }}
          >
            {state === 'running' ? (
              <Pause size={32} className="text-white" fill="white" />
            ) : (
              <Play size={32} className="text-white ml-1" fill="white" />
            )}
          </motion.button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
          >
            <Coffee size={22} className="text-white/70" />
          </button>
        </div>

        {/* Stats Card */}
        <div 
          className="rounded-3xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-1">
                {completedSessions}
              </div>
              <div className="text-white/50 text-xs font-medium uppercase tracking-wider">
                Сессий сегодня
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-1">
                {totalFocusTime}
              </div>
              <div className="text-white/50 text-xs font-medium uppercase tracking-wider">
                Минут фокуса
              </div>
            </div>
          </div>

          {/* Motivational message */}
          {completedSessions > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-white/10 text-center"
            >
              <p className="text-white/60 text-sm">
                {completedSessions >= 4 
                  ? '🔥 Отличная работа! Ты в потоке!' 
                  : completedSessions >= 2 
                    ? '💪 Продолжай в том же духе!' 
                    : '✨ Хорошее начало!'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Phase selector (subtle) */}
        <div className="flex justify-center gap-2 mt-6">
          {(['work', 'shortBreak', 'longBreak'] as TimerPhase[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                if (state === 'idle') {
                  setPhase(p);
                  setTimeLeft(getPhaseDuration(p));
                }
              }}
              disabled={state !== 'idle'}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                phase === p
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              } ${state !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {PHASE_CONFIG[p].emoji} {PHASE_CONFIG[p].label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PomodoroTimer;



