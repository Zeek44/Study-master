import { useState, useEffect } from 'react';
import { supabase, QuizTemplate, Question, QuizAttempt, QuizResponse } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useQuizzes(topicId?: string) {
  const { user } = useAuth();
  const [quizTemplates, setQuizTemplates] = useState<QuizTemplate[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizTemplate | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadQuizTemplates();
    }
  }, [user, topicId]);

  const loadQuizTemplates = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('quiz_templates')
        .select(`
          *,
          topic:topics(*),
          questions:questions(count)
        `)
        .or(`is_public.eq.true,created_by.eq.${user?.id}`);

      if (topicId) {
        query = query.eq('topic_id', topicId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setQuizTemplates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz templates');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizWithQuestions = async (quizId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_templates')
        .select(`
          *,
          topic:topics(*),
          questions:questions(*)
        `)
        .eq('id', quizId)
        .single();

      if (error) throw error;
      setCurrentQuiz(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startQuizAttempt = async (
    quizTemplateId: string,
    mode: 'practice' | 'exam' | 'review' = 'practice'
  ) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_template_id: quizTemplateId,
          mode,
          is_timed: mode === 'exam',
        })
        .select(`
          *,
          quiz_template:quiz_templates(*)
        `)
        .single();

      if (error) throw error;

      setCurrentAttempt(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start quiz attempt';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const submitQuizResponse = async (
    questionId: string,
    userAnswer: string,
    isCorrect: boolean,
    timeTaken?: number
  ) => {
    try {
      if (!currentAttempt) throw new Error('No active quiz attempt');

      const { data, error } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_attempt_id: currentAttempt.id,
          question_id: questionId,
          user_answer: userAnswer,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken,
        })
        .select(`
          *,
          question:questions(*)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const completeQuizAttempt = async (responses: QuizResponse[]) => {
    try {
      if (!currentAttempt) throw new Error('No active quiz attempt');

      const correctAnswers = responses.filter(r => r.is_correct).length;
      const totalQuestions = responses.length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const totalTime = responses.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0);

      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          time_taken_seconds: totalTime,
        })
        .eq('id', currentAttempt.id)
        .select(`
          *,
          quiz_template:quiz_templates(*)
        `)
        .single();

      if (error) throw error;

      setCurrentAttempt(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete quiz';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const getQuizResults = async (attemptId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select(`
          *,
          question:questions(*)
        `)
        .eq('quiz_attempt_id', attemptId)
        .order('created_at');

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get quiz results';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const getUserQuizHistory = async (limit = 10) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz_template:quiz_templates(
            title,
            topic:topics(name)
          )
        `)
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get quiz history';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  return {
    quizTemplates,
    currentQuiz,
    currentAttempt,
    loading,
    error,
    loadQuizTemplates,
    loadQuizWithQuestions,
    startQuizAttempt,
    submitQuizResponse,
    completeQuizAttempt,
    getQuizResults,
    getUserQuizHistory,
  };
}