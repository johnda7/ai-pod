
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Brain, Trophy } from 'lucide-react';
import { Task } from '../types';
import { hapticLight, hapticSuccess, hapticError, hapticMedium } from '../services/telegramService';
import { playCorrectSound, playWrongSound, playCompleteSound, playClickSound } from '../services/soundService';

interface MemoryGameProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

const COLORS = [
  'bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]', 
  'bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)]', 
  'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]', 
  'bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]'
];

const BASE_COLORS = [
  'bg-rose-900/50 border-rose-500/30',
  'bg-blue-900/50 border-blue-500/30',
  'bg-emerald-900/50 border-emerald-500/30',
  'bg-yellow-900/50 border-yellow-500/30'
];

export const MemoryGame: React.FC<MemoryGameProps> = ({ isOpen, onClose, onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    if (isOpen) {
        resetGame();
    }
  }, [isOpen]);

  const resetGame = () => {
      setSequence([]);
      setPlayerSequence([]);
      setIsPlaying(false);
      setLevel(1);
      setGameOver(false);
      setGameWon(false);
  };

  const startGame = () => {
      setIsPlaying(true);
      setGameOver(false);
      setGameWon(false);
      addToSequence();
  };

  const addToSequence = () => {
      const nextColor = Math.floor(Math.random() * 4);
      const newSequence = [...sequence, nextColor];
      setSequence(newSequence);
      setPlayerSequence([]);
      showSequence(newSequence);
  };

  const showSequence = (seq: number[]) => {
      setIsShowingSequence(true);
      let i = 0;
      const interval = setInterval(() => {
          setActiveColorIndex(seq[i]);
          setTimeout(() => setActiveColorIndex(null), 400);
          i++;
          if (i >= seq.length) {
              clearInterval(interval);
              setIsShowingSequence(false);
          }
      }, 800);
  };

  const handleColorClick = (index: number) => {
      if (!isPlaying || isShowingSequence || gameOver) return;

      hapticLight(); // 📳 Вибрация при клике
      playClickSound(); // 🔊 Звук клика
      
      // Visual feedback
      setActiveColorIndex(index);
      setTimeout(() => setActiveColorIndex(null), 200);

      const currentMove = playerSequence.length;
      // Check correctness
      if (index !== sequence[currentMove]) {
          hapticError(); // 📳 Ошибка!
          playWrongSound(); // 🔊 Звук ошибки
          setGameOver(true);
          setIsPlaying(false);
          return;
      }
      
      hapticMedium(); // 📳 Правильно!
      playCorrectSound(); // 🔊 Звук успеха

      const newPlayerSeq = [...playerSequence, index];
      setPlayerSequence(newPlayerSeq);

      // Check if sequence completed
      if (newPlayerSeq.length === sequence.length) {
          if (level >= 5) { // Win condition
              hapticSuccess(); // 📳 Победа!
              playCompleteSound(); // 🔊 Звук победы!
              setGameWon(true);
              setIsPlaying(false);
              onComplete(100); // Award 100 XP
          } else {
              setLevel(level + 1);
              setTimeout(addToSequence, 1000);
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-sm mx-4 bg-[#151925] border border-white/10 rounded-3xl p-6 shadow-2xl">
            
            <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-colors">
                <X size={20} />
            </button>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
                    <Brain size={32} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Нейро-Связь</h2>
                <p className="text-slate-400 text-sm">Повторяй сигналы системы</p>
            </div>

            {/* Game Area */}
            <div className="relative aspect-square max-w-[280px] mx-auto grid grid-cols-2 gap-4 mb-8">
                {BASE_COLORS.map((baseClass, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleColorClick(idx)}
                        className={`
                            rounded-2xl border-2 transition-all duration-100 active:scale-95
                            ${activeColorIndex === idx ? COLORS[idx] : baseClass}
                            ${isShowingSequence ? 'cursor-wait' : 'cursor-pointer'}
                        `}
                    ></button>
                ))}
                
                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0A0F1C] rounded-full border-4 border-[#151925] flex items-center justify-center z-10">
                    <div className="text-lg font-black text-white">{level}/5</div>
                </div>
            </div>

            {/* Controls / Status */}
            <div className="text-center h-16">
                {!isPlaying && !gameOver && !gameWon && (
                    <button 
                        onClick={startGame}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl uppercase tracking-wider transition-all"
                    >
                        Начать калибровку
                    </button>
                )}

                {isShowingSequence && (
                    <div className="text-indigo-400 font-mono animate-pulse font-bold">Прием сигнала...</div>
                )}

                {isPlaying && !isShowingSequence && (
                    <div className="text-emerald-400 font-mono font-bold">Твой ход</div>
                )}

                {gameOver && (
                     <div className="flex items-center gap-2 justify-center animate-in zoom-in duration-300">
                         <span className="text-rose-500 font-bold">Ошибка связи!</span>
                         <button onClick={startGame} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20">
                             Заново
                         </button>
                     </div>
                )}

                {gameWon && (
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="text-yellow-400 font-black text-xl mb-1 flex items-center justify-center gap-2">
                            <Trophy size={20} />
                            СИНХРОНИЗАЦИЯ 100%
                        </div>
                        <p className="text-slate-400 text-xs font-bold">+100 XP ПОЛУЧЕНО</p>
                    </div>
                )}
            </div>

        </div>
    </div>
  );
};
