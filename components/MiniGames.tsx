
import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, Clock, Brain, CheckCircle, XCircle, Crosshair, Sparkles, Shield, Skull, Battery, Flame, Droplets, Ghost, Play, Smartphone, Bell, Gamepad2, BookOpen, AlertTriangle, RefreshCw } from 'lucide-react';
import { GameSlide } from '../types';

interface MiniGameProps {
  config: GameSlide;
  onComplete: (score: number) => void;
}

// --- GAME 1: FOCUS DEFENDER (Liquid Glass Edition) ---
export const FocusDefender: React.FC<MiniGameProps> = ({ config, onComplete }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds || 30);
  const [targets, setTargets] = useState<{id: number, x: number, y: number, type: 'DISTRACTION' | 'FOCUS', iconIdx: number}[]>([]);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON' | 'LOST'>('START');
  
  const targetIdCounter = useRef(0);
  const targetScore = config.targetScore || 15;

  // Audio refs (mock)
  // const sfxPop = useRef(new Audio('/pop.mp3'));

  // Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    if (timeLeft <= 0) {
      if (score >= targetScore) {
        setGameState('WON');
        // Auto complete after small delay or let user click continue
        setTimeout(() => onComplete(score), 1500); 
      } else {
        setGameState('LOST');
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, targetScore, onComplete]);

  // Spawner
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const spawner = setInterval(() => {
      setTargets(prev => {
        if (prev.length >= 5) return prev; // Max targets on screen

        const isDistraction = Math.random() > 0.4; // 60% chance of distraction
        const newTarget = {
          id: targetIdCounter.current++,
          x: Math.random() * 80 + 10, // 10% to 90%
          y: Math.random() * 70 + 15, // 15% to 85%
          type: isDistraction ? 'DISTRACTION' : 'FOCUS' as 'DISTRACTION' | 'FOCUS',
          iconIdx: Math.floor(Math.random() * 3)
        };
        return [...prev, newTarget];
      });
    }, 600); // Spawn rate

    return () => clearInterval(spawner);
  }, [gameState]);

  const handleTargetClick = (e: React.MouseEvent | React.TouchEvent, id: number, type: 'DISTRACTION' | 'FOCUS') => {
    e.preventDefault();
    e.stopPropagation(); // Prevent ghost clicks
    
    // SFX placeholder
    // sfxPop.current.play().catch(() => {});

    if (type === 'DISTRACTION') {
      setScore(s => s + 1);
    } else {
      setScore(s => Math.max(0, s - 3)); // Penalty
      // Shake effect logic could go here
    }
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setTimeLeft(config.durationSeconds || 30);
    setTargets([]);
  };

  const getTargetIcon = (type: 'DISTRACTION' | 'FOCUS', idx: number) => {
    if (type === 'DISTRACTION') {
      const icons = [
        <Smartphone key="p" size={28} className="text-white drop-shadow-md" />,
        <Bell key="b" size={28} className="text-white drop-shadow-md" />,
        <Gamepad2 key="g" size={28} className="text-white drop-shadow-md" />
      ];
      return icons[idx % icons.length];
    } else {
      const icons = [
        <Brain key="br" size={28} className="text-white drop-shadow-md" />,
        <BookOpen key="bo" size={28} className="text-white drop-shadow-md" />,
        <Zap key="z" size={28} className="text-white drop-shadow-md" />
      ];
      return icons[idx % icons.length];
    }
  };

  // --- RENDER SCREENS ---

  if (gameState === 'START') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-indigo-400 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
          <Shield size={48} className="drop-shadow-lg" />
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-lg shadow-lg rotate-12">
             Цель: {targetScore}
          </div>
        </div>
        
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">
            Focus<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Defender</span>
          </h3>
          <p className="text-slate-400 text-sm font-medium max-w-[260px] mx-auto leading-relaxed">
            {config.instructions || "Уничтожай отвлечения, сохраняй фокус."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full relative z-10 max-w-xs">
             <div className="bg-[#151925]/60 backdrop-blur-md p-3 rounded-2xl border border-rose-500/20 flex flex-col items-center gap-2 group">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Smartphone size={20} className="text-white" />
                 </div>
                 <div className="text-[10px] font-black text-rose-300 uppercase tracking-wider">Кликай</div>
             </div>
             <div className="bg-[#151925]/60 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/20 flex flex-col items-center gap-2 group">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Brain size={20} className="text-white" />
                 </div>
                 <div className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">Не трогай</div>
             </div>
        </div>

        <button 
            onClick={startGame} 
            className="w-full max-w-xs py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all active:scale-95 relative z-10"
        >
          <span className="flex items-center justify-center gap-2"><Play size={18} fill="currentColor" /> НАЧАТЬ</span>
        </button>
      </div>
    );
  }

  if (gameState === 'LOST') {
     return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in zoom-in duration-300 relative">
             <div className="absolute inset-0 bg-red-500/10 blur-[100px] pointer-events-none"></div>
             
             <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.4)] mb-4">
                 <XCircle size={48} className="text-red-400" />
             </div>
             
             <div>
               <h3 className="text-2xl font-black text-white mb-2">Цель не достигнута</h3>
               <p className="text-slate-400 font-medium">Счет: <span className="text-white font-bold">{score}</span> / {targetScore}</p>
             </div>

             <button 
               onClick={startGame} 
               className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center gap-2 transition-all border border-white/10"
             >
                <RefreshCw size={18} /> Попробовать снова
             </button>
        </div>
     );
  }

  if (gameState === 'WON') {
    return (
       <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in zoom-in duration-500 relative">
            <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] pointer-events-none"></div>
            
            <div className="relative">
                 <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse"></div>
                 <Target size={80} className="text-yellow-400 relative z-10 drop-shadow-2xl" />
            </div>
            
            <div>
              <h3 className="text-3xl font-black text-white mb-2">Победа!</h3>
              <div className="inline-block bg-white/10 px-4 py-1 rounded-full border border-white/10">
                  <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Фокус защищен</p>
              </div>
            </div>

            <div className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-xl">
                {score} <span className="text-lg text-slate-500">XP</span>
            </div>
            
            <div className="text-xs text-slate-500 font-medium animate-pulse">Завершение уровня...</div>
       </div>
    );
 }

  // --- PLAYING STATE ---

  const progress = (timeLeft / (config.durationSeconds || 30)) * 100;

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#050B14] rounded-[2.5rem] select-none shadow-2xl border border-white/5 ring-1 ring-white/5 touch-none">
       
       {/* GRID BG */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

       {/* HUD */}
       <div className="flex justify-between items-start p-6 z-30 pointer-events-none">
          <div className="flex flex-col gap-1">
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Счет</div>
             <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 text-white font-black font-mono text-2xl border border-white/10 shadow-lg">
                <Crosshair size={20} className="text-indigo-400" /> 
                {score}
                <span className="text-sm text-slate-500 font-medium">/ {targetScore}</span>
             </div>
          </div>
          
          <div className="flex flex-col gap-1 items-end">
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-1">Время</div>
             <div className={`bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 font-black font-mono text-xl border border-white/10 shadow-lg transition-colors ${timeLeft < 5 ? 'text-red-400 border-red-500/50 animate-pulse' : 'text-white'}`}>
                {timeLeft}s <Clock size={18} />
             </div>
          </div>
       </div>

       {/* TIMER BAR */}
       <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-40">
           <div 
             className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.8)]"
             style={{ width: `${progress}%` }}
           ></div>
       </div>

       {/* GAME AREA */}
       <div className="flex-1 relative cursor-pointer overflow-hidden z-20">
          {targets.map(t => (
            <button
              key={t.id}
              onMouseDown={(e) => handleTargetClick(e, t.id, t.type)}
              onTouchStart={(e) => handleTargetClick(e, t.id, t.type)}
              className={`absolute w-20 h-20 flex items-center justify-center transition-all duration-75 active:scale-90 animate-in zoom-in duration-300 ease-out hover:scale-105
                ${t.type === 'DISTRACTION' ? 'z-20' : 'z-10'}
              `}
              style={{ top: `${t.y}%`, left: `${t.x}%`, transform: 'translate(-50%, -50%)' }}
            >
               {t.type === 'DISTRACTION' ? (
                   // DISTRACTION TARGET (RED)
                   <div className="relative w-16 h-16">
                       <div className="absolute inset-0 bg-rose-500/30 blur-xl rounded-full animate-pulse"></div>
                       <div className="relative w-full h-full bg-gradient-to-br from-rose-600 to-red-800 rounded-2xl border border-white/20 shadow-[0_10px_30px_rgba(225,29,72,0.4)] flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                            {getTargetIcon('DISTRACTION', t.iconIdx)}
                            {/* Glitch effect line */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50 animate-[ping_2s_infinite]"></div>
                       </div>
                   </div>
               ) : (
                   // FOCUS TARGET (GREEN)
                   <div className="relative w-14 h-14 opacity-90">
                       <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                       <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 to-teal-800 rounded-full border border-white/20 shadow-[0_5px_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
                           {getTargetIcon('FOCUS', t.iconIdx)}
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
