
import React, { useState } from 'react';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Music, Settings, X, Volume2 } from 'lucide-react';

export const MeditationView: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [activeMeditationId, setActiveMeditationId] = useState<string | null>(null);
  const [volume, setVolume] = useState(50); // Визуальная громкость

  const activeSound = SOUNDSCAPES.find(s => s.id === activeSoundId);

  const getSoundIcon = (type: string) => {
    switch(type) {
      case 'RAIN': return <CloudRain size={28} strokeWidth={1.5} />;
      case 'FOREST': return <Trees size={28} strokeWidth={1.5} />;
      case 'OCEAN': return <Waves size={28} strokeWidth={1.5} />;
      case 'FIRE': return <Flame size={28} strokeWidth={1.5} />;
      case 'WIND': return <Wind size={28} strokeWidth={1.5} />;
      default: return <Music size={28} strokeWidth={1.5} />;
    }
  };

  const toggleSound = (id: string) => {
    setActiveSoundId(prev => prev === id ? null : id);
  };

  // Use the first quote for display
  const dailyQuote = QUOTES[0];

  return (
    <div className="max-w-md mx-auto min-h-screen pb-40 animate-in fade-in duration-700">
      
      {/* 1. HEADER & QUOTE */}
      <div className="p-6 pb-2">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Chill Space</h1>
                  <p className="text-indigo-200/60 text-sm font-medium">Зона ментального релакса</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                  <Settings size={20} />
              </button>
          </div>

          {/* QUOTE CARD */}
          <div className="relative bg-[#1E2332]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 mb-8 overflow-hidden group shadow-lg">
               {/* Decorative Gradient Blob */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Мысль дня</span>
                   </div>
                   <p className="text-white font-medium text-xl leading-relaxed mb-4 font-serif">
                       "{dailyQuote.text}"
                   </p>
                   <div className="flex items-center gap-2">
                       <div className="h-px w-4 bg-indigo-500/50"></div>
                       <span className="text-sm font-bold text-white">{dailyQuote.author}</span>
                   </div>
               </div>
          </div>
      </div>

      {/* 2. ATMOSPHERE (SOUNDSCAPES) */}
      <div className="pl-6 mb-8">
        <div className="flex justify-between items-end pr-6 mb-4">
            <h2 className="text-white font-bold text-lg">Атмосфера</h2>
            <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">AUDIO HQ</span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide pr-6 snap-x">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className="snap-start shrink-0 flex flex-col items-center gap-3 group"
              >
                {/* Squircle Button */}
                <div className={`
                    w-[88px] h-[110px] rounded-[1.8rem] flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden border
                    ${isActive 
                        ? 'bg-gradient-to-b from-[#10B981] to-[#059669] border-[#34D399] shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] translate-y-[-4px]' 
                        : 'bg-[#1E2332] border-white/5 text-slate-400 hover:bg-[#252b3d] hover:border-white/10'}
                `}>
                    {/* Icon */}
                    <div className={`transition-all duration-500 ${isActive ? 'text-white scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                        {getSoundIcon(sound.iconType)}
                    </div>
                    
                    {/* Label inside for cleaner look */}
                    <span className={`absolute bottom-4 text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {sound.title}
                    </span>

                    {/* Active Indicator Dot */}
                    {isActive && (
                        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse"></div>
                    )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PRACTICES LIST */}
      <div className="px-6">
          <h2 className="text-white font-bold text-lg mb-4">Практики</h2>
          <div className="space-y-3">
            {MEDITATIONS.map((meditation) => (
              <div 
                key={meditation.id}
                onClick={() => setActiveMeditationId(meditation.id)}
                className="group relative bg-[#1E2332]/80 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-4 flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer hover:bg-[#252b3d] hover:border-white/10"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${meditation.color} text-white shadow-lg`}>
                   {meditation.category === 'SLEEP' && <Moon size={20} fill="currentColor" />}
                   {meditation.category === 'FOCUS' && <Zap size={20} fill="currentColor" />}
                   {meditation.category === 'ANXIETY' && <Wind size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base leading-tight mb-1 truncate">
                      {meditation.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${meditation.color}`}></span>
                    <span className="uppercase tracking-wide">{meditation.category === 'SLEEP' ? 'Сон' : 'Фокус'}</span>
                    <span className="text-slate-600">•</span>
                    <span>{meditation.duration}</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                    <Play size={14} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* 4. FLOATING PLAYER (TOAST STYLE) */}
      {activeSound && (
        <div className="fixed bottom-32 left-6 right-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-500">
           <div className="bg-[#2A3042]/90 backdrop-blur-2xl border border-white/10 p-3 pr-4 rounded-[2rem] flex items-center justify-between shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/5">
               
               <div className="flex items-center gap-3">
                   {/* Icon Container with Wave Animation */}
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${activeSound.color} relative overflow-hidden`}>
                       <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                       {getSoundIcon(activeSound.iconType)}
                   </div>
                   
                   <div>
                       <div className="text-white font-bold text-sm leading-none mb-1">{activeSound.title}</div>
                       <div className="flex items-center gap-1.5">
                           <div className="flex items-end gap-[2px] h-3">
                               <div className="w-[2px] h-1.5 bg-green-400 rounded-full animate-[bounce_1s_infinite]"></div>
                               <div className="w-[2px] h-3 bg-green-400 rounded-full animate-[bounce_1.2s_infinite]"></div>
                               <div className="w-[2px] h-2 bg-green-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
                           </div>
                           <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Playing</span>
                       </div>
                   </div>
               </div>

               <div className="flex items-center gap-3">
                  {/* Fake Volume Slider */}
                  <div className="hidden sm:flex items-center gap-2 px-2">
                     <Volume2 size={14} className="text-slate-400" />
                     <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 w-1/2"></div>
                     </div>
                  </div>

                  <div className="h-8 w-px bg-white/10 mx-1"></div>
                  
                  <button 
                      onClick={() => setActiveSoundId(null)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
               </div>
           </div>
           
           {/* 
              FIXED AUDIO PLAYBACK 
              Using a visible (but transparent) div ensures browsers handle autoplay better than 'display: none'.
           */}
           <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden -z-10">
             <iframe 
               width="100%" 
               height="100%" 
               src={`https://www.youtube.com/embed/${activeSound.youtubeId}?autoplay=1&controls=0&showinfo=0&loop=1&playlist=${activeSound.youtubeId}&enablejsapi=1&version=3`} 
               title="Audio Background" 
               allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
               referrerPolicy="strict-origin-when-cross-origin"
             ></iframe>
           </div>
        </div>
      )}

      {/* 5. FULL SCREEN MEDITATION MODAL */}
      {activeMeditationId && (
        <div className="fixed inset-0 z-[60] bg-[#0A0F1C] flex flex-col animate-in fade-in duration-500">
           {/* Background Gradient */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#0A0F1C] to-[#0A0F1C] pointer-events-none"></div>
           
           <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
               <button 
                 onClick={() => setActiveMeditationId(null)}
                 className="absolute top-8 right-8 p-3 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
               >
                 <X size={24} />
               </button>

               <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-12 relative group cursor-pointer">
                  {/* Breathing Animation Rings */}
                  <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
                  <div className="absolute inset-0 border border-indigo-400/10 rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-8 border border-purple-500/20 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                  
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-500">
                      <Play size={48} fill="currentColor" className="ml-2 drop-shadow-lg" />
                  </div>
               </div>
               
               <h2 className="text-3xl font-bold text-white mb-4 text-center tracking-tight">
                 {MEDITATIONS.find(m => m.id === activeMeditationId)?.title}
               </h2>
               <p className="text-slate-400 text-lg mb-12 text-center font-medium max-w-xs mx-auto">
                   Найди удобное положение и сосредоточься на дыхании...
               </p>
               
               {/* Player Controls Mockup */}
               <div className="w-full max-w-sm bg-white/5 rounded-3xl p-6 backdrop-blur-md border border-white/5">
                   <div className="w-full bg-white/10 h-1.5 rounded-full mb-6 overflow-hidden">
                       <div className="w-1/3 h-full bg-indigo-400 rounded-full"></div>
                   </div>
                   <div className="flex justify-between items-center px-4">
                        <span className="text-xs text-slate-500 font-mono">04:20</span>
                        <div className="flex gap-6 text-white">
                             <Music size={24} className="opacity-50" />
                        </div>
                        <span className="text-xs text-slate-500 font-mono">15:00</span>
                   </div>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};
