import React, { useEffect, useState } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';

// Rive персонаж Кати
// Можно заменить src на свой .riv файл когда он будет готов

interface RiveKatyaProps {
  state?: 'idle' | 'talking' | 'happy' | 'thinking' | 'waving' | 'encouraging';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

// Размеры
const SIZES = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 180, height: 180 },
  xl: { width: 250, height: 250 },
};

// Публичные Rive файлы для персонажей (можно заменить на кастомный)
const RIVE_SOURCES = {
  // Cute character waving - CC BY license
  waving: 'https://public.rive.app/community/runtime-files/1439-2851-waving-girl.riv',
  // Avatar with expressions
  avatar: 'https://public.rive.app/community/runtime-files/554-1038-my-avatar.riv',
  // Friendly character
  friendly: 'https://cdn.rive.app/animations/vehicles.riv', // fallback demo
};

export const RiveKatya: React.FC<RiveKatyaProps> = ({
  state = 'idle',
  size = 'md',
  message,
  className = '',
}) => {
  const [currentSrc, setCurrentSrc] = useState(RIVE_SOURCES.waving);
  const [loadError, setLoadError] = useState(false);
  
  const dimensions = SIZES[size];

  const { rive, RiveComponent } = useRive({
    src: currentSrc,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoadError: () => {
      console.warn('Rive load error, falling back to SVG');
      setLoadError(true);
    },
  });

  // Управление анимацией в зависимости от состояния
  useEffect(() => {
    if (rive) {
      // Попробуем найти и запустить анимацию
      try {
        if (state === 'waving' || state === 'happy' || state === 'encouraging') {
          rive.play();
        } else if (state === 'idle') {
          rive.play();
        }
      } catch (e) {
        console.log('Animation control not available');
      }
    }
  }, [rive, state]);

  // Если Rive не загрузился, показываем fallback SVG
  if (loadError) {
    return <FallbackKatya state={state} size={size} message={message} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 blur-2xl"
        style={{
          background: state === 'happy' || state === 'encouraging' 
            ? 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
        }}
      />
      
      {/* Rive Component */}
      <div 
        style={{ width: dimensions.width, height: dimensions.height }}
        className="relative z-10"
      >
        <RiveComponent />
      </div>

      {/* Speech bubble */}
      {message && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full z-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 max-w-[200px]">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/10 backdrop-blur-xl border-l border-t border-white/20 rotate-45" />
            <p className="text-white text-sm font-medium text-center relative z-10">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Fallback SVG компонент (используется если Rive не загрузился)
const FallbackKatya: React.FC<RiveKatyaProps> = ({ state, size, message, className }) => {
  const dimensions = SIZES[size || 'md'];
  
  // Цвета в зависимости от состояния
  const stateColors = {
    idle: { hair: '#8B4513', eyes: '#2E8B57', blush: '#FFB6C1' },
    talking: { hair: '#8B4513', eyes: '#2E8B57', blush: '#FFA07A' },
    happy: { hair: '#A0522D', eyes: '#32CD32', blush: '#FF69B4' },
    thinking: { hair: '#8B4513', eyes: '#4682B4', blush: '#DDA0DD' },
    waving: { hair: '#A0522D', eyes: '#2E8B57', blush: '#FFB6C1' },
    encouraging: { hair: '#8B4513', eyes: '#FFD700', blush: '#FF69B4' },
  };

  const colors = stateColors[state || 'idle'];

  return (
    <div className={`relative ${className}`}>
      {/* Glow */}
      <div 
        className="absolute inset-0 rounded-full opacity-40 blur-xl animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
        }}
      />
      
      {/* SVG Character */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 200"
        className="relative z-10"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" opacity="0.3" />
        
        {/* Hair back */}
        <ellipse cx="100" cy="85" rx="55" ry="50" fill={colors.hair}>
          <animate
            attributeName="rx"
            values="55;57;55"
            dur="3s"
            repeatCount="indefinite"
          />
        </ellipse>
        
        {/* Face */}
        <ellipse cx="100" cy="100" rx="45" ry="50" fill="#FFDAB9" />
        
        {/* Hair front */}
        <path
          d="M55 80 Q70 50 100 45 Q130 50 145 80 Q140 65 100 60 Q60 65 55 80"
          fill={colors.hair}
        />
        
        {/* Hair strands with animation */}
        <path
          d="M60 85 Q55 70 65 55"
          stroke={colors.hair}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values="M60 85 Q55 70 65 55;M60 85 Q52 72 63 55;M60 85 Q55 70 65 55"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Eyes */}
        <g>
          {/* Left eye */}
          <ellipse cx="80" cy="95" rx="8" ry="10" fill="white" />
          <circle cx="80" cy="95" r="5" fill={colors.eyes}>
            <animate
              attributeName="cy"
              values="95;96;95"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="82" cy="93" r="2" fill="white" />
          
          {/* Right eye */}
          <ellipse cx="120" cy="95" rx="8" ry="10" fill="white" />
          <circle cx="120" cy="95" r="5" fill={colors.eyes}>
            <animate
              attributeName="cy"
              values="95;96;95"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="122" cy="93" r="2" fill="white" />
          
          {/* Blink animation */}
          <rect x="70" y="85" width="20" height="20" fill="#FFDAB9" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0;0;0;0;1;0"
              dur="4s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="110" y="85" width="20" height="20" fill="#FFDAB9" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0;0;0;0;1;0"
              dur="4s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
        
        {/* Eyebrows */}
        <path d="M72 82 Q80 78 88 82" stroke="#8B4513" strokeWidth="2" fill="none" />
        <path d="M112 82 Q120 78 128 82" stroke="#8B4513" strokeWidth="2" fill="none" />
        
        {/* Nose */}
        <path d="M100 100 Q102 108 100 112" stroke="#DEB887" strokeWidth="2" fill="none" />
        
        {/* Mouth - changes with state */}
        {state === 'happy' || state === 'encouraging' ? (
          <path d="M85 125 Q100 140 115 125" stroke="#E91E63" strokeWidth="3" fill="none">
            <animate
              attributeName="d"
              values="M85 125 Q100 140 115 125;M85 125 Q100 142 115 125;M85 125 Q100 140 115 125"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        ) : state === 'talking' ? (
          <ellipse cx="100" cy="128" rx="10" ry="8" fill="#E91E63">
            <animate
              attributeName="ry"
              values="8;5;10;6;8"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </ellipse>
        ) : state === 'thinking' ? (
          <path d="M90 128 L110 128" stroke="#E91E63" strokeWidth="3" fill="none" />
        ) : (
          <path d="M88 125 Q100 132 112 125" stroke="#E91E63" strokeWidth="2" fill="none" />
        )}
        
        {/* Blush */}
        <ellipse cx="70" cy="115" rx="10" ry="6" fill={colors.blush} opacity="0.5" />
        <ellipse cx="130" cy="115" rx="10" ry="6" fill={colors.blush} opacity="0.5" />
        
        {/* Waving hand for waving state */}
        {state === 'waving' && (
          <g>
            <ellipse cx="160" cy="80" rx="12" ry="15" fill="#FFDAB9">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 160 95;20 160 95;-10 160 95;0 160 95"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </ellipse>
            {/* Fingers */}
            <rect x="155" y="60" width="4" height="12" rx="2" fill="#FFDAB9">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 160 95;20 160 95;-10 160 95;0 160 95"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </rect>
          </g>
        )}
        
        {/* Sparkles for encouraging state */}
        {state === 'encouraging' && (
          <>
            <circle cx="50" cy="60" r="3" fill="#FFD700">
              <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="50" r="4" fill="#FFD700">
              <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="90" r="2" fill="#FFD700">
              <animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        
        {/* Thinking bubbles */}
        {state === 'thinking' && (
          <>
            <circle cx="155" cy="70" r="5" fill="white" opacity="0.8">
              <animate attributeName="cy" values="70;65;70" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="165" cy="55" r="8" fill="white" opacity="0.6">
              <animate attributeName="cy" values="55;50;55" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="175" cy="40" r="12" fill="white" opacity="0.4">
              <animate attributeName="cy" values="40;35;40" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        
        {/* Gradients */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Message bubble */}
      {message && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full z-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 max-w-[200px]">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/10 backdrop-blur-xl border-l border-t border-white/20 rotate-45" />
            <p className="text-white text-sm font-medium text-center relative z-10">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiveKatya;



