
import React, { useState } from 'react';
import { MEDITATIONS, SOUNDSCAPES, QUOTES } from '../constants';
import { Play, Wind, CloudRain, Trees, Waves, Flame, Zap, Moon, Music, Pause, X } from 'lucide-react';

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
      case 'RAIN': return <CloudRain size={32} />;
      case 'FOREST': return <Trees size={32} />;
      case 'OCEAN': return <Waves size={32} />;
      case 'FIRE': return <Flame size={32} />;
      case 'WIND': return <Wind size={32} />;
      default: return <Music size={32} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-40 animate-in fade-in duration-700 bg-[#020617]">
      
      {/* 1. HEADER AREA */}
      <div className="p-6">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">Chill Zone</h1>
          <p className="text-slate-400 text-sm font-medium mb-6">Твоя станция перезагрузки</p>

          {/* FEATURED QUOTE - Minimalist */}
          <div className="relative border-l-4 border-indigo-500 pl-4 py-2 mb-8">
               <p className="text-white font-medium text-lg leading-relaxed italic">
                   "{dailyQuote.text}"
               </p>
               <p className="text-indigo-400 text-xs font-bold mt-2 uppercase tracking-widest">{dailyQuote.author}</p>
          </div>
      </div>

      {/* 2. SOUNDSCAPES (Grid Layout instead of Row) */}
      <div className="px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg tracking-tight">Атмосфера</h2>
            {activeSound && (
                 <div className="flex items-center gap-2">
                     <span className="flex gap-0.5 h-3 items-end">
                         <span className="w-0.5 h-2 bg-emerald-500 animate-[bounce_0.8s_infinite]"></span>
                         <span className="w-0.5 h-3 bg-emerald-500 animate-[bounce_1.1s_infinite]"></span>
                         <span className="w-0.5 h-1.5 bg-emerald-500 animate-[bounce_0.9s_infinite]"></span>
                     </span>
                     <span className="text-[10px] font-bold text-emerald-400 uppercase">Активно</span>
                 </div>
            )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {SOUNDSCAPES.map((sound) => {
            const isActive = activeSoundId === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handleSoundClick(sound.id)}
                className={`
                    relative h-24 rounded-2xl overflow-hidden transition-all duration-300 group text-left p-4 flex flex-col justify-between border
                    ${isActive 
                        ? 'border-indigo-400 ring-1 ring-indigo-500/50' 
                        : 'border-white/5 hover:border-white/10'}
                `}
              >
                {/* Background Color/Gradient */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'} ${sound.color}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                {/* Icon */}
                <div className={`relative z-10 transition-transform duration-500 ${isActive ? 'text-white scale-110' : 'text-white/70'}`}>
                    {getSoundIcon(sound.iconType)}
                </div>
                
                <div className="relative z-10 flex justify-between items-end w-full">
                    <span className="text-sm font-bold text-white leading-none">{sound.title}</span>
                    {isActive && <Pause size={16} className="text-white" fill="currentColor" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GUIDED MEDITATIONS */}
      <div className="px-6">
          <h2 className="text-white font-bold text-lg mb-4 tracking-tight">Практики</h2>
          <div className="space-y-3">
            {MEDITATIONS.map((meditation) => (
              <div 
                key={meditation.id}
                onClick={() => setActiveMeditationId(meditation.id)}
                className="group relative bg-[#151925] border border-white/5 rounded-2xl p-1 pr-4 flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer hover:bg-[#1E2332]"
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${meditation.color} text-white shadow-lg`}>
                   {meditation.category === 'SLEEP' && <Moon size={24} fill="currentColor" />}
                   {meditation.category === 'FOCUS' && <Zap size={24} fill="currentColor" />}
                   {meditation.category === 'ANXIETY' && <Wind size={24} />}
                </div>
                
                <div className="flex-1 min-w-0 py-2">
                  <h3 className="font-bold text-white text-base leading-tight mb-1">
                      {meditation.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="uppercase tracking-wider">{meditation.category}</span>
                    <span>•</span>
                    <span>{meditation.duration}</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* 4. PLAYER COMPONENT */}
      {activeSound && (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
           {/* Visible Player Box */}
           <div className="bg-[#1E2332] border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-4 relative overflow-hidden">
               
               {/* "Album Art" */}
               <div className={`w-12 h-12 rounded-xl ${activeSound.color} flex items-center justify-center text-white shrink-0 relative`}>
                   {getSoundIcon(activeSound.iconType)}
                   <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></div>
               </div>
               
               <div className="flex-1 min-w-0">
                   <div className="text-white font-bold text-sm truncate">{activeSound.title}</div>
                   <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                       {isPlaying ? 'Играет...' : 'На паузе'}
                   </div>
               </div>

               {/* Play/Pause Controls */}
               <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors shadow-lg"
               >
                 {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
               </button>

               <button 
                  onClick={() => { setActiveSoundId(null); setIsPlaying(false); }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
               >
                 <X size={16} />
               </button>

               {/* 
                 YOUTUBE EMBED - HIDDEN BUT ACTIVE
                 Added 'mute=0' and conditional rendering based on 'isPlaying'
               */}
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
             className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white z-20"
           >
             <X size={20} />
           </button>

           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
               <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 mb-8 flex items-center justify-center shadow-[0_0_100px_rgba(99,102,241,0.3)] relative">
                  <div className="absolute inset-0 border-2 border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <Play size={64} fill="currentColor" className="text-white ml-2" />
               </div>
               
               <h2 className="text-3xl font-black text-white mb-4">
                 {MEDITATIONS.find(m => m.id === activeMeditationId)?.title}
               </h2>
               
               <div className="bg-white/5 px-6 py-3 rounded-full border border-white/5">
                   <span className="text-indigo-300 font-mono">00:00 / {MEDITATIONS.find(m => m.id === activeMeditationId)?.duration}</span>
               </div>
               
               <p className="mt-12 text-slate-500 text-sm">Это демо-версия плеера.</p>
           </div>
        </div>
      )}

    </div>
  );
};
