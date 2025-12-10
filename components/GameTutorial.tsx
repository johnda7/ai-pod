import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Star, Zap, Heart, Shield, Gift, Flame, Trophy, 
  ChevronRight, X, Sparkles, Target, Brain, Moon, Coffee,
  Gamepad2, ShoppingBag, Award
} from 'lucide-react';

interface TutorialSlide {
  id: string;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  tips?: string[];
}

// 🎨 iOS 26 LIQUID GLASS - эмодзи вместо иконок, градиенты
const tutorialSlides: TutorialSlide[] = [
  {
    id: 'welcome',
    emoji: '🧠',
    title: 'Привет! Как ты?',
    description: 'Я — Катя, психолог для подростков. 💜\n\nГлавное, что я хочу тебе сказать:\n\n✨ С тобой всё нормально.\nУже нормально.\n\n🤝 Я не буду тебя осуждать\n💪 В тебе много внутренней силы',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    id: 'app',
    emoji: '🎮',
    title: 'Это твоя игра',
    description: 'AI Pod — приложение для прокачки себя.\n\nПроходи уроки, побеждай боссов и становись лучшей версией себя!',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    tips: ['🎮 Это как RPG, только для реальной жизни']
  },
  {
    id: 'xp',
    emoji: '⭐',
    title: 'Опыт',
    description: 'За каждый урок ты получаешь очки опыта.\n\nЧем больше опыта — тем выше твой уровень!',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    tips: ['⭐ Боссы дают x5 опыта', '📈 Уровни открывают новые возможности']
  },
  {
    id: 'coins',
    emoji: '💎',
    title: 'Монеты',
    description: 'Монеты — валюта для магазина.\n\nТрать их на полезные предметы: сюрпризы, заморозки, зелья!',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    tips: ['💰 Больше монет = больше возможностей', '🛒 Магазин в нижнем меню']
  },
  {
    id: 'hp',
    emoji: '❤️',
    title: 'Жизни',
    description: 'У тебя 5 жизней. Ошибка в уроке = -1 жизнь.\n\nЕсли жизни = 0, урок нужно начать заново.',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
    tips: ['❤️ Жизни восстанавливаются со временем', '🧪 Зелье восстанавливает жизни сразу']
  },
  {
    id: 'streak',
    emoji: '🔥',
    title: 'Серия дней',
    description: 'Заходи каждый день и увеличивай серию!\n\nЧем длиннее серия — тем больше бонусов.',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    tips: ['🔥 7 дней подряд = особая награда', '❄️ Заморозка спасает серию']
  },
  {
    id: 'shop',
    emoji: '🛍️',
    title: 'Магазин',
    description: 'В магазине ты можешь купить:\n\n🎁 Сюрприз — случайная награда\n❄️ Заморозка — защита серии\n🧪 Зелье — восстановление жизней',
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    tips: ['💡 Копи монеты на нужные предметы']
  },
  {
    id: 'boss',
    emoji: '👑',
    title: 'Боссы',
    description: 'В конце каждой недели тебя ждёт БОСС!\n\nЭто сложный урок, который проверит все знания.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    tips: ['👑 Победа над боссом = огромные награды', '💪 Готовься, проходя обычные уроки']
  },
  {
    id: 'ready',
    emoji: '🚀',
    title: 'Готов начать?',
    description: 'Твоё путешествие начинается!\n\nПервый урок ждёт тебя. Удачи, герой! 🚀',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    tips: ['🎯 Начни с урока "Мозг v2.0"']
  }
];

interface GameTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameTutorial: React.FC<GameTutorialProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const slide = tutorialSlides[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 🎨 iOS 26 LIQUID GLASS Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            }}
          />
          
          {/* Animated aurora blobs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{ 
              x: [0, 40, 0], 
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{ 
              x: [0, -30, 0], 
              y: [0, -40, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -25, 0],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1.2, 0.8],
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-14 right-4 z-50 w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <X size={20} className="text-white/80" />
        </button>

        {/* 🎨 iOS 26 LIQUID GLASS Card */}
        <motion.div
          className="relative w-full max-w-md mx-4 rounded-[32px] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-6 pb-4">
            {tutorialSlides.map((_, idx) => (
              <motion.div
                key={idx}
                className="h-2 rounded-full transition-all"
                style={{
                  width: idx === currentSlide ? 24 : 8,
                  background: idx === currentSlide 
                    ? 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                    : idx < currentSlide 
                      ? 'rgba(139,92,246,0.6)' 
                      : 'rgba(255,255,255,0.15)',
                }}
                animate={{ width: idx === currentSlide ? 24 : 8 }}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="px-6 pb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Emoji Icon with gradient background */}
              <motion.div
                className="w-28 h-28 mx-auto mb-6 rounded-[28px] flex items-center justify-center"
                style={{
                  background: slide.gradient,
                  boxShadow: '0 16px 48px rgba(139,92,246,0.4)',
                }}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <span className="text-6xl">{slide.emoji}</span>
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-black text-white text-center mb-4">
                {slide.title}
              </h2>

              {/* Description */}
              <p className="text-white/70 text-center leading-relaxed whitespace-pre-line mb-6">
                {slide.description}
              </p>

              {/* Tips - iOS 26 liquid glass style */}
              {slide.tips && (
                <div className="space-y-2 mb-6">
                  {slide.tips.map((tip, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-sm text-white/80">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Button - iOS 26 style */}
          <div className="px-6 pb-6">
            <motion.button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2"
              style={{
                background: slide.gradient,
                boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentSlide < tutorialSlides.length - 1 ? (
                <>
                  ДАЛЕЕ
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  НАЧАТЬ!
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Mini info cards for the dashboard
export const RewardInfoCard: React.FC<{ type: 'xp' | 'coins' | 'hp' | 'streak' }> = ({ type }) => {
  const configs = {
    xp: {
      emoji: '⭐',
      title: 'Опыт',
      desc: 'Повышай уровень',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    },
    coins: {
      emoji: '💎',
      title: 'Монеты',
      desc: 'Трать в магазине',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    },
    hp: {
      emoji: '❤️',
      title: 'Жизни',
      desc: 'Не теряй их!',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)'
    },
    streak: {
      emoji: '🔥',
      title: 'Серия',
      desc: 'Заходи каждый день',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)'
    }
  };

  const config = configs[type];

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: config.gradient }}
      >
        {config.emoji}
      </div>
      <div>
        <div className="text-white font-bold text-sm">{config.title}</div>
        <div className="text-white/60 text-xs">{config.desc}</div>
      </div>
    </div>
  );
};

export default GameTutorial;
