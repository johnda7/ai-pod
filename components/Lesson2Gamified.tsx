/**
 * 🎮 ИГРОВОЙ ДИЗАЙН ДЛЯ УРОКА 2: ДОФАМИН
 * 
 * Убираем свайпы, делаем визуально круто и игрово!
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Zap, ChevronRight, Lock, Unlock, Sparkles, 
  Trophy, Star, Heart, Target, Brain
} from 'lucide-react';
import { Task, LessonSlide } from '../types';

interface Lesson2GamifiedProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// 🎯 ДОФАМИНОВЫЙ МЕТР (всегда виден)
const DopamineMeter: React.FC<{
  cheapDopamine: number;
  expensiveDopamine: number;
}> = ({ cheapDopamine, expensiveDopamine }) => {
  const total = cheapDopamine + expensiveDopamine;
  const expensivePercent = total > 0 ? (expensiveDopamine / total) * 100 : 0;
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-md mx-auto px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-white/80 text-sm font-medium">
            Дофаминовый метр
          </span>
        </div>
        <span className="text-white font-bold text-lg">
          {Math.round(expensivePercent)}%
        </span>
      </div>
      
      <div className="relative h-4 rounded-full bg-red-500/20 overflow-hidden">
        {/* Дешёвый дофамин (красный) */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600"
          initial={{ width: 0 }}
          animate={{ width: `${cheapDopamine}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Дорогой дофамин (зелёный) */}
        <motion.div
          className="absolute right-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-600"
          initial={{ width: 0 }}
          animate={{ width: `${expensiveDopamine}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-red-300">🔴 Дешёвый</span>
        <span className="text-green-300">🟢 Дорогой</span>
      </div>
    </motion.div>
  );
};

