

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
  level: number;
  hp: number; // Health Points (Lives)
  maxHp: number;
  avatarUrl: string;
  streak: number;
  completedTaskIds: string[]; 
  learningStyle?: LearningStyle;
  interest: string;
}

// --- NEW LESSON ENGINE TYPES ---

export type SlideType = 'THEORY' | 'QUIZ' | 'SORTING' | 'PUZZLE' | 'VIDEO' | 'MATCHING' | 'INPUT';

export interface BaseSlide {
  id: string;
  type: SlideType;
  title?: string; // Optional header
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
  explanation?: string; // Shown after answer
}

export interface SortingItem {
  id: string;
  text: string;
  emoji: string;
  category: 'LEFT' | 'RIGHT'; // e.g., 'BAD' | 'GOOD'
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
  correctSentence: string[]; // Array of words in order
  distractorWords?: string[]; // Extra words to confuse
}

export interface PairItem {
  id: string;
  left: string;
  right: string; // The matching pair
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

export type LessonSlide = TheorySlide | QuizSlide | SortingSlide | PuzzleSlide | VideoSlide | MatchingSlide | InputSlide;

export interface Task {
  id: string;
  week: number;
  title: string;
  description: string;
  xpReward: number;
  isLocked?: boolean;
  isBoss?: boolean; // New visual style for boss levels
  slides: LessonSlide[]; // The content flow
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
  category: 'SLEEP' | 'FOCUS' | 'ANXIETY';
  duration: string;
  color: string;
}

export interface Soundscape {
  id: string;
  title: string;
  iconType: 'RAIN' | 'FOREST' | 'OCEAN' | 'FIRE' | 'WIND';
  color: string;
  youtubeId: string;
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