import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/telegramService';

// 🇷🇺 НОВАЯ ВЕРСИЯ БЕЗ YOUTUBE - работает в России без VPN
// Анимированные карточки с Катей вместо видео

// Изображение Кати - используем dicebear avatar
const KATYA_IMAGE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katya&hair=long&clothing=hoodie';

// Тексты для приветствия (анимированные слайды)
// Порядок: сначала представление, потом главное послание, потом мотивация
const WELCOME_SLIDES = [
  { emoji: '👋', title: 'Привет!', text: 'Я Катя — психолог и автор книги "Шаг к себе"' },
  { emoji: '✨', title: 'Моё главное послание:', text: 'С тобой всё нормально. Уже нормально. 💜' },
  { emoji: '🚀', title: 'Это твоё путешествие', text: 'К лучшей версии себя. Я буду рядом!' },
];

// Тексты для мотивации после урока
const MOTIVATION_MESSAGES = [
  { emoji: '🎉', title: 'Отлично!', text: 'Ты молодец! Каждый шаг важен.' },
  { emoji: '💪', title: 'Так держать!', text: 'Ты становишься лучше каждый день!' },
  { emoji: '⭐', title: 'Супер!', text: 'Продолжай в том же духе!' },
  { emoji: '🌟', title: 'Вау!', text: 'Это был крутой урок!' },
];

// Анимированный модал с Катей (без YouTube!)
interface KatyaVideoModalProps {
  videoId?: string; // Оставляем для совместимости, но не используем
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  type?: 'welcome' | 'motivation';
}

export const KatyaVideoModal: React.FC<KatyaVideoModalProps> = ({ 
  isOpen, 
  onClose,
  type = 'welcome'
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = type === 'welcome' ? WELCOME_SLIDES : [MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)]];
  const autoCloseTime = type === 'welcome' ? 8000 : 4000;

  useEffect(() => {
    if (isOpen) {
      hapticMedium();
      setCurrentSlide(0);
      
      // Автопереключение слайдов для welcome
      if (type === 'welcome' && slides.length > 1) {
        const slideInterval = setInterval(() => {
          setCurrentSlide(prev => {
            if (prev >= slides.length - 1) {
              clearInterval(slideInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 2500);
        
        return () => clearInterval(slideInterval);
      }
      
      // Автозакрытие
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(autoCloseTimer);
    }
  }, [isOpen, type, onClose]);

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  const handleNext = () => {
    hapticLight();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0f0f2a 100%)' }}
          onClick={handleClose}
        >
          {/* Фоновые эффекты */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2"
            style={{
              background: type === 'welcome' 
                ? 'radial-gradient(ellipse at 30% 0%, rgba(139,92,246,0.3) 0%, transparent 60%)'
                : 'radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.3) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-2 -right-2 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>

            {/* Katya Avatar */}
            <motion.div 
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div 
                className="relative w-32 h-32 rounded-full overflow-hidden"
                style={{
                  boxShadow: type === 'welcome'
                    ? '0 0 60px rgba(139,92,246,0.5), 0 20px 40px rgba(0,0,0,0.3)'
                    : '0 0 60px rgba(236,72,153,0.5), 0 20px 40px rgba(0,0,0,0.3)',
                  border: '3px solid rgba(255,255,255,0.2)',
                }}
              >
                <img 
                  src={KATYA_IMAGE} 
                  alt="Катя" 
                  className="w-full h-full object-cover"
                />
                {/* Pulse animation */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    border: type === 'welcome' 
                      ? '2px solid rgba(139,92,246,0.5)' 
                      : '2px solid rgba(236,72,153,0.5)'
                  }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Content Card */}
            <motion.div
              className="rounded-3xl p-6 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {/* Slide content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-4xl">{slides[currentSlide].emoji}</span>
                    {type === 'welcome' ? (
                      <Sparkles className="text-purple-400" size={24} />
                    ) : (
                      <Heart className="text-pink-400" size={24} fill="currentColor" />
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-black text-white mb-2">
                    {slides[currentSlide].title}
                  </h2>
                  
                  <p className="text-white/70 text-base leading-relaxed">
                    {slides[currentSlide].text}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots for welcome */}
              {type === 'welcome' && slides.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {slides.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Action button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleNext}
              className="mt-4 w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                background: type === 'welcome'
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                boxShadow: type === 'welcome'
                  ? '0 8px 32px rgba(139,92,246,0.4)'
                  : '0 8px 32px rgba(236,72,153,0.4)',
              }}
            >
              {currentSlide < slides.length - 1 ? (
                <>Далее <ArrowRight size={18} /></>
              ) : (
                'Поехали! 🚀'
              )}
            </motion.button>

            {/* Skip button */}
            {type === 'welcome' && currentSlide < slides.length - 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={handleClose}
                className="mt-3 w-full py-2 text-white/40 text-sm font-medium hover:text-white/60 transition-colors"
              >
                Пропустить
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Приветствие Кати - показывается один раз при первом входе
interface KatyaWelcomeProps {
  onComplete: () => void;
}

export const KatyaWelcome: React.FC<KatyaWelcomeProps> = ({ onComplete }) => {
  const [showModal, setShowModal] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    return localStorage.getItem('katya_welcome_seen') === 'true';
  });

  useEffect(() => {
    // Показываем приветствие только один раз
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome]);

  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem('katya_welcome_seen', 'true');
    setHasSeenWelcome(true);
    hapticSuccess();
    onComplete();
  };

  if (hasSeenWelcome) return null;

  return (
    <KatyaVideoModal
      isOpen={showModal}
      onClose={handleClose}
      type="welcome"
    />
  );
};

// Мотивация от Кати - показывается после завершения урока
interface KatyaMotivationProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
}

export const KatyaMotivation: React.FC<KatyaMotivationProps> = ({ 
  isOpen, 
  onClose,
  lessonTitle 
}) => {
  const handleClose = () => {
    hapticSuccess();
    onClose();
  };

  return (
    <KatyaVideoModal
      isOpen={isOpen}
      onClose={handleClose}
      type="motivation"
    />
  );
};

// Хук для управления показом мотивации
export const useKatyaMotivation = () => {
  const [showMotivation, setShowMotivation] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');

  const triggerMotivation = (title?: string) => {
    // Показываем мотивацию после каждого урока (можно уменьшить до 0.3 позже)
    setLessonTitle(title || '');
    setShowMotivation(true);
  };

  const closeMotivation = () => {
    setShowMotivation(false);
    setLessonTitle('');
  };

  return {
    showMotivation,
    lessonTitle,
    triggerMotivation,
    closeMotivation,
  };
};

export default KatyaVideoModal;
