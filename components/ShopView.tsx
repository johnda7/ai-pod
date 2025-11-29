import React, { useState, useEffect } from 'react';
import { SHOP_ITEMS } from '../constants';
import { User, ShopItem } from '../types';
import { ShoppingBag, Coins, Heart, Snowflake, Gift, Crown, Check, Sparkles, X, Zap, Star, Package, Flame, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticMedium, hapticSuccess, hapticLight, hapticError } from '../services/telegramService';
import { playPurchaseSound, playSurpriseSound } from '../services/soundService';

interface ShopViewProps {
  user: User;
  onBuy: (item: ShopItem) => void;
  onRefreshUser?: () => void;
}

interface MysteryReward {
  type: string;
  amount: number;
  message: string;
}

// Extended shop items with more options
const EXTENDED_SHOP_ITEMS = [
  ...SHOP_ITEMS,
  { id: 'xp_boost', name: 'XP Буст', description: '⚡ x2 опыта на следующий урок!', price: 80, icon: 'xp_boost', type: 'POWERUP' as const },
  { id: 'hint_pack', name: 'Подсказки', description: '💡 3 подсказки для сложных заданий', price: 60, icon: 'hint_pack', type: 'POWERUP' as const },
  { id: 'skip_task', name: 'Пропуск', description: '⏭️ Пропусти одно сложное задание', price: 120, icon: 'skip_task', type: 'POWERUP' as const },
];

