
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { 
  Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Pause, X, 
  Volume2, Coffee, Sparkles, Battery, Clock, Star, Leaf, Music2, Sun,
  Users, Heart
} from 'lucide-react';

// Calm-style images for soundscapes
const SOUNDSCAPE_IMAGES: Record<string, string> = {
  'RAIN': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=300&fit=crop',
  'FOREST': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop',
  'OCEAN': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
  'FIRE': 'https://images.unsplash.com/photo-1475552113915-6fcb52652ba2?w=400&h=300&fit=crop',
  'WIND': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'CAFE': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
  'THUNDER': 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&h=300&fit=crop',
  'NIGHT': 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=300&fit=crop',
};

// Meditation category images
const MEDITATION_IMAGES: Record<string, string> = {
  'SLEEP': 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=400&h=300&fit=crop',
  'FOCUS': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
  'ANXIETY': 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&h=300&fit=crop',
  'ENERGY': 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=300&fit=crop',
};

export const MeditationView: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeSound = SOUNDSCAPES.find(s => s.id === activeSoundId);
  
  // Random daily quote
  const dailyQuote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  const filteredMeditations = selectedCategory 
    ? MEDITATIONS.filter(m => m.category === selectedCategory)
    : MEDITATIONS;

  const categories = [
    { id: 'SLEEP', name: 'Сон', icon: Moon, color: 'from-indigo-500 to-purple-600' },
    { id: 'FOCUS', name: 'Фокус', icon: Zap, color: 'from-amber-500 to-orange-500' },
    { id: 'ANXIETY', name: 'Спокойствие', icon: Leaf, color: 'from-emerald-500 to-teal-500' },
    { id: 'ENERGY', name: 'Энергия', icon: Sun, color: 'from-rose-500 to-pink-500' },
  ];

  const handleSoundClick = (id: string) => {
    if (activeSoundId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSoundId(id);
      setIsPlaying(true);
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
      'THUNDER': <CloudRain size={size} />,
      'NIGHT': <Moon size={size} />,
    };
    return icons[type] || <Music2 size={size} />;
  };

  // 4-7-8 Breathing
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
            if (phase === 'exhale') { setCycles(c => c + 1); setPhase('inhale'); return 4; }
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [phase]);

    return (
      <motion.div 
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950" />
        
        {/* Ambient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          animate={{ 
            background: phase === 'inhale' ? 'rgba(99,102,241,0.3)' : 
                       phase === 'hold' ? 'rgba(168,85,247,0.3)' : 'rgba(20,184,166,0.3)',
            scale: phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.2 : 0.9
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />

        <button 
          onClick={() => setShowBreathing(false)}
          className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <X size={24} />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div className="text-center mb-12" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h2 className="text-5xl font-light text-white tracking-tight mb-2">4-7-8</h2>
            <p className="text-white/40 text-sm uppercase tracking-[0.3em]">Техника дыхания</p>
          </motion.div>

          <div className="relative flex items-center justify-center mb-12">
            <motion.div 
              className="absolute w-72 h-72 rounded-full border border-white/10"
              animate={{ scale: phase === 'inhale' ? 1.2 : 1 }}
              transition={{ duration: 4, ease: "easeInOut" }}
            />
            
            <motion.div 
              className="w-56 h-56 rounded-full flex items-center justify-center"
              animate={{ scale: phase === 'inhale' ? 1.15 : phase === 'hold' ? 1.1 : 0.85 }}
              transition={{ duration: 4, ease: "easeInOut" }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <div className="text-center">
                <motion.div 
                  className="text-7xl font-light text-white mb-1"
                  key={timer}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {timer}
                </motion.div>
                <div className="text-sm font-medium uppercase tracking-widest text-white/50">
                  {phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-white/30 text-sm">Циклов: {cycles}</div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pb-40 relative overflow-hidden bg-gradient-to-b from-[#1e3a5f] via-[#0f172a] to-[#020617]">
      {/* Calm-style gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-600/20 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>
      
      <AnimatePresence>
        {showBreathing && <BreathingOverlay />}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-28 pb-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-white">Релакс</h1>
          <button 
            onClick={() => setShowBreathing(true)}
            className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white transition-all"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Wind size={16} className="inline mr-2" />
            Дыхание
          </button>
        </div>

        {/* Daily Quote - Glass Card */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p className="text-white/90 text-base font-light leading-relaxed italic mb-2">
            "{dailyQuote.text}"
          </p>
          <p className="text-white/40 text-xs">— {dailyQuote.author}</p>
        </motion.div>
      </div>

      {/* Soundscapes Section - Calm Style Cards */}
      <div className="px-5 mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Звуки</h2>
          {activeSoundId && (
            <button 
              onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
              className="text-white/50 text-sm hover:text-white transition-colors"
            >
              Выключить
            </button>
          )}
        </div>
        
        {/* Horizontal scroll cards like Calm */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id && isPlaying;
            const imageKey = sound.iconType === 'RAIN' && sound.title === 'Гроза' ? 'THUNDER' : sound.iconType;
            
            return (
              <motion.button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                whileTap={{ scale: 0.98 }}
                className="relative flex-shrink-0 w-36 rounded-2xl overflow-hidden group"
                style={{ aspectRatio: '3/4' }}
              >
                {/* Background Image */}
                <img 
                  src={SOUNDSCAPE_IMAGES[imageKey] || SOUNDSCAPE_IMAGES['FOREST']}
                  alt={sound.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Active state glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                )}
                
                {/* Play indicator */}
                <div className="absolute top-3 left-3">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isActive ? 'bg-white text-black' : 'bg-black/40 text-white backdrop-blur-sm'
                    }`}
                  >
                    {isActive ? (
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-0.5 h-2 bg-black rounded-full animate-[bounce_0.8s_infinite]" />
                        <div className="w-0.5 h-3 bg-black rounded-full animate-[bounce_1s_infinite]" />
                        <div className="w-0.5 h-1.5 bg-black rounded-full animate-[bounce_0.6s_infinite]" />
                      </div>
                    ) : (
                      <Play size={12} fill="white" className="ml-0.5" />
                    )}
                  </div>
                </div>
                
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-semibold text-sm">{sound.title}</h3>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills - Glass Style */}
      <div className="px-5 mb-6 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null ? 'bg-white text-black' : 'text-white/70'
            }`}
            style={selectedCategory === null ? {} : {
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
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
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected ? 'text-white' : 'text-white/70'
                }`}
                style={isSelected ? {
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                } : {
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meditations Section - Calm Style */}
      <div className="px-5 relative z-10 pb-8">
        <h2 className="text-white font-semibold text-lg mb-4">Медитации</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredMeditations.map((meditation, idx) => {
              const categoryInfo = categories.find(c => c.id === meditation.category);
              
              return (
                <motion.button
                  key={meditation.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="relative overflow-hidden rounded-2xl group text-left"
                  style={{ aspectRatio: '1' }}
                >
                  {/* Background Image */}
                  <img 
                    src={MEDITATION_IMAGES[meditation.category]}
                    alt={meditation.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Play button */}
                  <div className="absolute top-3 left-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play size={12} fill="white" className="text-white ml-0.5" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm mb-0.5 leading-tight">
                      {meditation.title}
                    </h3>
                    <p className="text-white/60 text-xs">{meditation.duration}</p>
                  </div>
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
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={SOUNDSCAPE_IMAGES[activeSound?.iconType || 'FOREST']}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{activeSound?.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {isPlaying && (
                    <div className="flex gap-0.5 items-end h-2.5">
                      <div className="w-0.5 h-1.5 bg-green-400 rounded-full animate-[bounce_0.8s_infinite]" />
                      <div className="w-0.5 h-2.5 bg-green-400 rounded-full animate-[bounce_1.2s_infinite]" />
                      <div className="w-0.5 h-1 bg-green-400 rounded-full animate-[bounce_0.6s_infinite]" />
                    </div>
                  )}
                  <span className="text-white/40 text-xs">
                    {isPlaying ? 'Воспроизводится' : 'Пауза'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause size={18} className="text-black" fill="black" /> : <Play size={18} className="text-black ml-0.5" fill="black" />}
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
                  key={activeSound.id + isPlaying}
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
    </div>
  );
};
