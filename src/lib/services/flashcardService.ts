import { ApiResponse, createApiResponse } from '@/types';

// This file will be imported by API routes only

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

import { readFlashcardsData as readServerData, writeFlashcardsData as writeServerData } from '@/lib/server/actions';

// Read flashcards data from file
const readFlashcardsData = async (): Promise<FlashcardsData> => {
  try {
    return await readServerData<FlashcardsData>();
  } catch (error) {
    console.error('Error reading flashcards data:', error);
    return { cards: [], decks: [] };
  }
};

// Write flashcards data to file
const writeFlashcardsData = async (data: FlashcardsData): Promise<boolean> => {
  try {
    return await writeServerData<FlashcardsData>(data);
  } catch (error) {
    console.error('Error writing flashcards data:', error);
    return false;
  }
};

export class FlashcardService {
  // Create a new flashcard
  public static async createFlashcard(
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
      const data: any = await readFlashcardsData();
      
      // Check if the deck exists
      const deckIndex = data.decks.findIndex((deck: any) => deck.id === deckId && deck.userId === userId);
      
      if (deckIndex === -1) {
        return createApiResponse(false, null, `Deck with ID ${deckId} not found`);
      }
      
      // Create the new flashcard
      const newCard: Flashcard = {
        id: `card_${Date.now()}`,
        front,
        back,
        hint,
        tags,
        courseId,
        topicId,
        difficulty,
        createdAt: new Date().toISOString(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0
      };
      
      // Add the flashcard to the cards array
      data.cards.push(newCard);
      
      // Add the card ID to the deck
      data.decks[deckIndex].cardIds.push(newCard.id);
      data.decks[deckIndex].lastModified = new Date().toISOString();
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, null, 'Failed to save flashcard data');
      }
      