export const ShopView: React.FC<ShopViewProps> = ({ user, onBuy, onRefreshUser }) => {
  const [mysteryReward, setMysteryReward] = useState<MysteryReward | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'powerups' | 'cosmetic'>('all');

  // Check for mystery box reward after purchase
  useEffect(() => {
    const checkReward = () => {
      const rewardStr = localStorage.getItem('mystery_box_reward');
      if (rewardStr) {
        const reward = JSON.parse(rewardStr);
        setMysteryReward(reward);
        setShowRewardModal(true);
        localStorage.removeItem('mystery_box_reward');
      }
    };
    
    checkReward();
    const interval = setInterval(checkReward, 300);
    return () => clearInterval(interval);
  }, []);

  const closeRewardModal = () => {
    setShowRewardModal(false);
    setMysteryReward(null);
    if (onRefreshUser) {
      onRefreshUser();
    }
  };

  const handleBuy = async (item: ShopItem) => {
    if (user.coins < item.price) {
      hapticError(); // 📳 Недостаточно монет
      return;
    }
    hapticMedium(); // 📳 Начало покупки
    setIsPurchasing(true);
    await onBuy(item);
    hapticSuccess(); // 📳 Успешная покупка!
    playPurchaseSound(); // 🔊 Звук покупки
    if (item.id === 'mystery_box') {
      setTimeout(() => playSurpriseSound(), 300); // 🔊 Сюрприз!
    }
    setIsPurchasing(false);
  };
  
  const getIcon = (id: string) => {
    switch(id) {
      case 'hp_potion': return <Heart fill="currentColor" className="text-rose-400" size={32} />;
      case 'streak_freeze': return <Snowflake className="text-cyan-400" size={32} />;
      case 'mystery_box': return <Gift className="text-purple-400" size={32} />;
      case 'frame_gold': return <Crown className="text-yellow-400" size={32} />;
      case 'xp_boost': return <Zap className="text-orange-400" size={32} />;
      case 'hint_pack': return <Sparkles className="text-emerald-400" size={32} />;
      case 'skip_task': return <Clock className="text-blue-400" size={32} />;
      default: return <Package className="text-slate-400" size={32} />;
    }
  };

  const getGlowColor = (id: string) => {
    switch(id) {
      case 'hp_potion': return 'rgba(244,63,94,0.3)';
      case 'streak_freeze': return 'rgba(34,211,238,0.3)';
      case 'mystery_box': return 'rgba(168,85,247,0.3)';
      case 'frame_gold': return 'rgba(234,179,8,0.3)';
      case 'xp_boost': return 'rgba(251,146,60,0.3)';
      case 'hint_pack': return 'rgba(52,211,153,0.3)';
      case 'skip_task': return 'rgba(59,130,246,0.3)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  const categories = [
    { id: 'all', label: 'Всё', icon: '🛒' },
    { id: 'powerups', label: 'Усиления', icon: '⚡' },
    { id: 'cosmetic', label: 'Стиль', icon: '✨' },
  ];

  const filteredItems = EXTENDED_SHOP_ITEMS.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'powerups') return item.type === 'POWERUP';
    if (activeCategory === 'cosmetic') return item.type === 'COSMETIC';
    return true;
  });

  return (
    <div className="min-h-screen pb-40 text-white relative overflow-hidden">
      {/* iOS 26 LIQUID GLASS BACKGROUND - Like Chill Zone */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1025 30%, #0a0a1a 100%)'
        }} />
        
        {/* Animated ambient orbs */}
        <motion.div 
          className="absolute top-20 right-0 w-80 h-80 rounded-full blur-[120px]"
          style={{ background: 'rgba(234,179,8,0.15)' }}
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-60 -left-20 w-96 h-96 rounded-full blur-[150px]"
          style={{ background: 'rgba(139,92,246,0.12)' }}
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-10 w-72 h-72 rounded-full blur-[100px]"
          style={{ background: 'rgba(99,102,241,0.1)' }}
          animate={{ 
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* HEADER - iOS 26 LIQUID GLASS */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-5 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.1) 100%)',
                  border: '1px solid rgba(234,179,8,0.2)',
                  boxShadow: '0 0 20px rgba(234,179,8,0.2)',
                }}
              >
                <ShoppingBag className="text-yellow-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Магазин</h1>
                <p className="text-white/40 text-xs font-medium">Усиления и стиль</p>
              </div>
            </div>
            
            {/* Balance pill */}
            <div 
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.1) 100%)',
                border: '1px solid rgba(234,179,8,0.25)',
                boxShadow: '0 4px 20px rgba(234,179,8,0.15)',
              }}
            >
              <Coins className="text-yellow-400" fill="currentColor" size={20} />
              <span className="text-xl font-black text-yellow-300 font-mono">{user.coins}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CATEGORY TABS - Transparent pills like Chill Zone */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className="flex-1 py-3 px-4 rounded-2xl font-medium text-sm transition-all duration-300"
              style={{
                background: activeCategory === cat.id 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)'
                  : 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: activeCategory === cat.id 
                  ? '1px solid rgba(255,255,255,0.2)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: activeCategory === cat.id ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="px-4 mb-4">
        <div 
          className="p-4 rounded-2xl flex justify-around"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-rose-400 mb-1">
              <Heart size={16} fill="currentColor" />
              <span className="font-bold">{user.hp}/{user.maxHp}</span>
            </div>
            <span className="text-white/40 text-xs">Жизни</span>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Flame size={16} />
              <span className="font-bold">{user.streak}</span>
            </div>
            <span className="text-white/40 text-xs">Серия</span>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Shield size={16} />
              <span className="font-bold">{user.inventory.filter(i => i === 'streak_freeze').length}</span>
            </div>
            <span className="text-white/40 text-xs">Заморозки</span>
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const canAfford = user.coins >= item.price;
            const isHpFull = item.id === 'hp_potion' && user.hp === user.maxHp;
            const isOwned = user.inventory.includes(item.id) && item.type === 'COSMETIC';
            const ownedCount = user.inventory.filter(id => id === item.id).length;
            const hasInInventory = ownedCount > 0;
            const isDisabled = !canAfford || isHpFull || isOwned;

            return (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="relative group overflow-hidden rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 40px ${getGlowColor(item.id)}`,
                }}
              >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl pointer-events-none" />
                
                {/* Inventory count badge */}
                {hasInInventory && item.type === 'POWERUP' && (
                  <div 
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold z-20"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  >
                    ×{ownedCount}
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center text-center p-5 gap-3">
                  {/* Icon with glow */}
                  <motion.div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: `0 0 30px ${getGlowColor(item.id)}`,
                    }}
                  >
                    {getIcon(item.id)}
                  </motion.div>
                  
                  {/* Text */}
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                    <p className="text-white/40 text-[10px] mt-1 font-medium line-clamp-2">{item.description}</p>
                  </div>

                  {/* TRANSPARENT BUY BUTTON - Like Chill Zone */}
                  <div className="w-full mt-auto">
                    {isOwned ? (
                      <div 
                        className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
                        style={{
                          background: 'rgba(34,197,94,0.1)',
                          border: '1px solid rgba(34,197,94,0.2)',
                        }}
                      >
                        <Check size={14} className="text-green-400" /> 
                        <span className="text-green-400 font-bold text-xs">Есть</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBuy(item as ShopItem)}
                        disabled={isDisabled || isPurchasing}
                        className="w-full py-3 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
                        style={{
                          background: isDisabled 
                            ? 'rgba(255,255,255,0.03)'
                            : 'rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(20px)',
                          border: isDisabled 
                            ? '1px solid rgba(255,255,255,0.05)'
                            : '1px solid rgba(255,255,255,0.15)',
                          color: isDisabled ? 'rgba(255,255,255,0.3)' : '#fff',
                        }}
                      >
                        {isPurchasing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles size={14} />
                          </motion.div>
                        ) : isHpFull ? (
                          <>
                            <Heart size={12} fill="currentColor" className="text-green-400" />
                            <span className="text-green-400">Полно</span>
                          </>
                        ) : (
                          <>
                            <Coins size={12} className={canAfford ? 'text-yellow-400' : 'text-white/30'} />
                            <span>{item.price}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* INFO SECTION */}
      <div className="px-4 mt-4 mb-8">
        <div 
          className="p-4 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">💡 Как использовать</h3>
          <div className="space-y-2 text-white/40 text-xs">
            <p>• <span className="text-rose-400">Жизни</span> — восстанавливаются при покупке зелья</p>
            <p>• <span className="text-cyan-400">Заморозка</span> — автоматически защитит серию</p>
            <p>• <span className="text-purple-400">Сюрприз</span> — шанс получить больше, чем потратил!</p>
            <p>• <span className="text-yellow-400">Рамка</span> — появится на твоём аватаре</p>
          </div>
        </div>
      </div>

      {/* MYSTERY BOX REWARD MODAL */}
      <AnimatePresence>
        {showRewardModal && mysteryReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6"
            onClick={closeRewardModal}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="relative w-full max-w-sm p-8 rounded-3xl text-center overflow-hidden"
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(168,85,247,0.3)',
              }}
            >
              {/* Shine effect */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl pointer-events-none" />
              
              {/* Sparkles animation */}
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.div 
                className="text-7xl mb-6"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                🎁
              </motion.div>
              
              <h2 className="text-2xl font-black text-white mb-2">Сюрприз!</h2>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 mb-6">
                {mysteryReward.message}
              </p>
              
              <button 
                onClick={closeRewardModal}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.8) 0%, rgba(139,92,246,0.8) 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(168,85,247,0.4)',
                }}
              >
                Супер! ✨
              </button>
              
              {/* Close button */}
              <button 
                onClick={closeRewardModal}
                className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <X size={20} className="text-white/70" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
