
import React, { useState } from 'react';
import { LECTURES } from '../constants';
import { Play, BookOpen, Clock, List, Heart, MessageCircle, Sparkles, ChevronRight, Brain, Users, Shield, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export const ParentDashboard: React.FC = () => {
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);

  return (
    <div className="px-4 pb-24 pt-4 min-h-screen bg-gradient-to-b from-teal-950 to-slate-950">
      
      {/* Катино приветствие */}
      <motion.div 
        className="relative overflow-hidden rounded-3xl p-6 mb-8 border border-teal-500/30 bg-gradient-to-br from-teal-900/50 to-emerald-900/50 backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Привет, родитель! 💜</h2>
              <p className="text-teal-300 text-sm">Я — Катя Карпенко</p>
            </div>
          </div>
          <p className="text-teal-100 text-sm leading-relaxed mb-4">
            Эта книга для вас, чтобы лучше понимать, что происходит с вашими подростками. 
            Почему они кричат, злятся, отдаляются? Почему закрываются в комнате на три замка?
          </p>
          <div className="bg-teal-500/20 rounded-2xl p-4 border border-teal-500/30">
            <p className="text-teal-200 text-sm italic">
              "С вашим подростком всё нормально. И с вами тоже. Давайте разберёмся вместе."
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { icon: Brain, title: 'Их мозг ещё растёт', desc: 'Это не лень — это нейробиология', color: 'from-purple-500 to-indigo-600' },
          { icon: Shield, title: 'Сепарация важна', desc: 'Отдаление — часть взросления', color: 'from-teal-500 to-emerald-600' },
          { icon: MessageCircle, title: 'Слушайте, не спасайте', desc: 'Иногда нужно просто быть рядом', color: 'from-pink-500 to-rose-600' },
          { icon: Target, title: 'Их цели, не ваши', desc: 'Навязанное — саботируется', color: 'from-amber-500 to-orange-600' },
        ].map((tip, idx) => (
          <motion.div
            key={idx}
            className={`p-4 rounded-2xl bg-gradient-to-br ${tip.color} bg-opacity-20 border border-white/10`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <tip.icon className="w-6 h-6 text-white mb-2" />
            <h4 className="text-white font-bold text-sm mb-1">{tip.title}</h4>
            <p className="text-white/70 text-xs">{tip.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Lectures */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <h3 className="text-white font-bold text-lg">Лекции курса</h3>
        </div>

        <div className="space-y-4">
          {LECTURES.map((lecture, idx) => (
            <motion.div 
              key={lecture.id} 
              className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <div className="relative h-40 w-full">
                <img src={lecture.thumbnail} alt={lecture.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                <button className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center pl-1 shadow-lg shadow-teal-500/30 transform group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-white" fill="currentColor" />
                  </div>
                </button>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-white bg-teal-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Неделя {lecture.week}
                    </span>
                    <span className="text-[10px] font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
                      {lecture.duration}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-bold text-white text-base mb-2">{lecture.title}</h4>
                <p className="text-sm text-slate-400 mb-3">{lecture.description}</p>

                {lecture.topics && lecture.topics.length > 0 && (
                  <div className="space-y-2">
                    {lecture.topics.slice(0, 3).map((topic, tidx) => (
                      <div key={tidx} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                        <span>{topic}</span>
                      </div>
                    ))}
                    {lecture.topics.length > 3 && (
                      <button className="text-teal-400 text-sm font-medium flex items-center gap-1 hover:text-teal-300 transition-colors">
                        Ещё {lecture.topics.length - 3} темы
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Катины советы */}
      <motion.div 
        className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-6 border border-purple-500/30 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-bold">Советы от Кати</h3>
        </div>
        <div className="space-y-3">
          {[
            'Не пытайтесь быть идеальными родителями — будьте настоящими',
            'Признавайте свои ошибки — это учит детей делать то же',
            'Интересуйтесь их миром, даже если не понимаете',
            'Помните: сепарация — это не отвержение, а взросление'
          ].map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-purple-100">
              <span className="text-purple-400">💜</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Support CTA */}
      <motion.div 
        className="bg-slate-900/50 p-6 rounded-3xl border border-white/10 text-center backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-white text-lg mb-2">Нужна поддержка?</h3>
        <p className="text-sm text-slate-400 mb-4">
          Наши кураторы готовы ответить на вопросы и помочь разобраться в сложных ситуациях.
        </p>
        <button className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-bold hover:from-teal-400 hover:to-emerald-500 transition-all shadow-lg shadow-teal-500/30">
          Написать куратору
        </button>
      </motion.div>
    </div>
  );
};
