
import React, { useState, useEffect } from 'react';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Music, Pause, X, Headphones, Activity } from 'lucide-react';

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

  const getSoundIcon = (type: string) => {
    switch(type) {
      case 'RAIN': return <CloudRain size={28} />;
      case 'FOREST': return <Trees size={28} />;
      case 'OCEAN': return <Waves size={28} />;
      case 'FIRE': return <Flame size={28} />;
      case 'WIND': return <Wind size={28} />;
      default: return <Music size={28} />;
    }
  };

  const getCategoryLabel = (cat: string) => {
      switch(cat) {
          case 'SLEEP': return 'СОН';
          case 'FOCUS': return 'КОНЦЕНТРАЦИЯ';
          case 'ANXIETY': return 'АНТИ-СТРЕСС';
          default: return 'ПРАКТИКА';
      }
  };

  // Компонент дыхательной гимнастики
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
          <div className="fixed inset-0 z-[80] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
              <button 
                onClick={() => setShowBreathing(false)}
                className="absolute top-6 right-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                  <X size={24} />
              </button>
              
              <div className="mb-12 text-center">
                  <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Дыхание 4-7-8</h2>
                  <p className="text-slate-400 font-medium">Успокоение нервной системы</p>
              </div>

              <div className="relative flex items-center justify-center mb-12">
                  {/* Outer Glow */}
                  <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-[4000ms] ${phase === 'inhale' ? 'bg-indigo-500/40 scale-150' : phase === 'hold' ? 'bg-purple-500/40 scale-125' : 'bg-blue-500/20 scale-100'}`}></div>
                  
                  {/* Animated Circle */}
                  <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-[4000ms] relative z-10 
                      ${phase === 'inhale' ? 'border-indigo-400 scale-110 bg-indigo-500/10' : 
                        phase === 'hold' ? 'border-purple-400 scale-110 bg-purple-500/10' : 
                        'border-blue-400 scale-90 bg-blue-500/5'}
                  `}>
                      <div className="text-center">
                          <div className="text-6xl font-black text-white mb-2 font-mono">{timer}</div>
                          <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-200">
                              {phase === 'inhale' ? 'ВДОХ' : phase === 'hold' ? 'ЗАДЕРЖКА' : 'ВЫДОХ'}
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="px-8 text-center text-slate-500 text-sm max-w-xs leading-relaxed">
                  Следуй за ритмом круга. Вдох через нос, выдох через рот.
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen pb-40 animate-in fade-in duration-700 bg-[#020617] text-white">
      {showBreathing && <BreathingOverlay />}

      {/* 1. HEADER */}
      <div className="px-6 pt-10 pb-6 bg-gradient-to-b from-indigo-950/20 to-transparent">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-1">Релакс</h1>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Станция восстановления</p>
             </div>
             <button 
                onClick={() => setShowBreathing(true)}
                className="w-14 h-14 bg-[#1E2332] rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-lg active:scale-95 transition-transform"
             >
                 <Wind size={24} />
             </button>
          </div>

          {/* QUOTE CARD */}
          <div className="relative bg-[#151925] rounded-[2rem] p-6 border border-white/5 shadow-2xl overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 blur-[60px] rounded-full group-hover:bg-indigo-600/30 transition-colors duration-700"></div>
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4">
                       <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                           Мысль дня
                       </span>
                   </div>
                   <p className="text-white font-bold text-xl leading-relaxed mb-6 font-serif italic">
                       "{dailyQuote.text}"
                   </p>
                   <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                           {dailyQuote.author[0]}
                       </div>
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{dailyQuote.author}</p>
                   </div>
               </div>
          </div>
      </div>

      {/* 2. ATMOSPHERE (SOUNDSCAPES) */}
      <div className="pl-6 mb-10">
        <h2 className="text-white font-bold text-xl mb-5 tracking-tight flex items-center gap-2">
            <Headphones size={20} className="text-indigo-400" />
            Атмосфера
        </h2>
        
        <div className="flex gap-4 overflow-x-auto pb-6 pr-6 scrollbar-hide">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                className={`
                    relative w-40 h-40 rounded-[2rem] shrink-0 overflow-hidden transition-all duration-300 group
                    ${isActive ? 'ring-2 ring-indigo-500 scale-105 shadow-[0_10px_30px_rgba(99,102,241,0.3)]' : 'hover:scale-105 active:scale-95'}
                `}
              >
                <div className={`absolute inset-0 ${sound.color} transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-80'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent"></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                    <div className={`
                        w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                        ${isActive ? 'bg-white text-indigo-600 scale-110' : 'bg-white/20 text-white backdrop-blur-sm'}
                    `}>
                        {getSoundIcon(sound.iconType)}
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{sound.title}</span>
                </div>
                
                {/* Playing Indicator */}
                {isActive && isPlaying && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-75"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-150"></div>
                    </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PRACTICES (MEDITATIONS) */}
      <div className="px-6">
          <h2 className="text-white font-bold text-xl mb-5 tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-emerald-400" />
              Практики
          </h2>
          <div className="space-y-4">
            {MEDITATIONS.map((meditation) => (
              <div 
                key={meditation.id}
                onClick={() => setActiveMeditationId(meditation.id)}
                className="group relative bg-[#151925] border border-white/5 rounded-[2rem] p-4 flex items-center gap-5 transition-all active:scale-[0.98] cursor-pointer hover:border-white/10 hover:bg-[#1E2332] shadow-sm"
              >
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 ${meditation.color} text-white shadow-lg group-hover:scale-105 transition-transform`}>
                   {meditation.category === 'SLEEP' && <Moon size={32} fill="currentColor" />}
                   {meditation.category === 'FOCUS' && <Zap size={32} fill="currentColor" />}
                   {meditation.category === 'ANXIETY' && <Wind size={32} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg leading-tight mb-2">
                      {meditation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        meditation.category === 'SLEEP' ? 'bg-indigo-500/10 text-indigo-300' :
                        meditation.category === 'FOCUS' ? 'bg-yellow-500/10 text-yellow-300' :
                        'bg-emerald-500/10 text-emerald-300'
                    }`}>
                        {getCategoryLabel(meditation.category)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        ● {meditation.duration}
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-full bg-[#0A0F1C] border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-indigo-500 group-hover:bg-indigo-500 transition-all">
                    <Play size={20} fill="currentColor" className="ml-1" />
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* 4. PLAYER BAR (Sticky) */}
      {activeSound && (
        <div className="fixed bottom-28 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
           <div className="bg-[#151925]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.7)] flex items-center gap-4 relative overflow-hidden ring-1 ring-white/10">
               
               {/* Progress Bar (Visual) */}
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                   <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-1/3 animate-[width_3s_ease-in-out_infinite_alternate]"></div>
               </div>

               <div className={`w-16 h-16 rounded-2xl ${activeSound.color} flex items-center justify-center text-white shrink-0 relative shadow-lg`}>
                   {getSoundIcon(activeSound.iconType)}
                   <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl"></div>
               </div>
               
               <div className="flex-1 min-w-0">
                   <div className="text-white font-bold text-lg truncate mb-0.5">{activeSound.title}</div>
                   <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                       {isPlaying ? 'ВОСПРОИЗВЕДЕНИЕ' : 'ПАУЗА'}
                   </div>
               </div>

               <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-14 h-14 rounded-full bg-white text-slate-900 hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl shadow-white/10"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>
                    
                    <button 
                        onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
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

      {/* 5. MEDITATION MODAL */}
      {activeMeditationId && (
        <div className="fixed inset-0 z-[70] bg-[#020617] flex flex-col animate-in zoom-in-95 duration-300">
           <button 
             onClick={() => setActiveMeditationId(null)}
             className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-20 hover:bg-white/20 transition-colors"
           >
             <X size={24} />
           </button>

           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
               {/* Background Effects */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617]"></div>
               
               <div className="relative z-10">
                   <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 mb-12 flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.4)] relative">
                        <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-full"></div>
                        <Play size={80} fill="currentColor" className="text-white ml-2 drop-shadow-2xl relative z-10" />
                   </div>
                   
                   <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                     {MEDITATIONS.find(m => m.id === activeMeditationId)?.title}
                   </h2>
                   
                   <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md mb-10">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                       <span className="text-slate-300 font-mono font-bold text-lg">00:00 / {MEDITATIONS.find(m => m.id === activeMeditationId)?.duration}</span>
                   </div>
                   
                   <p className="text-slate-500 font-medium bg-[#151925] px-6 py-3 rounded-xl inline-block border border-white/5">
                       Демо-режим: Аудио недоступно
                   </p>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};
