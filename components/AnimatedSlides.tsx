
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Sparkles, Star, Heart, Shield, Flame, Trophy, Clock, Smartphone, Bell, Coffee, Moon, Sun, Battery, Lightbulb, Rocket } from 'lucide-react';

// Animated Brain with neurons firing
export const AnimatedBrain: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const [neurons, setNeurons] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const newNeuron = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setNeurons(prev => [...prev.slice(-8), newNeuron]);
    }, 400);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-purple-500/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Brain icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-purple-500/50">
          <Brain className="w-16 h-16 text-white" />
        </div>
      </motion.div>

      {/* Firing neurons */}
      <AnimatePresence>
        {neurons.map((neuron) => (
          <motion.div
            key={neuron.id}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
            style={{ left: `${neuron.x}%`, top: `${neuron.y}%` }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        ))}
      </AnimatePresence>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.circle
          cx="50%"
          cy="50%"
          r="40%"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="1"
          strokeDasharray="10 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Animated Dopamine molecule
export const AnimatedDopamine: React.FC = () => {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Central molecule */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Orbiting elements */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6"
            style={{
              transform: `rotate(${angle}deg) translateX(70px)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          >
            <div className={`w-full h-full rounded-full ${
              i % 2 === 0 ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-orange-500 shadow-orange-500/50'
            } shadow-lg`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Center */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50">
          <Zap className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      {/* Pulse rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 border-yellow-400/30 rounded-full"
          animate={{
            scale: [1, 2],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.6,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

// Animated Focus Target
export const AnimatedFocus: React.FC = () => {
  const [distractions, setDistractions] = useState<{ id: number; x: number; y: number; type: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['📱', '🔔', '💬', '📺'];
      setDistractions(prev => {
        const newDistraction = {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          type: types[Math.floor(Math.random() * types.length)],
        };
        return [...prev.slice(-5), newDistraction];
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Shield in center */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50">
          <Shield className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Distractions flying around */}
      <AnimatePresence>
        {distractions.map((d) => (
          <motion.div
            key={d.id}
            className="absolute text-2xl"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0.8],
              opacity: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 50],
              y: [0, (Math.random() - 0.5) * 50],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {d.type}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Protective aura */}
      <motion.div
        className="absolute inset-0 border-4 border-indigo-400/30 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

// Animated Energy Battery
export const AnimatedBattery: React.FC<{ level?: number }> = ({ level = 70 }) => {
  return (
    <div className="relative w-32 h-48 mx-auto">
      {/* Battery body */}
      <div className="absolute inset-0 bg-slate-800 rounded-3xl border-4 border-slate-600 overflow-hidden">
        {/* Energy level */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-emerald-400"
          initial={{ height: 0 }}
          animate={{ height: `${level}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Bubbles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/30 rounded-full"
              style={{ left: `${20 + i * 15}%` }}
              animate={{
                y: [0, -100],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Battery cap */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-600 rounded-t-lg" />

      {/* Energy icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Zap className="w-12 h-12 text-white drop-shadow-lg" />
      </motion.div>

      {/* Percentage */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-2xl font-black text-white">
        {level}%
      </div>
    </div>
  );
};

// Animated Sleep/Moon
export const AnimatedSleep: React.FC = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    // Generate initial stars
    const initialStars = [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
    }));
    setStars(initialStars);
  }, []);

  return (
    <div className="relative w-48 h-48 mx-auto overflow-hidden rounded-full bg-gradient-to-b from-indigo-900 to-slate-900">
      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Moon */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-2xl shadow-yellow-200/50 relative">
          {/* Moon craters */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-300/50 rounded-full" />
          <div className="absolute top-8 right-4 w-2 h-2 bg-yellow-300/50 rounded-full" />
          <div className="absolute bottom-4 left-6 w-4 h-4 bg-yellow-300/50 rounded-full" />
        </div>
      </motion.div>

      {/* Zzz */}
      <motion.div
        className="absolute top-4 right-4 text-2xl font-black text-purple-300"
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Z
      </motion.div>
      <motion.div
        className="absolute top-8 right-8 text-xl font-black text-purple-400"
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
      >
        z
      </motion.div>
      <motion.div
        className="absolute top-12 right-6 text-lg font-black text-purple-500"
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
      >
        z
      </motion.div>
    </div>
  );
};

// Animated Boss Character
export const AnimatedBoss: React.FC<{ defeated?: boolean }> = ({ defeated = false }) => {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Boss glow */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-3xl ${
          defeated ? 'bg-green-500/30' : 'bg-red-500/30'
        }`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Boss body */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={defeated ? { rotate: [0, 10, -10, 0], y: [0, 50] } : { scale: [1, 1.1, 1] }}
        transition={{ duration: defeated ? 1 : 2, repeat: defeated ? 0 : Infinity }}
      >
        <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-2xl ${
          defeated 
            ? 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/50' 
            : 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/50'
        }`}>
          {defeated ? (
            <Trophy className="w-14 h-14 text-yellow-400" />
          ) : (
            <Flame className="w-14 h-14 text-white" />
          )}
        </div>
      </motion.div>

      {/* Attack particles (when not defeated) */}
      {!defeated && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-orange-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 60 * Math.PI / 180) * 80],
                y: [0, Math.sin(i * 60 * Math.PI / 180) * 80],
                opacity: [1, 0],
                scale: [0.5, 1.5],
              }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                repeat: Infinity,
              }}
            />
          ))}
        </>
      )}

      {/* Victory stars (when defeated) */}
      {defeated && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: '20%',
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [-20, -60],
                opacity: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            >
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

// Animated Reward/Coins
export const AnimatedReward: React.FC<{ amount: number }> = ({ amount }) => {
  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      {/* Coin shower */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-2 border-yellow-600 flex items-center justify-center text-yellow-800 font-black text-xs shadow-lg"
          style={{ left: `${10 + i * 8}%` }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: [- 50, 150],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            delay: i * 0.15,
            repeat: Infinity,
          }}
        >
          ₽
        </motion.div>
      ))}

      {/* Central amount display */}
      <motion.div
        className="relative z-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl px-8 py-6 shadow-2xl shadow-orange-500/50"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="text-4xl font-black text-white">+{amount}</div>
        <div className="text-sm font-bold text-yellow-100 text-center">МОНЕТ</div>
      </motion.div>

      {/* Sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </motion.div>
      ))}
    </div>
  );
};

// Animated Progress Path
export const AnimatedPath: React.FC<{ progress: number; total: number }> = ({ progress, total }) => {
  return (
    <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        initial={{ width: 0 }}
        animate={{ width: `${(progress / total) * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ width: '50%' }}
      />

      {/* Step markers */}
      {[...Array(total)].map((_, i) => (
        <div
          key={i}
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
            i < progress 
              ? 'bg-white border-white' 
              : 'bg-slate-700 border-slate-600'
          }`}
          style={{ left: `${((i + 1) / total) * 100 - 2}%` }}
        />
      ))}
    </div>
  );
};

// Export all animations
export const SlideAnimations = {
  Brain: AnimatedBrain,
  Dopamine: AnimatedDopamine,
  Focus: AnimatedFocus,
  Battery: AnimatedBattery,
  Sleep: AnimatedSleep,
  Boss: AnimatedBoss,
  Reward: AnimatedReward,
  Path: AnimatedPath,
};

export default SlideAnimations;

