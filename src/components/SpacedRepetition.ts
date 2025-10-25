interface ReviewData {
  cardId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewCount: number;
  lastReview: Date;
}

export class SpacedRepetitionScheduler {
  private static calculateNextInterval(difficulty: 'easy' | 'medium' | 'hard', reviewCount: number): number {
    const baseIntervals = {
      easy: [1, 6, 13, 30, 90],      // days
      medium: [1, 3, 7, 18, 45],     // days
      hard: [1, 1, 2, 5, 12]         // days
    };

    const intervals = baseIntervals[difficulty];
    const index = Math.min(reviewCount, intervals.length - 1);
    return intervals[index];
  }

  static getNextReviewDate(difficulty: 'easy' | 'medium' | 'hard', reviewCount: number): Date {
    const daysToAdd = this.calculateNextInterval(difficulty, reviewCount);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);
    return nextReview;
  }

  static getCardsForReview(cards: any[]): any[] {
    const now = new Date();
    return cards.filter(card => {
      const nextReview = new Date(card.nextReview);
      return nextReview <= now;
    });
  }

  static updateCardAfterReview(card: any, difficulty: 'easy' | 'medium' | 'hard') {
    const nextReview = this.getNextReviewDate(difficulty, card.reviewCount);
    
    return {
      ...card,
      difficulty,
      reviewCount: card.reviewCount + 1,
      nextReview: nextReview.toISOString(),
      lastReview: new Date().toISOString()
    };
  }
}