import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Sparkles, Moon, Sun, Waves, Wind } from 'lucide-react';

interface ZenVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

type VisualizerType = 'aurora' | 'particles' | 'waves' | 'mandala';

const VISUALIZERS = [
  { id: 'aurora', name: 'Северное сияние', icon: Moon, color: 'from-purple-500 to-cyan-500' },
  { id: 'particles', name: 'Светлячки', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
  { id: 'waves', name: 'Волны', icon: Waves, color: 'from-blue-500 to-teal-500' },
  { id: 'mandala', name: 'Мандала', icon: Sun, color: 'from-pink-500 to-purple-500' },
];

// Aurora Borealis Effect
const AuroraVisualizer: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950" />
      
      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
      
      {/* Aurora layers */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-64"
          style={{
            top: '20%',
            background: `linear-gradient(180deg, 
              transparent 0%, 
              ${['rgba(34,197,94,0.3)', 'rgba(59,130,246,0.3)', 'rgba(168,85,247,0.3)', 'rgba(236,72,153,0.3)', 'rgba(6,182,212,0.3)'][i]} 50%, 
              transparent 100%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: ['-20%', '20%', '-20%'],
            scaleY: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
};

// Fireflies / Particles Effect
const ParticlesVisualizer: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${
              ['rgba(250,204,21,0.9)', 'rgba(34,197,94,0.9)', 'rgba(56,189,248,0.9)'][Math.floor(Math.random() * 3)]
            } 0%, transparent 70%)`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: 5 + Math.random() * 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      {/* Glow spots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute w-40 h-40 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + Math.random() * 40}%`,
            background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Ocean Waves Effect
const WavesVisualizer: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900 via-blue-900 to-slate-950" />
      
      {/* Sun/Moon */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,200,150,0.6) 50%, transparent 70%)',
          filter: 'blur(2px)',
        }}
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Waves */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[200%] h-32"
          style={{
            bottom: `${i * 12}%`,
            left: '-50%',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(${59 + i * 10},${130 + i * 10},${246 - i * 10},${0.3 - i * 0.03}) 25%, 
              rgba(${59 + i * 10},${130 + i * 10},${246 - i * 10},${0.5 - i * 0.05}) 50%, 
              rgba(${59 + i * 10},${130 + i * 10},${246 - i * 10},${0.3 - i * 0.03}) 75%, 
              transparent 100%)`,
            borderRadius: '50%',
          }}
          animate={{
            x: ['0%', '25%', '0%'],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
      
      {/* Sparkles on water */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 50}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 1 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
};

// Mandala Effect
const MandalaVisualizer: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-950 via-slate-950 to-purple-950">
      {/* Rotating rings */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 100 + i * 60,
            height: 100 + i * 60,
            borderColor: `rgba(${168 + i * 10},${85 + i * 10},${247},${0.3 - i * 0.03})`,
            borderWidth: 2,
          }}
          animate={{
            rotate: i % 2 === 0 ? [0, 360] : [360, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 20 + i * 5, repeat: Infinity, ease: 'linear' },
            scale: { duration: 3 + i, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}
      
      {/* Petals */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          className="absolute w-4 h-20 rounded-full origin-bottom"
          style={{
            background: `linear-gradient(to top, rgba(236,72,153,0.6), rgba(168,85,247,0.3))`,
            transform: `rotate(${i * 30}deg)`,
            filter: 'blur(2px)',
          }}
          animate={{
            scaleY: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
      
      {/* Center glow */}
      <motion.div
        className="absolute w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(168,85,247,0.5) 50%, transparent 70%)',
          filter: 'blur(5px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-pink-400"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
          animate={{
            x: [0, Math.random() * 50 - 25],
            y: [0, Math.random() * 50 - 25],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export const ZenVisualizer: React.FC<ZenVisualizerProps> = ({ isOpen, onClose }) => {
  const [activeVisualizer, setActiveVisualizer] = useState<VisualizerType>('aurora');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Управление не скрывается автоматически - пользователь сам нажимает на экран
  // чтобы скрыть/показать управление

  if (!isOpen) return null;

  const renderVisualizer = () => {
    switch (activeVisualizer) {
      case 'aurora': return <AuroraVisualizer />;
      case 'particles': return <ParticlesVisualizer />;
      case 'waves': return <WavesVisualizer />;
      case 'mandala': return <MandalaVisualizer />;
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[90] bg-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowControls(!showControls)}
    >
      {/* Solid background to prevent content showing through */}
      <div className="absolute inset-0 bg-slate-950" />
      
      {/* Visualizer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeVisualizer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {isPlaying && renderVisualizer()}
          {!isPlaying && (
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
              <div className="text-white/30 text-center">
                <Pause size={60} className="mx-auto mb-4" />
                <p>Пауза</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - LOWERED FOR TELEGRAM */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <X size={24} />
            </button>

            {/* Title */}
            <div className="absolute top-6 left-6">
              <h2 className="text-white font-bold text-xl">Визуализации</h2>
              <p className="text-white/50 text-sm">Расслабься и наблюдай</p>
            </div>

            {/* Visualizer selector + Play/Pause - всё внизу */}
            <div className="absolute bottom-8 left-0 right-0 px-4">
              {/* Play/Pause кнопка - компактная, слева */}
              <div className="flex gap-2 justify-center items-center flex-wrap">
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 rounded-xl flex flex-col items-center gap-1 min-w-[70px] text-white"
                  style={{
                    background: isPlaying 
                      ? 'rgba(255,255,255,0.1)'
                      : 'linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(16,185,129,0.5) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: isPlaying ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(34,197,94,0.5)',
                  }}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  <span className="text-[10px] font-medium">{isPlaying ? 'Пауза' : 'Играть'}</span>
                </motion.button>
                {VISUALIZERS.map((viz) => {
                  const Icon = viz.icon;
                  const isActive = activeVisualizer === viz.id;
                  return (
                    <button
                      key={viz.id}
                      onClick={() => setActiveVisualizer(viz.id as VisualizerType)}
                      className={`px-3 py-2 rounded-xl flex flex-col items-center gap-1 transition-all min-w-[70px] ${
                        isActive ? 'text-white scale-105' : 'text-white/60 hover:text-white'
                      }`}
                      style={{
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(168,85,247,0.5) 0%, rgba(236,72,153,0.5) 100%)'
                          : 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        border: isActive ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <Icon size={20} />
                      <span className="text-[10px] font-medium">{viz.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};





