import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { 
  X, ChevronUp, ChevronDown, 
  Sparkles, Zap, Trophy, Star, 
  CheckCircle, Brain, Target, Battery,
  Clock, Users, PenTool, Gamepad2
} from 'lucide-react';
import { Task, LessonSlide } from '../types';
import { KatyaMentor } from './KatyaMentor';
import { hapticSelection, hapticSuccess, hapticLight } from '../services/telegramService';

interface ModernLessonViewProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// TikTok-style vertical swipe lesson view with premium design
export const ModernLessonView: React.FC<ModernLessonViewProps> = ({
  task,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState<boolean[]>([]);
  const [saved, setSaved] = useState<boolean[]>([]);
  const [progress, setProgress] = useState(0);
  const [showQuickReaction, setShowQuickReaction] = useState(false);
  const [slideCompleted, setSlideCompleted] = useState<boolean[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  
  // For swipe detection
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5]);

  const slides = task.slides || [];
  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setLiked(new Array(slides.length).fill(false));
      setSaved(new Array(slides.length).fill(false));
      setSlideCompleted(new Array(slides.length).fill(false));
      setProgress(0);
      setXpEarned(0);
      setComboCount(0);
    }
  }, [isOpen, slides.length]);

  // Auto-progress for theory slides
  useEffect(() => {
    if (!currentSlide || currentSlide.type !== 'THEORY') return;
    
    const duration = 10000; // 10 seconds per slide
    const interval = 50;
    let elapsed = 0;
    
    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
      
      if (elapsed >= duration) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, currentSlide]);

  const handleSwipe = useCallback((direction: 'up' | 'down') => {
    hapticSelection(); // 📳 Вибрация при свайпе
    
    if (direction === 'up' && currentIndex < totalSlides - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else if (direction === 'up' && currentIndex === totalSlides - 1) {
      hapticSuccess(); // 📳 Успех при завершении!
      onComplete();
    }
  }, [currentIndex, totalSlides, onComplete]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) {
      handleSwipe('up');
    } else if (info.offset.y > threshold) {
      handleSwipe('down');
    }
  };

  // Keyboard navigation for browser testing (ArrowUp/Down, Space, Escape)
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          handleSwipe('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleSwipe('down');
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSwipe, onClose]);

  const handleDoubleTap = () => {
    const newLiked = [...liked];
    newLiked[currentIndex] = true;
    setLiked(newLiked);
    setShowQuickReaction(true);
    setTimeout(() => setShowQuickReaction(false), 1000);
  };

  const markSlideComplete = (bonusXp: number = 10) => {
    const newCompleted = [...slideCompleted];
    if (!newCompleted[currentIndex]) {
    newCompleted[currentIndex] = true;
    setSlideCompleted(newCompleted);
      setXpEarned(prev => prev + bonusXp);
      setComboCount(prev => prev + 1);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 1500);
    }
  };

  if (!isOpen) return null;

  // Get background gradient based on slide type and task
  const getBackgroundGradient = () => {
    if (task.isBoss) {
      return 'from-red-900/95 via-orange-900/90 to-black';
    }
    switch (currentSlide?.type) {
      case 'THEORY':
        return 'from-indigo-900/95 via-purple-900/90 to-black';
      case 'QUIZ':
        return 'from-amber-900/95 via-orange-900/90 to-black';
      case 'GAME':
        return 'from-emerald-900/95 via-green-900/90 to-black';
      case 'VIDEO':
        return 'from-rose-900/95 via-pink-900/90 to-black';
      case 'SORTING':
        return 'from-cyan-900/95 via-blue-900/90 to-black';
      case 'INPUT':
        return 'from-violet-900/95 via-purple-900/90 to-black';
      default:
        return 'from-slate-900/95 via-gray-900/90 to-black';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Main Container */}
      <motion.div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y, opacity }}
        onDoubleClick={handleDoubleTap}
      >
        {/* Premium Background - Static for performance */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 bg-gradient-to-b ${getBackgroundGradient()}`} />
          
          {/* Static gradient orbs - no animation for better performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-[400px] h-[400px] rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
                top: '-150px',
                right: '-150px',
              }}
            />
            <div
              className="absolute w-[300px] h-[300px] rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
                bottom: '-100px',
                left: '-100px',
              }}
            />
          </div>
        </div>

        {/* Top bar with iOS 26 liquid glass */}
        <div className="absolute top-0 left-0 right-0 z-50 safe-area-top">
          {/* Progress bars (TikTok style) */}
          <div className="flex gap-1 px-3 pt-3">
            {slides.map((_, idx) => (
              <div key={idx} className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className={`h-full rounded-full ${
                    slideCompleted[idx] 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-r from-white/80 to-white'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: idx < currentIndex ? '100%' : 
                           idx === currentIndex ? `${progress}%` : '0%' 
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            ))}
          </div>
          
          {/* Header with glass effect - COMPACT */}
          <div className="flex items-center justify-between px-4 py-2">
            {/* Left - Back button + Title */}
            <div className="flex items-center gap-2">
              {/* Back button */}
              <button 
                onClick={() => currentIndex > 0 ? handleSwipe('down') : onClose()}
                className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronDown size={18} className="text-white" />
              </button>
              
              {/* Title - compact */}
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs font-medium">
                  {currentIndex + 1}/{totalSlides}
                </span>
                {comboCount > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold">
                    🔥 x{comboCount}
                  </span>
                )}
              </div>
              </div>
            
            {/* Right - XP & Close */}
            <div className="flex items-center gap-2">
              <motion.div 
                className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-1.5"
                animate={showXpPopup ? { scale: [1, 1.2, 1] } : {}}
              >
                <Zap size={12} className="text-yellow-400" />
                <span className="text-white font-bold text-xs">+{xpEarned}</span>
              </motion.div>
              
            <button 
              onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
                <X size={18} className="text-white" />
            </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col justify-center items-center px-5 pt-28 pb-36"
          >
            <SlideContent 
              slide={currentSlide} 
              onComplete={markSlideComplete}
              onNext={() => handleSwipe('up')}
              task={task}
            />
          </motion.div>
        </AnimatePresence>


        {/* Bottom navigation hint */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center z-50">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-2">
              <ChevronUp size={18} className="text-white/80" />
              <span className="text-white/80 text-sm font-medium">
                {currentIndex === totalSlides - 1 ? 'Завершить урок' : 'Свайпни вверх'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Quick reaction animation */}
        <AnimatePresence>
          {showQuickReaction && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]"
            >
              <Heart size={100} className="text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* XP Popup */}
      <AnimatePresence>
          {showXpPopup && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[60]"
            >
              <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 shadow-2xl">
                <span className="text-white font-black text-2xl">+10 XP</span>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
      </motion.div>

    </div>
  );
};

