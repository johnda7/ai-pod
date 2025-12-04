import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, SkipForward, Settings, X, Check, 
  Volume2, VolumeX, TreePine, Target, TrendingUp,
  Music, Wind, Waves, CloudRain, Lock, Unlock
} from 'lucide-react';

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete?: (type: 'work' | 'break', duration: number) => void;
}

type TimerPhase = 'work' | 'shortBreak' | 'longBreak';
type TimerState = 'idle' | 'running' | 'paused';
type AmbientSound = 'none' | 'rain' | 'forest' | 'waves' | 'whitenoise' | 'lofi';

interface TimerPreset {
  id: string;
  name: string;
  emoji: string;
  work: number;
  shortBreak: number;
  longBreak: number;
}

interface DailyStats {
  date: string;
  sessions: number;
  focusMinutes: number;
}

const PRESETS: TimerPreset[] = [
  { id: 'classic', name: 'Классика', emoji: '🍅', work: 25, shortBreak: 5, longBreak: 15 },
  { id: 'short', name: 'Короткий', emoji: '⚡', work: 15, shortBreak: 3, longBreak: 10 },
  { id: 'long', name: 'Глубокий', emoji: '🧘', work: 45, shortBreak: 10, longBreak: 20 },
  { id: 'quick', name: 'Быстрый', emoji: '🚀', work: 10, shortBreak: 2, longBreak: 5 },
  { id: 'exam', name: 'Экзамен', emoji: '📚', work: 50, shortBreak: 10, longBreak: 30 },
];

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Тишина', icon: VolumeX },
  { id: 'rain', name: 'Дождь', icon: CloudRain },
  { id: 'forest', name: 'Лес', icon: TreePine },
  { id: 'waves', name: 'Волны', icon: Waves },
  { id: 'whitenoise', name: 'Белый шум', icon: Wind },
  { id: 'lofi', name: 'Lo-Fi', icon: Music },
];

const PHASE_CONFIG = {
  work: {
    label: 'Фокус',
    emoji: '🧠',
    color: '#8b5cf6',
    bgGradient: 'from-violet-900/90 via-purple-900/80 to-indigo-950/90',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    message: 'Сосредоточься на задаче',
  },
  shortBreak: {
    label: 'Перерыв',
    emoji: '☕',
    color: '#10b981',
    bgGradient: 'from-emerald-900/90 via-teal-900/80 to-green-950/90',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    message: 'Отдохни и расслабься',
  },
  longBreak: {
    label: 'Большой перерыв',
    emoji: '🌟',
    color: '#f59e0b',
    bgGradient: 'from-amber-900/90 via-orange-900/80 to-yellow-950/90',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    message: 'Ты молодец! Заслуженный отдых',
  },
};

