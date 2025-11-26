
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { 
  Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Pause, X, 
  Headphones, Activity, Heart, Volume2, Coffee, Sparkles, Battery,
  Clock, ChevronRight, Star, Leaf, Music2, Sun, CloudMoon
} from 'lucide-react';

// Premium Calm-style Meditation View with iOS 26 Liquid Glass
export const MeditationView: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [activeMeditationId, setActiveMeditationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeSound = SOUNDSCAPES.find(s => s.id === activeSoundId);
  
  // Random daily quote based on date
  const dailyQuote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  // Filter meditations by category
  const filteredMeditations = selectedCategory 
    ? MEDITATIONS.filter(m => m.category === selectedCategory)
    : MEDITATIONS;

  const categories = [
    { id: 'SLEEP', name: 'Сон', icon: Moon, gradient: 'from-indigo-600 to-purple-700' },
    { id: 'FOCUS', name: 'Фокус', icon: Zap, gradient: 'from-amber-500 to-orange-600' },
    { id: 'ANXIETY', name: 'Спокойствие', icon: Leaf, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'ENERGY', name: 'Энергия', icon: Sun, gradient: 'from-rose-500 to-pink-600' },
  ];

  // Dynamic background based on active sound
  const getBackgroundStyle = () => {
    if (!activeSound) return {};
    const gradients: Record<string, string> = {
      'RAIN': 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
      'FOREST': 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
      'OCEAN': 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
      'FIRE': 'radial-gradient(ellipse at top, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
      'WIND': 'radial-gradient(ellipse at top, rgba(148, 163, 184, 0.15) 0%, transparent 50%)',
      'CAFE': 'radial-gradient(ellipse at top, rgba(180, 83, 9, 0.15) 0%, transparent 50%)',
    };
    return { backgroundImage: gradients[activeSound.iconType] || '' };
  };

  const handleSoundClick = (id: string) => {
    if (activeSoundId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSoundId(id);
      setIsPlaying(true);
      setAudioLoading(true);
      setTimeout(() => setAudioLoading(false), 1500);
    }
  };

  const getSoundIcon = (type: string, size = 20) => {
    const icons: Record<string, React.ReactNode> = {
      'RAIN': <CloudRain size={size} />,
      'FOREST': <Trees size={size} />,
      'OCEAN': <Waves size={size} />,
      'FIRE': <Flame size={size} />,
      'WIND': <Wind size={size} />,
      'CAFE': <Coffee size={size} />,
    };
    return icons[type] || <Music2 size={size} />;
  };

  // 4-7-8 Breathing Exercise Overlay
  const BreathingOverlay = () => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [timer, setTimer] = useState(4);
    const [cycles, setCycles] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) {
            if (phase === 'inhale') { setPhase('hold'); return 7; }
            if (phase === 'hold') { setPhase('exhale'); return 8; }
            if (phase === 'exhale') { 
              setCycles(c => c + 1);
              setPhase('inhale'); 
              return 4; 
            }
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [phase]);

    const phaseColors = {
      inhale: 'from-blue-500/30 to-cyan-500/30',
      hold: 'from-purple-500/30 to-pink-500/30',
      exhale: 'from-teal-500/30 to-emerald-500/30',
    };

    return (
      <motion.div 
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl" />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br ${phaseColors[phase]} blur-[100px]`}
            animate={{ 
              scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.3 : 0.8,
              opacity: phase === 'hold' ? 0.8 : 0.5
            }}
            transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8, ease: "easeInOut" }}
          />
          <motion.div 
            className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br ${phaseColors[phase]} blur-[80px]`}
            animate={{ 
              scale: phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.1 : 0.7,
            }}
            transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8, ease: "easeInOut", delay: 0.2 }}
          />
        </div>

        <button 
          onClick={() => setShowBreathing(false)}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          {/* Title */}
          <motion.div 
            className="text-center mb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2 className="text-5xl font-extralight text-white tracking-tight mb-2">4-7-8</h2>
            <p className="text-white/40 text-xs font-medium uppercase tracking-[0.3em]">Техника дыхания</p>
          </motion.div>

          {/* Breathing Circle */}
          <div className="relative flex items-center justify-center mb-12">
            {/* Outer rings */}
            <motion.div 
              className="absolute w-72 h-72 rounded-full border border-white/5"
              animate={{ scale: phase === 'inhale' ? 1.2 : 1 }}
              transition={{ duration: 4, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute w-80 h-80 rounded-full border border-white/5"
              animate={{ scale: phase === 'inhale' ? 1.15 : 0.95 }}
              transition={{ duration: 4, ease: "easeInOut", delay: 0.1 }}
            />
            
            {/* Main circle - Liquid Glass */}
            <motion.div 
              className={`w-56 h-56 rounded-full flex items-center justify-center relative overflow-hidden`}
              animate={{ 
                scale: phase === 'inhale' ? 1.15 : phase === 'hold' ? 1.1 : 0.85,
              }}
              transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8, ease: "easeInOut" }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Inner glow */}
              <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${phaseColors[phase]} opacity-50`} />
              
              <div className="relative text-center z-10">
                <motion.div 
                  className="text-7xl font-extralight text-white mb-1"
                  key={timer}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {timer}
                </motion.div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                  {phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cycles counter */}
          <div className="text-white/30 text-sm font-medium">
            Циклов: {cycles}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      className="min-h-screen pb-40 relative overflow-hidden bg-[#020617]"
      style={getBackgroundStyle()}
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>
      
      <AnimatePresence>
        {showBreathing && <BreathingOverlay />}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-28 pb-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-1">Релакс</h1>
            <p className="text-white/40 text-sm">Найди свой покой</p>
          </div>
          
          {/* Breathing Button - Liquid Glass */}
          <button 
            onClick={() => setShowBreathing(true)}
            className="relative group"
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              <Wind size={20} className="text-white/80" />
            </div>
          </button>
        </div>

        {/* Daily Quote - Premium Glass Card */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute top-4 right-4 text-4xl text-white/5 font-serif">"</div>
          <p className="text-white/90 text-base font-light leading-relaxed italic mb-3 relative z-10">
            "{dailyQuote.text}"
          </p>
          <p className="text-white/30 text-xs font-medium">— {dailyQuote.author}</p>
        </motion.div>
      </div>

      {/* Soundscapes - Compact Pills */}
      <div className="px-5 mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/60 font-medium text-sm">Звуки</h2>
          {activeSoundId && (
            <button 
              onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
              className="text-white/40 text-xs hover:text-white/60 transition-colors"
            >
              Выключить
            </button>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id;
            
            return (
              <motion.button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                whileTap={{ scale: 0.95 }}
                className={`relative px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all ${
                  isActive ? 'pr-5' : ''
                }`}
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isActive ? '0 4px 20px rgba(99,102,241,0.2)' : '0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                <span className={`${isActive ? 'text-indigo-300' : 'text-white/50'}`}>
                  {getSoundIcon(sound.iconType, 16)}
                </span>
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                  {sound.title}
                </span>
                {isActive && isPlaying && (
                  <div className="flex gap-0.5 items-end h-3 ml-1">
                    <div className="w-0.5 h-2 bg-indigo-400 rounded-full animate-[bounce_0.8s_infinite]" />
                    <div className="w-0.5 h-3 bg-indigo-400 rounded-full animate-[bounce_1s_infinite]" />
                    <div className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite]" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-5 mb-6 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null 
                ? 'bg-white text-black' 
                : 'text-white/50 hover:text-white/70'
            }`}
            style={selectedCategory === null ? {} : {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Все
          </button>
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected ? 'text-white' : 'text-white/50 hover:text-white/70'
                }`}
                style={isSelected ? {
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                } : {
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className={isSelected ? `bg-gradient-to-r ${cat.gradient} p-1 rounded-lg -ml-1` : ''}>
                  <Icon size={14} className={isSelected ? 'text-white' : ''} />
                </div>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meditations Grid */}
      <div className="px-5 relative z-10 pb-8">
        <h2 className="text-white/60 font-medium text-sm mb-4">Медитации</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredMeditations.map((meditation, idx) => {
              const categoryInfo = categories.find(c => c.id === meditation.category);
              const Icon = categoryInfo?.icon || Moon;
              
              return (
                <motion.button
                  key={meditation.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  onClick={() => setActiveMeditationId(meditation.id)}
                  className="group relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Gradient accent */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${categoryInfo?.gradient || 'from-slate-500 to-slate-600'} opacity-20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`} />
                  
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryInfo?.gradient || 'from-slate-500 to-slate-600'} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  
                  <h3 className="text-white font-medium text-sm mb-1 leading-tight">
                    {meditation.title}
                  </h3>
                  <p className="text-white/40 text-xs">{meditation.duration}</p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Mini Player - Floating Glass */}
      <AnimatePresence>
        {activeSoundId && (
          <motion.div 
            className="fixed bottom-24 left-4 right-4 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div 
              className="rounded-3xl p-4 flex items-center gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.8) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Album Art */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden shadow-lg`}>
                {audioLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  getSoundIcon(activeSound?.iconType || '', 24)
                )}
                <div className="absolute inset-0 bg-white/10" />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{activeSound?.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 h-2 bg-green-400 rounded-full animate-[bounce_0.8s_infinite]" />
                      <div className="w-0.5 h-3 bg-green-400 rounded-full animate-[bounce_1.2s_infinite]" />
                      <div className="w-0.5 h-1.5 bg-green-400 rounded-full animate-[bounce_0.6s_infinite]" />
                    </div>
                  ) : null}
                  <span className="text-white/40 text-xs">
                    {isPlaying ? 'Воспроизводится' : 'Пауза'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
                >
                  {isPlaying ? <Pause size={20} className="text-black" fill="black" /> : <Play size={20} className="text-black ml-0.5" fill="black" />}
                </button>
                <button 
                  onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Hidden YouTube Embed */}
            {activeSound && isPlaying && (
              <div className="absolute w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
                <iframe 
                  key={activeSound.id}
                  width="1" height="1" 
                  src={`https://www.youtube.com/embed/${activeSound.youtubeId}?autoplay=1&controls=0&loop=1&playlist=${activeSound.youtubeId}&playsinline=1`} 
                  title="Audio Player" 
                  allow="autoplay; encrypted-media"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meditation Detail Modal */}
      <AnimatePresence>
        {activeMeditationId && (
          <motion.div 
            className="fixed inset-0 z-[100] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-[#020617]">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-transparent" />
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <button 
              onClick={() => setActiveMeditationId(null)}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <X size={20} />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
              {/* Visualizer */}
              <motion.div 
                className="relative w-64 h-64 mb-12"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Rings */}
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[pulse_4s_ease-in-out_infinite]" />
                <div className="absolute -inset-4 rounded-full border border-white/5 animate-[pulse_4s_ease-in-out_infinite_0.5s]" />
                <div className="absolute -inset-8 rounded-full border border-white/5 animate-[pulse_4s_ease-in-out_infinite_1s]" />
                
                {/* Main circle */}
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center cursor-pointer group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <Play size={64} className="text-white ml-2 group-hover:scale-110 transition-transform" fill="white" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-semibold text-white mb-3">
                  {MEDITATIONS.find(m => m.id === activeMeditationId)?.title}
                </h2>
                
                <div className="flex items-center justify-center gap-3 mb-8">
                  <span 
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-white/70"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {MEDITATIONS.find(m => m.id === activeMeditationId)?.duration}
                  </span>
                </div>
                
                <button 
                  className="px-12 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/20"
                >
                  Начать сессию
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
