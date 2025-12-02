import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type KatyaState = 'idle' | 'talking' | 'happy' | 'thinking' | 'celebrating' | 'waving' | 'encouraging';

interface KatyaCharacterProps {
  state?: KatyaState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showBubble?: boolean;
  className?: string;
}

// Animated Katya Character - Based on real Katya Karpenko
// Features: Brown wavy hair, green eyes, warm smile
export const KatyaCharacter: React.FC<KatyaCharacterProps> = ({ 
  state = 'idle', 
  size = 'md',
  message,
  showBubble = false,
  className = ''
}) => {
  const [currentState, setCurrentState] = useState<KatyaState>(state);
  const [blinkTimer, setBlinkTimer] = useState(false);

  // Auto blink
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkTimer(true);
      setTimeout(() => setBlinkTimer(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48'
  };

  // Animation variants for different states
  const bodyVariants = {
    idle: { y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    talking: { y: [0, -2, 0], transition: { duration: 0.4, repeat: Infinity } },
    happy: { y: [0, -8, 0], scale: [1, 1.03, 1], transition: { duration: 0.6, repeat: Infinity } },
    thinking: { rotate: [-1, 1, -1], transition: { duration: 2.5, repeat: Infinity } },
    celebrating: { y: [0, -12, 0], rotate: [0, 3, -3, 0], transition: { duration: 0.5, repeat: Infinity } },
    waving: { rotate: [0, 2, -2, 0], transition: { duration: 1, repeat: Infinity } },
    encouraging: { scale: [1, 1.02, 1], transition: { duration: 1.5, repeat: Infinity } }
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 z-10"
          >
            <div 
              className="px-4 py-3 rounded-2xl text-sm font-medium text-white max-w-[220px] text-center relative"
              style={{
                background: 'linear-gradient(135deg, rgba(236,72,153,0.95) 0%, rgba(168,85,247,0.95) 100%)',
                boxShadow: '0 8px 32px rgba(236,72,153,0.3)',
              }}
            >
              {message}
              {/* Bubble tail */}
              <div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.95) 0%, rgba(168,85,247,0.95) 100%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Container */}
      <motion.div 
        className={`${sizeClasses[size]} relative`}
        variants={bodyVariants}
        animate={currentState}
      >
        {/* SVG Character - Katya Karpenko Style */}
        <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
          <defs>
            {/* Gradients */}
            <linearGradient id="hairGradientKatya" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="50%" stopColor="#4E342E" />
              <stop offset="100%" stopColor="#3E2723" />
            </linearGradient>
            <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8D6E63" />
              <stop offset="100%" stopColor="#6D4C41" />
            </linearGradient>
            <linearGradient id="skinGradientKatya" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFCCBC" />
              <stop offset="100%" stopColor="#FFAB91" />
            </linearGradient>
            <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#81C784" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
            <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#90CAF9" />
              <stop offset="100%" stopColor="#64B5F6" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glowKatya" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Hair - Back layer (wavy) */}
          <path 
            d="M 20 55 Q 15 30, 35 15 Q 60 0, 85 15 Q 105 30, 100 55 
               Q 105 80, 95 100 Q 85 115, 75 120 
               L 45 120 Q 35 115, 25 100 Q 15 80, 20 55" 
            fill="url(#hairGradientKatya)"
          />
          
          {/* Hair waves - highlights */}
          <path 
            d="M 30 25 Q 40 35, 35 50 Q 30 60, 35 75" 
            stroke="url(#hairHighlight)" 
            strokeWidth="4" 
            fill="none" 
            opacity="0.6"
            strokeLinecap="round"
          />
          <path 
            d="M 85 30 Q 90 45, 85 60 Q 80 75, 85 90" 
            stroke="url(#hairHighlight)" 
            strokeWidth="3" 
            fill="none" 
            opacity="0.5"
            strokeLinecap="round"
          />
          
          {/* Face */}
          <ellipse cx="60" cy="65" rx="30" ry="35" fill="url(#skinGradientKatya)" />
          
          {/* Hair - Front bangs (wavy) */}
          <path 
            d="M 30 45 Q 40 25, 60 28 Q 80 25, 90 45 
               Q 85 35, 70 38 Q 55 32, 45 38 Q 35 35, 30 45" 
            fill="url(#hairGradientKatya)"
          />
          
          {/* Side hair strands */}
          <path 
            d="M 25 50 Q 20 70, 22 90 Q 24 105, 30 115" 
            stroke="url(#hairGradientKatya)" 
            strokeWidth="12" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M 95 50 Q 100 70, 98 90 Q 96 105, 90 115" 
            stroke="url(#hairGradientKatya)" 
            strokeWidth="12" 
            fill="none"
            strokeLinecap="round"
          />

          {/* Eyebrows */}
          <path d="M 42 52 Q 48 49, 54 52" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 66 52 Q 72 49, 78 52" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Eyes */}
          <g>
            {/* Left eye white */}
            <ellipse 
              cx="48" 
              cy="62" 
              rx="8" 
              ry={blinkTimer ? 1 : 6} 
              fill="white"
              style={{ transition: 'ry 0.1s' }}
            />
            {/* Left iris */}
            <ellipse 
              cx="48" 
              cy="63" 
              rx={blinkTimer ? 0 : 5} 
              ry={blinkTimer ? 0 : 5} 
              fill="url(#eyeGradient)"
            />
            {/* Left pupil */}
            <circle cx="48" cy="63" r={blinkTimer ? 0 : 2.5} fill="#1B5E20" />
            {/* Left eye sparkle */}
            <circle cx="50" cy="61" r={blinkTimer ? 0 : 1.5} fill="white" />
            
            {/* Right eye white */}
            <ellipse 
              cx="72" 
              cy="62" 
              rx="8" 
              ry={blinkTimer ? 1 : 6} 
              fill="white"
              style={{ transition: 'ry 0.1s' }}
            />
            {/* Right iris */}
            <ellipse 
              cx="72" 
              cy="63" 
              rx={blinkTimer ? 0 : 5} 
              ry={blinkTimer ? 0 : 5} 
              fill="url(#eyeGradient)"
            />
            {/* Right pupil */}
            <circle cx="72" cy="63" r={blinkTimer ? 0 : 2.5} fill="#1B5E20" />
            {/* Right eye sparkle */}
            <circle cx="74" cy="61" r={blinkTimer ? 0 : 1.5} fill="white" />
          </g>

          {/* Nose */}
          <path d="M 60 68 Q 58 75, 60 78 Q 62 75, 60 68" stroke="#FFAB91" strokeWidth="1.5" fill="none" />

          {/* Blush */}
          <ellipse cx="38" cy="75" rx="6" ry="3" fill="#FFCDD2" opacity="0.7" />
          <ellipse cx="82" cy="75" rx="6" ry="3" fill="#FFCDD2" opacity="0.7" />

          {/* Mouth - changes based on state */}
          {currentState === 'happy' || currentState === 'celebrating' || currentState === 'waving' ? (
            // Big smile with teeth
            <g>
              <path d="M 48 82 Q 60 95, 72 82" stroke="#D32F2F" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 50 84 Q 60 90, 70 84" fill="white" />
            </g>
          ) : currentState === 'talking' ? (
            // Talking mouth
            <motion.ellipse 
              cx="60" cy="85" rx="6" ry="4" fill="#D32F2F"
              animate={{ ry: [3, 5, 3] }}
              transition={{ duration: 0.25, repeat: Infinity }}
            />
          ) : currentState === 'thinking' ? (
            // Thoughtful expression
            <path d="M 54 84 Q 60 82, 66 84" stroke="#D32F2F" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : currentState === 'encouraging' ? (
            // Warm smile
            <path d="M 50 82 Q 60 90, 70 82" stroke="#D32F2F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            // Default gentle smile
            <path d="M 52 82 Q 60 88, 68 82" stroke="#D32F2F" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Neck */}
          <path d="M 52 98 L 52 110 Q 52 115, 60 115 Q 68 115, 68 110 L 68 98" fill="url(#skinGradientKatya)" />

          {/* Shoulders/Shirt */}
          <path 
            d="M 30 115 Q 40 110, 60 112 Q 80 110, 90 115 
               L 95 140 L 25 140 Z" 
            fill="url(#shirtGradient)"
          />
          
          {/* Shirt V-neck detail */}
          <path d="M 50 115 L 60 125 L 70 115" stroke="#42A5F5" strokeWidth="1.5" fill="none" />

          {/* Sparkles for celebrating */}
          {currentState === 'celebrating' && (
            <>
              <motion.circle 
                cx="15" cy="30" r="3" fill="#FFC107"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
              />
              <motion.circle 
                cx="105" cy="25" r="2.5" fill="#FFC107"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.circle 
                cx="10" cy="70" r="2" fill="#E91E63"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle 
                cx="110" cy="65" r="2" fill="#E91E63"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
              />
              <motion.path 
                d="M 8 50 L 12 50 M 10 48 L 10 52" 
                stroke="#9C27B0" strokeWidth="2"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </>
          )}

          {/* Thinking bubbles */}
          {currentState === 'thinking' && (
            <>
              <motion.circle 
                cx="95" cy="45" r="3" fill="#CE93D8"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              />
              <motion.circle 
                cx="102" cy="35" r="4" fill="#CE93D8"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle 
                cx="108" cy="22" r="5" fill="#CE93D8"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}

          {/* Waving hand */}
          {currentState === 'waving' && (
            <motion.g
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ transformOrigin: '95px 100px' }}
            >
              <ellipse cx="100" cy="95" rx="8" ry="12" fill="url(#skinGradientKatya)" />
              {/* Fingers */}
              <ellipse cx="96" cy="85" rx="2" ry="5" fill="url(#skinGradientKatya)" />
              <ellipse cx="100" cy="83" rx="2" ry="6" fill="url(#skinGradientKatya)" />
              <ellipse cx="104" cy="85" rx="2" ry="5" fill="url(#skinGradientKatya)" />
              <ellipse cx="107" cy="88" rx="2" ry="4" fill="url(#skinGradientKatya)" />
            </motion.g>
          )}

          {/* Hearts for encouraging */}
          {currentState === 'encouraging' && (
            <>
              <motion.path 
                d="M 15 50 C 15 45, 20 45, 20 50 C 20 45, 25 45, 25 50 C 25 55, 20 60, 20 60 C 20 60, 15 55, 15 50"
                fill="#E91E63"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.path 
                d="M 95 55 C 95 51, 99 51, 99 55 C 99 51, 103 51, 103 55 C 103 59, 99 63, 99 63 C 99 63, 95 59, 95 55"
                fill="#E91E63"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

// Pre-built character scenes
export const KatyaWelcome: React.FC<{ name?: string }> = ({ name }) => (
  <KatyaCharacter 
    state="waving" 
    size="lg" 
    showBubble 
    message={name ? `Привет, ${name}! 👋` : "Привет! Я Катя 👋"} 
  />
);

export const KatyaCelebrating: React.FC<{ message?: string }> = ({ message }) => (
  <KatyaCharacter 
    state="celebrating" 
    size="lg" 
    showBubble 
    message={message || "Ты молодец! 🎉"} 
  />
);

export const KatyaThinking: React.FC = () => (
  <KatyaCharacter state="thinking" size="md" />
);

export const KatyaTalking: React.FC<{ message: string }> = ({ message }) => (
  <KatyaCharacter state="talking" size="md" showBubble message={message} />
);

export const KatyaEncouraging: React.FC<{ message?: string }> = ({ message }) => (
  <KatyaCharacter 
    state="encouraging" 
    size="lg" 
    showBubble 
    message={message || "С тобой всё нормально ❤️"} 
  />
);
