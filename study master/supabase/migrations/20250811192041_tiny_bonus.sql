-- StudyMaster AI Database Schema
-- This file contains the complete database structure for the StudyMaster AI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    study_level TEXT DEFAULT 'beginner',
    preferred_subjects TEXT[],
    daily_goal INTEGER DEFAULT 30, -- minutes
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Topics/Subjects
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_area TEXT NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    created_by UUID REFERENCES public.profiles(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id),
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    tags TEXT[],
    difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaced Repetition System
CREATE TABLE IF NOT EXISTS public.srs_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    ease_factor DECIMAL(3,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, flashcard_id)
);

-- Quiz Templates
CREATE TABLE IF NOT EXISTS public.quiz_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id),
    time_limit_minutes INTEGER,
    question_count INTEGER DEFAULT 10,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    quiz_template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'short_answer', 'essay', 'true_false')),
    correct_answer TEXT NOT NULL,
    options JSONB, -- For multiple choice options
    explanation TEXT,
    difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    tags TEXT[],
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5,2),
    total_questions INTEGER,
    correct_answers INTEGER,
    time_taken_seconds INTEGER,
    is_timed BOOLEAN DEFAULT false,
    mode TEXT CHECK (mode IN ('practice', 'exam', 'review'))
);

-- Quiz Responses
CREATE TABLE IF NOT EXISTS public.quiz_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    session_type TEXT CHECK (session_type IN ('flashcards', 'quiz', 'reading', 'mixed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    cards_reviewed INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2)
);

-- Learning Resources
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('text', 'video', 'pdf', 'link', 'image')),
    url TEXT,
    content TEXT,
    tags TEXT[],
    created_by UUID REFERENCES public.profiles(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    mastery_level DECIMAL(5,2) DEFAULT 0, -- 0-100
    total_time_minutes INTEGER DEFAULT 0,
    cards_mastered INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Topics policies
CREATE POLICY "Users can view public topics or own topics" ON public.topics
    FOR SELECT TO authenticated
    USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create topics" ON public.topics
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own topics" ON public.topics
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid());

-- Flashcards policies
CREATE POLICY "Users can view public flashcards or own flashcards" ON public.flashcards
    FOR SELECT TO authenticated
    USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create flashcards" ON public.flashcards
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own flashcards" ON public.flashcards
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid());

-- SRS Items policies
CREATE POLICY "Users can manage own SRS items" ON public.srs_items
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Quiz related policies
CREATE POLICY "Users can view public quiz templates or own quiz templates" ON public.quiz_templates
    FOR SELECT TO authenticated
    USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create quiz templates" ON public.quiz_templates
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own quiz templates" ON public.quiz_templates
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can view questions for accessible quizzes" ON public.questions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_templates qt
            WHERE qt.id = quiz_template_id
            AND (qt.is_public = true OR qt.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can create questions for own quiz templates" ON public.questions
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Quiz attempts and responses policies
CREATE POLICY "Users can manage own quiz attempts" ON public.quiz_attempts
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own quiz responses" ON public.quiz_responses
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_attempt_id AND qa.user_id = auth.uid()
        )
    );

-- Study sessions policies
CREATE POLICY "Users can manage own study sessions" ON public.study_sessions
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Learning resources policies
CREATE POLICY "Users can view public resources or own resources" ON public.learning_resources
    FOR SELECT TO authenticated
    USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create resources" ON public.learning_resources
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- User progress policies
CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_srs_items_user_next_review ON public.srs_items(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON public.flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_template ON public.questions(quiz_template_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON public.study_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id, updated_at);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_templates_updated_at BEFORE UPDATE ON public.quiz_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON public.learning_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();