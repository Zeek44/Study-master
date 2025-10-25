export interface User {
  id: string;
  name: string;
  email: string;
  subscription_status: 'free' | 'premium';
  created_at: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
  reviewCount: number;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  processed: boolean;
}

export interface StudySession {
  id: string;
  type: 'flashcard' | 'quiz' | 'document_review';
  duration: number;
  accuracy?: number;
  completed_at: string;
}

export interface AdminUser extends User {
  documents_count: number;
}

export interface SystemStats {
  totalUsers: number;
  premiumUsers: number;
  totalDocuments: number;
  activeToday: number;
}