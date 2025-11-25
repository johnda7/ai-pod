import React, { useState, useEffect } from 'react';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Pause, X, Headphones, Activity, Heart, ArrowRight, Volume2, Maximize2, SkipForward } from 'lucide-react';

export const MeditationView: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [activeMeditationId, setActiveMeditationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const activeSound = SOUNDSCAPES.find(s => s.id === activeSoundId);
  const dailyQuote = QUOTES[0];

  // Immersive Background Logic
  const getBackgroundGradient = () => {
    switch (activeSound?.iconType) {
      case 'RAIN': return 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900';
      case 'FOREST': return 'bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-900';
      case 'OCEAN': return 'bg-gradient-to-br from-cyan-950 via-blue-900 to-indigo-950';
      case 'FIRE': return 'bg-gradient-to-br from-orange-950 via-red-950 to-slate-900';
      case 'WIND': return 'bg-gradient-to-br from-gray-800 via-slate-800 to-slate-900';
      default: return 'bg-[#020617]';
    }
  };

  const handleSoundClick = (id: string) => {
      if (activeSoundId === id) {
          setIsPlaying(!isPlaying);
      } else {
          setActiveSoundId(id);
          setIsPlaying(true);
          setAudioLoading(true);
          // Simulate loading delay for better UX feel
          setTimeout(() => setAudioLoading(false), 1500);
      }
  };

  const getSoundIcon = (type: string, size = 24) => {
    switch(type) {
      case 'RAIN': return <CloudRain size={size} />;
      case 'FOREST': return <Trees size={size} />;
      case 'OCEAN': return <Waves size={size} />;
      case 'FIRE': return <Flame size={size} />;
      case 'WIND': return <Wind size={size} />;
      default: return <Headphones size={size} />;
    }
  };

  // Breathing Overlay 
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
          <div className="fixed inset-0 z-[80] bg-[#020617]/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-700">
              <button 
                  onClick={() => setShowBreathing(false)}
                  className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/5"
              >
                  <X size={24} />
              </button>

              <div className="text-center mb-12 relative z-10">
                  <h2 className="text-6xl font-thin text-white mb-2 tracking-tighter">4-7-8</h2>
                  <p className="text-blue-200/60 text-sm font-bold uppercase tracking-[0.3em]">Техника Дыхания</p>
              </div>

              <div className="relative flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full border border-blue-400/20 transition-all duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'scale-150 opacity-100' : 'scale-90 opacity-20'}`}></div>
                  <div className={`absolute inset-0 rounded-full border border-teal-400/20 transition-all duration-[4000ms] delay-75 ease-in-out ${phase === 'inhale' ? 'scale-[1.8] opacity-60' : 'scale-75 opacity-10'}`}></div>

                  <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative z-10 shadow-[0_0_80px_rgba(56,189,248,0.2)] backdrop-blur-2xl border border-white/10
                      ${phase === 'inhale' ? 'bg-blue-500/20 scale-110' : 
                        phase === 'hold' ? 'bg-purple-500/20 scale-100' : 
                        'bg-teal-900/10 scale-90'}
                  `}>
                      <div className="text-center">
                          <div className="text-7xl font-light text-white font-mono mb-2">{timer}</div>
                          <div className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                              {phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className={`min-h-screen pb-40 transition-colors duration-1000 ease-in-out relative overflow-hidden ${getBackgroundGradient()}`}>
      
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 z-0">
           {/* Animated blobs */}
           <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] transition-all duration-1000 ${isPlaying ? 'opacity-100 animate-[pulse_8s_infinite]' : 'opacity-40'}`}></div>
           <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] transition-all duration-1000 ${isPlaying ? 'opacity-100 animate-[pulse_10s_infinite_reverse]' : 'opacity-40'}`}></div>
           {/* Noise texture */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      </div>
      
      {showBreathing && <BreathingOverlay />}

      {/* 1. HEADER */}
      <div className="px-6 pt-20 pb-6 relative z-10">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h1 className="text-4xl font-medium text-white tracking-tight mb-1 font-serif">Релакс</h1>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Атмосфера и Медитации</p>
             </div>
             <button 
                onClick={() => setShowBreathing(true)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md active:scale-95 group shadow-lg"
             >
                 <Wind size={22} className="text-blue-200 group-hover:scale-110 transition-transform" />
             </button>
          </div>

          {/* Daily Quote - Glass Card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 backdrop-blur-xl shadow-2xl group">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                   <div className="text-6xl font-serif text-white">"</div>
               </div>
               <p className="relative z-10 text-xl font-medium text-white/90 leading-relaxed italic text-center font-serif">
                   "{dailyQuote.text}"
               </p>
               <div className="mt-4 text-center">
                   <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">— {dailyQuote.author}</p>
               </div>
          </div>
      </div>

      {/* 2. SOUNDSCAPES - Liquid Glass Cards */}
      <div className="pl-6 mb-10 relative z-10 animate-in slide-in-from-bottom-10 duration-700">
        <h2 className="text-white/80 font-bold text-xs mb-4 tracking-widest uppercase opacity-70 pl-1">
            Звуковые ландшафты
        </h2>
        
        <div className="flex gap-4 overflow-x-auto pb-8 pr-6 scrollbar-hide">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id;
            
            // Custom gradients for each card type
            let cardGradient = "from-slate-800 to-slate-900";
            if (sound.iconType === 'RAIN') cardGradient = "from-blue-600/80 to-indigo-900/80";
            if (sound.iconType === 'FOREST') cardGradient = "from-emerald-600/80 to-teal-900/80";
            if (sound.iconType === 'OCEAN') cardGradient = "from-cyan-600/80 to-blue-900/80";
            if (sound.iconType === 'FIRE') cardGradient = "from-orange-600/80 to-red-900/80";

            return (
              <button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                className={`
                    relative w-40 h-56 rounded-[2rem] shrink-0 overflow-hidden transition-all duration-500 group flex flex-col justify-between p-5 text-left
                    ${isActive 
                        ? 'ring-1 ring-white/50 scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                        : 'hover:scale-[1.02] opacity-80 hover:opacity-100'}
                `}
              >
                {/* Card Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient} backdrop-blur-md opacity-60 transition-opacity`}></div>
                
                {/* Active Indicator */}
                <div className="relative z-10 flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 transition-all duration-500 ${isActive ? 'bg-white/20' : 'bg-white/5'}`}>
                        {isActive && isPlaying ? (
                             <Activity size={18} className="animate-pulse text-white" />
                        ) : (
                             getSoundIcon(sound.iconType, 18)
                        )}
                    </div>
                </div>

                <div className="relative z-10">
                    <h3 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow-md">{sound.title}</h3>
                    <div className={`h-1 w-8 rounded-full transition-all duration-500 ${isActive ? 'bg-white w-12' : 'bg-white/30'}`}></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MEDITATIONS LIST */}
      <div className="px-6 relative z-10 animate-in slide-in-from-bottom-20 duration-700 delay-100 pb-20">
          <h2 className="text-white/80 font-bold text-xs mb-4 tracking-widest uppercase opacity-70 pl-1">
              Сессии
          </h2>
          <div className="space-y-3">
            {MEDITATIONS.map((meditation) => (
              <div 
                key={meditation.id}
                onClick={() => setActiveMeditationId(meditation.id)}
                className="group relative bg-[#151925]/30 hover:bg-white/10 border border-white/5 rounded-[1.5rem] p-4 flex items-center gap-5 transition-all active:scale-[0.98] cursor-pointer backdrop-blur-md shadow-sm hover:shadow-lg"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${meditation.color} bg-opacity-20 text-white shadow-inner ring-1 ring-white/10 group-hover:scale-105 transition-transform`}>
                   {meditation.category === 'SLEEP' && <Moon size={24} className="text-indigo-200" />}
                   {meditation.category === 'FOCUS' && <Zap size={24} className="text-yellow-200" />}
                   {meditation.category === 'ANXIETY' && <Wind size={24} className="text-emerald-200" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg leading-tight mb-1 group-hover:text-blue-200 transition-colors">
                      {meditation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                        {meditation.duration}
                    </span>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                         {meditation.category === 'ANXIETY' ? 'Тревога' : meditation.category === 'FOCUS' ? 'Фокус' : 'Сон'}
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all shadow-lg">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* 4. PREMIUM PLAYER (Calm Style) */}
      <div className={`fixed bottom-[6rem] left-0 right-0 z-50 px-4 transition-all duration-700 transform ease-in-out ${activeSoundId ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
           <div className="w-full max-w-md mx-auto bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 p-3 rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] ring-1 ring-white/10 flex flex-col gap-2">
               
               <div className="flex items-center gap-4 p-2">
                   {/* Album Art / Icon */}
                   <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg relative overflow-hidden group`}>
                        {audioLoading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className="relative z-10">{getSoundIcon(activeSound?.iconType || '', 24)}</div>
                   </div>
                   
                   {/* Track Info & Visualizer */}
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <div className="text-white font-bold text-base truncate flex items-center gap-2">
                           {activeSound?.title}
                       </div>
                       
                       {/* Mini Visualizer / Status */}
                       <div className="flex items-center gap-2 h-4">
                           {isPlaying ? (
                               <div className="flex gap-[3px] items-end h-3">
                                    <div className="w-1 bg-green-400 rounded-full animate-[bounce_0.8s_infinite] h-2"></div>
                                    <div className="w-1 bg-green-400 rounded-full animate-[bounce_1.2s_infinite] h-3"></div>
                                    <div className="w-1 bg-green-400 rounded-full animate-[bounce_0.6s_infinite] h-1.5"></div>
                                    <div className="w-1 bg-green-400 rounded-full animate-[bounce_1.0s_infinite] h-2.5"></div>
                                    <span className="text-[10px] text-green-400 font-bold ml-1 uppercase tracking-wider">Playing</span>
                               </div>
                           ) : (
                               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Paused</span>
                           )}
                       </div>
                   </div>

                   {/* Controls */}
                   <div className="flex items-center gap-2 pr-2">
                        <button 
                            onClick={() => {
                                if (activeSoundId) setIsPlaying(!isPlaying);
                            }}
                            className="w-12 h-12 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-lg shadow-white/10"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                        </button>
                        
                        <button 
                            onClick={() => {
                                setActiveSoundId(null);
                                setIsPlaying(false);
                            }}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white flex items-center justify-center transition-colors"
                        >
                            <X size={14} />
                        </button>
                   </div>
               </div>

               {/* Progress Bar (Visual Only for looped sound) */}
               {isPlaying && (
                   <div className="px-2 pb-2">
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 animate-[loading_10s_linear_infinite] w-full origin-left"></div>
                       </div>
                   </div>
               )}
           </div>

           {/* Hidden YouTube Embed */}
           {activeSound && (
               <div className="absolute w-1 h-1 opacity-0 pointer-events-none overflow-hidden bottom-0 right-0">
                 {/* Re-mount iframe when ID changes using key */}
                 <iframe 
                   key={activeSound.id}
                   width="1" height="1" 
                   src={`https://www.youtube.com/embed/${activeSound.youtubeId}?autoplay=1&controls=0&loop=1&playlist=${activeSound.youtubeId}&playsinline=1&enablejsapi=1`} 
                   title="Audio Player" 
                   allow="autoplay; encrypted-media"
                 ></iframe>
               </div>
           )}
      </div>

      {/* 5. MEDITATION MODAL */}
      {activeMeditationId && (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-in slide-in-from-bottom duration-500">
           <div className="absolute inset-0 bg-blue-900/10 blur-[120px] pointer-events-none"></div>

           <button 
             onClick={() => setActiveMeditationId(null)}
             className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white z-20 hover:bg-white/10 transition-colors backdrop-blur-md"
           >
             <X size={24} />
           </button>

           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
               {/* Visualizer Circle */}
               <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="w-full h-full rounded-full border border-white/5 bg-white/5 backdrop-blur-2xl flex items-center justify-center relative z-10 shadow-2xl ring-1 ring-white/10 group cursor-pointer hover:scale-105 transition-transform duration-500">
                        <Play size={80} fill="white" className="text-white ml-2 opacity-90 group-hover:scale-110 transition-transform" />
                    </div>
                    {/* Rotating Rings */}
                    <div className="absolute w-[110%] h-[110%] border border-white/5 rounded-full animate-[spin_20s_linear_infinite] opacity-50"></div>
                    <div className="absolute w-[130%] h-[130%] border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse] opacity-30"></div>
               </div>
               
               <h2 className="text-4xl font-medium text-white mb-4 leading-tight font-serif">
                 {MEDITATIONS.find(m => m.id === activeMeditationId)?.title}
               </h2>
               
               <div className="flex items-center gap-3 mb-12">
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white/60">
                       {MEDITATIONS.find(m => m.id === activeMeditationId)?.duration}
                   </span>
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white/60">
                       Голос
                   </span>
               </div>
               
               <button className="w-full max-w-xs py-5 bg-white text-black font-black rounded-full uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-[0_10px_40px_rgba(255,255,255,0.2)] active:scale-95">
                   Начать сессию
               </button>
           </div>
        </div>
      )}

    </div>
  );
};