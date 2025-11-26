import React from 'react';
import { motion } from 'framer-motion';

// Профессиональный анимированный персонаж Кати
// Стиль: Duolingo / Headspace quality

interface KatyaMentorProps {
  state?: 'idle' | 'talking' | 'happy' | 'thinking' | 'waving' | 'encouraging' | 'celebrating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showMessage?: boolean;
  className?: string;
}

const SIZES = {
  sm: 100,
  md: 150,
  lg: 200,
  xl: 280,
};

export const KatyaMentor: React.FC<KatyaMentorProps> = ({
  state = 'idle',
  size = 'lg',
  message,
  showMessage = true,
  className = '',
}) => {
  const dimension = SIZES[size];
  
  // Цвета персонажа
  const colors = {
    hair: '#8B5A2B', // Тёплый каштановый
    hairHighlight: '#D4A574',
    skin: '#FFE4C4', // Персиковый
    skinShadow: '#F5D0B0',
    eyes: '#4A7C59', // Зелёные глаза
    eyeHighlight: '#7CB890',
    lips: '#E8A0A0',
    blush: '#FFB6C1',
    outfit: '#8B5CF6', // Фиолетовый (бренд)
    outfitDark: '#6D28D9',
  };

  // Анимации для разных состояний
  const getEyeAnimation = () => {
    if (state === 'happy' || state === 'celebrating') {
      return { scaleY: [1, 0.3, 1], transition: { duration: 0.3, repeat: 2 } };
    }
    if (state === 'thinking') {
      return { x: [0, 3, 0], transition: { duration: 2, repeat: Infinity } };
    }
    return { scaleY: [1, 0.1, 1], transition: { duration: 0.15, delay: 3, repeat: Infinity, repeatDelay: 3 } };
  };

  const getMouthPath = () => {
    switch (state) {
      case 'happy':
      case 'celebrating':
      case 'encouraging':
        return 'M 35 58 Q 50 70 65 58'; // Широкая улыбка
      case 'talking':
        return 'M 40 60 Q 50 65 60 60'; // Открытый рот
      case 'thinking':
        return 'M 42 60 L 58 60'; // Прямая линия
      case 'waving':
        return 'M 38 58 Q 50 65 62 58'; // Лёгкая улыбка
      default:
        return 'M 40 58 Q 50 63 60 58'; // Нейтральная улыбка
    }
  };

  const getBodyAnimation = () => {
    if (state === 'celebrating') {
      return { y: [0, -10, 0], transition: { duration: 0.5, repeat: 3 } };
    }
    if (state === 'waving') {
      return { rotate: [-2, 2, -2], transition: { duration: 0.5, repeat: Infinity } };
    }
    return { y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } };
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Контейнер персонажа - центрирован */}
      <motion.div
        className="relative"
        style={{ width: dimension, height: dimension }}
        animate={getBodyAnimation()}
      >
        {/* Свечение за персонажем */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: state === 'celebrating' || state === 'encouraging'
              ? 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 60%)',
            filter: 'blur(20px)',
            transform: 'scale(1.3)',
          }}
          animate={{
            scale: [1.3, 1.4, 1.3],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* SVG персонаж */}
        <svg
          viewBox="0 0 100 100"
          className="relative z-10 w-full h-full"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.2))' }}
        >
          {/* Градиенты */}
          <defs>
            <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.hairHighlight} />
              <stop offset="50%" stopColor={colors.hair} />
              <stop offset="100%" stopColor="#5D3A1A" />
            </linearGradient>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.skin} />
              <stop offset="100%" stopColor={colors.skinShadow} />
            </linearGradient>
            <linearGradient id="outfitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.outfit} />
              <stop offset="100%" stopColor={colors.outfitDark} />
            </linearGradient>
            <radialGradient id="eyeGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor={colors.eyeHighlight} />
              <stop offset="100%" stopColor={colors.eyes} />
            </radialGradient>
          </defs>

          {/* Волосы (задняя часть) */}
          <motion.ellipse
            cx="50"
            cy="38"
            rx="32"
            ry="28"
            fill="url(#hairGradient)"
            animate={{ rx: [32, 33, 32] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Тело / Одежда */}
          <motion.path
            d="M 30 75 Q 30 85 50 88 Q 70 85 70 75 L 65 60 Q 50 55 35 60 Z"
            fill="url(#outfitGradient)"
            animate={state === 'waving' ? { rotate: [-1, 1, -1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: '50px 70px' }}
          />

          {/* Шея */}
          <ellipse cx="50" cy="62" rx="8" ry="5" fill="url(#skinGradient)" />

          {/* Лицо */}
          <motion.ellipse
            cx="50"
            cy="42"
            rx="25"
            ry="27"
            fill="url(#skinGradient)"
          />

          {/* Волосы (передняя часть - чёлка) */}
          <path
            d="M 25 35 Q 30 20 50 18 Q 70 20 75 35 Q 70 28 50 25 Q 30 28 25 35"
            fill="url(#hairGradient)"
          />

          {/* Пряди волос по бокам */}
          <motion.path
            d="M 28 40 Q 22 50 25 60"
            stroke="url(#hairGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            animate={{ d: ['M 28 40 Q 22 50 25 60', 'M 28 40 Q 20 52 24 60', 'M 28 40 Q 22 50 25 60'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 72 40 Q 78 50 75 60"
            stroke="url(#hairGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            animate={{ d: ['M 72 40 Q 78 50 75 60', 'M 72 40 Q 80 52 76 60', 'M 72 40 Q 78 50 75 60'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Брови */}
          <motion.path
            d="M 36 32 Q 40 30 44 32"
            stroke="#5D3A1A"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            animate={state === 'thinking' ? { d: 'M 36 30 Q 40 28 44 32' } : {}}
          />
          <motion.path
            d="M 56 32 Q 60 30 64 32"
            stroke="#5D3A1A"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            animate={state === 'thinking' ? { d: 'M 56 32 Q 60 28 64 30' } : {}}
          />

          {/* Глаза */}
          <g>
            {/* Левый глаз */}
            <ellipse cx="40" cy="40" rx="6" ry="7" fill="white" />
            <motion.ellipse
              cx="40"
              cy="40"
              rx="4"
              ry="5"
              fill="url(#eyeGradient)"
              animate={getEyeAnimation()}
            />
            <circle cx="41.5" cy="38.5" r="1.5" fill="white" />

            {/* Правый глаз */}
            <ellipse cx="60" cy="40" rx="6" ry="7" fill="white" />
            <motion.ellipse
              cx="60"
              cy="40"
              rx="4"
              ry="5"
              fill="url(#eyeGradient)"
              animate={getEyeAnimation()}
            />
            <circle cx="61.5" cy="38.5" r="1.5" fill="white" />
          </g>

          {/* Нос */}
          <path d="M 50 44 Q 51 48 50 50" stroke={colors.skinShadow} strokeWidth="1.5" fill="none" />

          {/* Румянец */}
          <ellipse cx="32" cy="50" rx="5" ry="3" fill={colors.blush} opacity="0.5" />
          <ellipse cx="68" cy="50" rx="5" ry="3" fill={colors.blush} opacity="0.5" />

          {/* Рот */}
          <motion.path
            d={getMouthPath()}
            stroke={colors.lips}
            strokeWidth="2"
            fill={state === 'talking' ? colors.lips : 'none'}
            strokeLinecap="round"
            animate={state === 'talking' ? { 
              d: ['M 40 60 Q 50 65 60 60', 'M 42 58 Q 50 68 58 58', 'M 40 60 Q 50 65 60 60']
            } : {}}
            transition={{ duration: 0.3, repeat: state === 'talking' ? Infinity : 0 }}
          />

          {/* Машущая рука */}
          {state === 'waving' && (
            <motion.g
              animate={{ rotate: [-15, 15, -15] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              style={{ transformOrigin: '80px 55px' }}
            >
              <ellipse cx="82" cy="50" rx="6" ry="8" fill={colors.skin} />
              {/* Пальцы */}
              <rect x="79" y="38" width="2.5" height="8" rx="1" fill={colors.skin} />
              <rect x="82" y="36" width="2.5" height="10" rx="1" fill={colors.skin} />
              <rect x="85" y="38" width="2.5" height="8" rx="1" fill={colors.skin} />
            </motion.g>
          )}

          {/* Искры при celebrating/encouraging */}
          {(state === 'celebrating' || state === 'encouraging') && (
            <>
              <motion.circle
                cx="20" cy="25" r="3"
                fill="#FFD700"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.circle
                cx="80" cy="20" r="4"
                fill="#FFD700"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle
                cx="15" cy="50" r="2"
                fill="#FF69B4"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
              />
              <motion.circle
                cx="85" cy="45" r="2.5"
                fill="#FF69B4"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.9 }}
              />
              {/* Звёздочки */}
              <motion.path
                d="M 12 35 L 14 32 L 16 35 L 14 38 Z"
                fill="#FFD700"
                animate={{ opacity: [0, 1, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ transformOrigin: '14px 35px' }}
              />
              <motion.path
                d="M 88 30 L 90 27 L 92 30 L 90 33 Z"
                fill="#FFD700"
                animate={{ opacity: [0, 1, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                style={{ transformOrigin: '90px 30px' }}
              />
            </>
          )}

          {/* Пузырьки мыслей при thinking */}
          {state === 'thinking' && (
            <>
              <motion.circle
                cx="78" cy="30" r="4"
                fill="white"
                opacity="0.9"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle
                cx="85" cy="20" r="6"
                fill="white"
                opacity="0.7"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle
                cx="90" cy="8" r="8"
                fill="white"
                opacity="0.5"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}
        </svg>
      </motion.div>

      {/* Сообщение под персонажем */}
      {message && showMessage && (
        <motion.div
          className="mt-4 max-w-[250px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 shadow-xl">
            {/* Треугольник сверху */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/10 backdrop-blur-xl border-l border-t border-white/20 rotate-45" />
            <p className="text-white text-sm font-medium text-center relative z-10 leading-relaxed">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default KatyaMentor;

