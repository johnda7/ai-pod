import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, Trophy, Users, Heart, Star, 
  ChevronRight, Gift, Medal, Crown, Sparkles,
  GraduationCap, Target, MessageCircle, Clock,
  CheckCircle, Lock
} from 'lucide-react';
import { hapticLight, hapticSuccess } from '../services/telegramService';

interface ParentZoneProps {
  isOpen: boolean;
  onClose: () => void;
}

// 🏆 ЧЕЛЛЕНДЖ ДЛЯ РОДИТЕЛЕЙ: Призы - книги Кати
const PARENT_CHALLENGE_PRIZES = [
  { 
    place: 1, 
    prize: '📚 ГЛАВНЫЙ ПРИЗ', 
    description: 'Книга "Шаг к себе" + личная консультация с Катей (30 мин)',
    color: 'from-yellow-400 to-amber-500',
    icon: '👑'
  },
  { 
    place: 2, 
    prize: '📖 2 МЕСТО', 
    description: 'Книга "Шаг к себе" с автографом + видео-разбор',
    color: 'from-gray-300 to-gray-400',
    icon: '🥈'
  },
  { 
    place: 3, 
    prize: '📕 3 МЕСТО', 
    description: 'Книга "Шаг к себе" с автографом',
    color: 'from-amber-600 to-amber-700',
    icon: '🥉'
  },
  { 
    place: '4-5', 
    prize: '📗 ТОП-5', 
    description: 'Книга "Шаг к себе" (электронная версия)',
    color: 'from-purple-400 to-purple-600',
    icon: '⭐'
  },
];

// Мок-данные лидерборда родителей
const PARENT_LEADERBOARD = [
  { id: '1', name: 'Мама Маши', points: 580, avatar: '👩' },
  { id: '2', name: 'Папа Артёма', points: 520, avatar: '👨' },
  { id: '3', name: 'Мама Даши', points: 490, avatar: '👩‍🦰' },
  { id: '4', name: 'Папа Максима', points: 450, avatar: '🧔' },
  { id: '5', name: 'Мама Алины', points: 420, avatar: '👱‍♀️' },
];

// Модули для родителей из книги Кати
const PARENT_MODULES = [
  {
    id: 'understanding',
    title: 'Понимание подростка',
    description: 'Как понять что происходит с вашим ребёнком',
    icon: '🧠',
    lessons: 5,
    points: 100,
    isLocked: false,
  },
  {
    id: 'communication',
    title: 'Эффективное общение',
    description: 'Как говорить чтобы подросток слышал',
    icon: '💬',
    lessons: 6,
    points: 120,
    isLocked: false,
  },
  {
    id: 'motivation',
    title: 'Мотивация без давления',
    description: 'Как вдохновлять не заставляя',
    icon: '🔥',
    lessons: 4,
    points: 80,
    isLocked: true,
  },
  {
    id: 'boundaries',
    title: 'Границы и свобода',
    description: 'Баланс контроля и доверия',
    icon: '🛡️',
    lessons: 5,
    points: 100,
    isLocked: true,
  },
  {
    id: 'emotions',
    title: 'Эмоции подростка',
    description: 'Что делать с перепадами настроения',
    icon: '💖',
    lessons: 4,
    points: 80,
    isLocked: true,
  },
  {
    id: 'crisis',
    title: 'Кризисные ситуации',
    description: 'Как помочь в сложные моменты',
    icon: '🆘',
    lessons: 3,
    points: 60,
    isLocked: true,
  },
];

// Советы дня для родителей
const DAILY_TIPS = [
  {
    title: 'Слушайте без оценок',
    content: 'Когда подросток делится переживаниями, просто слушайте. Не давайте советов сразу — сначала покажите что вы слышите.',
    author: 'Катя Карпенко',
  },
  {
    title: 'Признавайте чувства',
    content: '"Я понимаю, что тебе сейчас тяжело" — эта фраза творит чудеса. Подростку важно знать, что его чувства нормальны.',
    author: 'Катя Карпенко',
  },
  {
    title: 'Не сравнивайте',
    content: 'Сравнение с другими детьми — главный убийца самооценки. Сравнивайте ребёнка только с ним самим вчерашним.',
    author: 'Катя Карпенко',
  },
];

