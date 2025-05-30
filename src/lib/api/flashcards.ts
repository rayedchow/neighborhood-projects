import { ApiResponse } from '@/types';
import { Flashcard, FlashcardDeck, FlashcardDifficulty, ReviewResult } from '@/lib/types/flashcards';

/**
 * Client-side API for flashcards - this file contains no direct file system operations
 * and is safe to import from client components
 */

// Create a new flashcard
export async function createFlashcard(
  userId: string,
  front: string,
  back: string,
  deckId: string,
  tags: string[] = [],
  hint?: string,
  courseId?: string,
  topicId?: string,
  difficulty: FlashcardDifficulty = FlashcardDifficulty.MEDIUM
): Promise<ApiResponse<Flashcard | null>> {
  try {
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        front,
        back,
        deckId,
        tags,
        hint,
        courseId,
        topicId,
        difficulty,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to create flashcard',
      timestamp: new Date().toISOString(),
    };
  }
}

// Get flashcards due for review
export async function getDueCards(
  userId: string, 
  limit: number = 20
): Promise<ApiResponse<Flashcard[]>> {
  try {
    const response = await fetch(`/api/flashcards?userId=${userId}&limit=${limit}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting due cards:', error);
    return {
      success: false,
      data: [],
      error: 'Failed to get due cards',
      timestamp: new Date().toISOString(),
    };
  }
}

// Get a specific deck with its cards
export async function getDeckWithCards(
  deckId: string
): Promise<ApiResponse<{deck: FlashcardDeck, cards: Flashcard[]}>> {
  try {
    const response = await fetch(`/api/flashcards?deckId=${deckId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting deck with cards:', error);
    return {
      success: false,
      data: { deck: {} as FlashcardDeck, cards: [] },
      error: 'Failed to get deck with cards',
      timestamp: new Date().toISOString(),
    };
  }
}

// Get all decks for a user
export async function getUserDecks(
  userId: string
): Promise<ApiResponse<FlashcardDeck[]>> {
  try {
    const response = await fetch(`/api/flashcards/decks?userId=${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting user decks:', error);
    return {
      success: false,
      data: [],
      error: 'Failed to get user decks',
      timestamp: new Date().toISOString(),
    };
  }
}

// Create a new deck
export async function createDeck(
  userId: string,
  name: string,
  description?: string,
  courseId?: string,
  topicId?: string,
  isPublic: boolean = false
): Promise<ApiResponse<FlashcardDeck>> {
  try {
    const response = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        name,
        description,
        courseId,
        topicId,
        isPublic,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating deck:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to create deck',
      timestamp: new Date().toISOString(),
    };
  }
}

// Process a card review
export async function reviewCard(
  userId: string,
  cardId: string,
  result: ReviewResult
): Promise<ApiResponse<Flashcard>> {
  try {
    const response = await fetch(`/api/flashcards/${cardId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        result,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error reviewing card:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to review card',
      timestamp: new Date().toISOString(),
    };
  }
}
