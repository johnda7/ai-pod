
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MEDITATIONS, SOUNDSCAPES, QUOTES, AFFIRMATIONS } from '../constants';
import { 
  Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Pause, X, 
  Coffee, Leaf, Music2, Sun, Gamepad2, Brain, Sparkles, Heart,
  BookHeart, Eye, MessageCircleHeart, ChevronRight
} from 'lucide-react';
import { GratitudeJournal } from './GratitudeJournal';
import { ZenVisualizer } from './ZenVisualizer';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/telegramService';

// Unique images for each soundscape
const SOUNDSCAPE_IMAGES: Record<string, string> = {
  'RAIN': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=500&fit=crop',
  'FOREST': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=500&fit=crop',
  'OCEAN': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=500&fit=crop',
  'FIRE': 'https://images.unsplash.com/photo-1475552113915-6fcb52652ba2?w=400&h=500&fit=crop',
  'WIND': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=500&fit=crop',
  'CAFE': 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=500&fit=crop',
  'THUNDER': 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&h=500&fit=crop',
  'NIGHT': 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=400&h=500&fit=crop',
};

// UNIQUE images for EACH meditation
const MEDITATION_UNIQUE_IMAGES: Record<string, string> = {
  // Сон
  'm1': 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=400&h=400&fit=crop', // Быстрый сон - clouds
  'm2': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop', // Глубокий отдых - dark cinema
  'm3': 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=400&fit=crop', // Ночные мысли - stars
  'm4': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop', // Сонное царство - moon
  // Фокус  
  'm5': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop', // Фокус перед экзаменом - meditation
  'm6': 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=400&fit=crop', // Утренняя ясность - sunrise
  'm7': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&h=400&fit=crop', // Практика тишины - calm water
  'm8': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop', // Ясный ум - clear sky
  // Спокойствие
  'm9': 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&h=400&fit=crop', // Снять тревогу - zen
  'm10': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop', // Заземление - nature
  'm11': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', // Отпустить страх - freedom
  'm12': 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=400&h=400&fit=crop', // Внутренний покой - sky
  // Энергия
  'm13': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', // Заряд энергии - vibrant
  'm14': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop', // Перезагрузка - workout
  'm15': 'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=400&h=400&fit=crop', // Утренний буст - coffee sunrise
  'm16': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop', // Сила момента - tree power
};

