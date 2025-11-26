import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Lightbulb, Trophy, Timer, Zap, Star } from 'lucide-react';

interface WordScrambleGameProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, xp: number, coins: number) => void;
}

interface Word {
  original: string;
  hint: string;
  category: string;
}

const WORDS: Word[] = [
  { original: 'МОТИВАЦИЯ', hint: 'Внутренний двигатель к действию', category: 'психология' },
  { original: 'ДОФАМИН', hint: 'Молекула желания в мозге', category: 'нейронаука' },
  { original: 'ФОКУС', hint: 'Концентрация внимания', category: 'продуктивность' },
  { original: 'ПРИВЫЧКА', hint: 'Автоматическое поведение', category: 'психология' },
  { original: 'ЭНЕРГИЯ', hint: 'Сила для действий', category: 'здоровье' },
  { original: 'ЦЕЛЬ', hint: 'То, к чему стремишься', category: 'планирование' },
  { original: 'УСПЕХ', hint: 'Достижение желаемого', category: 'мотивация' },
  { original: 'НЕЙРОН', hint: 'Клетка мозга', category: 'нейронаука' },
  { original: 'ДИСЦИПЛИНА', hint: 'Следование правилам', category: 'характер' },
  { original: 'ПРОГРЕСС', hint: 'Движение вперёд', category: 'развитие' },
  { original: 'БАЛАНС', hint: 'Равновесие в жизни', category: 'здоровье' },
  { original: 'ОТДЫХ', hint: 'Восстановление сил', category: 'здоровье' },
];

const shuffleWord = (word: string): string => {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Make sure it's actually shuffled
  const shuffled = arr.join('');
  return shuffled === word ? shuffleWord(word) : shuffled;
};

export const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong' | 'finished'>('playing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);

  const currentWord = WORDS[currentWordIndex];

  // Initialize game
  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen]);

  // Scramble word when index changes
  useEffect(() => {
    if (currentWord) {
      setScrambledWord(shuffleWord(currentWord.original));
      setUserInput('');
      setSelectedLetters([]);
      setShowHint(false);
    }
  }, [currentWordIndex, currentWord]);

  // Timer
  useEffect(() => {
    if (!isOpen || gameState !== 'playing' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, gameState, timeLeft]);

  const resetGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
    setHintsUsed(0);
    setStreak(0);
    setUserInput('');
    setSelectedLetters([]);
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (selectedLetters.includes(index)) return;
    
    setSelectedLetters([...selectedLetters, index]);
    setUserInput(prev => prev + letter);
  };

  const handleBackspace = () => {
    if (selectedLetters.length > 0) {
      setSelectedLetters(prev => prev.slice(0, -1));
      setUserInput(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (userInput.toUpperCase() === currentWord.original) {
      // Correct!
      const basePoints = 100;
      const streakBonus = streak * 20;
      const timeBonus = Math.floor(timeLeft / 10) * 10;
      const hintPenalty = showHint ? 30 : 0;
      const points = basePoints + streakBonus + timeBonus - hintPenalty;
      
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setGameState('correct');
      
      setTimeout(() => {
        if (currentWordIndex < WORDS.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setGameState('playing');
        } else {
          setGameState('finished');
        }
      }, 1000);
    } else {
      // Wrong
      setStreak(0);
      setGameState('wrong');
      
      setTimeout(() => {
        setUserInput('');
        setSelectedLetters([]);
        setGameState('playing');
      }, 1000);
    }
  };

  const handleHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    const xp = Math.floor(score / 10);
    const coins = Math.floor(score / 20);
    onComplete(score, xp, coins);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-14 pb-4">
          <div 
            className="p-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                  }}
                >
                  <span className="text-2xl">🔤</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Собери слово</h1>
                  <p className="text-white/50 text-xs">Слово {currentWordIndex + 1}/{WORDS.length}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/20">
                  <Star size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">{score}</span>
                </div>
                
                {streak > 1 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20">
                    <Zap size={14} className="text-orange-400" />
                    <span className="text-orange-400 font-bold text-sm">x{streak}</span>
                  </div>
                )}
              </div>
              
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                timeLeft <= 10 ? 'bg-red-500/20' : 'bg-white/10'
              }`}>
                <Timer size={14} className={timeLeft <= 10 ? 'text-red-400' : 'text-white/60'} />
                <span className={`font-bold text-sm ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Content */}
        {gameState !== 'finished' ? (
          <div className="px-4 py-6 flex flex-col items-center">
            {/* Category */}
            <div className="mb-4">
              <span className="text-xs font-medium text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/20">
                #{currentWord.category}
              </span>
            </div>

            {/* Scrambled Word */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {scrambledWord.split('').map((letter, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLetterClick(letter, index)}
                  disabled={selectedLetters.includes(index)}
                  className={`w-12 h-12 rounded-xl font-bold text-xl flex items-center justify-center transition-all ${
                    selectedLetters.includes(index)
                      ? 'bg-white/5 text-white/20'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-indigo-500/30'
                  }`}
                >
                  {letter}
                </motion.button>
              ))}
            </div>

            {/* User Input */}
            <div 
              className="w-full max-w-xs p-4 rounded-2xl mb-4 min-h-[60px] flex items-center justify-center"
              style={{
                background: gameState === 'correct' 
                  ? 'rgba(34,197,94,0.2)'
                  : gameState === 'wrong'
                    ? 'rgba(239,68,68,0.2)'
                    : 'rgba(255,255,255,0.05)',
                border: `2px solid ${
                  gameState === 'correct' 
                    ? 'rgba(34,197,94,0.5)'
                    : gameState === 'wrong'
                      ? 'rgba(239,68,68,0.5)'
                      : 'rgba(255,255,255,0.1)'
                }`,
              }}
            >
              <span className={`text-2xl font-bold tracking-widest ${
                gameState === 'correct' 
                  ? 'text-green-400'
                  : gameState === 'wrong'
                    ? 'text-red-400'
                    : 'text-white'
              }`}>
                {userInput || '_ _ _'}
              </span>
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30"
                >
                  <p className="text-amber-300 text-sm text-center">
                    💡 {currentWord.hint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBackspace}
                disabled={userInput.length === 0}
                className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
              >
                <RotateCcw size={20} className="text-white" />
              </button>
              
              <button
                onClick={handleHint}
                disabled={showHint}
                className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-colors disabled:opacity-30"
              >
                <Lightbulb size={20} className="text-amber-400" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={userInput.length !== currentWord.original.length}
              className="w-full max-w-xs py-4 rounded-2xl font-bold text-white disabled:opacity-50 transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              }}
            >
              Проверить
            </button>
          </div>
        ) : (
          /* Finished Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="text-center"
            >
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-white mb-2">Игра окончена!</h2>
              <p className="text-white/60 mb-6">Отличная работа!</p>
              
              <div 
                className="p-6 rounded-3xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >
                <div className="text-4xl font-black text-white mb-2">{score}</div>
                <div className="text-white/50 text-sm mb-4">очков</div>
                
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Zap size={16} className="text-yellow-400" />
                      <span className="text-yellow-400 font-bold">+{Math.floor(score / 10)}</span>
                    </div>
                    <span className="text-white/40 text-xs">XP</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="text-yellow-400">🪙</span>
                      <span className="text-yellow-400 font-bold">+{Math.floor(score / 20)}</span>
                    </div>
                    <span className="text-white/40 text-xs">Монет</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Ещё раз
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-4 rounded-2xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  Забрать
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WordScrambleGame;

