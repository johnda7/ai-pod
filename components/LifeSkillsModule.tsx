import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Star, Trophy, Zap, Target, Users, Lightbulb, Heart, Shield, Coins, Brain, MessageCircle, Clock, Check } from 'lucide-react';

/**
 * LIFE SKILLS MODULE
 * Based on analysis of top youth programs:
 * - 4-H (Head, Heart, Hands, Health)
 * - Junior Achievement (Financial Literacy, Work Readiness, Entrepreneurship)
 * - Dale Carnegie Youth (Public Speaking, Leadership, Confidence)
 * - Girls Who Code (Problem Solving, Persistence)
 * - Tony Robbins (Goal Setting, State Management)
 */

interface LifeSkillsModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number, coins: number) => void;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'leadership' | 'financial' | 'emotional' | 'social' | 'productivity';
  color: string;
  lessons: SkillLesson[];
}

interface SkillLesson {
  id: string;
  title: string;
  duration: string;
  xp: number;
  type: 'video' | 'exercise' | 'quiz' | 'practice';
}

const LIFE_SKILLS: Skill[] = [
  {
    id: 'public_speaking',
    name: 'Публичные выступления',
    description: 'Говори уверенно перед любой аудиторией',
    emoji: '🎤',
    category: 'leadership',
    color: '#6366f1',
    lessons: [
      { id: 'ps1', title: 'Преодоление страха сцены', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'ps2', title: 'Структура выступления', duration: '7 мин', xp: 40, type: 'exercise' },
      { id: 'ps3', title: 'Язык тела', duration: '5 мин', xp: 35, type: 'practice' },
    ]
  },
  {
    id: 'money_basics',
    name: 'Финансовая грамотность',
    description: 'Управляй деньгами как профи',
    emoji: '💰',
    category: 'financial',
    color: '#22c55e',
    lessons: [
      { id: 'mb1', title: 'Бюджет подростка', duration: '6 мин', xp: 35, type: 'video' },
      { id: 'mb2', title: 'Сбережения vs Траты', duration: '5 мин', xp: 30, type: 'quiz' },
      { id: 'mb3', title: 'Первые инвестиции', duration: '8 мин', xp: 50, type: 'exercise' },
    ]
  },
  {
    id: 'emotional_iq',
    name: 'Эмоциональный интеллект',
    description: 'Понимай себя и других',
    emoji: '💜',
    category: 'emotional',
    color: '#ec4899',
    lessons: [
      { id: 'eq1', title: 'Распознавание эмоций', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'eq2', title: 'Управление гневом', duration: '6 мин', xp: 40, type: 'practice' },
      { id: 'eq3', title: 'Эмпатия', duration: '5 мин', xp: 35, type: 'exercise' },
    ]
  },
  {
    id: 'goal_setting',
    name: 'Постановка целей',
    description: 'От мечты к плану действий',
    emoji: '🎯',
    category: 'productivity',
    color: '#f59e0b',
    lessons: [
      { id: 'gs1', title: 'SMART цели', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'gs2', title: 'Разбиение на шаги', duration: '6 мин', xp: 35, type: 'exercise' },
      { id: 'gs3', title: 'Отслеживание прогресса', duration: '5 мин', xp: 30, type: 'practice' },
    ]
  },
  {
    id: 'networking',
    name: 'Нетворкинг',
    description: 'Строй полезные связи',
    emoji: '🤝',
    category: 'social',
    color: '#3b82f6',
    lessons: [
      { id: 'nw1', title: 'Первое впечатление', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'nw2', title: 'Искусство small talk', duration: '6 мин', xp: 35, type: 'practice' },
      { id: 'nw3', title: 'Поддержание контактов', duration: '5 мин', xp: 30, type: 'exercise' },
    ]
  },
  {
    id: 'problem_solving',
    name: 'Решение проблем',
    description: 'Мысли как инженер',
    emoji: '🧩',
    category: 'productivity',
    color: '#8b5cf6',
    lessons: [
      { id: 'pr1', title: 'Определение проблемы', duration: '5 мин', xp: 30, type: 'video' },
      { id: 'pr2', title: 'Генерация решений', duration: '7 мин', xp: 40, type: 'exercise' },
      { id: 'pr3', title: 'Принятие решений', duration: '5 мин', xp: 35, type: 'quiz' },
    ]
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Все', emoji: '📚' },
  { id: 'leadership', name: 'Лидерство', emoji: '👑' },
  { id: 'financial', name: 'Финансы', emoji: '💰' },
  { id: 'emotional', name: 'Эмоции', emoji: '💜' },
  { id: 'social', name: 'Общение', emoji: '🤝' },
  { id: 'productivity', name: 'Продуктивность', emoji: '⚡' },
];

export const LifeSkillsModule: React.FC<LifeSkillsModuleProps> = ({ isOpen, onClose, onComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('life_skills_progress');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem('life_skills_progress', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const filteredSkills = selectedCategory === 'all' 
    ? LIFE_SKILLS 
    : LIFE_SKILLS.filter(s => s.category === selectedCategory);

  const getSkillProgress = (skill: Skill) => {
    const completed = skill.lessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completed / skill.lessons.length) * 100);
  };

  const handleLessonComplete = (lesson: SkillLesson) => {
    if (completedLessons.includes(lesson.id)) return;
    
    setCompletedLessons([...completedLessons, lesson.id]);
    onComplete(lesson.xp, Math.floor(lesson.xp / 3));
  };

  const totalProgress = Math.round(
    (completedLessons.length / LIFE_SKILLS.reduce((acc, s) => acc + s.lessons.length, 0)) * 100
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-14 pb-4">
          <div 
            className="p-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                  }}
                >
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Life Skills</h1>
                  <p className="text-white/50 text-xs">Навыки для жизни</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Total Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/50">Общий прогресс</span>
                <span className="text-indigo-400 font-bold">{totalProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white/5 text-white/50'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-40 overflow-y-auto h-[calc(100vh-280px)]">
          {!selectedSkill ? (
            /* Skills Grid */
            <div className="grid grid-cols-2 gap-3">
              {filteredSkills.map((skill, index) => {
                const progress = getSkillProgress(skill);
                const isComplete = progress === 100;
                
                return (
                  <motion.button
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedSkill(skill)}
                    className="p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: isComplete 
                        ? `linear-gradient(135deg, ${skill.color}20 0%, ${skill.color}10 100%)`
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isComplete ? skill.color + '40' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${skill.color}20` }}
                    >
                      <span className="text-2xl">{skill.emoji}</span>
                    </div>
                    
                    <h4 className="text-white font-bold text-sm mb-1">{skill.name}</h4>
                    <p className="text-white/40 text-xs mb-3 line-clamp-2">{skill.description}</p>
                    
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/30 text-[10px]">{skill.lessons.length} уроков</span>
                      <span className="text-xs font-bold" style={{ color: skill.color }}>{progress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${progress}%`,
                          background: skill.color,
                        }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            /* Skill Detail */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => setSelectedSkill(null)}
                className="flex items-center gap-2 text-white/50 mb-4 hover:text-white transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
                <span className="text-sm">Назад</span>
              </button>

              <div 
                className="p-5 rounded-3xl mb-4"
                style={{
                  background: `linear-gradient(135deg, ${selectedSkill.color}20 0%, ${selectedSkill.color}10 100%)`,
                  border: `1px solid ${selectedSkill.color}30`,
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: `${selectedSkill.color}30` }}
                  >
                    <span className="text-4xl">{selectedSkill.emoji}</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-xl">{selectedSkill.name}</h2>
                    <p className="text-white/50 text-sm">{selectedSkill.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-xs">Прогресс</span>
                  <span className="font-bold" style={{ color: selectedSkill.color }}>
                    {getSkillProgress(selectedSkill)}%
                  </span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${getSkillProgress(selectedSkill)}%`,
                      background: selectedSkill.color,
                    }}
                  />
                </div>
              </div>

              {/* Lessons */}
              <div className="space-y-2">
                {selectedSkill.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isLocked = index > 0 && !completedLessons.includes(selectedSkill.lessons[index - 1].id);
                  
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => !isLocked && handleLessonComplete(lesson)}
                      disabled={isLocked}
                      className={`w-full p-4 rounded-2xl text-left transition-all ${
                        isLocked ? 'opacity-40' : 'active:scale-[0.98]'
                      }`}
                      style={{
                        background: isCompleted 
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : isLocked 
                                ? 'bg-white/5' 
                                : 'bg-white/10'
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={20} className="text-white" />
                          ) : (
                            <span className="text-white/50 font-bold">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-white/30 text-xs flex items-center gap-1">
                              <Clock size={10} />
                              {lesson.duration}
                            </span>
                            <span className="text-yellow-400 text-xs flex items-center gap-1">
                              <Zap size={10} />
                              +{lesson.xp} XP
                            </span>
                          </div>
                        </div>
                        
                        <ChevronRight size={16} className="text-white/30" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LifeSkillsModule;

