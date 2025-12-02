import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Trophy, Zap, Clock, Target, Sparkles, Star } from 'lucide-react';

// ============================================
// THERMITE GRID - Профессиональная игра с комбо
// Вдохновлено NoPixel MiniGames
// ============================================

interface ThermiteGridProps {
  onComplete: (score: number) => void;
  rows?: number;
  cols?: number;
  targetScore?: number;
  duration?: number;
}

type CellStatus = 'full' | 'half' | 'empty';

interface Cell {
  status: CellStatus;
  highlighted: boolean;
  pattern: number; // 0-3 разные паттерны атаки
}

// Паттерны атаки (какие клетки подсвечиваются при клике)
const ATTACK_PATTERNS = [
  // Паттерн 0: Крест (+)
  [[0, -1], [0, 1], [-1, 0], [1, 0]],
  // Паттерн 1: Диагональ (X)
  [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  // Паттерн 2: Горизонталь (-)
  [[0, -1], [0, -2], [0, 1], [0, 2]],
  // Паттерн 3: Вертикаль (|)
  [[-1, 0], [-2, 0], [1, 0], [2, 0]],
];

const PATTERN_ICONS = ['➕', '✖️', '➖', '|'];
const PATTERN_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

export const ThermiteGrid: React.FC<ThermiteGridProps> = ({
  onComplete,
  rows = 5,
  cols = 5,
  targetScore = 15,
  duration = 45,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'won' | 'lost'>('intro');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [combo, setCombo] = useState(0);
  const [totalCombos, setTotalCombos] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showComboNotice, setShowComboNotice] = useState(false);
  const [isOutOfMoves, setIsOutOfMoves] = useState(false);
  const [clickFeedback, setClickFeedback] = useState<{ x: number; y: number; text: string } | null>(null);

  // Инициализация доски
  const initBoard = useCallback(() => {
    const newBoard: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          status: 'full',
          highlighted: r === Math.floor(rows / 2) && c === Math.floor(cols / 2), // Центр подсвечен
          pattern: Math.floor(Math.random() * 4),
        });
      }
      newBoard.push(row);
    }
    return newBoard;
  }, [rows, cols]);

  // Таймер
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      if (score >= targetScore) {
        setGameState('won');
        setTimeout(() => onComplete(score * 10 + totalCombos * 50), 2000);
      } else {
        setGameState('lost');
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, targetScore, totalCombos, onComplete]);

  // Проверка есть ли ходы
  const hasValidMoves = useCallback((currentBoard: Cell[][]) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (currentBoard[r][c].highlighted && currentBoard[r][c].status !== 'empty') {
          return true;
        }
      }
    }
    return false;
  }, [rows]);

  // Обработка клика
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    const cell = board[row][col];
    if (!cell.highlighted || cell.status === 'empty') return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    // Обновляем подсветку на основе паттерна кликнутой клетки
    const newBoard = board.map((r, ri) =>
      r.map((c, ci) => {
        if (ri === row && ci === col) {
          return c; // Кликнутая клетка обновится отдельно
        }
        if (c.status === 'empty') {
          return { ...c, highlighted: false };
        }

        // Проверяем попадает ли клетка в паттерн атаки
        const pattern = ATTACK_PATTERNS[cell.pattern];
        const isInPattern = pattern.some(([dr, dc]) => 
          ri === row + dr && ci === col + dc
        );

        return { ...c, highlighted: isInPattern };
      })
    );

    // Проверяем количество подсвеченных клеток (есть ли ходы)
    let highlightedCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === row && c === col) continue;
        if (newBoard[r][c].highlighted && newBoard[r][c].status !== 'empty') {
          highlightedCount++;
        }
      }
    }

    // Нет ходов = проигрыш
    if (highlightedCount === 0) {
      setIsOutOfMoves(true);
      setGameState('lost');
      return;
    }

    // Обработка очков
    let newScore = score;
    let newCombo = combo;
    let newTotalCombos = totalCombos;

    if (cell.status === 'half') {
      // Уничтожение клетки!
      newScore++;

      // Комбо логика (< 1.5 секунды между кликами)
      if (newCombo === 0 || timeSinceLastClick <= 1500) {
        newCombo++;
      } else {
        newCombo = 1;
      }

      // Комбо x3 = бонус!
      if (newCombo >= 3) {
        const comboBonus = Math.pow(2, newTotalCombos);
        newScore += comboBonus;
        newTotalCombos++;
        newCombo = 0;
        setShowComboNotice(true);
        setTimeout(() => setShowComboNotice(false), 800);
        
        setClickFeedback({ x: col, y: row, text: `+${1 + comboBonus} COMBO!` });
      } else {
        setClickFeedback({ x: col, y: row, text: '+1' });
      }

      setTimeout(() => setClickFeedback(null), 500);

      // Победа!
      if (newScore >= targetScore) {
        setGameState('won');
        setTimeout(() => onComplete(newScore * 10 + newTotalCombos * 50), 2000);
        return;
      }
    } else {
      // Не уничтожили = сброс комбо
      newCombo = 0;
    }

    // Обновляем кликнутую клетку
    newBoard[row][col] = {
      ...cell,
      status: cell.status === 'full' ? 'half' : 'empty',
      pattern: Math.floor(Math.random() * 4), // Новый случайный паттерн
      highlighted: false,
    };

    setBoard(newBoard);
    setScore(newScore);
    setCombo(newCombo);
    setTotalCombos(newTotalCombos);
    setLastClickTime(now);
  }, [board, gameState, score, combo, totalCombos, lastClickTime, rows, targetScore, onComplete]);

  // Старт игры
  const startGame = () => {
    setGameState('playing');
    setBoard(initBoard());
    setScore(0);
    setTimeLeft(duration);
    setCombo(0);
    setTotalCombos(0);
    setLastClickTime(0);
    setIsOutOfMoves(false);
  };

  // ============ ЭКРАНЫ ============

  // INTRO
  if (gameState === 'intro') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Фоновые эффекты */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          {/* Иконка игры */}
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 30px rgba(99,102,241,0.5)',
                '0 0 60px rgba(139,92,246,0.6)',
                '0 0 30px rgba(99,102,241,0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
          >
            <Target size={48} className="text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-black text-white mb-2">
            THERMITE
          </h2>
          <p className="text-indigo-300 text-lg font-medium mb-6">
            Расшифруй байты
          </p>

          {/* Правила */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/10">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-indigo-400" />
                </div>
                <span className="text-white/70">Полная</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/30 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-orange-400 opacity-50" />
                </div>
                <span className="text-white/70">Половина</span>
              </div>
            </div>
            <p className="text-white/50 text-xs mt-3">
              Кликай подсвеченные клетки. Паттерны показывают следующие ходы.
            </p>
          </div>

          {/* Паттерны */}
          <div className="flex justify-center gap-2 mb-6">
            {PATTERN_ICONS.map((icon, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ 
                  background: `${PATTERN_COLORS[idx]}20`,
                  border: `1px solid ${PATTERN_COLORS[idx]}40`
                }}
              >
                {icon}
              </div>
            ))}
          </div>

          {/* Цель */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <span className="text-yellow-400 font-bold">🎯 {targetScore} очков</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <span className="text-blue-400 font-bold">⏱️ {duration}с</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-10 py-4 rounded-2xl font-bold text-white text-lg flex items-center gap-3 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              boxShadow: '0 10px 40px rgba(99,102,241,0.5)',
            }}
          >
            <Play size={24} fill="white" /> НАЧАТЬ
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // WON
  if (gameState === 'won') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900" />
        
        {/* Конфетти эффект */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: -20, 
              x: Math.random() * 300 - 150,
              opacity: 1,
              rotate: 0
            }}
            animate={{ 
              y: 400, 
              opacity: 0,
              rotate: 360
            }}
            transition={{ 
              duration: 2 + Math.random(),
              delay: Math.random() * 0.5,
              ease: 'linear'
            }}
            className="absolute top-0 w-3 h-3 rounded-sm"
            style={{
              left: `${20 + Math.random() * 60}%`,
              background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA'][i % 4]
            }}
          />
        ))}
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <Trophy size={80} className="text-yellow-400 mx-auto mb-4" />
          </motion.div>
          
          <h2 className="text-4xl font-black text-white mb-2">
            ПОБЕДА!
          </h2>
          
          <div className="flex justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">{score}</div>
              <div className="text-white/60 text-sm">очков</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-400">{totalCombos}</div>
              <div className="text-white/60 text-sm">комбо</div>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-black text-yellow-400"
          >
            +{score * 10 + totalCombos * 50} XP
          </motion.div>
          
          <div className="flex gap-2 justify-center mt-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7 + i * 0.15 }}
              >
                <Star size={36} fill="#FCD34D" className="text-yellow-400" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // LOST
  if (gameState === 'lost') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-950/30 to-slate-900" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <div className="text-7xl mb-4">
            {isOutOfMoves ? '🚫' : '⏰'}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {isOutOfMoves ? 'Нет ходов!' : 'Время вышло!'}
          </h2>
          <p className="text-white/60 mb-4">
            Набрано: <span className="text-orange-400 font-bold">{score}</span> / {targetScore}
          </p>

          {totalCombos > 0 && (
            <p className="text-purple-400 mb-4">
              Комбо: {totalCombos}
            </p>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
            }}
          >
            <RefreshCw size={20} /> Ещё раз
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ============ ИГРОВОЙ ЭКРАН ============
  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      
      {/* HUD */}
      <div className="relative z-20 flex justify-between items-center p-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
          <Target size={18} className="text-yellow-400" />
          <span className="text-white font-bold">{score}/{targetScore}</span>
        </div>
        
        <AnimatePresence>
          {combo >= 2 && (
            <motion.div 
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20 }}
              className="px-4 py-2 rounded-xl bg-orange-500/30 backdrop-blur-sm border border-orange-500/30"
            >
              <span className="text-orange-300 font-bold flex items-center gap-1">
                <Zap size={16} /> x{combo}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
          <Clock size={18} className={timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'} />
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* COMBO NOTICE */}
      <AnimatePresence>
        {showComboNotice && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
              🔥 COMBO! 🔥
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Игровая сетка */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div 
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: `${cols * 60}px`,
          }}
        >
          {board.map((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <motion.button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                disabled={cell.status === 'empty' || !cell.highlighted}
                className="relative aspect-square rounded-xl transition-all"
                style={{
                  background: cell.status === 'empty'
                    ? 'transparent'
                    : cell.status === 'half'
                      ? `linear-gradient(135deg, ${PATTERN_COLORS[cell.pattern]}40 0%, ${PATTERN_COLORS[cell.pattern]}20 100%)`
                      : `linear-gradient(135deg, ${PATTERN_COLORS[cell.pattern]} 0%, ${PATTERN_COLORS[cell.pattern]}CC 100%)`,
                  border: cell.highlighted && cell.status !== 'empty'
                    ? '3px solid rgba(255,255,255,0.8)'
                    : cell.status === 'empty'
                      ? '1px dashed rgba(255,255,255,0.1)'
                      : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: cell.highlighted && cell.status !== 'empty'
                    ? `0 0 20px ${PATTERN_COLORS[cell.pattern]}, inset 0 0 20px rgba(255,255,255,0.1)`
                    : 'none',
                  opacity: cell.status === 'empty' ? 0.3 : 1,
                  cursor: cell.highlighted && cell.status !== 'empty' ? 'pointer' : 'default',
                }}
                whileHover={cell.highlighted && cell.status !== 'empty' ? { scale: 1.1 } : {}}
                whileTap={cell.highlighted && cell.status !== 'empty' ? { scale: 0.9 } : {}}
                animate={cell.highlighted && cell.status !== 'empty' ? {
                  boxShadow: [
                    `0 0 20px ${PATTERN_COLORS[cell.pattern]}`,
                    `0 0 40px ${PATTERN_COLORS[cell.pattern]}`,
                    `0 0 20px ${PATTERN_COLORS[cell.pattern]}`,
                  ]
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {/* Паттерн иконка */}
                {cell.status !== 'empty' && (
                  <span className="absolute inset-0 flex items-center justify-center text-white/80 text-lg font-bold">
                    {PATTERN_ICONS[cell.pattern]}
                  </span>
                )}
                
                {/* Крестик для пустых */}
                {cell.status === 'empty' && (
                  <span className="absolute inset-0 flex items-center justify-center text-white/20 text-xl">
                    ✕
                  </span>
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Click Feedback */}
      <AnimatePresence>
        {clickFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            className="absolute z-30 text-2xl font-black pointer-events-none"
            style={{
              left: `${(clickFeedback.x / cols) * 100 + 50 / cols}%`,
              top: `${(clickFeedback.y / rows) * 50 + 25}%`,
              color: clickFeedback.text.includes('COMBO') ? '#FCD34D' : '#34D399',
              textShadow: '0 0 10px currentColor',
            }}
          >
            {clickFeedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Прогресс бар */}
      <div className="relative z-10 p-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>0</span>
          <span className="text-white/80 font-bold">{Math.round((score / targetScore) * 100)}%</span>
          <span>{targetScore}</span>
        </div>
      </div>
    </div>
  );
};

export default ThermiteGrid;