// 📖 TAP-TO-REVEAL для THEORY слайдов
const TapToRevealSlide: React.FC<{
  slide: LessonSlide;
  onComplete: () => void;
}> = ({ slide, onComplete }) => {
  const [revealedBlocks, setRevealedBlocks] = useState(0);
  const content = (slide as any).content || '';
  const blocks = content.split('\n\n').filter(b => b.trim());
  
  const handleTap = () => {
    if (revealedBlocks < blocks.length) {
      setRevealedBlocks(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <div 
      className="w-full max-w-md text-center cursor-pointer"
      onClick={handleTap}
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black text-white mb-8"
        style={{
          textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(139,92,246,0.3)'
        }}
      >
        {slide.title}
      </motion.h1>
      
      {/* Content blocks */}
      <div className="space-y-4">
        <AnimatePresence>
          {blocks.slice(0, revealedBlocks).map((block, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="text-lg text-white/90 leading-relaxed"
            >
              {block}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Hint */}
      {revealedBlocks < blocks.length && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-8 flex items-center justify-center gap-2 text-white/60 text-sm"
        >
          <Sparkles size={16} className="text-yellow-400" />
          <span>Нажми, чтобы продолжить</span>
          <ChevronRight size={16} />
        </motion.div>
      )}
      
      {/* Continue button */}
      {revealedBlocks === blocks.length && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30"
        >
          Далее →
        </motion.button>
      )}
    </div>
  );
};

// 🎯 DRAG-TO-UNLOCK для QUIZ слайдов
const DragToUnlockQuiz: React.FC<{
  slide: LessonSlide;
  onComplete: (xp: number) => void;
  onNext: () => void;
}> = ({ slide, onComplete, onNext }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const correctIndex = (slide as any).correctIndex;
  const options = (slide as any).options || [];
  const explanation = (slide as any).explanation || '';
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    
    setSelected(index);
    setShowResult(true);
    setDraggedIndex(null);
    
    if (index === correctIndex) {
      setIsUnlocked(true);
      onComplete(20);
      
      // Автоматический переход через 2 секунды
      setTimeout(() => {
        onNext();
      }, 2000);
    } else {
      onComplete(5);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      {/* Question */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white text-center mb-8"
      >
        {(slide as any).question}
      </motion.h2>
      
      {/* Drop zone */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: isUnlocked ? 1.1 : 1,
          opacity: 1,
          borderColor: isUnlocked ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)'
        }}
        className="min-h-[200px] p-6 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-dashed mb-6 flex items-center justify-center"
        onDrop={(e) => {
          e.preventDefault();
          const index = parseInt(e.dataTransfer.getData('index'));
          handleDrop(index);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {isUnlocked ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <Unlock size={48} className="text-green-400 mx-auto mb-2" />
            <p className="text-green-300 font-bold text-lg">Разблокировано!</p>
          </motion.div>
        ) : selected === null ? (
          <div className="text-center text-white/40">
            <Lock size={32} className="mx-auto mb-2" />
            <p className="text-sm">Перетащи ответ сюда</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white font-semibold">
              {options[selected]}
            </p>
          </div>
        )}
      </motion.div>
      
      {/* Options */}
      <div className="space-y-3">
        {options.map((option: string, index: number) => {
          const isCorrect = index === correctIndex;
          const isSelected = selected === index;
          
          let bgClass = 'bg-white/10 border-white/20';
          if (showResult) {
            if (isCorrect) {
              bgClass = 'bg-green-500/30 border-green-400';
            } else if (isSelected && !isCorrect) {
              bgClass = 'bg-red-500/30 border-red-400';
            }
          }
          
          return (
            <motion.div
              key={index}
              draggable={!showResult}
              onDragStart={() => handleDragStart(index)}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileDrag={{ scale: 1.1, rotate: 5 }}
              className={`p-4 rounded-2xl border-2 backdrop-blur-xl cursor-move ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                  showResult && isCorrect 
                    ? 'bg-green-500 text-white' 
                    : showResult && isSelected && !isCorrect
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white/80'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-white font-semibold flex-1">{option}</span>
                {showResult && isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Trophy size={24} className="text-green-400" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Explanation */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-6 p-5 rounded-2xl backdrop-blur-xl border ${
              selected === correctIndex 
                ? 'bg-green-500/20 border-green-400/30' 
                : 'bg-red-500/20 border-red-400/30'
            }`}
          >
            <p className="text-white/80 text-sm leading-relaxed">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 🎮 ГЛАВНЫЙ КОМПОНЕНТ УРОКА
export const Lesson2Gamified: React.FC<Lesson2GamifiedProps> = ({
  task,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cheapDopamine, setCheapDopamine] = useState(50);
  const [expensiveDopamine, setExpensiveDopamine] = useState(0);
  
  const slides = task.slides || [];
  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;
  
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setCheapDopamine(50);
      setExpensiveDopamine(0);
    }
  }, [isOpen]);
  
  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSlideComplete = (xp: number = 10) => {
    // Обновляем дофаминовый метр
    if (xp >= 15) {
      setExpensiveDopamine(prev => Math.min(100, prev + 5));
    } else {
      setCheapDopamine(prev => Math.min(100, prev + 3));
    }
  };
  
  // Определяем цвет фона в зависимости от прогресса
  const getBackgroundGradient = () => {
    const progress = currentIndex / totalSlides;
    
    if (progress < 0.33) {
      // Начало: красный (дешёвый дофамин)
      return 'from-red-900/95 via-orange-900/90 to-black';
    } else if (progress < 0.66) {
      // Середина: жёлтый (переход)
      return 'from-amber-900/95 via-yellow-900/90 to-black';
    } else {
      // Конец: зелёный (дорогой дофамин)
      return 'from-green-900/95 via-emerald-900/90 to-black';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getBackgroundGradient()}`} />
      
      {/* Dopamine Meter */}
      <div className="absolute top-20 left-0 right-0 z-50">
        <DopamineMeter 
          cheapDopamine={cheapDopamine}
          expensiveDopamine={expensiveDopamine}
        />
      </div>
      
      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center px-5 pt-32 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {currentSlide?.type === 'THEORY' ? (
              <TapToRevealSlide 
                slide={currentSlide}
                onComplete={handleNext}
              />
            ) : currentSlide?.type === 'QUIZ' ? (
              <DragToUnlockQuiz
                slide={currentSlide}
                onComplete={handleSlideComplete}
                onNext={handleNext}
              />
            ) : (
              <div className="text-center text-white">
                <p>Тип слайда: {currentSlide?.type}</p>
                <button
                  onClick={handleNext}
                  className="mt-4 px-6 py-3 rounded-xl bg-purple-500 text-white"
                >
                  Далее
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Progress */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50">
        <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
          <span className="text-white/80 text-sm font-medium">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>
      </div>
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-50"
      >
        <span className="text-white text-xl">×</span>
      </button>
    </div>
  );
};


