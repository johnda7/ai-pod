
import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, Clock, Brain, CheckCircle, XCircle, Crosshair, Sparkles, Shield, Skull, Battery, Flame, Droplets, Ghost, Play, Smartphone, Bell, Gamepad2, BookOpen, AlertTriangle, RefreshCw, Trophy } from 'lucide-react';
import { GameSlide } from '../types';

interface MiniGameProps {
  config: GameSlide;
  onComplete: (score: number) => void;
}

// --- GAME 1: FOCUS DEFENDER (Simplified & Fun Edition) ---
export const FocusDefender: React.FC<MiniGameProps> = ({ config, onComplete }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds || 30);
  const [targets, setTargets] = useState<{id: number, x: number, y: number, type: 'DISTRACTION' | 'FOCUS', iconIdx: number, lifetime: number}[]>([]);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON' | 'LOST'>('START');
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  
  const targetIdCounter = useRef(0);
  // Сильно снижаем требования для прохождения
  const targetScore = Math.min(config.targetScore || 15, 10); // Максимум 10 очков нужно

  // Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    if (timeLeft <= 0) {
      // Победа если набрали хотя бы 60% от цели
      if (score >= Math.floor(targetScore * 0.6)) {
        setGameState('WON');
        setTimeout(() => onComplete(Math.max(score * 10, 50)), 1500); 
      } else {
        setGameState('LOST');
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, targetScore, onComplete]);

  // Spawner - медленнее и больше красных (которые нужно кликать)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const spawner = setInterval(() => {
      setTargets(prev => {
        if (prev.length >= 4) return prev; // Меньше целей на экране

        // 80% красных (которые нужно кликать), 20% зелёных (избегать)
        const isDistraction = Math.random() > 0.2;
        const newTarget = {
          id: targetIdCounter.current++,
          x: Math.random() * 70 + 15, // 15% to 85%
          y: Math.random() * 60 + 20, // 20% to 80%
          type: isDistraction ? 'DISTRACTION' : 'FOCUS' as 'DISTRACTION' | 'FOCUS',
          iconIdx: Math.floor(Math.random() * 3),
          lifetime: 4000 // 4 секунды жизни
        };
        return [...prev, newTarget];
      });
    }, 1200); // Спавн каждые 1.2 секунды (медленнее)

    return () => clearInterval(spawner);
  }, [gameState]);

  // Auto-remove targets after lifetime
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    const cleanup = setInterval(() => {
      setTargets(prev => prev.filter(t => {
        // Remove old targets (older than 4 seconds)
        return Date.now() - t.id < 4000;
      }));
    }, 500);
    
    return () => clearInterval(cleanup);
  }, [gameState]);

  const handleTargetClick = (e: React.MouseEvent | React.TouchEvent, id: number, type: 'DISTRACTION' | 'FOCUS') => {
    e.preventDefault();
    e.stopPropagation();

    if (type === 'DISTRACTION') {
      // Правильный клик! +1 очко + бонус за комбо
      const comboBonus = Math.min(combo, 3);
      setScore(s => s + 1 + comboBonus);
      setCombo(c => c + 1);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 500);
    } else {
      // Ошибка - только -1 очко (мягкий штраф)
      setScore(s => Math.max(0, s - 1));
      setCombo(0);
    }
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCombo(0);
    setTimeLeft(config.durationSeconds || 30);
    setTargets([]);
    targetIdCounter.current = Date.now(); // Reset counter with timestamp
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
      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-orange-500 rounded-[2rem] flex items-center justify-center text-white border border-white/20 shadow-[0_20px_50px_rgba(244,63,94,0.4)] relative z-10 animate-pulse">
          <Target size={40} className="drop-shadow-lg" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">
            🎯 Охотник за<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Отвлечениями</span>
          </h3>
          <p className="text-slate-400 text-sm font-medium max-w-[260px] mx-auto leading-relaxed">
            Кликай по красным иконкам!<br/>Избегай зелёных.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full relative z-10 max-w-xs">
             <div className="bg-rose-500/20 backdrop-blur-md p-4 rounded-2xl border border-rose-500/30 flex flex-col items-center gap-2">
                 <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/40 flex items-center justify-center">
                     <Smartphone size={24} className="text-white" />
                 </div>
                 <div className="text-xs font-black text-rose-300 uppercase">👆 КЛИКАЙ!</div>
             </div>
             <div className="bg-emerald-500/10 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 flex flex-col items-center gap-2">
                 <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/20 flex items-center justify-center opacity-60">
                     <Brain size={24} className="text-white" />
                 </div>
                 <div className="text-xs font-black text-emerald-400/60 uppercase">🚫 Не трогай</div>
             </div>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-4 py-2 relative z-10">
          <p className="text-yellow-300 text-xs font-bold">🏆 Цель: {targetScore} очков</p>
        </div>

        <button 
            onClick={startGame} 
            className="w-full max-w-xs py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black rounded-2xl uppercase tracking-wider shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all active:scale-95 relative z-10"
        >
          <span className="flex items-center justify-center gap-2"><Play size={18} fill="currentColor" /> ИГРАТЬ!</span>
        </button>
      </div>
    );
  }

  if (gameState === 'LOST') {
     return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in zoom-in duration-300 relative">
             <div className="absolute inset-0 bg-orange-500/10 blur-[100px] pointer-events-none"></div>
             
             <div className="text-6xl mb-2">😅</div>
             
             <div>
               <h3 className="text-2xl font-black text-white mb-2">Почти получилось!</h3>
               <p className="text-slate-400 font-medium">Набрано: <span className="text-orange-400 font-bold">{score}</span> / {targetScore}</p>
               <p className="text-slate-500 text-sm mt-1">Нужно {Math.ceil(targetScore * 0.6)} для победы</p>
             </div>

             <button 
               onClick={startGame} 
               className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-lg"
             >
                <RefreshCw size={18} /> Ещё раз!
             </button>
        </div>
     );
  }

  if (gameState === 'WON') {
    return (
       <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in zoom-in duration-500 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] pointer-events-none"></div>
            
            <div className="text-7xl animate-bounce">🎉</div>
            
            <div>
              <h3 className="text-3xl font-black text-white mb-2">Отлично!</h3>
              <div className="inline-block bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                  <p className="text-emerald-300 text-sm font-bold">✨ Фокус защищён!</p>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl px-8 py-4 border border-white/10">
              <div className="text-4xl font-black text-emerald-400 font-mono">
                  +{Math.max(score * 10, 50)} <span className="text-lg text-slate-400">XP</span>
              </div>
            </div>
            
            <div className="text-sm text-slate-400 font-medium animate-pulse">Загрузка награды...</div>
       </div>
    );
 }

  // --- PLAYING STATE ---

  const progress = (timeLeft / (config.durationSeconds || 30)) * 100;
  const scoreProgress = Math.min(100, (score / targetScore) * 100);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#050B14] rounded-[2.5rem] select-none shadow-2xl border border-white/5 ring-1 ring-white/5 touch-none">
       
       {/* GRID BG */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

       {/* Combo Popup */}
       {showCombo && combo > 1 && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in zoom-in-50 fade-in duration-200">
           <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
             🔥 x{combo}
           </div>
         </div>
       )}

       {/* HUD */}
       <div className="flex justify-between items-start p-4 z-30 pointer-events-none">
          <div className="flex flex-col gap-1">
             <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 text-white font-black font-mono text-xl border border-white/10 shadow-lg">
                <Target size={18} className="text-rose-400" /> 
                <span className={score >= targetScore ? 'text-emerald-400' : 'text-white'}>{score}</span>
                <span className="text-sm text-slate-500">/ {targetScore}</span>
             </div>
             {/* Score progress bar */}
             <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mx-1">
               <div 
                 className={`h-full transition-all duration-300 ${score >= targetScore ? 'bg-emerald-500' : 'bg-rose-500'}`}
                 style={{ width: `${scoreProgress}%` }}
               />
             </div>
          </div>
          
          <div className={`bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 font-black font-mono text-xl border shadow-lg transition-all ${timeLeft <= 5 ? 'text-red-400 border-red-500/50 animate-pulse scale-110' : 'text-white border-white/10'}`}>
             <Clock size={18} />
             {timeLeft}s
          </div>
       </div>

       {/* TIMER BAR */}
       <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-40">
           <div 
             className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.8)] ${timeLeft <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-rose-500'}`}
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
              className={`absolute flex items-center justify-center transition-all duration-75 active:scale-75 animate-in zoom-in duration-300 ease-out
                ${t.type === 'DISTRACTION' ? 'z-20 w-20 h-20' : 'z-10 w-16 h-16'}
              `}
              style={{ top: `${t.y}%`, left: `${t.x}%`, transform: 'translate(-50%, -50%)' }}
            >
               {t.type === 'DISTRACTION' ? (
                   // DISTRACTION TARGET (RED) - Big and obvious!
                   <div className="relative w-full h-full">
                       <div className="absolute inset-0 bg-rose-500/40 blur-xl rounded-full animate-pulse"></div>
                       <div className="relative w-full h-full bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl border-2 border-white/30 shadow-[0_0_30px_rgba(244,63,94,0.6)] flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
                            {getTargetIcon('DISTRACTION', t.iconIdx)}
                       </div>
                   </div>
               ) : (
                   // FOCUS TARGET (GREEN) - Smaller and less obvious
                   <div className="relative w-full h-full opacity-70">
                       <div className="relative w-full h-full bg-gradient-to-br from-emerald-700 to-teal-900 rounded-full border border-white/10 shadow-lg flex items-center justify-center">
                           {getTargetIcon('FOCUS', t.iconIdx)}
                       </div>
                   </div>
               )}
            </button>
          ))}
          
          {/* Help text */}
          {targets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-slate-500 text-sm animate-pulse">Жди появления целей...</p>
            </div>
          )}
      </div>
      
      {/* Bottom hint */}
      <div className="p-3 text-center z-30">
        <p className="text-xs text-slate-500">👆 Кликай по <span className="text-rose-400 font-bold">красным</span> иконкам!</p>
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

