
import React, { useState, useEffect, useRef } from 'react';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { Play, Pause, Moon, Wind, Zap, Heart, CloudRain, Trees, Waves, Flame, Cloud, Quote as QuoteIcon, X, Film, Volume2 } from 'lucide-react';
import { Soundscape } from '../types';

export const MeditationView: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playingType, setPlayingType] = useState<'MEDITATION' | 'SOUNDSCAPE' | null>(null);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [showVideo, setShowVideo] = useState(false);
  const [breathingState, setBreathingState] = useState<'INHALE' | 'HOLD' | 'EXHALE'>('INHALE');

  const activeItem = playingType === 'MEDITATION' 
    ? MEDITATIONS.find(m => m.id === activeId) 
    : SOUNDSCAPES.find(s => s.id === activeId);

  // Breathing Animation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingState(prev => {
        if (prev === 'INHALE') return 'HOLD';
        if (prev === 'HOLD') return 'EXHALE';
        return 'INHALE';
      });
    }, 4000); // Simple 4-4-4 rhythm
    return () => clearInterval(interval);
  }, []);

  const getIcon = (cat: string) => {
    switch(cat) {
        case 'SLEEP': return <Moon size={20} />;
        case 'ANXIETY': return <Wind size={20} />;
        case 'FOCUS': return <Zap size={20} />;
        default: return <Heart size={20} />;
    }
  };

  const getSoundIcon = (type: string) => {
    switch(type) {
      case 'RAIN': return <CloudRain size={24} />;
      case 'FOREST': return <Trees size={24} />;
      case 'OCEAN': return <Waves size={24} />;
      case 'FIRE': return <Flame size={24} />;
      case 'WIND': return <Cloud size={24} />;
      default: return <Wind size={24} />;
    }
  };

  const handlePlay = (id: string, type: 'MEDITATION' | 'SOUNDSCAPE') => {
    if (activeId === id) {
      setActiveId(null);
      setPlayingType(null);
    } else {
      setActiveId(id);
      setPlayingType(type);
    }
  };

  // Glassmorphism Style Constants
  const GLASS_PANEL = "bg-white/5 backdrop-blur-[24px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]";
  const LIQUID_BUTTON = "backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg active:scale-95 transition-all hover:bg-white/20";

  return (
    <div className="min-h-full bg-[#0A0F1C] text-white pb-32 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* --- AMBIENT AUDIO PLAYER (HIDDEN) --- */}
      {playingType === 'SOUNDSCAPE' && activeItem && (activeItem as Soundscape).youtubeId && (
        <div className="hidden">
          <iframe 
            width="1" 
            height="1" 
            src={`https://www.youtube.com/embed/${(activeItem as Soundscape).youtubeId}?autoplay=1&loop=1&playlist=${(activeItem as Soundscape).youtubeId}&controls=0`} 
            title="Ambient Audio"
            allow="autoplay"
          ></iframe>
        </div>
      )}

      {/* --- BACKGROUND FLUID ANIMATIONS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Top Orb */}
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-[organic-float_15s_infinite_ease-in-out]"></div>
        {/* Bottom Orb */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[100px] animate-[organic-float_20s_infinite_ease-in-out_reverse]"></div>
        {/* Noise Texture for Grain */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="p-6 relative z-10 max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-indigo-200 drop-shadow-sm">
              Chill Space
            </h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide mt-1">Зона ментального релакса</p>
          </div>
          
          {/* Breathing Widget Mini */}
          <div className={`${GLASS_PANEL} rounded-full p-1 w-14 h-14 flex items-center justify-center relative`}>
              <div className={`absolute inset-0 rounded-full bg-cyan-400/20 blur-md transition-all duration-[4000ms] ${breathingState === 'INHALE' ? 'scale-125 opacity-100' : 'scale-75 opacity-30'}`}></div>
              <Wind size={20} className="text-cyan-100 relative z-10" />
          </div>
        </div>

        {/* Feature: Daily Inspiration (Cinematic Glass) */}
        <div className={`mb-10 rounded-[2.5rem] overflow-hidden relative group ${GLASS_PANEL} transition-transform duration-500 hover:scale-[1.01]`}>
             {showVideo && quote.videoUrl ? (
                 <div className="aspect-video relative bg-black animate-in fade-in duration-500">
                     <iframe 
                        src={`${quote.videoUrl}?autoplay=1`} 
                        title="Movie Clip" 
                        className="w-full h-full border-0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                     />
                     <button 
                        onClick={(e) => { e.stopPropagation(); setShowVideo(false); }}
                        className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-red-500/80 backdrop-blur-md transition-colors"
                     >
                        <X size={20} />
                     </button>
                 </div>
             ) : (
                 <div className="p-8 relative min-h-[240px] flex flex-col justify-center">
                    {/* Cinematic Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                            <div className="w-1 h-1 bg-cyan-300 rounded-full"></div>
                            Мысль дня
                        </div>
                        
                        <blockquote className="text-2xl font-bold text-white mb-6 leading-relaxed">
                        "{quote.text}"
                        </blockquote>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{quote.author}</span>
                                {quote.movie && <span className="text-xs text-slate-400">{quote.movie}</span>}
                            </div>
                            
                            {quote.videoUrl && (
                                <button 
                                    onClick={() => setShowVideo(true)}
                                    className={`${LIQUID_BUTTON} px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 group-hover:bg-white/20`}
                                >
                                    <Play size={12} fill="currentColor" />
                                    Смотреть
                                </button>
                            )}
                        </div>
                    </div>
                 </div>
             )}
        </div>

        {/* Feature: Liquid Soundscapes */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-lg font-bold text-white tracking-wide">Атмосфера</h3>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audio HQ</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide">
            {SOUNDSCAPES.map((sound) => {
               const isPlaying = activeId === sound.id;
               return (
                <button 
                  key={sound.id}
                  onClick={() => handlePlay(sound.id, 'SOUNDSCAPE')}
                  className="group relative flex-shrink-0"
                >
                   <div className={`w-20 h-28 rounded-[2rem] transition-all duration-500 flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
                     isPlaying 
                        ? 'scale-110 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]' 
                        : 'hover:translate-y-1'
                   }`}>
                      {/* Active State Background */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b ${sound.color.replace('bg-', 'from-')}/80 to-black/50`}></div>
                      
                      {/* Inactive State Glass */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'} ${GLASS_PANEL} bg-white/5`}></div>

                      <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                          {isPlaying ? (
                              <div className="flex gap-[3px] h-5 items-end">
                                  {[...Array(4)].map((_, i) => (
                                      <div key={i} className="w-[3px] bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ animationDelay: `${i*0.1}s` }}></div>
                                  ))}
                              </div>
                          ) : (
                              getSoundIcon(sound.iconType)
                          )}
                      </div>
                      <span className="relative z-10 text-[10px] font-bold tracking-wider">{sound.title}</span>
                   </div>
                </button>
               );
            })}
          </div>
        </div>

        {/* Feature: Meditations List */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-lg font-bold text-white tracking-wide">Практики</h3>
          </div>
          
          <div className="space-y-3">
              {MEDITATIONS.map((m) => {
                  const isActive = activeId === m.id;
                  return (
                      <div 
                        key={m.id} 
                        onClick={() => handlePlay(m.id, 'MEDITATION')}
                        className={`relative overflow-hidden rounded-3xl p-1 transition-all duration-300 group cursor-pointer active:scale-[0.98]`}
                      >
                          {/* Inner Content */}
                          <div className={`relative z-10 flex items-center justify-between p-4 rounded-[1.3rem] transition-all duration-300 ${
                              isActive ? 'bg-white/10 backdrop-blur-xl' : `${GLASS_PANEL} hover:bg-white/10`
                          }`}>
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                    isActive ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-white/70'
                                  }`}>
                                      {isActive ? <Pause size={18} fill="currentColor" /> : getIcon(m.category)}
                                  </div>
                                  <div>
                                      <h4 className={`font-bold text-base transition-colors ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                        {m.title}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                              m.category === 'SLEEP' ? 'bg-purple-400' : m.category === 'FOCUS' ? 'bg-orange-400' : 'bg-cyan-400'
                                          }`}></span>
                                          {m.category}
                                        </span>
                                        <span className="text-[10px] text-white/30">•</span>
                                        <span className="text-[10px] text-white/50">{m.duration}</span>
                                      </div>
                                  </div>
                              </div>
                              
                              {isActive && (
                                  <div className="mr-2">
                                      <Volume2 size={20} className="text-cyan-300 animate-pulse" />
                                  </div>
                              )}
                          </div>
                          
                          {/* Glow Border Effect on Active */}
                          {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50 blur-sm rounded-3xl -z-10"></div>
                          )}
                      </div>
                  );
              })}
          </div>
        </div>
      </div>

      {/* --- GLOBAL PLAYER CAPSULE (Sticky) --- */}
      {activeId && activeItem && (
         <div className="fixed bottom-24 left-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-500 ease-out">
             <div className={`${GLASS_PANEL} p-2 pr-4 rounded-[2.5rem] flex items-center gap-3 backdrop-blur-[40px] border-white/20 ring-1 ring-white/20`}>
                 
                 {/* Spinning Vinyl / Icon */}
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden ${
                   playingType === 'SOUNDSCAPE' ? (activeItem as Soundscape).color : 'bg-indigo-600'
                 }`}>
                     {/* Spinner animation */}
                     <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
                     <div className="relative z-10">
                        {playingType === 'SOUNDSCAPE' 
                            ? getSoundIcon((activeItem as Soundscape).iconType) 
                            : getIcon((activeItem as any).category)
                        }
                     </div>
                 </div>

                 <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-white text-sm truncate">{activeItem.title}</h4>
                     <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-[10px] text-cyan-200 font-bold tracking-widest uppercase">Now Playing</span>
                     </div>
                 </div>

                 {/* Controls */}
                 <button 
                   onClick={() => { setActiveId(null); setPlayingType(null); }}
                   className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors text-white"
                 >
                    <X size={18} />
                 </button>
             </div>
         </div>
      )}

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; opacity: 0.5; }
          50% { height: 16px; opacity: 1; }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
