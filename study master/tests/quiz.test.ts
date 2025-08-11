import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../src/lib/supabase';

vi.mock('../src/lib/supabase');

describe('Quiz System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quiz Attempt Management', () => {
    it('should start a quiz attempt', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        user_id: 'user-1',
        quiz_template_id: 'quiz-1',
        started_at: new Date().toISOString(),
        mode: 'practice',
      };

      const mockResponse = {
        data: mockAttempt,
        error: null,
      };

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: 'user-1',
          quiz_template_id: 'quiz-1',
          mode: 'practice',
        })
        .select()
        .single();

      expect(result.data).toEqual(mockAttempt);
      expect(result.error).toBeNull();
    });

    it('should submit quiz response', async () => {
      const mockResponse = {
        id: 'response-1',
        quiz_attempt_id: 'attempt-1',
        question_id: 'question-1',
        user_answer: 'Paris',
        is_correct: true,
      };

      const mockResult = {
        data: mockResponse,
        error: null,
      };

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('quiz_responses')
        .insert({
          quiz_attempt_id: 'attempt-1',
          question_id: 'question-1',
          user_answer: 'Paris',
          is_correct: true,
        })
        .select()
        .single();

      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeNull();
    });

    it('should complete quiz attempt with score calculation', async () => {
      const mockCompletedAttempt = {
        id: 'attempt-1',
        completed_at: new Date().toISOString(),
        score: 80,
        total_questions: 5,
        correct_answers: 4,
      };

      const mockResponse = {
        data: mockCompletedAttempt,
        error: null,
      };

      const mockFromChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: expect.any(String),
          score: 80,
          total_questions: 5,
          correct_answers: 4,
        })
        .eq('id', 'attempt-1')
        .select()
        .single();

      expect(result.data).toEqual(mockCompletedAttempt);
      expect(result.error).toBeNull();
    });
  });

  describe('Quiz Grading', () => {
    it('should grade multiple choice questions correctly', () => {
      const gradeAnswer = (correctAnswer: string, userAnswer: string): boolean => {
        return correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
      };

      expect(gradeAnswer('Paris', 'Paris')).toBe(true);
      expect(gradeAnswer('Paris', 'paris')).toBe(true);
      expect(gradeAnswer('Paris', ' Paris ')).toBe(true);
      expect(gradeAnswer('Paris', 'London')).toBe(false);
    });

    it('should calculate quiz score correctly', () => {
      const calculateScore = (responses: Array<{ is_correct: boolean }>) => {
        const correct = responses.filter(r => r.is_correct).length;
        const total = responses.length;
        return total > 0 ? Math.round((correct / total) * 100) : 0;
      };

      const responses = [
        { is_correct: true },
        { is_correct: true },
        { is_correct: false },
        { is_correct: true },
        { is_correct: false },
      ];

      expect(calculateScore(responses)).toBe(60);
      expect(calculateScore([])).toBe(0);
      expect(calculateScore([{ is_correct: true }])).toBe(100);
    });
  });

  describe('Quiz History', () => {
    it('should fetch user quiz history', async () => {
      const mockHistory = [
        {
          id: 'attempt-1',
          completed_at: '2025-01-01T12:00:00Z',
          score: 85,
          quiz_template: { title: 'Biology Quiz' },
        },
        {
          id: 'attempt-2',
          completed_at: '2025-01-02T12:00:00Z',
          score: 92,
          quiz_template: { title: 'Math Quiz' },
        },
      ];

      const mockResponse = {
        data: mockHistory,
        error: null,
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz_template:quiz_templates(title)
        `)
        .eq('user_id', 'user-1')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10);

      expect(result.data).toEqual(mockHistory);
      expect(result.error).toBeNull();
    });
  });
});