// Define the flashcard data structures
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tags: string[];
  courseId?: string;
  topicId?: string;
  difficulty: FlashcardDifficulty;
  createdAt: string;
  lastReviewed?: string;
  nextReviewDate?: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

export interface FlashcardDeck {
  id: string;
  userId: string;
  name: string;
  description?: string;
  courseId?: string;
  topicId?: string;
  createdAt: string;
  lastModified: string;
  cardIds: string[];
  isPublic: boolean;
}

export enum FlashcardDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum ReviewResult {
  AGAIN = 'again',
  HARD = 'hard',
  GOOD = 'good',
  EASY = 'easy'
}

export interface FlashcardsData {
  cards: Flashcard[];
  decks: FlashcardDeck[];
}
