export interface User {
  name: string;
  email?: string; // Added email for Google Auth simulation
  photoUrl?: string; // Added photo for profile
  isLoggedIn: boolean;
  stats?: {
    quizTaken: number;
    highestScore: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface Topic {
  id: string;
  title: string;
  icon: any; // Using Lucide icon component type generically
  shortDesc: string;
  fullContent: string;
  image: string;
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
}