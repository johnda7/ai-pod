import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Star, Trophy, Zap, Target, Users, Lightbulb, Heart, Shield, Coins, Brain, MessageCircle, Clock, Check, Play, Lock } from 'lucide-react';

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
  image: string;
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
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
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

const LESSON_TYPE_ICONS = {
  video: Play,
  exercise: Target,
  quiz: Brain,
  practice: Users,
};

export const LifeSkillsModule: React.FC<LifeSkillsModuleProps> = ({ isOpen, onClose, onComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('life_skills_progress');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

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
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        {/* Beautiful Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0f2a 50%, #0a0a1a 100%)',
            }}
          />
          
          {/* Aurora effects */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.25) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 right-0 w-1/2 h-1/2"
            style={{
              background: 'radial-gradient(ellipse at 100% 20%, rgba(139,92,246,0.2) 0%, transparent 60%)',
              filter: 'blur(50px)',
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />

          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 pt-14 pb-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
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
                  className="w-14 h-14 rounded-xl overflow-hidden relative"
                  style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop"
                    alt="Life Skills"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Life Skills</h1>
                  <p className="text-white/50 text-xs">Навыки для жизни</p>
                </div>
              </div>
              
              <button
                onClick={selectedSkill ? () => setSelectedSkill(null) : onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                {selectedSkill ? (
                  <ChevronRight size={20} className="text-white rotate-180" />
                ) : (
                  <X size={20} className="text-white" />
                )}
              </button>
            </div>

            {/* Total Progress */}
            {!selectedSkill && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/50">Общий прогресс</span>
                    <span className="text-indigo-400 font-bold">{totalProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
                      style={{
                        background: selectedCategory === cat.id 
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : 'rgba(255,255,255,0.05)',
                        color: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.5)',
                        boxShadow: selectedCategory === cat.id ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
                      }}
                    >
                      <span>{cat.emoji}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 pb-40 overflow-y-auto h-[calc(100vh-280px)]">
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
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedSkill(skill)}
                    className="rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
                    style={{
                      boxShadow: `0 8px 32px ${skill.color}20`,
                    }}
                  >
                    {/* Image */}
                    <div className="h-28 relative">
                      <img 
                        src={skill.image}
                        alt={skill.name}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(180deg, transparent 0%, ${skill.color}90 100%)`,
                        }}
                      />
                      
                      {/* Progress badge */}
                      {progress > 0 && (
                        <div 
                          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: isComplete ? '#22c55e' : 'rgba(0,0,0,0.5)',
                            color: 'white',
                          }}
                        >
                          {isComplete ? '✓' : `${progress}%`}
                        </div>
                      )}
                      
                      {/* Emoji */}
                      <div className="absolute bottom-2 left-3">
                        <span className="text-3xl drop-shadow-lg">{skill.emoji}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div 
                      className="p-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      }}
                    >
                      <h4 className="text-white font-bold text-sm mb-0.5 truncate">{skill.name}</h4>
                      <p className="text-white/40 text-[10px] mb-2 line-clamp-1">{skill.description}</p>
                      
                      {/* Progress bar */}
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${progress}%`,
                            background: skill.color,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-white/30 text-[9px]">{skill.lessons.length} уроков</span>
                        <span className="text-[9px] font-bold" style={{ color: skill.color }}>{progress}%</span>
                      </div>
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
              {/* Skill Header Card */}
              <div 
                className="rounded-3xl overflow-hidden mb-4"
                style={{ boxShadow: `0 8px 32px ${selectedSkill.color}30` }}
              >
                <div className="h-40 relative">
                  <img 
                    src={selectedSkill.image}
                    alt={selectedSkill.name}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${selectedSkill.color}95 100%)`,
                    }}
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{selectedSkill.emoji}</span>
                      <div>
                        <h2 className="text-white font-bold text-xl">{selectedSkill.name}</h2>
                        <p className="text-white/70 text-sm">{selectedSkill.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  }}
                >
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
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                {selectedSkill.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isLocked = index > 0 && !completedLessons.includes(selectedSkill.lessons[index - 1].id);
                  const TypeIcon = LESSON_TYPE_ICONS[lesson.type];
                  
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => !isLocked && handleLessonComplete(lesson)}
                      disabled={isLocked}
                      className={`w-full p-4 rounded-2xl text-left transition-all ${
                        isLocked ? 'opacity-50' : 'active:scale-[0.98]'
                      }`}
                      style={{
                        background: isCompleted 
                          ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: isCompleted 
                              ? '#22c55e' 
                              : isLocked 
                                ? 'rgba(255,255,255,0.05)' 
                                : `${selectedSkill.color}20`,
                          }}
                        >
                          {isCompleted ? (
                            <Check size={20} className="text-white" />
                          ) : isLocked ? (
                            <Lock size={18} className="text-white/30" />
                          ) : (
                            <TypeIcon size={20} style={{ color: selectedSkill.color }} />
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
                            <span className="text-xs flex items-center gap-1" style={{ color: '#fbbf24' }}>
                              <Zap size={10} />
                              +{lesson.xp} XP
                            </span>
                          </div>
                        </div>
                        
                        {!isLocked && !isCompleted && (
                          <div 
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                              background: `${selectedSkill.color}20`,
                              color: selectedSkill.color,
                            }}
                          >
                            Начать
                          </div>
                        )}
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
