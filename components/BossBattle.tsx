import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Heart, Zap, Shield, Swords, Trophy, X, Star, Sparkles } from 'lucide-react';

interface BossBattleProps {
  bossName: string;
  bossEmoji: string;
  bossDescription: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  onComplete: (won: boolean, score: number) => void;
  onClose: () => void;
}

export const BossBattle: React.FC<BossBattleProps> = ({
  bossName,
  bossEmoji,
  bossDescription,
  questions,
  onComplete,
  onClose,
}) => {
  const [phase, setPhase] = useState<'intro' | 'battle' | 'victory' | 'defeat'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);
  const [bossShake, setBossShake] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const damagePerHit = Math.floor(100 / questions.length);
  const bossDamage = 20;

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Атака на босса
      const comboDamage = damagePerHit + (combo * 5);
      setBossHP(prev => Math.max(0, prev - comboDamage));
      setBossShake(true);
      setTimeout(() => setBossShake(false), 500);
      setCombo(prev => prev + 1);
      setMaxCombo(prev => Math.max(prev, combo + 1));
      setScore(prev => prev + 100 + (combo * 20));
    } else {
      // Босс атакует
      setPlayerHP(prev => Math.max(0, prev - bossDamage));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setCombo(0);
    }

    // Переход к следующему вопросу
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      
      if (bossHP - (correct ? damagePerHit + (combo * 5) : 0) <= 0) {
        setPhase('victory');
        onComplete(true, score + 100 + (combo * 20));
      } else if (playerHP - (correct ? 0 : bossDamage) <= 0) {
        setPhase('defeat');
        onComplete(false, score);
      } else if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Все вопросы пройдены, проверяем кто победил
        if (bossHP > playerHP) {
          setPhase('defeat');
          onComplete(false, score);
        } else {
          setPhase('victory');
          onComplete(true, score);
        }
      }
    }, 2000);
  }, [selectedAnswer, showResult, currentQuestion, combo, damagePerHit, bossHP, playerHP, bossDamage, currentQuestionIndex, questions.length, score, onComplete]);

  // Intro phase
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/90" />
        
        {/* Boss entrance */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative z-10 text-center"
        >
          {/* Boss */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[120px] mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            {bossEmoji}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-black text-red-500 mb-2 uppercase tracking-wider"
          >
            БОСС: {bossName}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/60 text-lg mb-8 max-w-md mx-auto"
          >
            {bossDescription}
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            onClick={() => setPhase('battle')}
            className="px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 8px 30px rgba(239,68,68,0.4)',
            }}
          >
            <Swords className="inline mr-2" size={24} />
            В БОЙ!
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Victory phase
  if (phase === 'victory') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/50 to-black/90" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative z-10 text-center"
        >
          {/* Confetti effect */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#fbbf24', '#ef4444', '#22c55e', '#3b82f6'][i % 4],
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -50, opacity: 1 }}
              animate={{ 
                y: 400, 
                opacity: 0,
                rotate: Math.random() * 360,
                x: (Math.random() - 0.5) * 200,
              }}
              transition={{ 
                duration: 2 + Math.random(), 
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-[100px] mb-6"
          >
            🏆
          </motion.div>
          
          <h1 className="text-5xl font-black text-yellow-400 mb-4 uppercase">
            ПОБЕДА!
          </h1>
          
          <p className="text-white/80 text-xl mb-2">
            {bossName} повержен!
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <span className="text-yellow-400 font-bold">+{score} XP</span>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <span className="text-purple-400 font-bold">Макс комбо: {maxCombo}x</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-1 mb-8">
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: star * 0.2 }}
              >
                <Star 
                  size={40} 
                  className={playerHP > (3 - star) * 30 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} 
                />
              </motion.div>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 8px 30px rgba(34,197,94,0.4)',
            }}
          >
            Круто! 🎉
          </button>
        </motion.div>
      </div>
    );
  }

  // Defeat phase
  if (phase === 'defeat') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/50 to-black/90" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-[80px] mb-6 grayscale"
          >
            💔
          </motion.div>
          
          <h1 className="text-4xl font-black text-red-400 mb-4">
            Не сдавайся!
          </h1>
          
          <p className="text-white/60 text-lg mb-6 max-w-sm mx-auto">
            {bossName} оказался сильнее... Но ты можешь попробовать снова!
          </p>
          
          <p className="text-white/40 text-sm mb-8">
            Набрано: {score} XP
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setPhase('intro');
                setCurrentQuestionIndex(0);
                setPlayerHP(100);
                setBossHP(100);
                setCombo(0);
                setScore(0);
              }}
              className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
              }}
            >
              Ещё раз
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              Выйти
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Battle phase
  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1a0a0a 0%, #0a0a1a 100%)',
        }}
      />
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
      >
        <X size={20} className="text-white/60" />
      </button>
      
      {/* Battle Arena */}
      <div className="relative z-10 flex-1 flex flex-col p-4 pt-16">
        
        {/* Boss Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Boss HP Bar */}
          <div className="w-full max-w-sm mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-red-400 font-bold text-sm">{bossName}</span>
              <span className="text-red-300 text-xs">{bossHP}%</span>
            </div>
            <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-red-500/30">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                }}
                animate={{ width: `${bossHP}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Boss */}
          <motion.div
            animate={bossShake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -5, 0] }}
            transition={bossShake ? { duration: 0.4 } : { duration: 2, repeat: Infinity }}
            className="text-[80px] drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            {bossEmoji}
          </motion.div>
          
          {/* Combo indicator */}
          {combo > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40"
            >
              <span className="text-yellow-400 font-bold text-sm">
                🔥 КОМБО x{combo}
              </span>
            </motion.div>
          )}
        </div>
        
        {/* Question Section */}
        <div className="mb-4">
          <div 
            className="rounded-3xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Question counter */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/40 text-xs font-medium">
                Вопрос {currentQuestionIndex + 1}/{questions.length}
              </span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentQuestionIndex ? 'bg-green-500' :
                      i === currentQuestionIndex ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Question */}
            <h2 className="text-white font-bold text-lg mb-4 leading-tight">
              {currentQuestion.question}
            </h2>
            
            {/* Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correctIndex;
                const showCorrect = showResult && isCorrectAnswer;
                const showWrong = showResult && isSelected && !isCorrectAnswer;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                      showCorrect ? 'bg-green-500/30 border-green-500' :
                      showWrong ? 'bg-red-500/30 border-red-500' :
                      isSelected ? 'bg-white/20 border-white/40' :
                      'bg-white/5 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    <span className={`${
                      showCorrect ? 'text-green-400' :
                      showWrong ? 'text-red-400' :
                      'text-white'
                    }`}>
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Explanation */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className={`text-sm ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                    {isCorrect ? '✓ Правильно! ' : '✗ Неверно. '}
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Player Section */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="pb-4"
        >
          {/* Player HP Bar */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-sm">Ты</span>
                <span className="text-green-300 text-xs">{playerHP}%</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-green-500/30">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: playerHP > 30 
                      ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                      : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: playerHP > 30 
                      ? '0 0 10px rgba(34,197,94,0.5)'
                      : '0 0 10px rgba(239,68,68,0.5)',
                  }}
                  animate={{ width: `${playerHP}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="text-yellow-400 font-bold text-sm">
              {score} XP
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BossBattle;



