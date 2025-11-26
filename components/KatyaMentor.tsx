import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Star, MessageCircle } from 'lucide-react';

// Простой и красивый аватар Кати
// Минималистичный стиль с анимациями

interface KatyaMentorProps {
  state?: 'idle' | 'talking' | 'happy' | 'thinking' | 'waving' | 'encouraging' | 'celebrating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showMessage?: boolean;
  className?: string;
}

const SIZES = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
};

export const KatyaMentor: React.FC<KatyaMentorProps> = ({
  state = 'idle',
  size = 'lg',
  message,
  showMessage = true,
  className = '',
}) => {
  const dimension = SIZES[size];
  
  // Эмодзи для разных состояний
  const getEmoji = () => {
    switch (state) {
      case 'happy':
      case 'celebrating':
        return '😊';
      case 'talking':
        return '💬';
      case 'thinking':
        return '🤔';
      case 'waving':
        return '👋';
      case 'encouraging':
        return '💪';
      default:
        return '😊';
    }
  };

  // Цвет свечения
  const getGlowColor = () => {
    switch (state) {
      case 'happy':
      case 'celebrating':
        return 'rgba(251, 191, 36, 0.4)';
      case 'encouraging':
        return 'rgba(34, 197, 94, 0.4)';
      default:
        return 'rgba(139, 92, 246, 0.4)';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Контейнер аватара */}
      <motion.div
        className="relative"
        animate={{ 
          y: state === 'celebrating' ? [0, -10, 0] : [0, -4, 0],
          scale: state === 'happy' ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          duration: state === 'celebrating' ? 0.5 : 2, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
      >
        {/* Свечение */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: dimension * 1.3,
            height: dimension * 1.3,
            left: -dimension * 0.15,
            top: -dimension * 0.15,
            background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
            filter: 'blur(15px)',
          }}
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.6, 0.8, 0.6] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Основной круг аватара */}
        <motion.div
          className="relative rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: dimension,
            height: dimension,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)',
            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Внутренний градиент */}
          <div 
            className="absolute inset-2 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
            }}
          />

          {/* Буква К или эмодзи */}
          <div className="relative z-10 flex flex-col items-center">
            <span 
              className="font-black text-white drop-shadow-lg"
              style={{ fontSize: dimension * 0.4 }}
            >
              К
            </span>
            <span 
              className="text-white/80 font-bold tracking-wider"
              style={{ fontSize: dimension * 0.1 }}
            >
              КАТЯ
            </span>
          </div>

          {/* Декоративные элементы */}
          <motion.div
            className="absolute top-2 right-2"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={dimension * 0.12} className="text-yellow-300" />
          </motion.div>
        </motion.div>

        {/* Индикатор состояния */}
        <motion.div
          className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center shadow-lg"
          style={{
            width: dimension * 0.35,
            height: dimension * 0.35,
            background: state === 'encouraging' 
              ? 'linear-gradient(135deg, #22C55E, #16A34A)' 
              : state === 'happy' || state === 'celebrating'
              ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
              : 'linear-gradient(135deg, #EC4899, #DB2777)',
          }}
          animate={state === 'waving' ? { rotate: [-10, 10, -10] } : {}}
          transition={{ duration: 0.3, repeat: state === 'waving' ? Infinity : 0 }}
        >
          <span style={{ fontSize: dimension * 0.18 }}>{getEmoji()}</span>
        </motion.div>

        {/* Искры при celebrating/encouraging */}
        {(state === 'celebrating' || state === 'encouraging') && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#FBBF24' : '#EC4899',
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  scale: 0 
                }}
                animate={{ 
                  x: [0, (Math.random() - 0.5) * dimension],
                  y: [0, (Math.random() - 0.5) * dimension],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: 'easeOut'
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Сообщение */}
      {message && showMessage && (
        <motion.div
          className="mt-4 max-w-[280px]"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div 
            className="relative px-5 py-3 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(109,40,217,0.15) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Треугольник */}
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(109,40,217,0.15) 100%)',
                borderLeft: '1px solid rgba(139,92,246,0.3)',
                borderTop: '1px solid rgba(139,92,246,0.3)',
              }}
            />
            <p className="text-white text-sm font-medium leading-relaxed relative z-10">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default KatyaMentor;
