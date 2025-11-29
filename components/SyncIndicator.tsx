import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface SyncIndicatorProps {
  status: 'idle' | 'syncing' | 'synced' | 'error';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

/**
 * ☁️ Универсальный индикатор синхронизации
 */
export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ 
  status, 
  size = 'sm',
  showLabel = false 
}) => {
  if (status === 'idle') return null;

  const iconSize = size === 'sm' ? 12 : 16;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="flex items-center gap-1"
      >
        {status === 'syncing' && (
          <>
            <Cloud size={iconSize} className="text-blue-400 animate-pulse" />
            {showLabel && <span className="text-blue-400 text-xs">Синхр...</span>}
          </>
        )}
        {status === 'synced' && (
          <>
            <CheckCircle size={iconSize} className="text-green-400" />
            {showLabel && <span className="text-green-400 text-xs">Сохранено</span>}
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={iconSize} className="text-red-400" />
            {showLabel && <span className="text-red-400 text-xs">Ошибка</span>}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SyncIndicator;

