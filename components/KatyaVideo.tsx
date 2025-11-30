import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import { hapticLight, hapticMedium } from '../services/telegramService';

// Видео Кати на YouTube
export const KATYA_VIDEOS = {
  welcome: {
    id: 'EfLG_uMGqTo',
    title: 'Привет от Кати!',
    description: 'Знакомство с твоим личным коучем',
    duration: '17 сек',
  },
  motivation: {
    id: 'uw3BJghYc4o', 
    title: 'Ты молодец!',
    description: 'Мотивация от Кати',
    duration: '9 сек',
  },
};

interface KatyaVideoPlayerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const KatyaVideoPlayer: React.FC<KatyaVideoPlayerProps> = ({ videoId, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.3)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                hapticLight();
                onClose();
              }}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>

            {/* YouTube Shorts Embed */}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&playsinline=1&loop=1&playlist=${videoId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Катя - видео"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface KatyaVideoCardProps {
  video: typeof KATYA_VIDEOS.welcome;
  onPlay: () => void;
  compact?: boolean;
}

export const KatyaVideoCard: React.FC<KatyaVideoCardProps> = ({ video, onPlay, compact = false }) => {
  return (
    <motion.button
      onClick={() => {
        hapticMedium();
        onPlay();
      }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden rounded-2xl ${compact ? 'w-full' : 'w-full'}`}
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.1) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 8px 32px rgba(139,92,246,0.2)',
      }}
    >
      {/* Thumbnail with play overlay */}
      <div className={`relative ${compact ? 'aspect-video' : 'aspect-video'}`}>
        <img
          src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default quality if maxres not available
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-purple-500/90 backdrop-blur-md flex items-center justify-center shadow-lg"
            style={{
              boxShadow: '0 0 30px rgba(139,92,246,0.5)',
            }}
          >
            <Play size={28} className="text-white ml-1" fill="white" />
          </motion.div>
        </div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium">
          {video.duration}
        </div>

        {/* Title and description */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg">{video.title}</h3>
          <p className="text-white/70 text-sm">{video.description}</p>
        </div>
      </div>
    </motion.button>
  );
};

// Widget для главного экрана
interface KatyaVideoWidgetProps {
  onXpEarned?: (xp: number) => void;
}

export const KatyaVideoWidget: React.FC<KatyaVideoWidgetProps> = ({ onXpEarned }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('katya_watched_videos') || '[]');
    } catch {
      return [];
    }
  });

  const handleVideoClose = () => {
    if (selectedVideo && !watchedVideos.includes(selectedVideo)) {
      const newWatched = [...watchedVideos, selectedVideo];
      setWatchedVideos(newWatched);
      localStorage.setItem('katya_watched_videos', JSON.stringify(newWatched));
      // Award XP for first watch
      if (onXpEarned) {
        onXpEarned(25);
      }
    }
    setSelectedVideo(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Play size={14} className="text-purple-400 ml-0.5" fill="currentColor" />
          </div>
          <span className="text-white/80 font-bold text-sm">Видео от Кати</span>
          {watchedVideos.length < 2 && (
            <span className="ml-auto text-xs text-purple-400 font-medium">+25 XP за просмотр!</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(KATYA_VIDEOS).map(([key, video]) => (
            <motion.button
              key={key}
              onClick={() => {
                hapticMedium();
                setSelectedVideo(video.id);
              }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              <div className="relative aspect-video">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl" />
                
                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center">
                    <Play size={18} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>

                {/* Watched badge */}
                {watchedVideos.includes(video.id) && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-bold">
                    ✓
                  </div>
                )}

                {/* Duration */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px]">
                  {video.duration}
                </div>

                {/* Title */}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate">{video.title}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Video Player Modal */}
      <KatyaVideoPlayer
        videoId={selectedVideo || ''}
        isOpen={!!selectedVideo}
        onClose={handleVideoClose}
      />
    </>
  );
};

export default KatyaVideoWidget;

