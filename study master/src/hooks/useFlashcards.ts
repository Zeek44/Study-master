import { useState, useEffect } from 'react';
import { supabase, Flashcard, SRSItem } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useFlashcards(topicId?: string) {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [srsItems, setSrsItems] = useState<SRSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFlashcards();
      loadSRSItems();
    }
  }, [user, topicId]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('flashcards')
        .select(`
          *,
          topic:topics(*)
        `)
        .or(`is_public.eq.true,created_by.eq.${user?.id}`);

      if (topicId) {
        query = query.eq('topic_id', topicId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setFlashcards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const loadSRSItems = async () => {
    try {
      if (!user) return;

      let query = supabase
        .from('srs_items')
        .select(`
          *,
          flashcard:flashcards(
            *,
            topic:topics(*)
          )
        `)
        .eq('user_id', user.id);

      if (topicId) {
        query = query.eq('flashcard.topic_id', topicId);
      }

      const { data, error } = await query.order('next_review_date', { ascending: true });

      if (error) throw error;
      setSrsItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SRS items');
    }
  };

  const createFlashcard = async (flashcardData: {
    topic_id: string;
    front_text: string;
    back_text: string;
    tags?: string[];
    difficulty?: number;
    is_public?: boolean;
  }) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          ...flashcardData,
          created_by: user.id,
        })
        .select(`
          *,
          topic:topics(*)
        `)
        .single();

      if (error) throw error;

      setFlashcards(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create flashcard';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateFlashcard = async (id: string, updates: Partial<Flashcard>) => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', id)
        .eq('created_by', user?.id)
        .select(`
          *,
          topic:topics(*)
        `)
        .single();

      if (error) throw error;

      setFlashcards(prev => prev.map(card => card.id === id ? data : card));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update flashcard';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteFlashcard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
        .eq('created_by', user?.id);

      if (error) throw error;

      setFlashcards(prev => prev.filter(card => card.id !== id));
      setSrsItems(prev => prev.filter(item => item.flashcard_id !== id));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete flashcard';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const reviewCard = async (flashcardId: string, quality: 1 | 2 | 3 | 4 | 5) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Get or create SRS item
      let { data: srsItem } = await supabase
        .from('srs_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();

      if (!srsItem) {
        const { data: newItem, error } = await supabase
          .from('srs_items')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
          })
          .select()
          .single();

        if (error) throw error;
        srsItem = newItem;
      }

      // Calculate new SRS values using SM-2 algorithm
      const { easeFactor, interval, repetitions } = calculateSRS(
        srsItem.ease_factor,
        srsItem.interval_days,
        srsItem.repetitions,
        quality
      );

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      const { data, error } = await supabase
        .from('srs_items')
        .update({
          ease_factor: easeFactor,
          interval_days: interval,
          repetitions,
          next_review_date: nextReviewDate.toISOString(),
          last_reviewed_at: new Date().toISOString(),
        })
        .eq('id', srsItem.id)
        .select(`
          *,
          flashcard:flashcards(
            *,
            topic:topics(*)
          )
        `)
        .single();

      if (error) throw error;

      setSrsItems(prev => prev.map(item => item.id === srsItem!.id ? data : item));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to review card';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const getDueCards = () => {
    const now = new Date();
    return srsItems.filter(item => new Date(item.next_review_date) <= now);
  };

  return {
    flashcards,
    srsItems,
    loading,
    error,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewCard,
    getDueCards,
    loadFlashcards,
  };
}

// SM-2 Algorithm implementation
function calculateSRS(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number
): { easeFactor: number; interval: number; repetitions: number } {
  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return { easeFactor, interval, repetitions };
}