      return createApiResponse(true, newCard);
    } catch (error) {
      console.error('Error creating flashcard:', error);
      return createApiResponse(false, null, 'Failed to create flashcard');
    }
  }
  
  // Update an existing flashcard
  public static async updateFlashcard(
    userId: string,
    cardId: string,
    updates: Partial<Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'incorrectCount'>>
  ): Promise<ApiResponse<Flashcard | null>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Find the card index
      const cardIndex = data.cards.findIndex((card: any) => card.id === cardId);
      
      if (cardIndex === -1) {
        return createApiResponse(false, null, `Flashcard with ID ${cardId} not found`);
      }
      
      // Find the deck containing this card to verify ownership
      const deck = data.decks.find((deck: any) => 
        deck.userId === userId && deck.cardIds.includes(cardId)
      );
      
      if (!deck) {
        return createApiResponse(false, null, 'You do not have permission to update this flashcard');
      }
      
      // Update the flashcard
      data.cards[cardIndex] = {
        ...data.cards[cardIndex],
        ...updates
      };
      
      // Update deck's lastModified timestamp
      const deckIndex = data.decks.findIndex((d: any) => d.id === deck.id);
      if (deckIndex !== -1) {
        data.decks[deckIndex].lastModified = new Date().toISOString();
      }
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, null, 'Failed to save flashcard data');
      }
      
      return createApiResponse(true, data.cards[cardIndex]);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      return createApiResponse(false, null, 'Failed to update flashcard');
    }
  }
  
  // Delete a flashcard
  public static async deleteFlashcard(userId: string, cardId: string): Promise<ApiResponse<boolean>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Find the card index
      const cardIndex = data.cards.findIndex((card: any) => card.id === cardId);
      
      if (cardIndex === -1) {
        return createApiResponse(false, false, `Flashcard with ID ${cardId} not found`);
      }
      
      // Find the deck containing this card to verify ownership
      const deckIndex = data.decks.findIndex((deck: any) => 
        deck.userId === userId && deck.cardIds.includes(cardId)
      );
      
      if (deckIndex === -1) {
        return createApiResponse(false, false, 'You do not have permission to delete this flashcard');
      }
      
      // Remove the card ID from the deck
      data.decks[deckIndex].cardIds = data.decks[deckIndex].cardIds.filter((id: any) => id !== cardId);
      data.decks[deckIndex].lastModified = new Date().toISOString();
      
      // Remove the card
      data.cards.splice(cardIndex, 1);
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, false, 'Failed to save flashcard data');
      }
      
      return createApiResponse(true, true);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      return createApiResponse(false, false, 'Failed to delete flashcard');
    }
  }
  
  // Create a new deck
  public static async createDeck(
    userId: string,
    name: string,
    description?: string,
    courseId?: string,
    topicId?: string,
    isPublic: boolean = false
  ): Promise<ApiResponse<FlashcardDeck | null>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Create the new deck
      const newDeck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        userId,
        name,
        description,
        courseId,
        topicId,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        cardIds: [],
        isPublic
      };
      
      // Add the deck to the decks array
      data.decks.push(newDeck);
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, null, 'Failed to save deck data');
      }
      
      return createApiResponse(true, newDeck);
    } catch (error) {
      console.error('Error creating deck:', error);
      return createApiResponse(false, null, 'Failed to create deck');
    }
  }
  
  // Update an existing deck
  public static async updateDeck(
    userId: string,
    deckId: string,
    updates: Partial<Omit<FlashcardDeck, 'id' | 'userId' | 'createdAt' | 'cardIds'>>
  ): Promise<ApiResponse<FlashcardDeck | null>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Find the deck index
      const deckIndex = data.decks.findIndex((deck: any) => deck.id === deckId && deck.userId === userId);
      
      if (deckIndex === -1) {
        return createApiResponse(false, null, `Deck with ID ${deckId} not found or you don't have permission to update it`);
      }
      
      // Update the deck
      data.decks[deckIndex] = {
        ...data.decks[deckIndex],
        ...updates,
        lastModified: new Date().toISOString()
      };
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, null, 'Failed to save deck data');
      }
      
      return createApiResponse(true, data.decks[deckIndex]);
    } catch (error) {
      console.error('Error updating deck:', error);
      return createApiResponse(false, null, 'Failed to update deck');
    }
  }
  
  // Delete a deck
  public static async deleteDeck(userId: string, deckId: string): Promise<ApiResponse<boolean>> {
    try {
      const data = await readFlashcardsData();
      
      // Find the deck index
      const deckIndex = data.decks.findIndex(deck => deck.id === deckId && deck.userId === userId);
      
      if (deckIndex === -1) {
        return createApiResponse(false, false, `Deck with ID ${deckId} not found or you don't have permission to delete it`);
      }
      
      // Get the card IDs in this deck
      const cardIds = data.decks[deckIndex].cardIds;
      
      // Remove the cards in this deck
      data.cards = data.cards.filter(card => !cardIds.includes(card.id));
      
      // Remove the deck
      data.decks.splice(deckIndex, 1);
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, false, 'Failed to save deck data');
      }
      
      return createApiResponse(true, true);
    } catch (error) {
      console.error('Error deleting deck:', error);
      return createApiResponse(false, false, 'Failed to delete deck');
    }
  }
  
  // Get all decks for a user
  public static async getUserDecks(userId: string): Promise<ApiResponse<FlashcardDeck[]>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Filter decks by user ID
      const userDecks = data.decks.filter((deck: any) => deck.userId === userId);
      
      return createApiResponse(true, userDecks);
    } catch (error) {
      console.error('Error getting user decks:', error);
      return createApiResponse(false, [], 'Failed to retrieve user decks');
    }
  }
  
  // Get a specific deck with its cards
  public static async getDeckWithCards(deckId: string): Promise<ApiResponse<{deck: FlashcardDeck, cards: Flashcard[]} | null>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Find the deck
      const deck = data.decks.find((deck: any) => deck.id === deckId);
      
      if (!deck) {
        return createApiResponse(false, null, `Deck with ID ${deckId} not found`);
      }
      
      // Get the cards in this deck
      const cards = data.cards.filter((card: any) => deck.cardIds.includes(card.id));
      
      return createApiResponse(true, { deck, cards });
    } catch (error) {
      console.error('Error getting deck with cards:', error);
      return createApiResponse(false, null, 'Failed to retrieve deck with cards');
    }
  }
  
  // Process a card review using spaced repetition
  public static async reviewCard(
    userId: string,
    cardId: string, 
    result: ReviewResult
  ): Promise<ApiResponse<Flashcard | null>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Find the card
      const cardIndex = data.cards.findIndex((card: any) => card.id === cardId);
      
      if (cardIndex === -1) {
        return createApiResponse(false, null, `Flashcard with ID ${cardId} not found`);
      }
      
      const card = data.cards[cardIndex];
      
      // Find the deck containing this card to verify ownership
      const deck = data.decks.find((deck: any) => 
        deck.userId === userId && deck.cardIds.includes(cardId)
      );
      
      if (!deck) {
        return createApiResponse(false, null, 'You do not have permission to review this flashcard');
      }
      
      // Update review counts
      card.reviewCount++;
      
      if (result === ReviewResult.GOOD || result === ReviewResult.EASY) {
        card.correctCount++;
      } else {
        card.incorrectCount++;
      }
      
      card.lastReviewed = new Date().toISOString();
      
      // Calculate next review date using spaced repetition algorithm
      card.nextReviewDate = this.calculateNextReviewDate(card, result);
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, null, 'Failed to save flashcard data');
      }
      
      return createApiResponse(true, card);
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
      return createApiResponse(false, null, 'Failed to review flashcard');
    }
  }
  
  // Get cards due for review
  public static async getDueCards(userId: string, limit: number = 20): Promise<ApiResponse<Flashcard[]>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Get all user's decks
      const userDeckIds = data.decks
        .filter((deck: any) => deck.userId === userId)
        .map((deck: any) => deck.id);
      
      // Get all cards in user's decks
      const userCardIds = data.decks
        .filter((deck: any) => userDeckIds.includes(deck.id))
        .flatMap((deck: any) => deck.cardIds);
      
      // Get cards that are due for review
      const now = new Date();
      const dueCards = data.cards
        .filter((card: any) => 
          userCardIds.includes(card.id) && 
          (!card.nextReviewDate || new Date(card.nextReviewDate) <= now)
        )
        .sort((a: any, b: any) => {
          // Cards that have never been reviewed come first
          if (!a.lastReviewed) return -1;
          if (!b.lastReviewed) return 1;
          
          // Then sort by due date (oldest first)
          if (!a.nextReviewDate) return -1;
          if (!b.nextReviewDate) return 1;
          
          return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
        })
        .slice(0, limit);
      
      return createApiResponse(true, dueCards);
    } catch (error) {
      console.error('Error getting due cards:', error);
      return createApiResponse(false, [], 'Failed to retrieve due cards');
    }
  }
  
  // Get public decks for browsing
  public static async getPublicDecks(limit: number = 20, offset: number = 0): Promise<ApiResponse<FlashcardDeck[]>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Filter public decks
      const publicDecks = data.decks
        .filter((deck: any) => deck.isPublic)
        .sort((a: any, b: any) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(offset, offset + limit);
      
      return createApiResponse(true, publicDecks);
    } catch (error) {
      console.error('Error getting public decks:', error);
      return createApiResponse(false, [], 'Failed to retrieve public decks');
    }
  }
  
  // Clone a public deck to a user's collection
  public static async cloneDeck(userId: string, deckId: string, newName?: string): Promise<ApiResponse<FlashcardDeck | null>> {
    try {
      const data: any = await readFlashcardsData();
      
      // Find the source deck
      const sourceDeck = data.decks.find((deck: any) => deck.id === deckId && deck.isPublic);
      
      if (!sourceDeck) {
        return createApiResponse(false, null, `Public deck with ID ${deckId} not found`);
      }
      
      // Create a new deck
      const newDeck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        userId,
        name: newName || `Copy of ${sourceDeck.name}`,
        description: sourceDeck.description,
        courseId: sourceDeck.courseId,
        topicId: sourceDeck.topicId,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        cardIds: [],
        isPublic: false
      };
      
      // Clone the cards
      const newCards: Flashcard[] = [];
      sourceDeck.cardIds.forEach((cardId: any) => {
        const sourceCard = data.cards.find((card: any) => card.id === cardId);
        if (sourceCard) {
          const newCard: Flashcard = {
            ...sourceCard,
            id: `card_${Date.now()}_${newCards.length}`,
            createdAt: new Date().toISOString(),
            lastReviewed: undefined,
            nextReviewDate: undefined,
            reviewCount: 0,
            correctCount: 0,
            incorrectCount: 0
          };
          newCards.push(newCard);
          newDeck.cardIds.push(newCard.id);
        }
      });
      
      // Add the new deck and cards
      data.decks.push(newDeck);
      data.cards.push(...newCards);
      
      // Save the updated data
      if (!writeFlashcardsData(data)) {
        return createApiResponse(false, null, 'Failed to save deck data');
      }
      
      return createApiResponse(true, newDeck);
    } catch (error) {
      console.error('Error cloning deck:', error);
      return createApiResponse(false, null, 'Failed to clone deck');
    }
  }
  
  // Private helper method to calculate next review date using spaced repetition
  private static calculateNextReviewDate(card: Flashcard, result: ReviewResult): string {
    const now = new Date();
    let daysToAdd = 1; // Default is 1 day
    
    // If this is the first review, use the initial intervals based on result
    if (card.reviewCount <= 1) {
      switch (result) {
        case ReviewResult.AGAIN: daysToAdd = 0.5; break; // 12 hours
        case ReviewResult.HARD: daysToAdd = 1; break;    // 1 day
        case ReviewResult.GOOD: daysToAdd = 3; break;    // 3 days
        case ReviewResult.EASY: daysToAdd = 5; break;    // 5 days
      }
    } else {
      // Get the days since last review
      let lastInterval = 1;
      if (card.lastReviewed && card.nextReviewDate) {
        const lastReview = new Date(card.lastReviewed);
        const nextReview = new Date(card.nextReviewDate);
        lastInterval = Math.max(1, Math.round((nextReview.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)));
      }
      
      // Calculate new interval based on performance
      switch (result) {
        case ReviewResult.AGAIN:
          daysToAdd = 1; // Reset to 1 day
          break;
        case ReviewResult.HARD:
          daysToAdd = lastInterval * 1.2; // Increase by 20%
          break;
        case ReviewResult.GOOD:
          daysToAdd = lastInterval * 2; // Double the interval
          break;
        case ReviewResult.EASY:
          daysToAdd = lastInterval * 3; // Triple the interval
          break;
      }
    }
    
    // Cap the maximum interval at 365 days (1 year)
    daysToAdd = Math.min(daysToAdd, 365);
    
    // Convert days to milliseconds and add to current date
    const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    
    return nextDate.toISOString();
  }
}
