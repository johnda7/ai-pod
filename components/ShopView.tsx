
import React, { useState, useEffect } from 'react';
import { SHOP_ITEMS } from '../constants';
import { User, ShopItem } from '../types';
import { ShoppingBag, Coins, Heart, Snowflake, Gift, Crown, Check, Sparkles, X } from 'lucide-react';

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
    
    // Check immediately and set up interval
    checkReward();
    const interval = setInterval(checkReward, 300);
    return () => clearInterval(interval);
  }, []);

  const closeRewardModal = () => {
    setShowRewardModal(false);
    setMysteryReward(null);
    // Refresh user data after closing modal to show updated coins/xp/hp
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
      case 'hp_potion': return <Heart fill="currentColor" className="text-rose-500" size={32} />;
      case 'streak_freeze': return <Snowflake className="text-sky-400" size={32} />;
      case 'mystery_box': return <Gift className="text-purple-400" size={32} />;
      case 'frame_gold': return <Crown className="text-yellow-400" size={32} />;
      default: return <ShoppingBag className="text-slate-400" size={32} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] pb-40 animate-in fade-in duration-500 text-white">
      
      {/* HEADER - Updated pt-28 to avoid overlap with Telegram badges */}
      <div className="sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-6 pt-28 pb-6 shadow-xl">
         <div className="flex justify-between items-center">
             <div>
                 <h1 className="text-3xl font-black text-white tracking-tight">Магазин</h1>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Потрать с умом</p>
             </div>
             <div className="flex items-center gap-2 bg-[#151925] px-4 py-2 rounded-2xl border border-yellow-500/20">
                 <Coins className="text-yellow-400" fill="currentColor" size={20} />
                 <span className="text-xl font-black text-yellow-400 font-mono">{user.coins}</span>
             </div>
         </div>
      </div>

      {/* ITEMS GRID */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SHOP_ITEMS.map((item) => {
             const canAfford = user.coins >= item.price;
             const isHpFull = item.id === 'hp_potion' && user.hp === user.maxHp;
             const isOwned = user.inventory.includes(item.id) && item.type === 'COSMETIC';
             
             // Count how many of this item user has (for consumables like streak_freeze)
             const ownedCount = user.inventory.filter(id => id === item.id).length;
             const hasInInventory = ownedCount > 0;
             
             // Disable logic: cosmetics can only be bought once, consumables can be bought multiple times
             const isDisabled = !canAfford || isHpFull || isOwned;

             return (
               <div key={item.id} className="bg-[#151925] rounded-[2rem] p-6 border border-white/5 relative group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                   {/* Hover Effect */}
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                   {/* Owned Badge for consumables */}
                   {hasInInventory && item.type === 'POWERUP' && item.id === 'streak_freeze' && (
                       <div className="absolute top-4 right-4 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-xs font-bold border border-sky-500/30 z-20">
                           В инвентаре: {ownedCount}
                       </div>
                   )}

                   <div className="relative z-10 flex flex-col items-center text-center gap-4">
                       <div className="w-20 h-20 rounded-full bg-[#0A0F1C] border border-white/5 flex items-center justify-center shadow-lg text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 relative">
                           {/* Glow behind icon */}
                           <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="relative z-10">{getIcon(item.id)}</div>
                       </div>
                       
                       <div>
                           <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
                           <p className="text-slate-500 text-xs mt-1 font-medium">{item.description}</p>
                       </div>

                       <div className="w-full mt-2">
                          {isOwned ? (
                              <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold uppercase text-xs flex items-center justify-center gap-2 cursor-default">
                                  <Check size={16} /> Куплено
                              </button>
                          ) : (
                              <button 
                                onClick={() => handleBuy(item)}
                                disabled={isDisabled || isPurchasing}
                                className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
                                    ${isDisabled || isPurchasing
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'}
                                `}
                              >
                                  {isPurchasing ? (
                                      <span className="animate-pulse">Покупка...</span>
                                  ) : isHpFull ? (
                                      <span>HP Полно</span>
                                  ) : (
                                    <>
                                      <Coins size={14} fill="currentColor" className={canAfford ? 'text-yellow-300' : 'text-slate-400'} />
                                      {item.price}
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

      {/* BANNER */}
      <div className="px-6 mt-4">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-[2rem] p-6 relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/30 blur-[50px] rounded-full"></div>
              <div className="relative z-10 flex items-center justify-between">
                  <div>
                      <h3 className="text-xl font-black text-white mb-1">Премиум доступ</h3>
                      <p className="text-purple-200 text-xs font-bold">Открой все скины и бесконечные жизни</p>
                  </div>
                  <button className="px-4 py-2 bg-white text-purple-900 font-black text-xs uppercase rounded-xl hover:bg-purple-50 transition-colors shadow-lg">
                      Скоро
                  </button>
              </div>
          </div>
      </div>

      {/* MYSTERY BOX REWARD MODAL */}
      {showRewardModal && mysteryReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-purple-900 to-indigo-950 rounded-[2rem] p-8 max-w-sm w-full relative overflow-hidden border border-purple-500/30 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Sparkle effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-8 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-100"></div>
              <div className="absolute bottom-12 left-8 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-8 right-12 w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-300"></div>
            </div>
            
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50 animate-bounce">
                <Gift className="text-white" size={48} />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="text-yellow-400" size={24} />
                СЮРПРИЗ!
                <Sparkles className="text-yellow-400" size={24} />
              </h2>
              
              <p className="text-2xl font-bold text-purple-200 mb-6">
                {mysteryReward.message}
              </p>
              
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-300">
                  {mysteryReward.type === 'coins' && `Монеты добавлены к вашему балансу!`}
                  {mysteryReward.type === 'xp' && `Опыт добавлен! Проверь свой уровень!`}
                  {mysteryReward.type === 'hp' && `Жизни восстановлены!`}
                </p>
              </div>
              
              <button 
                onClick={closeRewardModal}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-wider text-sm hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30 active:scale-95"
              >
                Круто! 🎉
              </button>
            </div>
            
            {/* Close button */}
            <button 
              onClick={closeRewardModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};