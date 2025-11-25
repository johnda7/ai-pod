
import React, { useState, useEffect } from 'react';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Music, Pause, X, Headphones, Activity, Heart, ArrowRight } from 'lucide-react';

export const MeditationView: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [activeMeditationId, setActiveMeditationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  const activeSound = SOUNDSCAPES.find(s => s.id === activeSoundId);
  const dailyQuote = QUOTES[0];

  const handleSoundClick = (id: string) => {
      if (activeSoundId === id) {
          setActiveSoundId(null);
          setIsPlaying(false);
      } else {
          setActiveSoundId(id);
          setIsPlaying(true);
      }
  };

  const getSoundIcon = (type: string, size = 20) => {
    switch(type) {
      case 'RAIN': return <CloudRain size={size} />;
      case 'FOREST': return <Trees size={size} />;
      case 'OCEAN': return <Waves size={size} />;
      case 'FIRE': return <Flame size={size} />;
      case 'WIND': return <Wind size={size} />;
      default: return <Music size={size} />;
    }
  };

  // Breathing Overlay (Improved Visuals)
  const BreathingOverlay = () => {
      const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
      const [timer, setTimer] = useState(4);
      
      useEffect(() => {
          const interval = setInterval(() => {
              setTimer(prev => {
                  if (prev === 1) {
                      if (phase === 'inhale') { setPhase('hold'); return 7; }
                      if (phase === 'hold') { setPhase('exhale'); return 8; }
                      if (phase === 'exhale') { setPhase('inhale'); return 4; }
                  }
                  return prev - 1;
              });
          }, 1000);
          return () => clearInterval(interval);
      }, [phase]);

      return (
          <div className="fixed inset-0 z-[80] bg-[#020617]/80 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-700">
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-end">
                <button 
                    onClick={() => setShowBreathing(false)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <X size={20} />
                </button>
              </div>

              <div className="text-center mb-16 relative z-10">
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight">4 — 7 — 8</h2>
                  <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest opacity-80">Техника спокойствия</p>
              </div>

              <div className="relative flex items-center justify-center">
                  {/* Outer Rings */}
                  <div className={`absolute inset-0 rounded-full border border-indigo-500/30 transition-all duration-[4000ms] ${phase === 'inhale' ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                  <div className={`absolute inset-0 rounded-full border border-purple-500/20 transition-all duration-[4000ms] delay-100 ${phase === 'inhale' ? 'scale-[1.8] opacity-80' : 'scale-90 opacity-40'}`}></div>

                  {/* Core Visual */}
                  <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-[4000ms] relative z-10 shadow-[0_0_50px_rgba(99,102,241,0.5)]
                      ${phase === 'inhale' ? 'bg-indigo-500 scale-110 shadow-indigo-500/60' : 
                        phase === 'hold' ? 'bg-purple-600 scale-100 shadow-purple-600/60' : 
                        'bg-blue-900 scale-90 shadow-blue-900/40'}
                  `}>
                      <div className="text-center">
                          <div className="text-5xl font-black text-white font-mono">{timer}</div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 mt-1">
                              {phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Держи' : 'Выдох'}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen pb-40 animate-in fade-in duration-700 bg-[#020617] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-teal-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      {showBreathing && <BreathingOverlay />}

      {/* 1. HEADER & QUOTE */}
      <div className="px-6 pt-12 pb-6">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">Восстановление</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Твой личный дзен</p>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                 <Heart size={20} fill="white" className="text-white" />
             </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#151925]/60 border border-white/5 p-8 shadow-2xl backdrop-blur-xl group">
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               
               <p className="relative z-10 text-xl font-medium text-white leading-relaxed italic opacity-90">
                   "{dailyQuote.text}"
               </p>
               <div className="relative z-10 mt-6 flex items-center gap-2">
                   <div className="h-px w-8 bg-indigo-500"></div>
                   <p className="text-indigo-300 text-xs font-black uppercase tracking-widest">{dailyQuote.author}</p>
               </div>
          </div>
      </div>

      {/* 2. ATMOSPHERE (Updated: Smaller Icons, Cleaner Look) */}
      <div className="pl-6 mb-8">
        <h2 className="text-white font-bold text-lg mb-4 tracking-tight flex items-center gap-2 opacity-90">
            <Headphones size={18} className="text-teal-400" />
            Атмосфера
        </h2>
        
        <div className="flex gap-4 overflow-x-auto pb-4 pr-6 scrollbar-hide">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                className={`
                    relative w-24 h-32 rounded-[1.5rem] shrink-0 overflow-hidden transition-all duration-300 group flex flex-col items-center justify-end p-3
                    ${isActive 
                        ? 'ring-1 ring-white/50 scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                        : 'hover:bg-white/5 active:scale-95 opacity-70 hover:opacity-100'}
                `}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 ${sound.color} opacity-20 transition-opacity duration-500 ${isActive ? 'opacity-40' : ''}`}></div>
                
                {/* Icon Container */}
                <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/10 backdrop-blur-md
                    ${isActive ? 'bg-white text-black scale-110 shadow-lg' : 'bg-white/10 text-white'}
                `}>
                    {getSoundIcon(sound.iconType)}
                </div>

                {/* Equalizer Animation (Only when active) */}
                {isActive && isPlaying && (
                    <div className="absolute bottom-3 flex gap-0.5 items-end h-3">
                         <div className="w-1 bg-white/80 rounded-full animate-[bounce_0.8s_infinite] h-full"></div>
                         <div className="w-1 bg-white/80 rounded-full animate-[bounce_1.2s_infinite] h-2/3"></div>
                         <div className="w-1 bg-white/80 rounded-full animate-[bounce_0.6s_infinite] h-full"></div>
                         <div className="w-1 bg-white/80 rounded-full animate-[bounce_1s_infinite] h-1/2"></div>
                    </div>
                )}
                
                {!isActive && (
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider opacity-60">{sound.title}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. QUICK ACTIONS (Breathing) */}
      <div className="px-6 mb-10">
          <div 
            onClick={() => setShowBreathing(true)}
            className="w-full bg-[#151925]/60 border border-white/5 rounded-[2rem] p-1 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group backdrop-blur-md"
          >
              <div className="w-24 h-24 rounded-[1.8rem] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 border border-white/10 rounded-[1.8rem]"></div>
                  <Wind size={32} className="text-indigo-300 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500/30 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-indigo-400 animate-[loading_2s_infinite]"></div>
                  </div>
              </div>
              <div className="flex-1 py-2 pr-4">
                  <h3 className="text-lg font-bold text-white mb-1">Дыхание 4-7-8</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Быстрый способ снять стресс и успокоить нервы перед сном.</p>
              </div>
              <div className="pr-4 text-slate-500 group-hover:text-white transition-colors">
                  <ArrowRight size={20} />
              </div>
          </div>
      </div>

      {/* 4. MEDITATIONS LIST */}
      <div className="px-6">
          <h2 className="text-white font-bold text-lg mb-4 tracking-tight flex items-center gap-2 opacity-90">
              <Activity size={18} className="text-emerald-400" />
              Практики
          </h2>
          <div className="space-y-3">
            {MEDITATIONS.map((meditation) => (
              <div 
                key={meditation.id}
                onClick={() => setActiveMeditationId(meditation.id)}
                className="group relative bg-[#151925]/40 border border-white/5 rounded-[1.5rem] p-4 flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer hover:bg-white/5 backdrop-blur-sm"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meditation.color} bg-opacity-20 text-white shadow-inner`}>
                   {meditation.category === 'SLEEP' && <Moon size={20} className="text-indigo-200" />}
                   {meditation.category === 'FOCUS' && <Zap size={20} className="text-yellow-200" />}
                   {meditation.category === 'ANXIETY' && <Wind size={20} className="text-emerald-200" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-indigo-300 transition-colors">
                      {meditation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                        {meditation.duration}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-black transition-all">
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* 5. FLOATING PLAYER (Glass Capsule) */}
      {activeSound && (
        <div className="fixed bottom-28 left-0 right-0 z-40 px-6 animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 p-3 pr-4 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-4 relative overflow-hidden ring-1 ring-white/10">
               
               {/* Progress Line */}
               <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-1/3 animate-[loading_4s_ease-in-out_infinite]"></div>
               </div>

               <div className={`w-12 h-12 rounded-full ${activeSound.color} flex items-center justify-center text-white shrink-0 relative shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                   {getSoundIcon(activeSound.iconType, 18)}
               </div>
               
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                   <div className="text-white font-bold text-sm truncate">{activeSound.title}</div>
                   <div className="text-indigo-300/70 text-[10px] font-bold uppercase tracking-widest">
                       {isPlaying ? 'Играет...' : 'Пауза'}
                   </div>
               </div>

               <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition-all"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    
                    <button 
                        onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
               </div>

               {/* YouTube Embed (Hidden) */}
               {isPlaying && (
                   <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none">
                     <iframe 
                       width="100" height="100" 
                       src={`https://www.youtube.com/embed/${activeSound.youtubeId}?autoplay=1&controls=0&loop=1&playlist=${activeSound.youtubeId}&playsinline=1`} 
                       title="Audio" 
                       allow="autoplay"
                     ></iframe>
                   </div>
               )}
           </div>
        </div>
      )}

      {/* 6. MEDITATION MODAL (Full Screen) */}
      {activeMeditationId && (
        <div className="fixed inset-0 z-[70] bg-[#020617] flex flex-col animate-in zoom-in-95 duration-300">
           <div className="absolute inset-0 bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

           <button 
             onClick={() => setActiveMeditationId(null)}
             className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-20 hover:bg-white/20 transition-colors backdrop-blur-md"
           >
             <X size={24} />
           </button>

           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
               <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="w-full h-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center relative z-10 shadow-2xl">
                        <Play size={64} fill="white" className="text-white ml-2 opacity-80" />
                    </div>
                    {/* Orbiting particles */}
                    <div className="absolute w-[120%] h-[120%] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]">
                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
                    </div>
               </div>
               
               <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                 {MEDITATIONS.find(m => m.id === activeMeditationId)?.title}
               </h2>
               
               <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md mb-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="text-slate-300 font-mono font-bold text-sm">
                       {MEDITATIONS.find(m => m.id === activeMeditationId)?.duration}
                   </span>
               </div>
               
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                   Аудио-сессия загружается...<br/>(Демо режим)
               </p>
           </div>
        </div>
      )}

    </div>
  );
};