export const ParentZone: React.FC<ParentZoneProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'challenge' | 'progress'>('learn');
  const [parentPoints, setParentPoints] = useState(120);
  const [dailyTipIndex] = useState(Math.floor(Math.random() * DAILY_TIPS.length));
  
  if (!isOpen) return null;

  const dailyTip = DAILY_TIPS[dailyTipIndex];
  const userPosition = PARENT_LEADERBOARD.findIndex(u => u.points < parentPoints) + 1 || 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              border: '1px solid rgba(236,72,153,0.3)',
            }}
          >
            <GraduationCap className="text-pink-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Зона Родителей</h1>
            <p className="text-white/50 text-xs">По книге Кати Карпенко</p>
          </div>
        </div>
        
        {/* Points */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: 'rgba(236,72,153,0.15)',
              border: '1px solid rgba(236,72,153,0.3)',
            }}
          >
            <Star className="text-pink-400" size={16} fill="currentColor" />
            <span className="text-pink-300 font-bold">{parentPoints}</span>
          </div>
          
          <button 
            onClick={() => { hapticLight(); onClose(); }}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="text-white/70" size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4">
        {[
          { id: 'learn', label: 'Обучение', icon: BookOpen },
          { id: 'challenge', label: 'Челлендж', icon: Trophy },
          { id: 'progress', label: 'Прогресс', icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { hapticLight(); setActiveTab(tab.id as any); }}
            className="flex-1 py-3 px-4 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 100%)'
                : 'rgba(255,255,255,0.05)',
              border: activeTab === tab.id 
                ? '1px solid rgba(236,72,153,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* LEARN TAB */}
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Daily Tip */}
              <div 
                className="p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                  border: '1px solid rgba(236,72,153,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-pink-400" size={18} />
                  <span className="text-pink-300 font-semibold text-sm">Совет дня</span>
                </div>
                <h3 className="text-white font-bold mb-2">{dailyTip.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">{dailyTip.content}</p>
                <p className="text-white/40 text-xs italic">— {dailyTip.author}</p>
              </div>

              {/* Modules */}
              <h2 className="text-white font-bold text-lg mt-6 mb-3">📚 Модули обучения</h2>
              <div className="space-y-3">
                {PARENT_MODULES.map((module, index) => (
                  <motion.button
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !module.isLocked && hapticLight()}
                    disabled={module.isLocked}
                    className="w-full p-4 rounded-2xl text-left relative overflow-hidden"
                    style={{
                      background: module.isLocked 
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.05)',
                      border: module.isLocked
                        ? '1px solid rgba(255,255,255,0.05)'
                        : '1px solid rgba(255,255,255,0.1)',
                      opacity: module.isLocked ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          background: module.isLocked 
                            ? 'rgba(255,255,255,0.05)'
                            : 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                        }}
                      >
                        {module.isLocked ? <Lock size={24} className="text-white/30" /> : module.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{module.title}</h3>
                        <p className="text-white/50 text-sm">{module.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-white/40 text-xs">{module.lessons} уроков</span>
                          <span className="text-pink-400 text-xs font-medium">+{module.points} очков</span>
                        </div>
                      </div>
                      <ChevronRight className="text-white/30" size={20} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* CHALLENGE TAB */}
          {activeTab === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Challenge Banner */}
              <div
                className="rounded-3xl p-5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                  border: '1px solid rgba(236,72,153,0.3)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                    <Trophy className="text-pink-400" size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Родительский Челлендж</h2>
                    <p className="text-white/60 text-sm">Станьте лучшим родителем!</p>
                  </div>
                </div>
                
                {/* Timer */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 mb-4">
                  <Clock className="text-white/60" size={18} />
                  <span className="text-white/80 text-sm">До конца месяца:</span>
                  <span className="ml-auto text-pink-400 font-bold">21 день</span>
                </div>
                
                {/* Position */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Medal className="text-purple-400" size={18} />
                    <span className="text-white/80 text-sm">Ваша позиция:</span>
                  </div>
                  <span className="text-2xl font-black text-purple-400">#{userPosition}</span>
                </div>
              </div>
              
              {/* Prizes */}
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="text-pink-400" size={20} />
                Призы — книги Кати!
              </h3>
              
              <div className="space-y-3">
                {PARENT_CHALLENGE_PRIZES.map((prize, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: index < 3 ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${prize.color}`}
                      >
                        {prize.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{prize.prize}</div>
                        <div className="text-white/60 text-sm">{prize.description}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Leaderboard */}
              <h3 className="text-lg font-bold text-white mt-6 flex items-center gap-2">
                <Users className="text-blue-400" size={20} />
                Топ родителей
              </h3>
              
              <div className="space-y-2">
                {PARENT_LEADERBOARD.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: index === 0 
                        ? 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.05) 100%)'
                        : 'rgba(255,255,255,0.03)',
                      border: index === 0 
                        ? '1px solid rgba(236,72,153,0.3)'
                        : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-pink-500/20 text-pink-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-amber-600/20 text-amber-500' :
                      'bg-white/5 text-white/40'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="flex-1 text-white font-medium">{player.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="text-pink-400" size={16} fill="currentColor" />
                      <span className="text-pink-300 font-bold">{player.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PROGRESS TAB */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="text-3xl font-black text-pink-400">{parentPoints}</div>
                  <div className="text-white/50 text-sm">Очков</div>
                </div>
                <div 
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="text-3xl font-black text-purple-400">2</div>
                  <div className="text-white/50 text-sm">Урока пройдено</div>
                </div>
                <div 
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="text-3xl font-black text-blue-400">3</div>
                  <div className="text-white/50 text-sm">Дней подряд</div>
                </div>
                <div 
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="text-3xl font-black text-green-400">#{userPosition}</div>
                  <div className="text-white/50 text-sm">В рейтинге</div>
                </div>
              </div>

              {/* Child Progress */}
              <h3 className="text-lg font-bold text-white mt-6 flex items-center gap-2">
                <Heart className="text-rose-400" size={20} />
                Прогресс ребёнка
              </h3>
              
              <div 
                className="p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                    👧
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">Ваш ребёнок</h4>
                    <p className="text-green-400 text-sm">Уровень 1 • 320 XP</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Уроков пройдено</span>
                    <span className="text-white font-bold">2 / 28</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '7%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-white/60">Серия дней</span>
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                      🔥 0 дней
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Заработано монет</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      💰 405
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div 
                className="p-4 rounded-2xl mt-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <MessageCircle className="text-blue-400" size={16} />
                  Рекомендация от Кати
                </h4>
                <p className="text-white/60 text-sm">
                  Ваш ребёнок только начинает путь. Поддержите его — спросите сегодня что нового он узнал в приложении!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ParentZone;