// --- GAME 3: REACTION TIME ---
interface ReactionGameProps {
  onComplete: (score: number) => void;
}

export const ReactionGame: React.FC<ReactionGameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'WAITING' | 'READY' | 'GO' | 'TOO_EARLY' | 'RESULT'>('WAITING');
  const [reactionTime, setReactionTime] = useState(0);
  const [round, setRound] = useState(1);
  const [times, setTimes] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = 5;

  const startRound = () => {
    setGameState('READY');
    
    // Random delay between 1-4 seconds
    const delay = Math.random() * 3000 + 1000;
    
    timerRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState('GO');
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'WAITING') {
      startRound();
    } else if (gameState === 'READY') {
      // Clicked too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('TOO_EARLY');
    } else if (gameState === 'GO') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setTimes(prev => [...prev, time]);
      
      if (round >= totalRounds) {
        setGameState('RESULT');
      } else {
        setRound(r => r + 1);
        setGameState('WAITING');
      }
    } else if (gameState === 'TOO_EARLY') {
      setGameState('WAITING');
    } else if (gameState === 'RESULT') {
      // Calculate score based on average time
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const score = Math.max(0, Math.min(100, Math.round(150 - avgTime / 5)));
      onComplete(score);
    }
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'READY': return 'bg-gradient-to-br from-red-900 to-red-950';
      case 'GO': return 'bg-gradient-to-br from-green-600 to-emerald-700';
      case 'TOO_EARLY': return 'bg-gradient-to-br from-orange-900 to-red-950';
      case 'RESULT': return 'bg-gradient-to-br from-indigo-900 to-purple-950';
      default: return 'bg-gradient-to-br from-slate-900 to-slate-950';
    }
  };

  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div 
      onClick={handleClick}
      className={`h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all duration-500 ${getBackgroundColor()}`}
    >
      {gameState === 'WAITING' && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
            <Zap size={48} className="text-yellow-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Раунд {round} / {totalRounds}</h3>
          <p className="text-slate-400 mb-6">Нажми, чтобы начать</p>
          {times.length > 0 && (
            <div className="text-sm text-slate-500">
              Последнее время: <span className="text-green-400 font-bold">{reactionTime} мс</span>
            </div>
          )}
        </div>
      )}

      {gameState === 'READY' && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-500/30 border-4 border-red-500 flex items-center justify-center animate-pulse">
            <Clock size={48} className="text-red-400" />
          </div>
          <h3 className="text-3xl font-black text-red-400 mb-2">ЖДИ...</h3>
          <p className="text-red-300/70">Не нажимай пока не станет зелёным!</p>
        </div>
      )}

      {gameState === 'GO' && (
        <div className="animate-in zoom-in duration-200">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-green-500/30 border-4 border-green-400 flex items-center justify-center">
            <Target size={48} className="text-green-300" />
          </div>
          <h3 className="text-4xl font-black text-green-400 mb-2">ЖМИИ!</h3>
          <p className="text-green-300/70">Как можно быстрее!</p>
        </div>
      )}

      {gameState === 'TOO_EARLY' && (
        <div className="animate-in shake duration-300">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-500/30 flex items-center justify-center">
            <AlertTriangle size={48} className="text-orange-400" />
          </div>
          <h3 className="text-2xl font-black text-orange-400 mb-2">Слишком рано!</h3>
          <p className="text-orange-300/70">Нажми, чтобы попробовать снова</p>
        </div>
      )}

      {gameState === 'RESULT' && (
        <div className="animate-in zoom-in duration-500">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Trophy size={48} className="text-white" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">Готово!</h3>
          <div className="bg-white/10 rounded-2xl p-4 mb-6">
            <p className="text-slate-400 text-sm mb-1">Среднее время реакции</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              {avgTime} мс
            </p>
          </div>
          <div className="text-sm text-slate-500 mb-4">
            {avgTime < 250 ? '🔥 Невероятно быстро!' : 
             avgTime < 350 ? '⚡ Отличная реакция!' : 
             avgTime < 450 ? '👍 Хороший результат!' : 
             '💪 Продолжай тренироваться!'}
          </div>
          <p className="text-indigo-300">Нажми, чтобы продолжить</p>
        </div>
      )}

      {/* Progress dots */}
      <div className="absolute bottom-8 flex gap-2">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all ${
              i < times.length ? 'bg-green-400' : 
              i === round - 1 && gameState !== 'RESULT' ? 'bg-white animate-pulse' : 
              'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
