import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#22c55e', // green
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
];

const SHAPES = ['circle', 'square', 'triangle'];

export const Confetti: React.FC<ConfettiProps> = ({ isActive, duration = 3000 }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Generate particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5,
        });
      }
      setParticles(newParticles);
      setShow(true);

      // Hide after duration
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: particle.rotation + 720,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: particle.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
          
          {/* Center celebration burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-8xl">🎉</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Simpler reward animation for XP/Coins
interface RewardPopupProps {
  xp?: number;
  coins?: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export const RewardPopup: React.FC<RewardPopupProps> = ({ xp, coins, isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] pointer-events-none"
        >
          <div 
            className="px-8 py-6 rounded-3xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(139,92,246,0.95) 100%)',
              boxShadow: '0 20px 60px rgba(99,102,241,0.5)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.1 }}
              className="text-5xl mb-3"
            >
              🏆
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white font-bold text-xl mb-3"
            >
              Отлично!
            </motion.h3>
            
            <div className="flex items-center justify-center gap-4">
              {xp && xp > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20"
                >
                  <span className="text-yellow-300 text-lg">⚡</span>
                  <span className="text-white font-bold">+{xp} XP</span>
                </motion.div>
              )}
              
              {coins && coins > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20"
                >
                  <span className="text-yellow-300 text-lg">🪙</span>
                  <span className="text-white font-bold">+{coins}</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast notification
interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  isVisible: boolean;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: '✅',
    info: '💡',
    warning: '⚠️',
  };

  const colors = {
    success: 'from-green-500 to-emerald-500',
    info: 'from-indigo-500 to-purple-500',
    warning: 'from-amber-500 to-orange-500',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-20 left-1/2 z-[100]"
        >
          <div 
            className={`px-5 py-3 rounded-2xl flex items-center gap-3 bg-gradient-to-r ${colors[type]}`}
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-xl">{icons[type]}</span>
            <span className="text-white font-medium text-sm">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Level Up Animation
interface LevelUpProps {
  newLevel: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpProps> = ({ newLevel, isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          {/* Rays */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [0.5, 2],
                  rotate: i * 30,
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.05,
                  repeat: 1,
                }}
                className="absolute w-2 h-40 bg-gradient-to-t from-transparent via-yellow-400 to-transparent"
                style={{ transformOrigin: 'center 200px' }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative z-10 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-8xl mb-4"
            >
              🎊
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-white mb-2"
            >
              LEVEL UP!
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                boxShadow: '0 10px 40px rgba(245,158,11,0.5)',
              }}
            >
              <span className="text-white text-xl font-bold">Уровень</span>
              <span className="text-4xl font-black text-white">{newLevel}</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Confetti;



