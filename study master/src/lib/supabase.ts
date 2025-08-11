import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  study_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_subjects: string[];
  daily_goal: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  subject_area: string;
  difficulty_level: number;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  topic_id: string;
  created_by: string;
  front_text: string;
  back_text: string;
  tags: string[];
  difficulty: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  topic?: Topic;
}

export interface SRSItem {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  created_at: string;
  flashcard?: Flashcard;
}

export interface QuizTemplate {
  id: string;
  title: string;
  description: string | null;
  topic_id: string;
  created_by: string;
  time_limit_minutes: number | null;
  question_count: number;
  difficulty_level: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  topic?: Topic;
  questions?: Question[];
}

export interface Question {
  id: string;
  topic_id: string;
  quiz_template_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  correct_answer: string;
  options: Record<string, any> | null;
  explanation: string | null;
  difficulty: number;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_template_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number | null;
  is_timed: boolean;
  mode: 'practice' | 'exam' | 'review';
  quiz_template?: QuizTemplate;
}

export interface QuizResponse {
  id: string;
  quiz_attempt_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken_seconds: number | null;
  created_at: string;
  question?: Question;
}

export interface StudySession {
  id: string;
  user_id: string;
  topic_id: string;
  session_type: 'flashcards' | 'quiz' | 'reading' | 'mixed';
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  cards_reviewed: number;
  questions_answered: number;
  accuracy_rate: number | null;
  topic?: Topic;
}

export interface UserProgress {
  id: string;
  user_id: string;
  topic_id: string;
  mastery_level: number;
  total_time_minutes: number;
  cards_mastered: number;
  quizzes_completed: number;
  average_score: number;
  streak_days: number;
  last_activity_date: string;
  updated_at: string;
  topic?: Topic;
}