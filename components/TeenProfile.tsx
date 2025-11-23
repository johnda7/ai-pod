import React from 'react';
import { User } from '../types';
import { Star, Award, Target, TrendingUp, Calendar, Flame } from 'lucide-react';

interface TeenProfileProps {
  user: User;
}

export const TeenProfile: React.FC<TeenProfileProps> = ({ user }) => {
  const level = Math.floor(user.xp / 500) + 1;
  const xpForNextLevel = level * 500;
  const xpProgress = (user.xp % 500) / 500 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-24">
      {/* Header with Avatar */}
      <div className="bg-white rounded-b-[3rem] shadow-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 ring-4 ring-indigo-100">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>

          {/* Name & Level */}
          <h1 className="text-3xl font-black text-slate-800 mb-2">{user.name}</h1>
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-full shadow-lg">
            <Star size={16} className="text-yellow-300" fill="currentColor" />
            <span className="text-white font-bold">Уровень {level}</span>
          </div>

          {/* XP Progress */}
          <div className="w-full max-w-xs mt-6">
            <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
              <span>{user.xp} XP</span>
              <span>{xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-2 font-medium">
              Ещё {xpForNextLevel - user.xp} XP до следующего уровня
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Tasks Completed */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Award className="text-amber-500" size={24} />
              <span className="text-3xl font-black text-slate-800">{user.completedTaskIds.length}</span>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Заданий</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Flame className="text-orange-500" size={24} />
              <span className="text-3xl font-black text-slate-800">{user.streak}</span>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Дней подряд</p>
          </div>
        </div>

        {/* Learning Style */}
        {user.learningStyle && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">Твой стиль обучения</p>
                <h3 className="text-2xl font-black">{
                  user.learningStyle === 'VISUAL' ? 'Визуал' :
                  user.learningStyle === 'AUDIO' ? 'Аудиал' :
                  'Кинестетик'
                }</h3>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              {user.learningStyle === 'VISUAL' 
                ? 'Ты лучше всего запоминаешь через картинки, схемы и видео. Мы подбираем визуальный контент специально для тебя!' 
                : user.learningStyle === 'AUDIO'
                ? 'Ты отлично воспринимаешь информацию на слух. Подкасты и аудио-уроки - твоё!'
                : 'Тебе важно всё попробовать на практике. Больше челленджей и реальных задач для тебя!'}
            </p>
          </div>
        )}

        {/* Interest */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Интерес</p>
              <h3 className="text-xl font-black text-slate-800">{user.interest}</h3>
            </div>
          </div>
          <p className="text-sm text-slate-600">Мы адаптируем все уроки под твои интересы!</p>
        </div>

        {/* Achievements Section */}
        <div className="mt-6">
          <h2 className="text-xl font-black text-slate-800 mb-4 px-2">Достижения</h2>
          <div className="grid grid-cols-3 gap-3">
            {user.completedTaskIds.length > 0 && (
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square">
                <Award size={32} className="text-white mb-2" fill="currentColor" />
                <p className="text-xs font-black text-white text-center">Первый Шаг</p>
              </div>
            )}
            {user.streak >= 7 && (
              <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square">
                <Flame size={32} className="text-white mb-2" fill="currentColor" />
                <p className="text-xs font-black text-white text-center">Огонь!</p>
              </div>
            )}
            {user.completedTaskIds.length >= 5 && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square">
                <Star size={32} className="text-white mb-2" fill="currentColor" />
                <p className="text-xs font-black text-white text-center">Суперзвезда</p>
              </div>
            )}
            {/* Placeholder locked achievements */}
            {[...Array(Math.max(0, 3 - [user.completedTaskIds.length > 0, user.streak >= 7, user.completedTaskIds.length >= 5].filter(Boolean).length))].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl p-4 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center aspect-square">
                <div className="w-8 h-8 bg-slate-200 rounded-full mb-2"></div>
                <p className="text-xs font-bold text-slate-400 text-center">Скоро</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
