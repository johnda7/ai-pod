
import React, { useState } from 'react';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Music, Pause, X, Headphones, Heart } from 'lucide-react';

export const MeditationView: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [activeMeditationId, setActiveMeditationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
      case 'RAIN': return <CloudRain size={24} />;
      case 'FOREST': return <Trees size={24} />;
      case 'OCEAN': return <Waves size={24} />;
      case 'FIRE': return <Flame size={24} />;
      case 'WIND': return <Wind size={24} />;
      default: return <Music size={24} />;
    }
  };

  const getCategoryLabel = (cat: string) => {
      switch(cat) {
          case 'SLEEP': return 'Сон';
          case 'FOCUS': return 'Фокус';
          case 'ANXIETY': return 'Спокойствие';
          default: return 'Медитация';
      }
  };

  return (
    <div className="min-h-screen pb-40 animate-in fade-in duration-700 bg-[#020617]">
      
      {/* 1. HEADER & QUOTE */}
      <div className="p-6 pt-8">
          <div className="flex items-center justify-between mb-6">
             <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Зона Релакса</h1>
                <p className="text-slate-400 text-sm font-medium">Твоя станция перезагрузки</p>
             </div>
             <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                 <Headphones size={20} />
             </div>
          </div>

          {/* QUOTE CARD */}
          <div className="relative bg-gradient-to-br from-[#1E2332] to-[#151925] rounded-3xl p-6 border border-white/5 shadow-xl overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full"></div>
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-3">
                       <SparklesIcon className="text-yellow-400" size={16} />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Цитата дня</span>
                   </div>
                   <p className="text-white font-medium text-lg leading-relaxed italic mb-4">
                       "{dailyQuote.text}"
                   </p>
                   <div className="flex items-center gap-2">
                       <div className="h-px w-8 bg-indigo-500"></div>
                       <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{dailyQuote.author}</p>
                   </div>
               </div>
          </div>
      </div>

      {/* 2. SOUNDSCAPES (HORIZONTAL SCROLL) */}
      <div className="pl-6 mb-10">
        <div className="flex items-center justify-between pr-6 mb-4">
            <h2 className="text-white font-bold text-lg tracking-tight">Атмосфера</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 pr-6 scrollbar-hide">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                className={`
                    relative w-36 h-48 rounded-[2rem] shrink-0 overflow-hidden transition-all duration-300 group flex flex-col justify-end p-4 text-left
                    ${isActive ? 'ring-2 ring-indigo-500 scale-105' : 'hover:opacity-90'}
                `}
              >
                {/* Background */}
                <div className={`absolute inset-0 ${sound.color} transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-80'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>

                {/* Active Indicator */}
                {isActive && (
                     <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                         <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                     </div>
                )}
                
                <div className="relative z-10">
                    <div className="mb-2 text-white/90">
                        {getSoundIcon(sound.iconType)}
                    </div>
                    <span className="text-base font-bold text-white leading-none block">{sound.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GUIDED MEDITATIONS (LIST) */}
      <div className="px-6">
          <h2 className="text-white font-bold text-lg mb-4 tracking-tight">Практики</h2>
          <div className="space-y-3">
            {MEDITATIONS.map((meditation) => (
              <div 
                key={meditation.id}
                onClick={() => setActiveMeditationId(meditation.id)}
                className="group relative bg-[#1E2332] border border-white/5 rounded-[1.5rem] p-2 pr-5 flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer hover:border-white/10 hover:bg-[#252b3b]"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${meditation.color} text-white shadow-lg group-hover:scale-105 transition-transform`}>
                   {meditation.category === 'SLEEP' && <Moon size={28} fill="currentColor" />}
                   {meditation.category === 'FOCUS' && <Zap size={28} fill="currentColor" />}
                   {meditation.category === 'ANXIETY' && <Wind size={28} />}
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-bold text-white text-base leading-tight mb-1.5">
                      {meditation.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 uppercase tracking-wider text-[10px]">
                        {getCategoryLabel(meditation.category)}
                    </span>
                    <span>{meditation.duration}</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-sm">
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* 4. PLAYER BAR (Sticky) */}
      {activeSound && (
        <div className="fixed bottom-28 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
           <div className="bg-[#151925]/95 backdrop-blur-xl border border-white/10 p-3 pr-5 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 relative overflow-hidden ring-1 ring-white/5">
               
               {/* Progress Bar (Fake) */}
               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                   <div className="h-full bg-indigo-500 w-1/3 animate-[width_20s_linear_infinite]"></div>
               </div>

               {/* Artwork */}
               <div className={`w-14 h-14 rounded-2xl ${activeSound.color} flex items-center justify-center text-white shrink-0 relative shadow-lg`}>
                   {getSoundIcon(activeSound.iconType)}
                   <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl"></div>
               </div>
               
               <div className="flex-1 min-w-0">
                   <div className="text-white font-bold text-base truncate">{activeSound.title}</div>
                   <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                       {isPlaying ? 'Воспроизведение...' : 'Пауза'}
                   </div>
               </div>

               <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 rounded-full bg-white text-slate-900 hover:bg-indigo-50 flex items-center justify-center transition-colors shadow-lg"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                    
                    <button 
                        onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
               </div>

               {/* Hidden YouTube Embed */}
               {isPlaying && (
                   <div className="absolute top-0 left-0 w-1 h-1 opacity-[0.01] pointer-events-none overflow-hidden">
                     <iframe 
                       width="100%" 
                       height="100%" 
                       src={`https://www.youtube.com/embed/${activeSound.youtubeId}?autoplay=1&controls=0&showinfo=0&loop=1&playlist=${activeSound.youtubeId}&enablejsapi=1&version=3&playsinline=1&mute=0`} 
                       title="Audio" 
                       allow="autoplay; encrypted-media;"
                       referrerPolicy="strict-origin-when-cross-origin"
                     ></iframe>
                   </div>
               )}
           </div>
        </div>
      )}

      {/* 5. MEDITATION MODAL */}
      {activeMeditationId && (
        <div className="fixed inset-0 z-[60] bg-[#0A0F1C] flex flex-col animate-in zoom-in-95 duration-300">
           <button 
             onClick={() => setActiveMeditationId(null)}
             className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-20 hover:bg-white/20 transition-colors"
           >
             <X size={24} />
           </button>

           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
               <div className="relative">
                   <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-30 rounded-full"></div>
                   <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 mb-10 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] relative z-10">
                        <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
                        <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
                        <Play size={80} fill="currentColor" className="text-white ml-2 drop-shadow-lg" />
                   </div>
               </div>
               
               <h2 className="text-3xl font-black text-white mb-4 max-w-xs mx-auto leading-tight">
                 {MEDITATIONS.find(m => m.id === activeMeditationId)?.title}
               </h2>
               
               <div className="bg-white/5 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md">
                   <span className="text-indigo-300 font-mono font-bold">00:00 / {MEDITATIONS.find(m => m.id === activeMeditationId)?.duration}</span>
               </div>
               
               <p className="mt-12 text-slate-500 text-sm font-medium bg-[#151925] px-4 py-2 rounded-lg">Демо-режим</p>
           </div>
        </div>
      )}

    </div>
  );
};

// Simple Sparkle Icon component for internal use
const SparklesIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);
