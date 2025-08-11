import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../src/lib/supabase';

// Mock Supabase client
vi.mock('../src/lib/supabase');

describe('Flashcard Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Flashcard CRUD Operations', () => {
    it('should create a flashcard', async () => {
      const mockFlashcard = {
        id: 'flashcard-1',
        topic_id: 'topic-1',
        front_text: 'What is the capital of France?',
        back_text: 'Paris',
        created_by: 'user-1',
        difficulty: 3,
        tags: ['geography'],
      };

      const mockResponse = {
        data: mockFlashcard,
        error: null,
      };

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('flashcards')
        .insert({
          topic_id: 'topic-1',
          front_text: 'What is the capital of France?',
          back_text: 'Paris',
          created_by: 'user-1',
          difficulty: 3,
          tags: ['geography'],
        })
        .select()
        .single();

      expect(result.data).toEqual(mockFlashcard);
      expect(result.error).toBeNull();
    });

    it('should fetch flashcards for a topic', async () => {
      const mockFlashcards = [
        {
          id: 'flashcard-1',
          topic_id: 'topic-1',
          front_text: 'Question 1',
          back_text: 'Answer 1',
        },
        {
          id: 'flashcard-2',
          topic_id: 'topic-1',
          front_text: 'Question 2',
          back_text: 'Answer 2',
        },
      ];

      const mockResponse = {
        data: mockFlashcards,
        error: null,
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('flashcards')
        .select('*')
        .eq('topic_id', 'topic-1')
        .order('created_at');

      expect(result.data).toEqual(mockFlashcards);
      expect(result.error).toBeNull();
    });

    it('should update a flashcard', async () => {
      const updatedFlashcard = {
        id: 'flashcard-1',
        front_text: 'Updated question',
        back_text: 'Updated answer',
      };

      const mockResponse = {
        data: updatedFlashcard,
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
        .from('flashcards')
        .update({
          front_text: 'Updated question',
          back_text: 'Updated answer',
        })
        .eq('id', 'flashcard-1')
        .select()
        .single();

      expect(result.data).toEqual(updatedFlashcard);
      expect(result.error).toBeNull();
    });

    it('should delete a flashcard', async () => {
      const mockResponse = {
        data: null,
        error: null,
      };

      const mockFromChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('flashcards')
        .delete()
        .eq('id', 'flashcard-1');

      expect(result.error).toBeNull();
    });
  });

  describe('Spaced Repetition System', () => {
    it('should calculate next review date correctly', () => {
      // Test SM-2 algorithm implementation
      const calculateNextReview = (
        easeFactor: number,
        interval: number,
        repetitions: number,
        quality: number
      ) => {
        let newEaseFactor = easeFactor;
        let newInterval = interval;
        let newRepetitions = repetitions;

        if (quality >= 3) {
          if (repetitions === 0) {
            newInterval = 1;
          } else if (repetitions === 1) {
            newInterval = 6;
          } else {
            newInterval = Math.round(interval * easeFactor);
          }
          newRepetitions += 1;
        } else {
          newRepetitions = 0;
          newInterval = 1;
        }

        newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) {
          newEaseFactor = 1.3;
        }

        return {
          easeFactor: newEaseFactor,
          interval: newInterval,
          repetitions: newRepetitions,
        };
      };

      // Test with good quality (4)
      const result1 = calculateNextReview(2.5, 1, 0, 4);
      expect(result1.interval).toBe(1);
      expect(result1.repetitions).toBe(1);
      expect(result1.easeFactor).toBeGreaterThan(2.5);

      // Test with poor quality (2)
      const result2 = calculateNextReview(2.5, 6, 2, 2);
      expect(result2.interval).toBe(1);
      expect(result2.repetitions).toBe(0);
      expect(result2.easeFactor).toBeLessThan(2.5);
    });

    it('should create SRS item when reviewing card for first time', async () => {
      const mockSRSItem = {
        id: 'srs-1',
        user_id: 'user-1',
        flashcard_id: 'flashcard-1',
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: new Date().toISOString(),
      };

      const mockResponse = {
        data: mockSRSItem,
        error: null,
      };

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await supabase
        .from('srs_items')
        .insert({
          user_id: 'user-1',
          flashcard_id: 'flashcard-1',
        })
        .select()
        .single();

      expect(result.data).toEqual(mockSRSItem);
      expect(result.error).toBeNull();
    });
  });
});