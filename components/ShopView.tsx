import React, { useState, useEffect } from 'react';
import { SHOP_ITEMS } from '../constants';
import { User, ShopItem } from '../types';
import { ShoppingBag, Coins, Heart, Snowflake, Gift, Crown, Check, Sparkles, X, Zap, Star } from 'lucide-react';

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

export const ShopView: React.FC<ShopViewProps> = ({ user, onBuy, onRefreshUser }) => {
  const [mysteryReward, setMysteryReward] = useState<MysteryReward | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

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
    setIsPurchasing(true);
    await onBuy(item);
    setIsPurchasing(false);
  };
  
  const getIcon = (id: string) => {
    switch(id) {
      case 'hp_potion': return <Heart fill="currentColor" className="text-rose-400" size={36} />;
      case 'streak_freeze': return <Snowflake className="text-cyan-400" size={36} />;
      case 'mystery_box': return <Gift className="text-purple-400" size={36} />;
      case 'frame_gold': return <Crown className="text-yellow-400" size={36} />;
      default: return <ShoppingBag className="text-slate-400" size={36} />;
    }
  };

  const getGradient = (id: string) => {
    switch(id) {
      case 'hp_potion': return 'from-rose-500/30 to-pink-600/20';
      case 'streak_freeze': return 'from-cyan-500/30 to-blue-600/20';
      case 'mystery_box': return 'from-purple-500/30 to-indigo-600/20';
      case 'frame_gold': return 'from-yellow-500/30 to-amber-600/20';
      default: return 'from-slate-500/30 to-slate-600/20';
    }
  };

  const getBorderColor = (id: string) => {
    switch(id) {
      case 'hp_potion': return 'rgba(244,63,94,0.25)';
      case 'streak_freeze': return 'rgba(34,211,238,0.25)';
      case 'mystery_box': return 'rgba(168,85,247,0.25)';
      case 'frame_gold': return 'rgba(234,179,8,0.25)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  return (
    <div className="min-h-screen pb-40 animate-in fade-in duration-500 text-white relative">
      {/* iOS 26 LIQUID GLASS BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0c1222 0%, #020617 50%, #0a0f1a 100%)'
        }} />
        {/* Animated orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-600/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-60 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>
      
      {/* HEADER - iOS 26 LIQUID GLASS - MORE LOWERED FOR TELEGRAM */}
      <div className="sticky top-0 z-20 px-4 pt-24 pb-4">
        <div 
          className="p-5 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <ShoppingBag className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Магазин</h1>
                  <p className="text-white/50 text-xs font-medium">Потрать с умом 💎</p>
                </div>
              </div>
            </div>
            <div 
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.25) 0%, rgba(234,179,8,0.15) 100%)',
                border: '1px solid rgba(234,179,8,0.3)',
                boxShadow: '0 4px 20px rgba(234,179,8,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <Coins className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" fill="currentColor" size={22} />
              <span className="text-xl font-black text-yellow-300 font-mono">{user.coins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {SHOP_ITEMS.map((item, index) => {
          const canAfford = user.coins >= item.price;
          const isHpFull = item.id === 'hp_potion' && user.hp === user.maxHp;
          const isOwned = user.inventory.includes(item.id) && item.type === 'COSMETIC';
          
          const ownedCount = user.inventory.filter(id => id === item.id).length;
          const hasInInventory = ownedCount > 0;
          
          const isDisabled = !canAfford || isHpFull || isOwned;

          return (
            <div 
              key={item.id} 
              className="relative group overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)`,
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: `1px solid ${getBorderColor(item.id)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Shine effect */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl pointer-events-none" />
              
              {/* Colored glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(item.id)} opacity-50`} />

              {/* Owned Badge */}
              {hasInInventory && item.type === 'POWERUP' && item.id === 'streak_freeze' && (
                <div 
                  className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold z-20"
                  style={{
                    background: 'rgba(34,211,238,0.2)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    color: '#22d3ee',
                  }}
                >
                  ×{ownedCount}
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center p-5 gap-3">
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="relative z-10">{getIcon(item.id)}</div>
                </div>
                
                {/* Text */}
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                  <p className="text-white/40 text-[10px] mt-1 font-medium line-clamp-2">{item.description}</p>
                </div>

                {/* Button */}
                <div className="w-full mt-auto">
                  {isOwned ? (
                    <div 
                      className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2"
                      style={{
                        background: 'rgba(34,197,94,0.15)',
                        border: '1px solid rgba(34,197,94,0.25)',
                      }}
                    >
                      <Check size={14} className="text-green-400" /> 
                      <span className="text-green-400 font-bold text-xs">Куплено</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleBuy(item)}
                      disabled={isDisabled || isPurchasing}
                      className="w-full py-2.5 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        background: isDisabled || isPurchasing
                          ? 'rgba(255,255,255,0.05)'
                          : 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 100%)',
                        border: isDisabled || isPurchasing
                          ? '1px solid rgba(255,255,255,0.05)'
                          : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: isDisabled || isPurchasing
                          ? 'none'
                          : '0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        color: isDisabled || isPurchasing ? 'rgba(255,255,255,0.3)' : 'white',
                      }}
                    >
                      {isPurchasing ? (
                        <span className="animate-pulse">...</span>
                      ) : isHpFull ? (
                        <span>HP Полно</span>
                      ) : (
                        <>
                          <Coins size={12} fill="currentColor" className={canAfford ? 'text-yellow-300' : 'text-white/30'} />
                          <span>{item.price}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PREMIUM BANNER - iOS 26 Style */}
      <div className="px-4 mt-4">
        <div 
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 8px 32px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Shine */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl pointer-events-none" />
          
          {/* Animated orbs */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/30 blur-[40px] rounded-full animate-pulse"></div>
          <div className="absolute -left-5 -bottom-5 w-24 h-24 bg-indigo-500/30 blur-[30px] rounded-full"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Star className="text-yellow-400" fill="currentColor" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-0.5">Премиум</h3>
                <p className="text-purple-200 text-xs font-medium">Все скины + ∞ жизни</p>
              </div>
            </div>
            <button 
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                color: '#6366f1',
                boxShadow: '0 4px 20px rgba(255,255,255,0.3)',
              }}
            >
              Скоро
            </button>
          </div>
        </div>
      </div>

      {/* MYSTERY BOX REWARD MODAL - iOS 26 Style */}
      {showRewardModal && mysteryReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div 
            className="max-w-sm w-full relative overflow-hidden rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 100%)',
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 80px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Shine */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[2.5rem] pointer-events-none" />
            
            {/* Sparkle effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-6 left-6 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-10 right-10 w-4 h-4 bg-purple-400 rounded-full animate-ping delay-100"></div>
              <div className="absolute bottom-16 left-10 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-10 right-14 w-3 h-3 bg-cyan-400 rounded-full animate-ping delay-300"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div 
                className="w-28 h-28 mx-auto mb-6 rounded-3xl flex items-center justify-center animate-bounce"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.4) 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 40px rgba(168,85,247,0.5)',
                }}
              >
                <Gift className="text-white drop-shadow-lg" size={56} />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-3 flex items-center justify-center gap-3">
                <Sparkles className="text-yellow-400" size={28} />
                СЮРПРИЗ!
                <Sparkles className="text-yellow-400" size={28} />
              </h2>
              
              <p className="text-2xl font-bold text-white/90 mb-6">
                {mysteryReward.message}
              </p>
              
              <div 
                className="rounded-2xl p-4 mb-6"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p className="text-sm text-white/70">
                  {mysteryReward.type === 'coins' && `Монеты добавлены к балансу!`}
                  {mysteryReward.type === 'xp' && `Опыт добавлен! Проверь уровень!`}
                  {mysteryReward.type === 'hp' && `Жизни восстановлены!`}
                </p>
              </div>
              
              <button 
                onClick={closeRewardModal}
                className="w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                  color: '#6366f1',
                  boxShadow: '0 4px 25px rgba(255,255,255,0.3)',
                }}
              >
                Круто! 🎉
              </button>
            </div>
            
            {/* Close button */}
            <button 
              onClick={closeRewardModal}
              className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <X size={20} className="text-white/70" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
