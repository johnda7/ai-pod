import React, { useState } from 'react';
import { MEDITATIONS } from '../constants';
import { Play, Pause, Moon, Wind, Zap, Heart } from 'lucide-react';

export const MeditationView: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const getIcon = (cat: string) => {
    switch(cat) {
        case 'SLEEP': return <Moon size={20} />;
        case 'ANXIETY': return <Wind size={20} />;
        case 'FOCUS': return <Zap size={20} />;
        default: return <Heart size={20} />;
    }
  };

  return (
    <div className="min-h-full bg-slate-900 text-white p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
          Релакс & Сон
        </h2>
        <p className="text-slate-400 text-sm">Восстанови энергию или подготовься ко сну.</p>
      </div>

      {/* Categories / Featured */}
      <div className="mb-8 overflow-x-auto pb-4 -mx-4 px-4 flex gap-4 scrollbar-hide">
          <div className="w-64 h-32 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center relative overflow-hidden shadow-lg group cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba')] bg-cover opacity-30"></div>
              <div className="relative z-10 text-center">
                  <Moon size={32} className="mx-auto mb-2 text-indigo-200" />
                  <h3 className="font-bold text-lg">Сон</h3>
              </div>
          </div>
          <div className="w-64 h-32 shrink-0 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center relative overflow-hidden shadow-lg group cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e')] bg-cover opacity-30"></div>
              <div className="relative z-10 text-center">
                  <Wind size={32} className="mx-auto mb-2 text-teal-200" />
                  <h3 className="font-bold text-lg">Дыхание</h3>
              </div>
          </div>
      </div>

      {/* List */}
      <div className="space-y-3">
          <h3 className="font-bold text-slate-300 mb-2">Рекомендуем для тебя</h3>
          {MEDITATIONS.map((m) => {
              const isActive = activeId === m.id;
              return (
                  <div 
                    key={m.id} 
                    onClick={() => setActiveId(isActive ? null : m.id)}
                    className={`rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer ${
                        isActive ? `${m.color} shadow-lg scale-[1.02]` : 'bg-slate-800 hover:bg-slate-750'
                    }`}
                  >
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white/90`}>
                              {getIcon(m.category)}
                          </div>
                          <div>
                              <h4 className="font-bold text-sm md:text-base">{m.title}</h4>
                              <p className="text-xs text-white/60">{m.duration} • {m.category === 'SLEEP' ? 'Сон' : m.category === 'FOCUS' ? 'Фокус' : 'Анти-стресс'}</p>
                          </div>
                      </div>
                      <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                          {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                      </button>
                  </div>
              );
          })}
      </div>

      {/* Mini Player (Simulated) */}
      {activeId && (
         <div className="fixed bottom-20 left-4 right-4 bg-slate-800/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom fade-in duration-300 z-40">
             <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                 <Wind size={20} className="text-white animate-pulse" />
             </div>
             <div className="flex-1">
                 <div className="h-1 bg-slate-600 rounded-full mb-1 overflow-hidden">
                     <div className="h-full bg-indigo-400 w-1/3 animate-pulse"></div>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-400">
                     <span>01:20</span>
                     <span>{MEDITATIONS.find(m => m.id === activeId)?.duration}</span>
                 </div>
             </div>
             <button onClick={(e) => { e.stopPropagation(); setActiveId(null); }} className="p-2 text-slate-400 hover:text-white">
                 Close
             </button>
         </div>
      )}
    </div>
  );
};