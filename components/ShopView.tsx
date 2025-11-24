
import React from 'react';
import { SHOP_ITEMS } from '../constants';
import { User, ShopItem } from '../types';
import { ShoppingBag, Coins, Heart, Snowflake, Gift, Crown, Check } from 'lucide-react';

interface ShopViewProps {
  user: User;
  onBuy: (item: ShopItem) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ user, onBuy }) => {
  
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
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 pt-10 pb-6">
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
             const isDisabled = !canAfford || isHpFull || isOwned;

             return (
               <div key={item.id} className="bg-[#151925] rounded-[2rem] p-6 border border-white/5 relative group overflow-hidden">
                   {/* Hover Effect */}
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                   <div className="relative z-10 flex flex-col items-center text-center gap-4">
                       <div className="w-20 h-20 rounded-full bg-[#0A0F1C] border border-white/5 flex items-center justify-center shadow-lg text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                           {getIcon(item.id)}
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
                                onClick={() => onBuy(item)}
                                disabled={isDisabled}
                                className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
                                    ${isDisabled 
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'}
                                `}
                              >
                                  {isHpFull ? (
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
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-[2rem] p-6 relative overflow-hidden border border-white/10">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/30 blur-[50px] rounded-full"></div>
              <div className="relative z-10 flex items-center justify-between">
                  <div>
                      <h3 className="text-xl font-black text-white mb-1">Премиум доступ</h3>
                      <p className="text-purple-200 text-xs font-bold">Открой все скины и бесконечные жизни</p>
                  </div>
                  <button className="px-4 py-2 bg-white text-purple-900 font-black text-xs uppercase rounded-xl hover:bg-purple-50">
                      Скоро
                  </button>
              </div>
          </div>
      </div>

    </div>
  );
};