const TREE_STAGES = [
  { progress: 0, emoji: '🌱', name: 'Семечко' },
  { progress: 0.25, emoji: '🌿', name: 'Росток' },
  { progress: 0.5, emoji: '🪴', name: 'Кустик' },
  { progress: 0.75, emoji: '🌳', name: 'Деревце' },
  { progress: 1, emoji: '🌲', name: 'Дерево' },
];

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
}) => {
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(PRESETS[0]);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [deepFocusMode, setDeepFocusMode] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [todayGoal, setTodayGoal] = useState(4);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const getPhaseDuration = useCallback((p: TimerPhase) => {
    switch (p) {
      case 'work': return selectedPreset.work * 60;
      case 'shortBreak': return selectedPreset.shortBreak * 60;
      case 'longBreak': return selectedPreset.longBreak * 60;
    }
  }, [selectedPreset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / getPhaseDuration(phase));

  const getTreeStage = () => {
    for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
      if (progress >= TREE_STAGES[i].progress) {
        return TREE_STAGES[i];
      }
    }
    return TREE_STAGES[0];
  };

  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playTone(523.25, now, 0.2);
      playTone(659.25, now + 0.1, 0.2);
      playTone(783.99, now + 0.2, 0.3);
      playTone(1046.50, now + 0.3, 0.4);
      vibrate([100, 50, 100]);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  const startAmbientSound = useCallback(() => {
    if (ambientSound === 'none') return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ambientSourceRef.current) {
        try { ambientSourceRef.current.stop(); } catch (e) {}
        ambientSourceRef.current = null;
      }
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      switch (ambientSound) {
        case 'rain':
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          gain.gain.value = 0.15;
          break;
        case 'forest':
          filter.type = 'bandpass';
          filter.frequency.value = 1000;
          filter.Q.value = 0.5;
          gain.gain.value = 0.08;
          break;
        case 'waves':
          filter.type = 'lowpass';
          filter.frequency.value = 400;
          gain.gain.value = 0.2;
          break;
        case 'whitenoise':
          filter.type = 'highpass';
          filter.frequency.value = 200;
          gain.gain.value = 0.1;
          break;
        case 'lofi':
          filter.type = 'lowpass';
          filter.frequency.value = 2000;
          gain.gain.value = 0.05;
          break;
      }
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
      ambientSourceRef.current = whiteNoise;
    } catch (e) {
      console.log('Ambient sound not available');
    }
  }, [ambientSound]);

  const stopAmbientSound = useCallback(() => {
    if (ambientSourceRef.current) {
      try { ambientSourceRef.current.stop(); } catch (e) {}
      ambientSourceRef.current = null;
    }
  }, []);

  const updateWeeklyStats = useCallback((minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    setWeeklyStats(prev => {
      const stats = [...prev];
      const todayIndex = stats.findIndex(s => s.date === today);
      if (todayIndex >= 0) {
        stats[todayIndex].sessions += 1;
        stats[todayIndex].focusMinutes += minutes;
      } else {
        stats.push({ date: today, sessions: 1, focusMinutes: minutes });
      }
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const filtered = stats.filter(s => new Date(s.date) >= weekAgo);
      localStorage.setItem('pomodoro_weekly_stats', JSON.stringify(filtered));
      return filtered;
    });
  }, []);

  const switchPhase = useCallback(() => {
    playCompletionSound();
    vibrate([200, 100, 200]);
    if (phase === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      setTotalFocusTime(prev => prev + selectedPreset.work);
      onSessionComplete?.('work', selectedPreset.work);
      const today = new Date().toDateString();
      const lastPomodoroDate = localStorage.getItem('pomodoro_last_date');
      if (lastPomodoroDate !== today) {
        localStorage.setItem('pomodoro_sessions_today', '1');
        localStorage.setItem('pomodoro_last_date', today);
      } else {
        const current = parseInt(localStorage.getItem('pomodoro_sessions_today') || '0', 10);
        localStorage.setItem('pomodoro_sessions_today', (current + 1).toString());
      }
      updateWeeklyStats(selectedPreset.work);
      if (newCompletedSessions % 4 === 0) {
        setPhase('longBreak');
        setTimeLeft(selectedPreset.longBreak * 60);
      } else {
        setPhase('shortBreak');
        setTimeLeft(selectedPreset.shortBreak * 60);
      }
    } else {
      onSessionComplete?.('break', phase === 'shortBreak' ? selectedPreset.shortBreak : selectedPreset.longBreak);
      setPhase('work');
      setTimeLeft(selectedPreset.work * 60);
    }
    setState('idle');
    stopAmbientSound();
  }, [phase, completedSessions, selectedPreset, playCompletionSound, onSessionComplete, stopAmbientSound, updateWeeklyStats]);

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            switchPhase();
            return 0;
          }
          if (prev % 60 === 0 && prev !== getPhaseDuration(phase)) {
            vibrate(10);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, switchPhase, getPhaseDuration, phase]);

  useEffect(() => {
    if (state === 'running' && phase === 'work') {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [state, phase, ambientSound, startAmbientSound, stopAmbientSound]);

  useEffect(() => {
    const savedStats = localStorage.getItem('pomodoro_weekly_stats');
    if (savedStats) setWeeklyStats(JSON.parse(savedStats));
    const savedSessions = localStorage.getItem('pomodoro_stats');
    if (savedSessions) {
      const stats = JSON.parse(savedSessions);
      setCompletedSessions(stats.sessions || 0);
      setTotalFocusTime(stats.totalTime || 0);
    }
    const savedGoal = localStorage.getItem('pomodoro_daily_goal');
    if (savedGoal) setTodayGoal(parseInt(savedGoal, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoro_stats', JSON.stringify({
      sessions: completedSessions,
      totalTime: totalFocusTime,
    }));
  }, [completedSessions, totalFocusTime]);

  useEffect(() => {
    localStorage.setItem('pomodoro_daily_goal', todayGoal.toString());
  }, [todayGoal]);

  const handleStart = () => { setState('running'); vibrate(50); };
  const handlePause = () => { setState('paused'); stopAmbientSound(); vibrate(30); };
  const handleReset = () => { setState('idle'); setTimeLeft(getPhaseDuration(phase)); stopAmbientSound(); vibrate([30, 30, 30]); };
  const handleSkip = () => { switchPhase(); };

  const selectPreset = (preset: TimerPreset) => {
    setSelectedPreset(preset);
    if (state === 'idle') { setTimeLeft(preset.work * 60); setPhase('work'); }
    setShowSettings(false);
    vibrate(30);
  };

  const todayStats = weeklyStats.find(s => s.date === new Date().toISOString().split('T')[0]);
  const todaySessions = todayStats?.sessions || 0;
  const todayMinutes = todayStats?.focusMinutes || 0;
  const goalProgress = Math.min(todaySessions / todayGoal, 1);

  if (!isOpen) return null;

  const config = PHASE_CONFIG[phase];
  const treeStage = getTreeStage();

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] overflow-hidden" 
        style={{ backgroundColor: '#0a0a1a' }}
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${config.color}30 0%, #0a0a1a 40%, #0f0f2a 70%, #0a0a1a 100%)` }}
          animate={{ background: state === 'running' ? [
            `linear-gradient(135deg, ${config.color}30 0%, #0a0a1a 40%, #0f0f2a 70%, #0a0a1a 100%)`,
            `linear-gradient(180deg, ${config.color}35 0%, #0a0a1a 40%, #0f0f2a 70%, #0a0a1a 100%)`,
            `linear-gradient(225deg, ${config.color}30 0%, #0a0a1a 40%, #0f0f2a 70%, #0a0a1a 100%)`,
          ] : undefined }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        {state === 'running' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div key={i} className="absolute w-1 h-1 rounded-full"
                style={{ background: config.color, left: `${Math.random() * 100}%`, opacity: 0.3 }}
                animate={{ y: [800, -20], opacity: [0, 0.6, 0] }}
                transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between p-4">
            <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl">
              <TrendingUp size={18} className="text-white/70" />
              <span className="text-white/80 text-sm font-medium">{todaySessions}/{todayGoal}</span>
            </motion.button>

            <div className="flex gap-2">
              {deepFocusMode && state === 'running' ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-2 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center gap-2">
                  <Lock size={14} className="text-red-400" />
                  <span className="text-red-300 text-xs font-medium">Глубокий фокус</span>
                </motion.div>
              ) : (
                <>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(!showSettings)} className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
                    <Settings size={18} className="text-white/70" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
                    <X size={18} className="text-white/70" />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-8">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl">{config.emoji}</span>
                <h2 className="text-2xl font-black text-white">{config.label}</h2>
              </div>
              <p className="text-white/50 text-sm">{config.message}</p>
            </motion.div>

            {/* Инструкция для новичков - показывается только в idle */}
            {state === 'idle' && completedSessions === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl max-w-xs text-center"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <p className="text-white/80 text-xs leading-relaxed">
                  <span className="font-bold text-violet-300">Как работает:</span><br/>
                  🍅 Работай {selectedPreset.work} мин → ☕ Отдых {selectedPreset.shortBreak} мин<br/>
                  После 4 сессий — большой перерыв {selectedPreset.longBreak} мин<br/>
                  <span className="text-violet-400 font-medium">Нажми ▶️ чтобы начать!</span>
                </p>
              </motion.div>
            )}

            <div className="relative mb-8">
              <motion.div className="absolute inset-[-20px] rounded-full"
                animate={{ boxShadow: state === 'running' ? [
                  `0 0 60px 20px ${config.glowColor}`,
                  `0 0 80px 30px ${config.glowColor}`,
                  `0 0 60px 20px ${config.glowColor}`,
                ] : `0 0 40px 10px ${config.glowColor}` }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              <svg className="w-72 h-72 -rotate-90" viewBox="0 0 288 288">
                <circle cx="144" cy="144" r="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <motion.circle cx="144" cy="144" r="130" fill="none" stroke={config.color} strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 130}
                  initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 130 * (1 - progress) }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                  style={{ filter: `drop-shadow(0 0 8px ${config.color})` }}
                />
                <circle cx="144" cy="144" r="110" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {phase === 'work' && state !== 'idle' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl mb-2">{treeStage.emoji}</motion.div>
                )}
                <motion.div key={timeLeft} initial={{ scale: 1.02 }} animate={{ scale: 1 }} className="text-center">
                  <span className="text-7xl font-black text-white tabular-nums tracking-tight" style={{ textShadow: `0 0 40px ${config.glowColor}` }}>
                    {formatTime(timeLeft)}
                  </span>
                </motion.div>
                {phase === 'work' && state !== 'idle' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 text-xs mt-2">{treeStage.name}</motion.p>
                )}
                <div className="flex gap-2 mt-4">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${i < (completedSessions % 4) ? 'bg-white shadow-lg' : 'bg-white/20'}`}
                      style={{ boxShadow: i < (completedSessions % 4) ? `0 0 10px ${config.color}` : 'none' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {currentTask && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl max-w-xs">
                <p className="text-white/70 text-sm text-center truncate"><Target size={14} className="inline mr-2" />{currentTask}</p>
              </motion.div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleReset} className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center" disabled={deepFocusMode && state === 'running'}>
                <RotateCcw size={22} className="text-white/70" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={state === 'running' ? handlePause : handleStart}
                className="w-24 h-24 rounded-[2rem] flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`, boxShadow: `0 10px 40px ${config.glowColor}` }}
                disabled={deepFocusMode && state === 'running'}
              >
                {state === 'running' && (
                  <motion.div className="absolute inset-0 rounded-[2rem]" animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: config.color }} />
                )}
                <div className="relative z-10">
                  {state === 'running' ? <Pause size={36} className="text-white" fill="white" /> : <Play size={36} className="text-white ml-1" fill="white" />}
                </div>
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSkip} className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center" disabled={deepFocusMode && state === 'running'}>
                <SkipForward size={22} className="text-white/70" />
              </motion.button>
            </div>

            {state !== 'running' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-2 mb-4">
                {AMBIENT_SOUNDS.map((sound) => {
                  const Icon = sound.icon;
                  return (
                    <motion.button key={sound.id} whileTap={{ scale: 0.95 }} onClick={() => setAmbientSound(sound.id as AmbientSound)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-medium transition-all ${ambientSound === sound.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{sound.name}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {state === 'idle' && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowTaskInput(!showTaskInput)} className="text-white/40 text-sm hover:text-white/60 transition-colors">
                {currentTask ? 'Изменить задачу' : '+ Добавить задачу для фокуса'}
              </motion.button>
            )}
          </div>

          <div className="p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-3xl p-4 bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/50 text-xs font-medium">Цель на день</span>
                  <span className="text-white/70 text-xs">{todaySessions} из {todayGoal} сессий</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${config.color}, ${config.color}cc)` }}
                    initial={{ width: 0 }} animate={{ width: `${goalProgress * 100}%` }} transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-2xl bg-white/5">
                  <div className="text-2xl font-black text-white">{todaySessions}</div>
                  <div className="text-white/40 text-xs">сессий</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-white/5">
                  <div className="text-2xl font-black text-white">{todayMinutes}</div>
                  <div className="text-white/40 text-xs">минут</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-white/5">
                  <div className="text-2xl font-black text-white">{completedSessions}</div>
                  <div className="text-white/40 text-xs">всего</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {PRESETS.map((preset) => (
                  <motion.button key={preset.id} whileTap={{ scale: 0.95 }} onClick={() => selectPreset(preset)} disabled={state === 'running'}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${selectedPreset.id === preset.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'} ${state === 'running' ? 'opacity-50' : ''}`}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.name}</span>
                    <span className="text-white/30">{preset.work}м</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {deepFocusMode ? <Lock size={14} className="text-violet-400" /> : <Unlock size={14} className="text-white/40" />}
                  <span className="text-white/60 text-xs">Глубокий фокус</span>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setDeepFocusMode(!deepFocusMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${deepFocusMode ? 'bg-violet-500' : 'bg-white/20'}`}
                >
                  <motion.div className="w-5 h-5 rounded-full bg-white absolute top-0.5" animate={{ left: deepFocusMode ? 26 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xl flex items-end" onClick={() => setShowSettings(false)}>
              <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className="w-full bg-gradient-to-b from-gray-900 to-gray-950 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-4">Настройки</h3>
                
                <div className="mb-6">
                  <h4 className="text-white/50 text-sm mb-3">Пресеты времени</h4>
                  <div className="space-y-2">
                    {PRESETS.map((preset) => (
                      <motion.button key={preset.id} whileTap={{ scale: 0.98 }} onClick={() => selectPreset(preset)}
                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${selectedPreset.id === preset.id ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{preset.emoji}</span>
                          <div className="text-left">
                            <div className="text-white font-medium">{preset.name}</div>
                            <div className="text-white/40 text-xs">{preset.work}м фокус • {preset.shortBreak}м перерыв</div>
                          </div>
                        </div>
                        {selectedPreset.id === preset.id && <Check size={20} className="text-violet-400" />}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-white/50 text-sm mb-3">Звуки</h4>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <Volume2 size={20} className="text-white/60" />
                      <span className="text-white">Звук завершения</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-12 h-6 rounded-full transition-all relative ${soundEnabled ? 'bg-violet-500' : 'bg-white/20'}`}
                    >
                      <motion.div className="w-5 h-5 rounded-full bg-white absolute top-0.5" animate={{ left: soundEnabled ? 26 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </motion.button>
                  </div>
                </div>

                <div>
                  <h4 className="text-white/50 text-sm mb-3">Цель на день: {todayGoal} сессий</h4>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                    <Target size={20} className="text-white/60" />
                    <div className="flex-1">
                      <input type="range" min="1" max="12" value={todayGoal} onChange={(e) => setTodayGoal(parseInt(e.target.value))} className="w-full accent-violet-500" />
                    </div>
                    <span className="text-white font-bold w-8 text-center">{todayGoal}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTaskInput && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setShowTaskInput(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-gray-900 rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target size={20} />
                  На чём фокусируешься?
                </h3>
                <input type="text" value={currentTask} onChange={(e) => setCurrentTask(e.target.value)} placeholder="Например: Доделать проект по истории"
                  className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 focus:outline-none" autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setCurrentTask(''); setShowTaskInput(false); }} className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 font-medium">
                    Очистить
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowTaskInput(false)} className="flex-1 py-3 rounded-xl bg-violet-500 text-white font-medium">
                    Готово
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default PomodoroTimer;
