
import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, Clock, Brain, CheckCircle, XCircle, Crosshair, Sparkles, Shield, Skull, Battery, Flame, Droplets, Ghost, Play } from 'lucide-react';
import { GameSlide } from '../types';

interface MiniGameProps {
  config: GameSlide;
  onComplete: (score: number) => void;
}

// --- GAME 1: FOCUS DEFENDER (Liquid Glass Edition) ---
export const FocusDefender: React.FC<MiniGameProps> = ({ config, onComplete }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds || 20);
  const [targets, setTargets] = useState<{id: number, x: number, y: number, type: 'BAD' | 'GOOD'}[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const targetIdCounter = useRef(0);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      setIsPlaying(false);
      onComplete(score);
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Spawner
  useEffect(() => {
    if (!isPlaying) return;
    const spawner = setInterval(() => {
      if (targets.length < 6) {
        const type = Math.random() > 0.6 ? 'GOOD' : 'BAD'; 
        const newTarget = {
          id: targetIdCounter.current++,
          x: Math.random() * 70 + 15, 
          y: Math.random() * 60 + 20,
          type: type as 'BAD' | 'GOOD'
        };
        setTargets(prev => [...prev, newTarget]);
      }
    }, 550);
    return () => clearInterval(spawner);
  }, [isPlaying, targets]);

  const handleTargetClick = (e: React.MouseEvent | React.TouchEvent, id: number, type: 'BAD' | 'GOOD') => {
    e.preventDefault();
    if (type === 'BAD') {
      setScore(s => s + 1);
    } else {
      setScore(s => Math.max(0, s - 3));
    }
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(config.durationSeconds || 20);
    setTargets([]);
  };

  if (!isPlaying && timeLeft === (config.durationSeconds || 20)) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-indigo-400 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 group">
          <div className="absolute inset-0 border border-indigo-500/30 rounded-[2.5rem] animate-[pulse_2s_infinite]"></div>
          <Shield size={56} className="group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">Защитник<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Фокуса</span></h3>
          <p className="text-slate-400 text-sm font-medium max-w-[240px] mx-auto leading-relaxed">{config.instructions}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full relative z-10 max-w-xs">
             <div className="bg-[#151925]/60 backdrop-blur-md p-4 rounded-3xl border border-red-500/20 flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30 flex items-center justify-center">
                     <Skull size={24} className="text-white" />
                 </div>
                 <div className="text-[10px] font-black text-red-300 uppercase tracking-wider">Уничтожай</div>
             </div>
             <div className="bg-[#151925]/60 backdrop-blur-md p-4 rounded-3xl border border-green-500/20 flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                     <Battery size={24} className="text-white" />
                 </div>
                 <div className="text-[10px] font-black text-green-300 uppercase tracking-wider">Не трогай</div>
             </div>
        </div>

        <button 
            onClick={startGame} 
            className="w-full max-w-xs py-5 bg-white text-black font-black rounded-3xl uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10"
        >
          <span className="flex items-center justify-center gap-2"><Play size={18} fill="black" /> НАЧАТЬ</span>
        </button>
      </div>
    );
  }

  if (!isPlaying && timeLeft === 0) {
     return (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500">
            <h3 className="text-3xl font-black text-white">Время вышло!</h3>
            <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 blur-[100px] opacity-20"></div>
                <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-2xl relative z-10">{score}</div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm bg-white/5 px-4 py-2 rounded-full">Очков набрано</p>
             <button onClick={() => onComplete(score)} className="w-full max-w-xs py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              Продолжить
            </button>
        </div>
     );
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#050B14] rounded-[2.5rem] select-none shadow-2xl border border-white/5 ring-1 ring-white/5">
       {/* HUD */}
       <div className="flex justify-between items-center p-6 z-30 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-3 text-yellow-400 font-black font-mono text-xl border border-white/10 shadow-lg">
             <Zap size={20} fill="currentColor" /> {score}
          </div>
          <div className={`bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-3 font-black font-mono text-xl border border-white/10 shadow-lg transition-colors ${timeLeft < 5 ? 'text-red-500 border-red-500/50' : 'text-white'}`}>
             <Clock size={20} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
       </div>

       {/* Game Area */}
       <div className="flex-1 relative cursor-crosshair overflow-hidden">
          {/* Grid visual */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          {targets.map(t => (
            <button
              key={t.id}
              onMouseDown={(e) => handleTargetClick(e, t.id, t.type)}
              onTouchStart={(e) => handleTargetClick(e, t.id, t.type)}
              className={`absolute w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 animate-in zoom-in duration-300 group
                ${t.type === 'BAD' ? 'z-20' : 'z-10'}
              `}
              style={{ top: `${t.y}%`, left: `${t.x}%`, transform: 'translate(-50%, -50%)' }}
            >
               {t.type === 'BAD' ? (
                   <div className="relative w-full h-full flex items-center justify-center">
                       {/* Spikes Visual */}
                       <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                       <div className="w-16 h-16 bg-gradient-to-br from-[#1E2332] to-black rounded-2xl rotate-45 border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center relative z-10 overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                            <Skull className="text-red-400 w-8 h-8 relative z-20" />
                       </div>
                   </div>
               ) : (
                   <div className="relative w-full h-full flex items-center justify-center">
                       <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                       <div className="w-14 h-14 bg-emerald-900/40 backdrop-blur-md rounded-full border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center relative z-10">
                           <Battery className="text-emerald-400 w-6 h-6" />
                       </div>
                   </div>
               )}
            </button>
          ))}
      </div>
    </div>
  );
};