// Helper function to get slide icon
const getSlideIcon = (type?: string) => {
  switch (type) {
    case 'THEORY': return '📚';
    case 'QUIZ': return '❓';
    case 'GAME': return '🎮';
    case 'VIDEO': return '🎬';
    case 'SORTING': return '📊';
    case 'INPUT': return '✍️';
    case 'POLL': return '📊';
    case 'MATCHING': return '🔗';
    case 'PUZZLE': return '🧩';
    default: return '🧠';
  }
};

// Slide content renderer
interface SlideContentProps {
  slide: LessonSlide;
  onComplete: (xp?: number) => void;
  onNext: () => void;
  task: Task;
}

const SlideContent: React.FC<SlideContentProps> = ({ slide, onComplete, onNext, task }) => {
  if (!slide) return null;

  switch (slide.type) {
    case 'THEORY':
      return <TheorySlide slide={slide} onNext={onNext} task={task} />;
    case 'QUIZ':
      return <QuizSlide slide={slide} onComplete={onComplete} onNext={onNext} />;
    case 'POLL':
      return <PollSlide slide={slide} onComplete={onComplete} onNext={onNext} />;
    case 'VIDEO':
      return <VideoSlide slide={slide} onNext={onNext} />;
    case 'SORTING':
      return <SortingSlide slide={slide} onComplete={onComplete} onNext={onNext} />;
    case 'INPUT':
      return <InputSlide slide={slide} onComplete={onComplete} onNext={onNext} />;
    case 'MATCHING':
      return <MatchingSlide slide={slide} onComplete={onComplete} onNext={onNext} />;
    case 'PUZZLE':
      return <PuzzleSlide slide={slide} onComplete={onComplete} onNext={onNext} />;
    case 'GAME':
      return <GameSlide slide={slide} onComplete={onComplete} onNext={onNext} />;
    default:
      return <TheorySlide slide={slide} onNext={onNext} task={task} />;
  }
};

