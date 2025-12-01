import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Sparkles, Heart } from 'lucide-react';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/telegramService';

// Видео Кати на YouTube
export const KATYA_VIDEOS = {
  welcome: {
    id: 'EfLG_uMGqTo',
    title: 'Привет! Я Катя 👋',
    description: 'Твой личный коуч по развитию',
    duration: 17,
  },
  motivation: {
    id: 'uw3BJghYc4o', 
    title: 'Ты молодец! 🎉',
    description: 'Так держать!',
    duration: 9,
  },
};

// Скрытый YouTube плеер без брендинга
interface KatyaVideoModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  type?: 'welcome' | 'motivation';
}

export const KatyaVideoModal: React.FC<KatyaVideoModalProps> = ({ 
  videoId, 
  isOpen, 
  onClose,
  title,
  subtitle,
  type = 'welcome'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Получаем длительность видео
  const videoDuration = type === 'welcome' ? KATYA_VIDEOS.welcome.duration : KATYA_VIDEOS.motivation.duration;

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      hapticMedium();
      
      // Автозакрытие сразу после окончания видео (без буфера)
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, videoDuration * 1000);
      
      return () => clearTimeout(autoCloseTimer);
    } else {
      setIsPlaying(false);
    }
  }, [isOpen, videoDuration, onClose]);

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xs"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-4"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  {type === 'welcome' ? (
                    <Sparkles className="text-purple-400" size={20} />
                  ) : (
                    <Heart className="text-pink-400" size={20} fill="currentColor" />
                  )}
                  <h2 className="text-white font-bold text-xl">{title}</h2>
                </div>
                {subtitle && (
                  <p className="text-white/60 text-sm">{subtitle}</p>
                )}
              </motion.div>
            )}

            {/* Video Container - компактный размер */}
            <div 
              className="relative rounded-3xl overflow-hidden"
            style={{
                aspectRatio: '9/16',
                maxHeight: '60vh',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.3)',
            }}
          >
            {/* Close button */}
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all"
              >
                <X size={18} />
            </button>

              {/* YouTube Embed - без повтора, автозакрытие */}
              {isPlaying && (
                <div className="relative w-full h-full overflow-hidden">
            <iframe
                    id="katya-video-player"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&playsinline=1&loop=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0&enablejsapi=1`}
                    className="absolute inset-0 w-[115%] h-[115%] top-0 -left-[7.5%]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Катя"
                    style={{ border: 'none', pointerEvents: 'none' }}
                  />
                </div>
              )}

              {/* Overlays to hide YouTube branding - уменьшены чтобы не закрывать голову */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
            </div>

            {/* Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleClose}
              className="mt-4 w-full py-3 rounded-2xl text-white/60 text-sm font-medium hover:text-white/80 transition-colors"
            >
              Пропустить
            </motion.button>
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
  const [showVideo, setShowVideo] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    return localStorage.getItem('katya_welcome_seen') === 'true';
  });

  useEffect(() => {
    // Показываем приветствие только один раз
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome]);

  const handleClose = () => {
    setShowVideo(false);
    localStorage.setItem('katya_welcome_seen', 'true');
    setHasSeenWelcome(true);
    hapticSuccess();
    onComplete();
  };

  if (hasSeenWelcome) return null;

  return (
    <KatyaVideoModal
      videoId={KATYA_VIDEOS.welcome.id}
      isOpen={showVideo}
      onClose={handleClose}
      title="Привет! Я Катя 👋"
      subtitle="Твой личный коуч"
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
      videoId={KATYA_VIDEOS.motivation.id}
      isOpen={isOpen}
      onClose={handleClose}
      title="Отличная работа! 🎉"
      subtitle={lessonTitle ? `Урок "${lessonTitle}" пройден!` : 'Так держать!'}
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
