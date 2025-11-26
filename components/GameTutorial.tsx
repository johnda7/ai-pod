import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Star, Zap, Heart, Shield, Gift, Flame, Trophy, 
  ChevronRight, X, Sparkles, Target, Brain, Moon, Coffee,
  Gamepad2, ShoppingBag, Award
} from 'lucide-react';

interface TutorialSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  tips?: string[];
}

const tutorialSlides: TutorialSlide[] = [
  {
    id: 'welcome',
    icon: <Brain className="w-16 h-16" />,
    title: 'Добро пожаловать!',
    description: 'AI Pod — это игра для прокачки твоего мозга.\n\nПроходи уроки, побеждай боссов и становись лучшей версией себя!',
    color: 'from-indigo-500 to-purple-600',
    tips: ['🎮 Это как RPG, только для реальной жизни']
  },
  {
    id: 'xp',
    icon: <Star className="w-16 h-16" />,
    title: 'Опыт (XP)',
    description: 'За каждый урок ты получаешь XP — очки опыта.\n\nЧем больше XP — тем выше твой уровень!',
    color: 'from-yellow-500 to-orange-500',
    tips: ['⭐ Боссы дают x5 XP', '📈 Уровни открывают новые возможности']
  },
  {
    id: 'coins',
    icon: <Coins className="w-16 h-16" />,
    title: 'Монеты',
    description: 'Монеты — валюта для магазина.\n\nТрать их на полезные предметы: сюрпризы, заморозки, зелья!',
    color: 'from-yellow-400 to-amber-500',
    tips: ['💰 Больше монет = больше возможностей', '🛒 Магазин в нижнем меню']
  },
  {
    id: 'hp',
    icon: <Heart className="w-16 h-16" />,
    title: 'Жизни (HP)',
    description: 'У тебя 5 жизней. Ошибка в уроке = -1 HP.\n\nЕсли HP = 0, урок нужно начать заново.',
    color: 'from-red-500 to-pink-500',
    tips: ['❤️ HP восстанавливается со временем', '🧪 Зелье HP восстанавливает сразу']
  },
  {
    id: 'streak',
    icon: <Flame className="w-16 h-16" />,
    title: 'Серия дней',
    description: 'Заходи каждый день и увеличивай серию!\n\nЧем длиннее серия — тем больше бонусов.',
    color: 'from-orange-500 to-red-500',
    tips: ['🔥 7 дней подряд = особая награда', '❄️ Заморозка спасает серию']
  },
  {
    id: 'shop',
    icon: <ShoppingBag className="w-16 h-16" />,
    title: 'Магазин',
    description: 'В магазине ты можешь купить:\n\n🎁 Сюрприз — случайная награда\n❄️ Заморозка — защита серии\n🧪 Зелье HP — восстановление жизней',
    color: 'from-emerald-500 to-teal-500',
    tips: ['💡 Копи монеты на нужные предметы']
  },
  {
    id: 'boss',
    icon: <Trophy className="w-16 h-16" />,
    title: 'Боссы',
    description: 'В конце каждой недели тебя ждёт БОСС!\n\nЭто сложный урок, который проверит все знания.',
    color: 'from-purple-500 to-pink-600',
    tips: ['👑 Победа над боссом = огромные награды', '💪 Готовься, проходя обычные уроки']
  },
  {
    id: 'ready',
    icon: <Gamepad2 className="w-16 h-16" />,
    title: 'Готов начать?',
    description: 'Твоё путешествие начинается!\n\nПервый урок ждёт тебя. Удачи, герой! 🚀',
    color: 'from-indigo-500 to-purple-600',
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md mx-4 bg-[#0A0F1C] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-6 pb-2">
            {tutorialSlides.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide 
                    ? 'bg-white w-6' 
                    : idx < currentSlide 
                      ? 'bg-white/50' 
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <motion.div
                className={`w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center text-white shadow-2xl`}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {slide.icon}
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-black text-white text-center mb-4">
                {slide.title}
              </h2>

              {/* Description */}
              <p className="text-slate-300 text-center leading-relaxed whitespace-pre-line mb-6">
                {slide.description}
              </p>

              {/* Tips */}
              {slide.tips && (
                <div className="space-y-2 mb-6">
                  {slide.tips.map((tip, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-slate-200">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Button */}
          <div className="p-6 pt-0">
            <motion.button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r ${slide.color} shadow-lg`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentSlide < tutorialSlides.length - 1 ? (
                <>
                  Далее
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Начать!
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
      icon: <Star className="w-5 h-5" />,
      title: 'Опыт',
      desc: 'Повышай уровень',
      color: 'from-yellow-500 to-orange-500'
    },
    coins: {
      icon: <Coins className="w-5 h-5" />,
      title: 'Монеты',
      desc: 'Трать в магазине',
      color: 'from-yellow-400 to-amber-500'
    },
    hp: {
      icon: <Heart className="w-5 h-5" />,
      title: 'Жизни',
      desc: 'Не теряй их!',
      color: 'from-red-500 to-pink-500'
    },
    streak: {
      icon: <Flame className="w-5 h-5" />,
      title: 'Серия',
      desc: 'Заходи каждый день',
      color: 'from-orange-500 to-red-500'
    }
  };

  const config = configs[type];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${config.color} bg-opacity-20`}>
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white`}>
        {config.icon}
      </div>
      <div>
        <div className="text-white font-bold text-sm">{config.title}</div>
        <div className="text-white/70 text-xs">{config.desc}</div>
      </div>
    </div>
  );
};

export default GameTutorial;

