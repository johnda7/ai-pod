import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RefreshCw, Share2, Bookmark, Sparkles } from 'lucide-react';

// Цитаты из книги Кати "Шаг к себе"
const KATYA_QUOTES = [
  {
    text: "С тобой всё нормально. Уже нормально. Ты справишься.",
    category: "поддержка",
    emoji: "💜"
  },
  {
    text: "В тебе очень много внутренней силы. Давай её раскроем!",
    category: "мотивация",
    emoji: "💪"
  },
  {
    text: "Просто прочитать — это ничто. Важно всю информацию сразу внедрять в жизнь!",
    category: "действие",
    emoji: "🚀"
  },
  {
    text: "«Потом» чаще всего равно «никогда». Действуй сейчас!",
    category: "действие",
    emoji: "⚡"
  },
  {
    text: "Ты уже молодец, что начал этот путь. Это важный шаг.",
    category: "поддержка",
    emoji: "🌟"
  },
  {
    text: "Цель должна быть ТВОЕЙ — не родителей, не друзей, только твоей.",
    category: "цели",
    emoji: "🎯"
  },
  {
    text: "Маленькие шаги каждый день важнее редких марафонов.",
    category: "привычки",
    emoji: "👣"
  },
  {
    text: "Ошибки — это не провал, это обратная связь. Учись на них!",
    category: "рост",
    emoji: "📈"
  },
  {
    text: "Твоя энергия — как вода в ведре. Найди дыры и заткни их.",
    category: "энергия",
    emoji: "🔋"
  },
  {
    text: "Спроси себя «Почему?» 5 раз — и найдёшь истинную причину.",
    category: "осознанность",
    emoji: "🤔"
  },
  {
    text: "Дисциплина важнее мотивации. Мотивация приходит и уходит.",
    category: "дисциплина",
    emoji: "🏋️"
  },
  {
    text: "Не жди идеального момента. Начни с того, что есть.",
    category: "действие",
    emoji: "🔥"
  },
  {
    text: "Сравнивай себя только с собой вчерашним.",
    category: "рост",
    emoji: "🪞"
  },
  {
    text: "Отдых — это не лень. Это перезарядка для новых свершений.",
    category: "баланс",
    emoji: "😴"
  },
  {
    text: "Каждый день записывай 3 вещи, за которые ты молодец!",
    category: "практика",
    emoji: "✨"
  },
  {
    text: "Твой мозг можно прокачать, как персонажа в игре.",
    category: "мотивация",
    emoji: "🧠"
  },
  {
    text: "Страх — это нормально. Храбрость — действовать несмотря на страх.",
    category: "храбрость",
    emoji: "🦁"
  },
  {
    text: "Ты не обязан быть идеальным. Ты обязан быть настоящим.",
    category: "принятие",
    emoji: "💫"
  },
];

interface KatyaQuoteCardProps {
  showRefresh?: boolean;
  compact?: boolean;
}

export const KatyaQuoteCard: React.FC<KatyaQuoteCardProps> = ({ 
  showRefresh = true,
  compact = false 
}) => {
  const [currentQuote, setCurrentQuote] = useState(KATYA_QUOTES[0]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Random quote on mount
    const randomIndex = Math.floor(Math.random() * KATYA_QUOTES.length);
    setCurrentQuote(KATYA_QUOTES[randomIndex]);
  }, []);

  const getNewQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * KATYA_QUOTES.length);
      } while (KATYA_QUOTES[newIndex].text === currentQuote.text);
      
      setCurrentQuote(KATYA_QUOTES[newIndex]);
      setIsLiked(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Save to localStorage
    const likes = JSON.parse(localStorage.getItem('katya_liked_quotes') || '[]');
    if (!isLiked) {
      likes.push(currentQuote.text);
    } else {
      const index = likes.indexOf(currentQuote.text);
      if (index > -1) likes.splice(index, 1);
    }
    localStorage.setItem('katya_liked_quotes', JSON.stringify(likes));
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(219,39,119,0.08) 100%)',
          border: '1px solid rgba(236,72,153,0.2)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{currentQuote.emoji}</span>
          <div className="flex-1">
            <p className="text-white/80 text-sm leading-relaxed italic">
              "{currentQuote.text}"
            </p>
            <p className="text-pink-400/60 text-xs mt-2">— Катя Карпенко</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(139,92,246,0.15) 100%)',
        border: '1px solid rgba(236,72,153,0.25)',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
      
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">Катя говорит</span>
              <span className="text-white/40 text-xs block">#{currentQuote.category}</span>
            </div>
          </div>
          
          {showRefresh && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={getNewQuote}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <RefreshCw size={16} className="text-white/60" />
            </motion.button>
          )}
        </div>

        {/* Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.text}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{currentQuote.emoji}</span>
              <p className="text-white text-base leading-relaxed font-medium">
                "{currentQuote.text}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                isLiked 
                  ? 'bg-pink-500/20 text-pink-400' 
                  : 'bg-white/5 text-white/50 hover:text-white/80'
              }`}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-xs font-medium">{isLiked ? 'Нравится' : 'Лайк'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                isSaved 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : 'bg-white/5 text-white/50 hover:text-white/80'
              }`}
            >
              <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
              <span className="text-xs font-medium">{isSaved ? 'Сохранено' : 'Сохранить'}</span>
            </motion.button>
          </div>
          
          <span className="text-white/30 text-xs">— Катя Карпенко</span>
        </div>
      </div>
    </motion.div>
  );
};

// Daily Quote Widget for Dashboard
export const DailyQuoteWidget: React.FC = () => {
  const [quote, setQuote] = useState(KATYA_QUOTES[0]);

  useEffect(() => {
    // Get quote of the day based on date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const quoteIndex = dayOfYear % KATYA_QUOTES.length;
    setQuote(KATYA_QUOTES[quoteIndex]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{quote.emoji}</div>
        <div className="flex-1">
          <p className="text-white/80 text-sm leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-purple-400/60 text-xs mt-2 flex items-center gap-1">
            <Sparkles size={10} />
            Цитата дня от Кати
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default KatyaQuoteCard;