export const MeditationView: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showJournal, setShowJournal] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [selectedMeditation, setSelectedMeditation] = useState<typeof MEDITATIONS[0] | null>(null);
  const [meditationPlaying, setMeditationPlaying] = useState(false);

  const activeSound = SOUNDSCAPES.find(s => s.id === activeSoundId);
  
  const dailyQuote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  // Rotate affirmations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAffirmation(prev => (prev + 1) % AFFIRMATIONS.length);
    }, 8000);
    return () => clearInterval(interval);
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
      hapticLight(); // 📳 Выбор звука
      if (activeSoundId === id) {
          setIsPlaying(!isPlaying);
      } else {
          setActiveSoundId(id);
          setIsPlaying(true);
    }
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

      {/* Modals */}
      <GratitudeJournal isOpen={showJournal} onClose={() => setShowJournal(false)} />
      <ZenVisualizer isOpen={showVisualizer} onClose={() => setShowVisualizer(false)} />

      {/* Header */}
      <div className="px-5 pt-4 pb-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
             <div>
            <h1 className="text-3xl font-semibold text-white">Чилл-зона</h1>
            <p className="text-white/50 text-sm mt-1">Отдыхай с пользой</p>
             </div>
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

        {/* Quick Actions - Journal & Visualizer */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowJournal(true)}
            className="p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(236,72,153,0.05) 100%)',
              border: '1px solid rgba(236,72,153,0.25)',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <BookHeart size={18} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium text-sm">Дневник</div>
              <div className="text-white/50 text-xs">Я молодец!</div>
            </div>
          </button>
          
          <button
            onClick={() => setShowVisualizer(true)}
            className="p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Eye size={18} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium text-sm">Визуализации</div>
              <div className="text-white/50 text-xs">Расслабься</div>
            </div>
             </button>
          </div>

        {/* Affirmation Card - Rotating */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.1) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(168,85,247,0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <MessageCircleHeart size={18} className="text-white" />
               </div>
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAffirmation}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-white text-sm font-medium leading-relaxed mb-2">
                    "{AFFIRMATIONS[currentAffirmation].text}"
                  </p>
                  <p className="text-purple-300 text-xs">— {AFFIRMATIONS[currentAffirmation].author}</p>
                </motion.div>
              </AnimatePresence>
               </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-3">
            {AFFIRMATIONS.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentAffirmation % 8 ? 'bg-purple-400 w-4' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Soundscapes Section */}
      <div className="px-5 mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">🎧 Звуки для фона</h2>
          {activeSoundId && (
            <button 
              onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
              className="text-white/50 text-sm hover:text-white transition-colors"
            >
              Выключить
            </button>
          )}
        </div>
        
        {/* COMPACT Sound Grid - 4 columns */}
        <div className="grid grid-cols-4 gap-2">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id && isPlaying;

            return (
              <motion.button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                whileTap={{ scale: 0.95 }}
                className="relative rounded-xl overflow-hidden aspect-square group"
              >
                <img 
                  src={SOUNDSCAPE_IMAGES[sound.iconType]}
                  alt={sound.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                      <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 h-2 bg-white rounded-full animate-[bounce_0.8s_infinite]" />
                      <div className="w-0.5 h-3 bg-white rounded-full animate-[bounce_1s_infinite]" />
                      <div className="w-0.5 h-1.5 bg-white rounded-full animate-[bounce_0.6s_infinite]" />
                    </div>
                </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-1.5">
                  <h3 className="text-white font-medium text-[10px] text-center truncate">{sound.title}</h3>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-5 mb-6 relative z-10">
        <h2 className="text-white font-semibold text-lg mb-4">🧘 Медитации</h2>
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

      {/* Meditations Grid - COMPACT 3 columns */}
      <div className="px-5 relative z-10 pb-8">
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {filteredMeditations.map((meditation, idx) => (
              <motion.button
                key={meditation.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="relative overflow-hidden rounded-xl group text-left aspect-[3/4]"
                onClick={() => { setSelectedMeditation(meditation); setMeditationPlaying(true); hapticLight(); }}
              >
                {/* UNIQUE image for each meditation */}
                <img 
                  src={MEDITATION_UNIQUE_IMAGES[meditation.id]}
                  alt={meditation.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Play icon - smaller */}
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play size={10} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-white font-medium text-[11px] leading-tight truncate">
                    {meditation.title}
                  </h3>
                  <p className="text-white/50 text-[9px]">{meditation.duration}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
          </div>
      </div>

      {/* Mini Player */}
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
                background: 'rgba(15,23,42,0.9)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={SOUNDSCAPE_IMAGES[activeSound?.iconType || 'FOREST']}
                  alt=""
                  className="w-full h-full object-cover"
                />
                   </div>
                   
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
                  src={`https://www.youtube-nocookie.com/embed/${activeSound.youtubeId}?autoplay=1&controls=0&loop=1&playlist=${activeSound.youtubeId}&playsinline=1&modestbranding=1&rel=0`} 
                   title="Audio Player" 
                   allow="autoplay; encrypted-media"
                />
               </div>
           )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEDITATION PLAYER MODAL */}
      <AnimatePresence>
        {selectedMeditation && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={MEDITATION_UNIQUE_IMAGES[selectedMeditation.id]}
                alt={selectedMeditation.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => { setSelectedMeditation(null); setMeditationPlaying(false); }}
              className="absolute top-6 right-6 z-[100] w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-2">{selectedMeditation.title}</h2>
                <p className="text-white/60 mb-8">{selectedMeditation.duration}</p>
                
                {/* Play/Pause Button */}
                <motion.button
                  onClick={() => setMeditationPlaying(!meditationPlaying)}
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {meditationPlaying ? (
                    <Pause size={40} className="text-white" fill="white" />
                  ) : (
                    <Play size={40} className="text-white ml-2" fill="white" />
                  )}
                </motion.button>

                <p className="text-white/40 text-sm mt-6">
                  {meditationPlaying ? 'Слушай и расслабляйся...' : 'Нажми чтобы начать'}
                </p>
              </motion.div>
            </div>

            {/* Hidden YouTube Audio */}
            {meditationPlaying && selectedMeditation.youtubeId && (
              <div className="absolute w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
                <iframe
                  key={selectedMeditation.id + meditationPlaying}
                  width="1"
                  height="1"
                  src={`https://www.youtube-nocookie.com/embed/${selectedMeditation.youtubeId}?autoplay=1&controls=0&playsinline=1&modestbranding=1&rel=0`}
                  title="Meditation Audio"
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

