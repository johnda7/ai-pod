import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Battery, Moon, Sparkles, Heart, Star, Trophy, ChevronRight, MessageCircle } from 'lucide-react';

// Улучшенный слайд теории с анимациями
interface TheorySlideProps {
  title: string;
  content: string;
  tips?: string[];
  animation?: string;
  onNext: () => void;
}

export const EnhancedTheorySlide: React.FC<TheorySlideProps> = ({ 
  title, 
  content, 
  tips, 
  animation,
  onNext 
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [typedContent, setTypedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setShowContent(false);
    setShowTips(false);
    setTypedContent('');
    setIsTyping(true);
    
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, [title]);

  // Typing effect
  useEffect(() => {
    if (!showContent) return;
    
    let index = 0;
    const text = content;
    
    const typeTimer = setInterval(() => {
      if (index < text.length) {
        setTypedContent(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeTimer);
        if (tips && tips.length > 0) {
          setTimeout(() => setShowTips(true), 300);
        }
      }
    }, 15);

    return () => clearInterval(typeTimer);
  }, [showContent, content, tips]);

  const getAnimationIcon = () => {
    switch (animation) {
      case 'brain': return <AnimatedBrainIcon />;
      case 'dopamine': return <AnimatedDopamineIcon />;
      case 'focus': return <AnimatedFocusIcon />;
      case 'battery': return <AnimatedBatteryIcon />;
      case 'sleep': return <AnimatedSleepIcon />;
      case 'katya_waving': return <AnimatedKatyaIcon />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center text-center px-4 py-6">
      {/* Animation */}
      {animation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mb-6"
        >
          {getAnimationIcon()}
        </motion.div>
      )}

      {/* Title with gradient */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-black mb-4 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
      >
        {title}
      </motion.h2>

      {/* Content with typing effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        className="text-white/80 text-base leading-relaxed mb-6 max-w-sm whitespace-pre-line"
      >
        {typedContent}
        {isTyping && (
          <span className="inline-block w-0.5 h-5 bg-indigo-400 ml-0.5 animate-pulse" />
        )}
      </motion.div>

      {/* Tips */}
      <AnimatePresence>
        {showTips && tips && tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-2 mb-6"
          >
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-3 text-left p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                <Sparkles size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">{tip}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: !isTyping ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onNext}
        disabled={isTyping}
        className="mt-auto px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}
      >
        Далее
        <ChevronRight size={20} />
      </motion.button>
    </div>
  );
};

// Улучшенный Quiz слайд
interface QuizSlideProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onCorrect: () => void;
  onWrong: () => void;
}

export const EnhancedQuizSlide: React.FC<QuizSlideProps> = ({
  question,
  options,
  correctIndex,
  explanation,
  onCorrect,
  onWrong,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedIndex(index);
    setShowResult(true);
    setIsCorrect(index === correctIndex);
    
    setTimeout(() => {
      if (index === correctIndex) {
        onCorrect();
      } else {
        onWrong();
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col px-4 py-6">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(234,88,12,0.2) 100%)',
            }}
          >
            <MessageCircle size={20} className="text-amber-400" />
          </div>
          <span className="text-white/50 text-sm font-medium">Вопрос</span>
        </div>
        
        <h2 className="text-xl font-bold text-white leading-tight">
          {question}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === correctIndex;
          
          let bgStyle = 'rgba(255,255,255,0.05)';
          let borderStyle = 'rgba(255,255,255,0.1)';
          
          if (showResult) {
            if (isCorrectOption) {
              bgStyle = 'rgba(34,197,94,0.2)';
              borderStyle = 'rgba(34,197,94,0.5)';
            } else if (isSelected && !isCorrectOption) {
              bgStyle = 'rgba(239,68,68,0.2)';
              borderStyle = 'rgba(239,68,68,0.5)';
            }
          } else if (isSelected) {
            bgStyle = 'rgba(99,102,241,0.2)';
            borderStyle = 'rgba(99,102,241,0.5)';
          }

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className="w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98] disabled:cursor-default"
              style={{
                background: bgStyle,
                border: `2px solid ${borderStyle}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: showResult && isCorrectOption 
                      ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                      : showResult && isSelected && !isCorrectOption
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'rgba(255,255,255,0.1)',
                    color: showResult && (isCorrectOption || (isSelected && !isCorrectOption)) 
                      ? 'white' 
                      : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className={`text-sm ${showResult && isCorrectOption ? 'text-green-400 font-medium' : 'text-white/80'}`}>
                  {option}
                </span>
                
                {showResult && isCorrectOption && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <Trophy size={20} className="text-green-400" />
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
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl"
            style={{
              background: isCorrect 
                ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
              border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{isCorrect ? '🎉' : '💡'}</div>
              <div>
                <p className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'Отлично!' : 'Не совсем...'}
                </p>
                <p className="text-white/70 text-sm">{explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Улучшенный Poll слайд
interface PollSlideProps {
  question: string;
  options: string[];
  onSelect: (index: number) => void;
}

export const EnhancedPollSlide: React.FC<PollSlideProps> = ({
  question,
  options,
  onSelect,
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [votes, setVotes] = useState<number[]>([]);

  useEffect(() => {
    // Simulate random votes
    setVotes(options.map(() => Math.floor(Math.random() * 30) + 10));
  }, [options]);

  const handleSelect = (index: number) => {
    setSelected(index);
    setShowResults(true);
    
    // Update votes
    const newVotes = [...votes];
    newVotes[index] += 1;
    setVotes(newVotes);
    
    setTimeout(() => onSelect(index), 1500);
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col px-4 py-6">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.2) 100%)',
            }}
          >
            <Star size={20} className="text-purple-400" />
          </div>
          <span className="text-white/50 text-sm font-medium">Опрос</span>
        </div>
        
        <h2 className="text-xl font-bold text-white leading-tight">
          {question}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selected === index;
          const percentage = showResults ? Math.round((votes[index] / totalVotes) * 100) : 0;

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !showResults && handleSelect(index)}
              disabled={showResults}
              className="w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98] disabled:cursor-default relative overflow-hidden"
              style={{
                background: isSelected 
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.1) 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isSelected ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {/* Progress bar */}
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(90deg, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.1) 100%)'
                      : 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                  }}
                />
              )}
              
              <div className="flex items-center justify-between relative z-10">
                <span className="text-white/80 text-sm">{option}</span>
                {showResults && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/50 text-sm font-bold"
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/40 text-xs mt-4"
        >
          {totalVotes} голосов
        </motion.p>
      )}
    </div>
  );
};

// Animated Icons
const AnimatedBrainIcon = () => (
  <motion.div
    animate={{ 
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
    }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
    style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
      boxShadow: '0 20px 60px rgba(99,102,241,0.3)',
    }}
  >
    <Brain size={48} className="text-indigo-400" />
    {/* Particles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-indigo-400"
        animate={{
          x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
          y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.3,
        }}
      />
    ))}
  </motion.div>
);

const AnimatedDopamineIcon = () => (
  <motion.div
    className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
    style={{
      background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(234,88,12,0.2) 100%)',
      boxShadow: '0 20px 60px rgba(245,158,11,0.3)',
    }}
  >
    <motion.div
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Zap size={48} className="text-amber-400" />
    </motion.div>
    {/* Sparkles */}
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          top: `${20 + Math.random() * 60}%`,
          left: `${20 + Math.random() * 60}%`,
        }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.25,
        }}
      >
        <Sparkles size={16} className="text-yellow-300" />
      </motion.div>
    ))}
  </motion.div>
);

const AnimatedFocusIcon = () => (
  <motion.div
    className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
    style={{
      background: 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.2) 100%)',
      boxShadow: '0 20px 60px rgba(34,197,94,0.3)',
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Target size={48} className="text-green-400" />
    </motion.div>
    {/* Rings */}
    {[1, 2, 3].map((ring) => (
      <motion.div
        key={ring}
        className="absolute rounded-full border-2 border-green-400/30"
        style={{
          width: `${60 + ring * 20}%`,
          height: `${60 + ring * 20}%`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: ring * 0.3,
        }}
      />
    ))}
  </motion.div>
);

const AnimatedBatteryIcon = () => (
  <motion.div
    className="w-24 h-24 rounded-3xl flex items-center justify-center relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.2) 100%)',
      boxShadow: '0 20px 60px rgba(59,130,246,0.3)',
    }}
  >
    <Battery size={48} className="text-blue-400" />
    {/* Charging animation */}
    <motion.div
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400/50 to-transparent"
      animate={{
        height: ['30%', '80%', '30%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.div>
);

const AnimatedSleepIcon = () => (
  <motion.div
    className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
    style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(109,40,217,0.2) 100%)',
      boxShadow: '0 20px 60px rgba(139,92,246,0.3)',
    }}
  >
    <Moon size={48} className="text-purple-400" />
    {/* Stars */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-yellow-300"
        style={{
          top: `${10 + Math.random() * 30}%`,
          left: `${10 + Math.random() * 80}%`,
        }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.4,
        }}
      >
        ✨
      </motion.div>
    ))}
  </motion.div>
);

const AnimatedKatyaIcon = () => (
  <motion.div
    className="w-28 h-28 rounded-full flex items-center justify-center relative"
    style={{
      background: 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(219,39,119,0.2) 100%)',
      boxShadow: '0 20px 60px rgba(236,72,153,0.3)',
    }}
  >
    <motion.div
      animate={{ 
        rotate: [-5, 5, -5],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="text-5xl"
    >
      👋
    </motion.div>
    {/* Hearts */}
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        animate={{
          y: [-20, -50],
          x: [0, (i - 1) * 20],
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.5,
        }}
      >
        <Heart size={16} className="text-pink-400 fill-pink-400" />
      </motion.div>
    ))}
  </motion.div>
);

export default EnhancedTheorySlide;



