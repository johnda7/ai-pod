

export enum UserRole {
  TEEN = 'TEEN',
  PARENT = 'PARENT',
  CURATOR = 'CURATOR',
}

export type LearningStyle = 'VISUAL' | 'AUDIO' | 'KINESTHETIC';

export interface User {
  id: string; // Internal UUID
  telegramId?: number; // Telegram User ID
  username?: string; // Telegram Username
  name: string;
  role: UserRole;
  xp: number;
  level: number;
  avatarUrl: string;
  streak: number;
  completedTaskIds: string[]; // Legacy local check
  learningStyle?: LearningStyle;
  interest: string;
}

export interface TaskProgress {
  userId: string;
  taskId: string;
  completedAt: string; // ISO Date
  xpEarned: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TaskContent {
  videoUrl?: string;
  videoDuration?: string;
  questions?: QuizQuestion[];
  actionSteps?: string[];
  topics?: string[];
  adaptedText?: string;
}

export interface Task {
  id: string;
  week: number;
  title: string;
  description: string;
  xpReward: number;
  type: 'VIDEO' | 'QUIZ' | 'ACTION' | 'UPLOAD' | 'AUDIO';
  learningStyle: LearningStyle; 
  isLocked?: boolean;
  position: { x: number; y: number }; 
  content?: TaskContent;
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

// Used for Mock Data in constants.ts
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

// For Curator View
export interface StudentStats {
  id: string;
  name: string;
  avatar: string;
  week1Progress: number; // 0-100
  week2Progress: number;
  week3Progress: number;
  status: 'active' | 'risk' | 'inactive';
  lastLogin: string;
  totalXp: number;
  tasksCompletedCount: number;
}