// --- GAME 2: NEURO MATCH (Liquid Glass Edition) ---
export const EmbeddedMemoryGame: React.FC<MiniGameProps> = ({ config, onComplete }) => {
  const [cards, setCards] = useState<{id: number, val: number, flipped: boolean, matched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const targetPairs = config.targetScore || 4;

  const initGame = () => {
     const pairs = [];
     for(let i=0; i<targetPairs; i++) {
        pairs.push(i);
        pairs.push(i);
     }
     const shuffled = pairs.sort(() => Math.random() - 0.5).map((val, idx) => ({
         id: idx, val, flipped: false, matched: false
     }));
     setCards(shuffled);
     setGameStarted(true);
     setMatches(0);
     setMoves(0);
  };

  const handleCardClick = (idx: number) => {
     if (flippedIndices.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
     
     const newCards = [...cards];
     newCards[idx].flipped = true;
     setCards(newCards);
     
     const newFlipped = [...flippedIndices, idx];
     setFlippedIndices(newFlipped);

     if (newFlipped.length === 2) {
         setMoves(m => m + 1);
         const [first, second] = newFlipped;
         if (cards[first].val === cards[second].val) {
             setTimeout(() => {
                 const matchedCards = [...cards];
                 matchedCards[first].matched = true;
                 matchedCards[second].matched = true;
                 setCards(matchedCards);
                 setFlippedIndices([]);
                 setMatches(m => {
                    const newM = m + 1;
                    if (newM === targetPairs) {
                        setTimeout(() => onComplete(100), 800);
                    }
                    return newM;
                 });
             }, 400);
         } else {
             setTimeout(() => {
                 const resetCards = [...cards];
                 resetCards[first].flipped = false;
                 resetCards[second].flipped = false;
                 setCards(resetCards);
                 setFlippedIndices([]);
             }, 1000);
         }
     }
  };

  if (!gameStarted) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
             <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full"></div>
            
            <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-emerald-400 border border-white/10 shadow-[0_20px_50px_rgba(16,185,129,0.3)] relative z-10 group">
                <div className="absolute inset-0 border border-emerald-500/30 rounded-[2.5rem] animate-[pulse_3s_infinite]"></div>
                <Brain size={56} className="group-hover:rotate-12 transition-transform duration-500" />
            </div>
            
            <div className="relative z-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">Нейро<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Связь</span></h3>
                <p className="text-slate-400 mt-2 font-medium max-w-[200px] mx-auto text-sm">{config.instructions}</p>
            </div>
            
            <button onClick={initGame} className="w-full max-w-xs py-5 bg-white text-black font-black rounded-3xl uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10">
                <span className="flex items-center justify-center gap-2"><Play size={18} fill="black" /> НАЧАТЬ</span>
            </button>
        </div>
      );
  }

  const gridCols = targetPairs > 6 ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4';

  const getIcon = (val: number) => {
      const icons = [
          <Zap size={24} className="text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" />,
          <Flame size={24} className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]" />,
          <Brain size={24} className="text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]" />,
          <Ghost size={24} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />,
          <Droplets size={24} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />,
          <Battery size={24} className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]" />,
          <Target size={24} className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]" />,
          <Shield size={24} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
      ];
      return icons[val % icons.length];
  };

  return (
      <div className="h-full flex flex-col">
          <div className="flex justify-between px-6 py-4 bg-[#151925]/60 backdrop-blur-xl rounded-3xl mb-4 text-slate-300 font-bold font-mono text-xs uppercase tracking-wider border border-white/5 shadow-lg mx-2 z-10">
              <span className="flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> {matches}/{targetPairs}</span>
              <span className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> Ходы: {moves}</span>
          </div>
          <div className={`flex-1 p-2 grid ${gridCols} gap-3 content-center overflow-y-auto`}>
              {cards.map((card, idx) => (
                  <button 
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`aspect-square rounded-[1.5rem] transition-all duration-500 transform perspective-1000 relative group
                        ${card.flipped || card.matched ? 'rotate-y-180' : 'bg-white/5 backdrop-blur-md border border-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'}
                    `}
                  >
                      {/* CARD BACK */}
                      <div className={`absolute inset-0 flex items-center justify-center backface-hidden transition-opacity duration-300 ${card.flipped || card.matched ? 'opacity-0' : 'opacity-100'}`}>
                          <Brain size={20} className="text-white/20 group-hover:text-white/40 transition-colors" />
                      </div>

                      {/* CARD FRONT */}
                      {(card.flipped || card.matched) && (
                          <div className={`absolute inset-0 rounded-[1.5rem] flex items-center justify-center animate-in zoom-in duration-300 shadow-inner backdrop-blur-xl
                             ${card.matched 
                                ? 'bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                                : 'bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]'}
                          `}>
                              {getIcon(card.val)}
                          </div>
                      )}
                  </button>
              ))}
          </div>
      </div>
  );
}