// Premium Theory Slide with animations
const TheorySlide: React.FC<{ slide: LessonSlide; onNext: () => void; task: Task }> = ({ slide, onNext, task }) => {
  const [showFull, setShowFull] = useState(false);
  const [typedText, setTypedText] = useState('');
  const content = (slide as any).content || '';

  useEffect(() => {
    setTypedText('');
    setShowFull(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < content.length) {
        setTypedText(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setShowFull(true);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [content]);

  const renderAnimation = () => {
    const animation = (slide as any).animation;
    switch (animation) {
      case 'brain':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1], 
              rotate: [0, 3, -3, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-indigo-500/40 to-purple-600/40 flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain size={72} className="text-indigo-300" />
            </motion.div>
          </motion.div>
        );
      case 'dopamine':
        return (
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-amber-500/40 to-orange-600/40 flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
              <Zap size={72} className="text-amber-300" />
            </motion.div>
          </motion.div>
        );
      case 'focus':
        return (
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-green-500/40 to-emerald-600/40 flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <Target size={72} className="text-green-300" />
            </motion.div>
          </motion.div>
        );
      case 'battery':
        return (
          <motion.div
            className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-emerald-500/40 to-teal-600/40 flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
            transition={{ duration: 2, repeat: Infinity }}
          >
              <Battery size={72} className="text-emerald-300" />
            </motion.div>
          </motion.div>
        );
      case 'katya_waving':
        return (
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-6"
          >
            <KatyaMentor state="waving" size="lg" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md text-center">
      {renderAnimation()}
      
      {/* Title with premium glow effect */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black text-white mb-6"
        style={{
          textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(139,92,246,0.3)'
        }}
      >
        {slide.title}
      </motion.h1>

      {/* Content with typing effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg text-white/90 leading-relaxed whitespace-pre-line"
      >
        {typedText}
        {!showFull && (
          <motion.span 
            className="inline-block w-0.5 h-5 bg-white/80 ml-0.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Tips with glass cards */}
      {showFull && (slide as any).tips && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-3"
        >
          {(slide as any).tips.map((tip: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-lg"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <Sparkles size={18} className="text-yellow-400 shrink-0" />
              </motion.div>
              <span className="text-white/90 text-sm text-left font-medium">{tip}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Premium Quiz Slide
const QuizSlide: React.FC<{ slide: LessonSlide; onComplete: (xp?: number) => void; onNext: () => void }> = ({ 
  slide, onComplete, onNext 
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const correctIndex = (slide as any).correctIndex;
  const options = (slide as any).options || [];
  const explanation = (slide as any).explanation || '';

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    if (index === correctIndex) {
      onComplete(20);
    } else {
      onComplete(5);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Question badge */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-2 shadow-lg shadow-orange-500/30">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={18} className="text-white" />
          </motion.div>
          <span className="text-white font-black text-sm tracking-wide">ВОПРОС</span>
        </div>
      </motion.div>

      {/* Question */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white text-center mb-8"
        style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}
      >
        {(slide as any).question}
      </motion.h2>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option: string, index: number) => {
          let bgClass = 'bg-white/10 border-white/20';
          let textClass = 'text-white';
          
          if (showResult) {
            if (index === correctIndex) {
              bgClass = 'bg-green-500/30 border-green-400';
              textClass = 'text-green-300';
            } else if (index === selected && index !== correctIndex) {
              bgClass = 'bg-red-500/30 border-red-400';
              textClass = 'text-red-300';
            }
          } else if (index === selected) {
            bgClass = 'bg-indigo-500/30 border-indigo-400';
          }

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!showResult ? { scale: 1.02, x: 5 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full p-4 rounded-2xl border-2 backdrop-blur-xl transition-all shadow-lg ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                  showResult && index === correctIndex 
                    ? 'bg-green-500 text-white' 
                    : showResult && index === selected && index !== correctIndex
                      ? 'bg-red-500 text-white'
                        : 'bg-white/20 text-white/80'
                  }`}
                  animate={showResult && index === correctIndex ? { scale: [1, 1.2, 1] } : {}}
                >
                  {String.fromCharCode(65 + index)}
                </motion.div>
                <span className={`text-left font-semibold ${textClass}`}>{option}</span>
                {showResult && index === correctIndex && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <CheckCircle size={24} className="text-green-400" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mt-6 p-5 rounded-2xl backdrop-blur-xl border ${
              selected === correctIndex 
                ? 'bg-green-500/20 border-green-400/30' 
                : 'bg-red-500/20 border-red-400/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <motion.span 
                className="text-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                {selected === correctIndex ? '🎉' : '💡'}
              </motion.span>
              <div>
                <p className={`font-black text-lg ${selected === correctIndex ? 'text-green-300' : 'text-red-300'}`}>
                  {selected === correctIndex ? 'Верно! +20 XP' : 'Не совсем... +5 XP'}
                </p>
                <p className="text-white/80 text-sm mt-1 leading-relaxed">{explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Premium Poll Slide
const PollSlide: React.FC<{ slide: LessonSlide; onComplete: (xp?: number) => void; onNext: () => void }> = ({ 
  slide, onComplete, onNext 
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [votes, setVotes] = useState<number[]>([]);
  const options = (slide as any).options || [];

  useEffect(() => {
    setVotes(options.map(() => Math.floor(Math.random() * 80) + 20));
  }, [options.length]);

  const handleSelect = (index: number) => {
    if (showResults) return;
    setSelected(index);
    setShowResults(true);
    const newVotes = [...votes];
    newVotes[index] += 1;
    setVotes(newVotes);
    onComplete(10);
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-md">
      {/* Poll badge */}
      <motion.div
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: 0 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-2 shadow-lg shadow-purple-500/30">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Star size={18} className="text-white" />
          </motion.div>
          <span className="text-white font-black text-sm tracking-wide">ОПРОС</span>
        </div>
      </motion.div>

      {/* Question */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white text-center mb-8"
        style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}
      >
        {(slide as any).question}
      </motion.h2>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option: string, index: number) => {
          const percentage = showResults ? Math.round((votes[index] / totalVotes) * 100) : 0;
          const isSelected = selected === index;

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!showResults ? { scale: 1.02 } : {}}
              whileTap={!showResults ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(index)}
              disabled={showResults}
              className={`w-full p-4 rounded-2xl border-2 backdrop-blur-xl transition-all relative overflow-hidden shadow-lg ${
                isSelected 
                  ? 'bg-purple-500/30 border-purple-400' 
                  : 'bg-white/10 border-white/20'
              }`}
            >
              {/* Progress bar */}
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40' 
                      : 'bg-white/10'
                  }`}
                />
              )}
              
              <div className="flex items-center justify-between relative z-10">
                <span className="text-white font-semibold">{option}</span>
                {showResults && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white font-black text-lg"
                  >
                    {percentage}%
                  </motion.span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          <Users size={16} className="text-white/50" />
          <span className="text-white/50 text-sm font-medium">{totalVotes} голосов</span>
        </motion.div>
      )}
    </div>
  );
};

// Video Slide
const VideoSlide: React.FC<{ slide: LessonSlide; onNext: () => void }> = ({ slide, onNext }) => {
  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="aspect-video rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl backdrop-blur-xl"
      >
        <iframe
          width="100%"
          height="100%"
          src={(slide as any).videoUrl}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <h3 className="text-xl font-bold text-white mb-2">{slide.title}</h3>
        <p className="text-white/70">{(slide as any).description}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-2">
            <Clock size={14} className="text-white/60" />
            <span className="text-white/60 text-sm font-medium">{(slide as any).duration}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Sorting Slide
const SortingSlide: React.FC<{ slide: LessonSlide; onComplete: (xp?: number) => void; onNext: () => void }> = ({ 
  slide, onComplete, onNext 
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [leftItems, setLeftItems] = useState<any[]>([]);
  const [rightItems, setRightItems] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const slideData = slide as any;

  useEffect(() => {
    const shuffled = [...(slideData.items || [])].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setLeftItems([]);
    setRightItems([]);
    setShowResult(false);
    setScore(0);
  }, [slideData.items]);

  const moveItem = (item: any, target: 'left' | 'right') => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (target === 'left') {
      setLeftItems(prev => [...prev, item]);
    } else {
      setRightItems(prev => [...prev, item]);
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    leftItems.forEach(item => {
      if (item.category === 'LEFT') correct++;
    });
    rightItems.forEach(item => {
      if (item.category === 'RIGHT') correct++;
    });
    setScore(correct);
    setShowResult(true);
    onComplete(correct * 5);
  };

  const total = slideData.items?.length || 0;

  return (
    <div className="w-full max-w-md">
      {/* Badge */}
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center gap-2 shadow-lg">
          <span className="text-white font-black text-sm">📊 СОРТИРОВКА</span>
      </div>
      </motion.div>

      <h2 className="text-xl font-bold text-white text-center mb-4">{slideData.question}</h2>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div 
          className="p-3 rounded-2xl bg-red-500/20 border-2 border-red-400/50 min-h-[120px]"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-red-300 font-bold text-sm mb-2 text-center">{slideData.leftCategoryLabel}</p>
          <div className="space-y-2">
            {leftItems.map(item => (
              <div key={item.id} className="px-3 py-2 bg-red-500/30 rounded-xl text-white text-sm">
                {item.emoji} {item.text}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div 
          className="p-3 rounded-2xl bg-green-500/20 border-2 border-green-400/50 min-h-[120px]"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-green-300 font-bold text-sm mb-2 text-center">{slideData.rightCategoryLabel}</p>
          <div className="space-y-2">
            {rightItems.map(item => (
              <div key={item.id} className="px-3 py-2 bg-green-500/30 rounded-xl text-white text-sm">
                {item.emoji} {item.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Items to sort */}
      {!showResult && items.length > 0 && (
        <motion.div
          key={items[0]?.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 mb-4"
        >
          <p className="text-white text-center text-lg font-medium mb-3">
            {items[0]?.emoji} {items[0]?.text}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => moveItem(items[0], 'left')}
              className="flex-1 py-3 rounded-xl bg-red-500/30 border border-red-400/50 text-red-300 font-bold hover:bg-red-500/50 transition-colors"
            >
              ← {slideData.leftCategoryLabel?.split(' ')[0]}
            </button>
            <button
              onClick={() => moveItem(items[0], 'right')}
              className="flex-1 py-3 rounded-xl bg-green-500/30 border border-green-400/50 text-green-300 font-bold hover:bg-green-500/50 transition-colors"
            >
              {slideData.rightCategoryLabel?.split(' ')[0]} →
        </button>
      </div>
        </motion.div>
      )}

      {/* Check button */}
      {items.length === 0 && !showResult && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={checkAnswers}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg"
        >
          Проверить ответы
        </motion.button>
      )}

      {/* Result */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl ${score >= total * 0.7 ? 'bg-green-500/20 border-green-400/50' : 'bg-orange-500/20 border-orange-400/50'} border`}
        >
          <p className="text-center text-white font-bold text-lg">
            {score >= total * 0.7 ? '🎉 Отлично!' : '💪 Неплохо!'} {score}/{total}
          </p>
          <p className="text-center text-white/70 text-sm mt-1">+{score * 5} XP</p>
        </motion.div>
      )}
            </div>
  );
};

// Input Slide
const InputSlide: React.FC<{ slide: LessonSlide; onComplete: (xp?: number) => void; onNext: () => void }> = ({ 
  slide, onComplete, onNext 
}) => {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const slideData = slide as any;
  const minLength = slideData.minLength || 3;

  const handleSubmit = () => {
    if (value.length >= minLength) {
      setSubmitted(true);
      onComplete(15);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center gap-2 shadow-lg">
          <PenTool size={16} className="text-white" />
          <span className="text-white font-black text-sm">РЕФЛЕКСИЯ</span>
              </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white text-center mb-6"
      >
        {slideData.question}
      </motion.h2>

      {!submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={slideData.placeholder}
            className="w-full h-32 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white placeholder:text-white/40 outline-none focus:border-purple-400 transition-colors resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className={`text-sm ${value.length >= minLength ? 'text-green-400' : 'text-white/50'}`}>
              {value.length}/{minLength}+ символов
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={value.length < minLength}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                value.length >= minLength
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              Отправить
            </motion.button>
            </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-green-500/20 border border-green-400/50 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-4xl mb-3"
          >
            ✨
          </motion.div>
          <p className="text-green-300 font-bold text-lg">Отлично! +15 XP</p>
          <p className="text-white/70 text-sm mt-2">Твой ответ сохранён</p>
          <div className="mt-4 p-3 rounded-xl bg-white/10 text-white/80 text-sm text-left">
            "{value}"
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Matching Slide
const MatchingSlide: React.FC<{ slide: LessonSlide; onComplete: (xp?: number) => void; onNext: () => void }> = ({ 
  slide, onComplete, onNext 
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [showResult, setShowResult] = useState(false);
  const slideData = slide as any;
  const pairs = slideData.pairs || [];

  const handleLeftClick = (id: string) => {
    if (showResult || matches[id]) return;
    setSelectedLeft(id);
  };

  const handleRightClick = (right: string) => {
    if (!selectedLeft || showResult) return;
    const newMatches = { ...matches, [selectedLeft]: right };
    setMatches(newMatches);
    setSelectedLeft(null);
    
    if (Object.keys(newMatches).length === pairs.length) {
      setTimeout(() => {
        setShowResult(true);
        const correct = pairs.filter((p: any) => newMatches[p.id] === p.right).length;
        onComplete(correct * 5);
      }, 500);
    }
  };

  const usedRights = Object.values(matches);
  const correct = pairs.filter((p: any) => matches[p.id] === p.right).length;

  return (
    <div className="w-full max-w-md">
      {/* Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center gap-2 shadow-lg">
          <span className="text-white font-black text-sm">🔗 СОЕДИНИ</span>
        </div>
      </motion.div>

      <h2 className="text-lg font-bold text-white text-center mb-4">{slideData.question}</h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {pairs.map((pair: any) => (
            <motion.button
              key={pair.id}
              whileHover={!matches[pair.id] ? { scale: 1.02 } : {}}
              whileTap={!matches[pair.id] ? { scale: 0.98 } : {}}
              onClick={() => handleLeftClick(pair.id)}
              className={`w-full p-3 rounded-xl text-sm font-medium transition-all ${
                matches[pair.id] 
                  ? showResult && matches[pair.id] === pair.right
                    ? 'bg-green-500/30 border-green-400 text-green-300'
                    : showResult
                      ? 'bg-red-500/30 border-red-400 text-red-300'
                      : 'bg-purple-500/30 border-purple-400 text-purple-300'
                  : selectedLeft === pair.id
                    ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300'
                    : 'bg-white/10 border-white/20 text-white'
              } border-2`}
            >
              {pair.left}
            </motion.button>
        ))}
      </div>

        {/* Right column */}
        <div className="space-y-2">
          {pairs.map((pair: any) => (
            <motion.button
              key={pair.id + '_right'}
              whileHover={!usedRights.includes(pair.right) ? { scale: 1.02 } : {}}
              whileTap={!usedRights.includes(pair.right) ? { scale: 0.98 } : {}}
              onClick={() => handleRightClick(pair.right)}
              disabled={usedRights.includes(pair.right)}
              className={`w-full p-3 rounded-xl text-sm font-medium transition-all ${
                usedRights.includes(pair.right)
                  ? 'bg-purple-500/30 border-purple-400 text-purple-300'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              } border-2`}
            >
              {pair.right}
            </motion.button>
          ))}
      </div>
      </div>

      {/* Result */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-2xl ${
            correct === pairs.length ? 'bg-green-500/20 border-green-400/50' : 'bg-orange-500/20 border-orange-400/50'
          } border text-center`}
        >
          <p className="text-white font-bold">
            {correct === pairs.length ? '🎉 Идеально!' : '💪 Неплохо!'} {correct}/{pairs.length}
          </p>
          <p className="text-white/70 text-sm">+{correct * 5} XP</p>
    </motion.div>
      )}
    </div>
  );
};

// Puzzle Slide
const PuzzleSlide: React.FC<{ slide: LessonSlide; onComplete: (xp?: number) => void; onNext: () => void }> = ({ 
  slide, onComplete, onNext 
}) => {
  const slideData = slide as any;
  const correctSentence = slideData.correctSentence || [];
  const distractors = slideData.distractorWords || [];
  
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const allWords = [...correctSentence, ...distractors].sort(() => Math.random() - 0.5);
    setAvailableWords(allWords);
    setSelectedWords([]);
    setShowResult(false);
  }, []);

  const addWord = (word: string) => {
    if (showResult) return;
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter(w => w !== word));
  };

  const removeWord = (word: string, index: number) => {
    if (showResult) return;
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  const checkAnswer = () => {
    setShowResult(true);
    const isCorrect = selectedWords.join(' ') === correctSentence.join(' ');
    onComplete(isCorrect ? 25 : 10);
  };

  const isCorrect = selectedWords.join(' ') === correctSentence.join(' ');

  return (
    <div className="w-full max-w-md">
      {/* Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center gap-2 shadow-lg">
          <span className="text-white font-black text-sm">🧩 СОБЕРИ</span>
        </div>
      </motion.div>

      <h2 className="text-lg font-bold text-white text-center mb-4">{slideData.question}</h2>

      {/* Selected words area */}
      <div className="min-h-[80px] p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 mb-4 flex flex-wrap gap-2">
        {selectedWords.map((word, idx) => (
          <motion.button
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => removeWord(word, idx)}
            className={`px-4 py-2 rounded-xl font-medium ${
              showResult
                ? isCorrect
                  ? 'bg-green-500/30 border-green-400 text-green-300'
                  : 'bg-red-500/30 border-red-400 text-red-300'
                : 'bg-purple-500/30 border-purple-400 text-purple-300'
            } border`}
          >
            {word}
          </motion.button>
        ))}
        {selectedWords.length === 0 && (
          <span className="text-white/40 text-sm">Нажми на слова ниже...</span>
        )}
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {availableWords.map((word, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addWord(word)}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
          >
            {word}
          </motion.button>
        ))}
      </div>

      {/* Check button */}
      {!showResult && selectedWords.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={checkAnswer}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg"
        >
          Проверить
        </motion.button>
      )}

      {/* Result */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl ${isCorrect ? 'bg-green-500/20 border-green-400/50' : 'bg-orange-500/20 border-orange-400/50'} border text-center`}
        >
          <p className="text-white font-bold text-lg">
            {isCorrect ? '🎉 Верно!' : '💪 Почти!'}
          </p>
          <p className="text-white/70 text-sm">+{isCorrect ? 25 : 10} XP</p>
          {!isCorrect && (
            <p className="text-white/60 text-xs mt-2">
              Правильно: {correctSentence.join(' ')}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Game Slide (Mini-games)
const GameSlide: React.FC<{ slide: LessonSlide; onComplete: (xp?: number) => void; onNext: () => void }> = ({ 
  slide, onComplete, onNext 
}) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [targets, setTargets] = useState<{id: number; x: number; y: number; type: 'good' | 'bad'}[]>([]);
  
  const slideData = slide as any;
  const targetScore = slideData.targetScore || 5;
  const duration = slideData.durationSeconds || 30;

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            onComplete(score >= targetScore ? 30 : 15);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const spawnTarget = () => {
        const newTarget = {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
          type: Math.random() > 0.3 ? 'bad' as const : 'good' as const
        };
        setTargets(prev => [...prev, newTarget]);
        
        setTimeout(() => {
          setTargets(prev => prev.filter(t => t.id !== newTarget.id));
        }, 2000);
      };

      const interval = setInterval(spawnTarget, 800);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver]);

  const handleTargetClick = (target: {id: number; type: 'good' | 'bad'}) => {
    setTargets(prev => prev.filter(t => t.id !== target.id));
    if (target.type === 'bad') {
      setScore(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 1));
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(duration);
    setGameOver(false);
    setTargets([]);
  };

  if (!gameStarted) {
    return (
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-500/40 to-emerald-600/40 flex items-center justify-center backdrop-blur-xl border border-white/20"
        >
          <Gamepad2 size={48} className="text-green-300" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-4">{slideData.gameType?.replace('_', ' ')}</h2>
        <p className="text-white/70 mb-6">{slideData.instructions}</p>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
            <span className="text-white/60 text-sm">Цель:</span>
            <span className="text-white font-bold ml-2">{targetScore} очков</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
            <span className="text-white/60 text-sm">Время:</span>
            <span className="text-white font-bold ml-2">{duration}с</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg shadow-lg shadow-green-500/30"
        >
          🎮 Начать игру
        </motion.button>
      </div>
    );
  }

  if (gameOver) {
    const success = score >= targetScore;
    return (
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-6"
        >
          {success ? '🎉' : '💪'}
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {success ? 'Отлично!' : 'Неплохо!'}
        </h2>
        <p className="text-white/70 mb-4">Счёт: {score}/{targetScore}</p>
        <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 inline-block">
          <span className="text-white font-bold text-xl">+{success ? 30 : 15} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Game HUD */}
      <div className="flex justify-between items-center mb-4">
        <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
          <span className="text-yellow-400 font-bold">⭐ {score}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
            ⏱️ {timeLeft}s
          </span>
        </div>
      </div>

      {/* Game area */}
      <div className="relative h-[300px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <AnimatePresence>
          {targets.map(target => (
            <motion.button
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => handleTargetClick(target)}
              className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                target.type === 'bad' 
                  ? 'bg-red-500/80 border-2 border-red-400' 
                  : 'bg-green-500/80 border-2 border-green-400'
              }`}
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
            >
              {target.type === 'bad' ? '📱' : '📚'}
            </motion.button>
          ))}
        </AnimatePresence>

        <p className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm">
          Кликай по 📱 (отвлечения), избегай 📚 (полезное)
        </p>
      </div>
    </div>
  );
};

export default ModernLessonView;
