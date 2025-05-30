// This file is only imported by API routes (server-side)
import { readFlashcardsData, writeFlashcardsData } from '@/lib/server/actions';
import { createApiResponse, ApiResponse } from '@/types';
import { Flashcard, FlashcardDeck, FlashcardDifficulty, ReviewResult, FlashcardsData } from '@/lib/types/flashcards';

// FlashcardService for server-side operations (API routes)
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
      const data = await readFlashcardsData<FlashcardsData>();
      
      // Check if the deck exists
      const deckIndex = data.decks.findIndex(deck => deck.id === deckId && deck.userId === userId);
      
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
      if (!await writeFlashcardsData<FlashcardsData>(data)) {
        return createApiResponse(false, null, 'Failed to save flashcard data');
      }
      
      return createApiResponse(true, newCard);
    } catch (error) {
      console.error('Error creating flashcard:', error);
      return createApiResponse(false, null, 'Failed to create flashcard');
    }
  }
  
  // Get all decks for a user
  public static async getUserDecks(userId: string): Promise<ApiResponse<FlashcardDeck[]>> {
    try {
      const data = await readFlashcardsData<FlashcardsData>();
      
      // Filter decks by userId
      const userDecks = data.decks.filter(deck => deck.userId === userId);
      
      return createApiResponse(true, userDecks);
    } catch (error) {
      console.error('Error getting user decks:', error);
      return createApiResponse(false, [], 'Failed to get user decks');
    }
  }
  
  // Get a specific deck with its cards
  public static async getDeckWithCards(deckId: string): Promise<ApiResponse<{deck: FlashcardDeck, cards: Flashcard[]} | null>> {
    try {
      const data = await readFlashcardsData<FlashcardsData>();
      
      // Find the deck
      const deck = data.decks.find(deck => deck.id === deckId);
      
      if (!deck) {
        return createApiResponse(false, null, `Deck with ID ${deckId} not found`);
      }
      
      // Get the cards in this deck
      const deckCards = data.cards.filter(card => deck.cardIds.includes(card.id));
      
      return createApiResponse(true, { deck, cards: deckCards });
    } catch (error) {
      console.error('Error getting deck with cards:', error);
      return createApiResponse(false, null, 'Failed to get deck with cards');
    }
  }
  
  // Update an existing flashcard
  public static async updateFlashcard(
    userId: string,
    cardId: string,
    updates: Partial<Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'incorrectCount'>>
  ): Promise<ApiResponse<Flashcard | null>> {
    try {
      const data = await readFlashcardsData<FlashcardsData>();
      
      // Find the card index
      const cardIndex = data.cards.findIndex(card => card.id === cardId);
      
      if (cardIndex === -1) {
        return createApiResponse(false, null, `Flashcard with ID ${cardId} not found`);
      }
      
      // Find the deck containing this card to verify ownership
      const deck = data.decks.find(deck => 
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
      const deckIndex = data.decks.findIndex(d => d.id === deck.id);
      if (deckIndex !== -1) {
        data.decks[deckIndex].lastModified = new Date().toISOString();
      }
      
      // Save the updated data
      if (!await writeFlashcardsData<FlashcardsData>(data)) {
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
      const data = await readFlashcardsData<FlashcardsData>();
      
      // Find the card index
      const cardIndex = data.cards.findIndex(card => card.id === cardId);
      
      if (cardIndex === -1) {
        return createApiResponse(false, false, `Flashcard with ID ${cardId} not found`);
      }
      
      // Find the deck containing this card to verify ownership
      const deck = data.decks.find(deck => 
        deck.userId === userId && deck.cardIds.includes(cardId)
      );
      
      if (!deck) {
        return createApiResponse(false, false, 'You do not have permission to delete this flashcard');
      }
      
      // Remove the card ID from the deck
      const deckIndex = data.decks.findIndex(d => d.id === deck.id);
      if (deckIndex !== -1) {
        data.decks[deckIndex].cardIds = data.decks[deckIndex].cardIds.filter(id => id !== cardId);
        data.decks[deckIndex].lastModified = new Date().toISOString();
      }
      
      // Remove the card from the cards array
      data.cards.splice(cardIndex, 1);
      
      // Save the updated data
      if (!await writeFlashcardsData<FlashcardsData>(data)) {
        return createApiResponse(false, false, 'Failed to save flashcard data');
      }
      
      return createApiResponse(true, true);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      return createApiResponse(false, false, 'Failed to delete flashcard');
    }
  }
  
  // Process a card review using spaced repetition
  public static async reviewCard(
    userId: string,
    cardId: string, 
    result: ReviewResult
  ): Promise<ApiResponse<Flashcard | null>> {
    try {
      const data = await readFlashcardsData<FlashcardsData>();
      
      // Find the card
      const cardIndex = data.cards.findIndex(card => card.id === cardId);
      
      if (cardIndex === -1) {
        return createApiResponse(false, null, `Card with ID ${cardId} not found`);
      }
      
      // Find the deck containing this card to verify ownership
      const deck = data.decks.find(deck => 
        deck.userId === userId && deck.cardIds.includes(cardId)
      );
      
      if (!deck) {
        return createApiResponse(false, null, 'You do not have permission to review this card');
      }
      
      // Update the card based on review result
      const card = data.cards[cardIndex];
      
      // Increment review count
      card.reviewCount += 1;
      
      // Mark as correct or incorrect
      if (result === ReviewResult.GOOD || result === ReviewResult.EASY) {
        card.correctCount += 1;
      } else {
        card.incorrectCount += 1;
      }
      
      // Set last reviewed date
      card.lastReviewed = new Date().toISOString();
      
      // Calculate next review date
      card.nextReviewDate = this.calculateNextReviewDate(card, result);
      
      // Save the updated data
      if (!await writeFlashcardsData<FlashcardsData>(data)) {
        return createApiResponse(false, null, 'Failed to save review data');
      }
      
      return createApiResponse(true, card);
    } catch (error) {
      console.error('Error reviewing card:', error);
      return createApiResponse(false, null, 'Failed to review card');
    }
  }
  
  // Get cards due for review
  public static async getDueCards(userId: string, limit: number = 20): Promise<ApiResponse<Flashcard[]>> {
    try {
      const data = await readFlashcardsData<FlashcardsData>();
      
      // Get all decks belonging to the user
      const userDecks = data.decks.filter(deck => deck.userId === userId);
      
      // Get all card IDs from these decks
      const userCardIds = userDecks.flatMap(deck => deck.cardIds);
      
      // Get current date in ISO string format
      const now = new Date().toISOString();
      
      // Filter for cards that are due for review
      const dueCards = data.cards.filter(card => 
        userCardIds.includes(card.id) && 
        (
          !card.nextReviewDate || // Never reviewed
          card.nextReviewDate <= now // Due for review
        )
      );
      
      // Sort by priority (never reviewed first, then by due date)
      const sortedDueCards = dueCards.sort((a, b) => {
        // Cards that have never been reviewed come first
        if (!a.nextReviewDate && b.nextReviewDate) return -1;
        if (a.nextReviewDate && !b.nextReviewDate) return 1;
        
        // Then sort by due date (oldest first)
        return (a.nextReviewDate || '').localeCompare(b.nextReviewDate || '');
      });
      
      // Limit the number of cards
      const limitedCards = sortedDueCards.slice(0, limit);
      
      return createApiResponse(true, limitedCards);
    } catch (error) {
      console.error('Error getting due cards:', error);
      return createApiResponse(false, [], 'Failed to get due cards');
    }
  }
  
  // Private helper method to calculate next review date using spaced repetition
  private static calculateNextReviewDate(card: Flashcard, result: ReviewResult): string {
    // Get current review interval (or default to 1 day if first review)
    let currentInterval = 1; // Default: 1 day
    
    if (card.lastReviewed && card.nextReviewDate) {
      // Calculate current interval in days
      const lastReviewDate = new Date(card.lastReviewed);
      const nextReviewDate = new Date(card.nextReviewDate);
      const daysDiff = (nextReviewDate.getTime() - lastReviewDate.getTime()) / (1000 * 3600 * 24);
      
      currentInterval = Math.max(1, daysDiff); // Ensure at least 1 day
    }
    
    // Apply spacing factor based on review result
    let newInterval: number;
    
    switch (result) {
      case ReviewResult.AGAIN: // Failed to recall, reset interval
        newInterval = 1;
        break;
      case ReviewResult.HARD: // Difficult recall, slight increase
        newInterval = currentInterval * 1.2;
        break;
      case ReviewResult.GOOD: // Good recall, standard increase
        newInterval = currentInterval * 2.5;
        break;
      case ReviewResult.EASY: // Easy recall, larger increase
        newInterval = currentInterval * 4;
        break;
      default:
        newInterval = currentInterval * 2;
    }
    
    // Round to nearest whole day
    newInterval = Math.round(newInterval);
    
    // Calculate the new review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    
    return nextDate.toISOString();
  }
}
