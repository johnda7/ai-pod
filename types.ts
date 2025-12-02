
export enum UserRole {
  TEEN = 'TEEN',
  PARENT = 'PARENT',
  CURATOR = 'CURATOR',
}

export type LearningStyle = 'VISUAL' | 'AUDIO' | 'KINESTHETIC';

export interface User {
  id: string; 
  telegramId?: number; 
  username?: string; 
  name: string;
  role: UserRole;
  xp: number;
  coins: number; 
  level: number;
  hp: number; 
  maxHp: number;
  avatarUrl: string;
  streak: number;
  completedTaskIds: string[]; 
  learningStyle?: LearningStyle;
  interest: string;
  inventory: string[]; 
  league: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
}

// --- NEW LESSON ENGINE TYPES ---

export type SlideType = 'THEORY' | 'QUIZ' | 'SORTING' | 'PUZZLE' | 'VIDEO' | 'MATCHING' | 'INPUT' | 'POLL' | 'GAME';

export interface BaseSlide {
  id: string;
  type: SlideType;
  title?: string; 
}

export interface TheorySlide extends BaseSlide {
  type: 'THEORY';
  content: string;
  imageUrl?: string;
  buttonText?: string;
}

export interface VideoSlide extends BaseSlide {
  type: 'VIDEO';
  videoUrl: string;
  duration: string;
  description: string;
}

export interface QuizSlide extends BaseSlide {
  type: 'QUIZ';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string; 
}

export interface PollSlide extends BaseSlide {
  type: 'POLL';
  question: string;
  options: string[]; 
}

export interface SortingItem {
  id: string;
  text: string;
  emoji: string;
  category: 'LEFT' | 'RIGHT'; 
}

export interface SortingSlide extends BaseSlide {
  type: 'SORTING';
  question: string;
  leftCategoryLabel: string;
  rightCategoryLabel: string;
  items: SortingItem[];
}

export interface PuzzleSlide extends BaseSlide {
  type: 'PUZZLE';
  question: string;
  correctSentence: string[]; 
  distractorWords?: string[]; 
}

export interface PairItem {
  id: string;
  left: string;
  right: string; 
}

export interface MatchingSlide extends BaseSlide {
  type: 'MATCHING';
  question: string;
  pairs: PairItem[];
}

export interface InputSlide extends BaseSlide {
  type: 'INPUT';
  question: string;
  placeholder: string;
  minLength?: number;
}

export interface GameSlide extends BaseSlide {
  type: 'GAME';
  gameType: 'FOCUS_DEFENDER' | 'NEURO_MATCH' | 'REACTION_TIME' | 'BUBBLE_POP' | 'EMOTION_MATCH' | 'BREATH_SYNC' | 'THERMITE_GRID';
  instructions: string;
  durationSeconds?: number; // For timed games
  targetScore?: number;
}

export type LessonSlide = TheorySlide | QuizSlide | SortingSlide | PuzzleSlide | VideoSlide | MatchingSlide | InputSlide | PollSlide | GameSlide;

export interface Task {
  id: string;
  week: number;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number; 
  isLocked?: boolean;
  isBoss?: boolean; 
  slides: LessonSlide[]; 
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  type: 'POWERUP' | 'COSMETIC';
}

// --- LEGACY/OTHER TYPES ---

export interface TaskProgress {
  userId: string;
  taskId: string;
  completedAt: string; 
  xpEarned: number;
}

export interface Lecture {
  id: string;
  week: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  topics?: string[];
}

export interface Meditation {
  id: string;
  title: string;
  category: 'SLEEP' | 'FOCUS' | 'ANXIETY' | 'ENERGY';
  duration: string;
  color: string;
  youtubeId?: string;
}

export interface Soundscape {
  id: string;
  title: string;
  iconType: 'RAIN' | 'FOREST' | 'OCEAN' | 'FIRE' | 'WIND' | 'CAFE' | 'THUNDER' | 'NIGHT';
  color: string;
  youtubeId: string;
}

// Система достижений
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'LEARNING' | 'STREAK' | 'SOCIAL' | 'SPECIAL';
  requirement: {
    type: 'TASKS_COMPLETED' | 'STREAK_DAYS' | 'XP_EARNED' | 'COINS_EARNED' | 'BOSS_DEFEATED' | 'WEEK_COMPLETED';
    value: number;
  };
  reward: {
    xp?: number;
    coins?: number;
  };
}

export interface Quote {
  text: string;
  author: string;
  movie?: string;
  videoUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'katya';
  text: string;
  timestamp: number;
}

export interface StudentProgress {
  id: string;
  name: string;
  avatar: string;
  week1Progress: number;
  week2Progress: number;
  week3Progress: number;
  status: 'active' | 'risk' | 'inactive';
  lastLogin: string;
  tasksCompleted: number;
}

export interface StudentStats {
  id: string;
  name: string;
  avatar: string;
  week1Progress: number; 
  week2Progress: number;
  week3Progress: number;
  status: 'active' | 'risk' | 'inactive';
  lastLogin: string;
  totalXp: number;
  tasksCompletedCount: number;
}
