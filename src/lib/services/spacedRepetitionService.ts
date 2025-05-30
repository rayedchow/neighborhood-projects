import { User, CourseProgress, UnitProgress, TopicProgress } from '@/types';
import { readProgressData, writeProgressData, createApiResponse } from '../utils/fileOperations';

// Difficulty rating enum
export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  VERY_HARD = 4
}

// Spaced repetition interval constants (in days)
const INITIAL_INTERVAL = 1;
const EASY_MULTIPLIER = 2.5;
const MEDIUM_MULTIPLIER = 1.5;
const HARD_MULTIPLIER = 1.2;
const VERY_HARD_MULTIPLIER = 0.6;
const MAX_INTERVAL = 365; // Cap at 1 year

// Review card interface
export interface ReviewCard {
  courseId: string;
  unitId: string;
  topicId: string;
  questionId: string;
  dueDate: Date;
  interval: number;
  factor: number;
  reps: number;
}

interface SpacedRepetitionData {
  userId: string;
  cards: ReviewCard[];
}

/**
 * Service class for handling spaced repetition learning algorithms
 */
export class SpacedRepetitionService {
  
  /**
   * Get all due review cards for a user 
   * @param userId User ID
   * @param limit Maximum number of cards to return
   * @returns Array of due review cards
   */
  public static async getDueCards(userId: string, limit: number = 20): Promise<ReviewCard[]> {
    const srData = await this.getUserSRData(userId);
    if (!srData) return [];
    
    const now = new Date();
    
    // Get cards that are due
    const dueCards = srData.cards
      .filter(card => new Date(card.dueDate) <= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, limit);
      
    return dueCards;
  }
  
  /**
   * Process a review and update the spaced repetition schedule
   * @param userId User ID
   * @param questionId Question ID
   * @param difficulty Difficulty rating provided by user
   * @returns True if successful
   */
  public static async processReview(
    userId: string, 
    courseId: string,
    unitId: string,
    topicId: string,
    questionId: string, 
    difficulty: Difficulty
  ): Promise<boolean> {
    try {
      let srData = await this.getUserSRData(userId);
      
      // If no SR data exists, create a new entry
      if (!srData) {
        srData = {
          userId,
          cards: []
        };
      }
      
      // Find the card
      let card = srData.cards.find(c => 
        c.courseId === courseId && 
        c.unitId === unitId && 
        c.topicId === topicId && 
        c.questionId === questionId
      );
      
      const now = new Date();
      
      // If card doesn't exist, create a new one
      if (!card) {
        card = {
          courseId,
          unitId,
          topicId,
          questionId,
          dueDate: now,
          interval: INITIAL_INTERVAL,
          factor: 2.5, // Initial ease factor
          reps: 0
        };
        srData.cards.push(card);
      }
      
      // Increment repetitions
      card.reps += 1;
      
      // Apply spaced repetition algorithm (SM-2 inspired)
      let newInterval = card.interval;
      let newFactor = card.factor;
      
      switch (difficulty) {
        case Difficulty.EASY:
          newInterval = Math.min(Math.round(card.interval * EASY_MULTIPLIER * card.factor), MAX_INTERVAL);
          newFactor = Math.min(card.factor + 0.15, 2.5);
          break;
        case Difficulty.MEDIUM:
          newInterval = Math.min(Math.round(card.interval * MEDIUM_MULTIPLIER * card.factor), MAX_INTERVAL);
          break;
        case Difficulty.HARD:
          newInterval = Math.min(Math.round(card.interval * HARD_MULTIPLIER), MAX_INTERVAL);
          newFactor = Math.max(card.factor - 0.15, 1.3);
          break;
        case Difficulty.VERY_HARD:
          newInterval = INITIAL_INTERVAL; // Reset
          newFactor = Math.max(card.factor - 0.2, 1.3);
          break;
      }
      
      // If it's the first repetition, use fixed intervals
      if (card.reps <= 1) {
        switch (difficulty) {
          case Difficulty.EASY:
            newInterval = 4;
            break;
          case Difficulty.MEDIUM:
            newInterval = 3;
            break;
          case Difficulty.HARD:
            newInterval = 2;
            break;
          case Difficulty.VERY_HARD:
            newInterval = 1;
            break;
        }
      }
      
      // Update card
      card.interval = newInterval;
      card.factor = newFactor;
      card.dueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
      
      // Save data
      await this.saveUserSRData(srData);
      
      return true;
    } catch (error) {
      console.error('Error processing review:', error);
      return false;
    }
  }
  
  /**
   * Add a new question to the spaced repetition system
   * @param userId User ID
   * @param questionDetails Question details
   * @returns True if successful
   */
  public static async addQuestion(
    userId: string,
    courseId: string,
    unitId: string,
    topicId: string,
    questionId: string
  ): Promise<boolean> {
    try {
      let srData = await this.getUserSRData(userId);
      
      // If no SR data exists, create a new entry
      if (!srData) {
        srData = {
          userId,
          cards: []
        };
      }
      
      // Check if card already exists
      const existingCard = srData.cards.find(c => 
        c.courseId === courseId && 
        c.unitId === unitId && 
        c.topicId === topicId && 
        c.questionId === questionId
      );
      
      if (existingCard) {
        return true; // Card already exists
      }
      
      // Create a new card
      const now = new Date();
      const newCard: ReviewCard = {
        courseId,
        unitId,
        topicId,
        questionId,
        dueDate: now,
        interval: INITIAL_INTERVAL,
        factor: 2.5, // Initial ease factor
        reps: 0
      };
      
      // Add to collection
      srData.cards.push(newCard);
      
      // Save data
      this.saveUserSRData(srData);
      
      return true;
    } catch (error) {
      console.error('Error adding question:', error);
      return false;
    }
  }
  
  /**
   * Get a user's spaced repetition data
   * @param userId User ID
   * @returns User's spaced repetition data or null if not found
   */
  private static async getUserSRData(userId: string): Promise<SpacedRepetitionData | null> {
    try {
      // Read from storage
      const data = await readProgressData();
      
      // Find user
      const user = data.users.find(u => u.id === userId);
      if (!user) return null;
      
      // Check if user has SR data in metadata
      if (!user.metadata) {
        user.metadata = {};
      }
      
      if (!user.metadata.spacedRepetition) {
        user.metadata.spacedRepetition = {
          userId,
          cards: []
        };
        
        // Save the initialized metadata
        writeProgressData(data);
      }
      
      return user.metadata.spacedRepetition as SpacedRepetitionData;
    } catch (error) {
      console.error('Error getting SR data:', error);
      return null;
    }
  }
  
  /**
   * Save a user's spaced repetition data
   * @param srData Spaced repetition data to save
   * @returns True if successful
   */
  private static async saveUserSRData(srData: SpacedRepetitionData): Promise<boolean> {
    try {
      // Read from storage
      const data = await readProgressData();
      
      // Find user
      const user = data.users.find(u => u.id === srData.userId);
      if (!user) return false;
      
      // Initialize metadata if it doesn't exist
      if (!user.metadata) {
        user.metadata = {};
      }
      
      // Update SR data
      user.metadata.spacedRepetition = srData;
      
      // Save data
      return writeProgressData(data);
    } catch (error) {
      console.error('Error saving SR data:', error);
      return false;
    }
  }
  
  /**
   * Get user's review statistics
   * @param userId User ID
   * @returns Review statistics
   */
  public static async getReviewStats(userId: string): Promise<{
    reviewsDueToday: number;
    reviewsDueTomorrow: number;
    reviewsCompletedToday: number;
    totalCards: number;
  }> {
    const srData = await this.getUserSRData(userId);
    if (!srData) {
      return {
        reviewsDueToday: 0,
        reviewsDueTomorrow: 0,
        reviewsCompletedToday: 0,
        totalCards: 0
      };
    }
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Start of today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of tomorrow
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    // End of tomorrow
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    
    const reviewsDueToday = srData.cards.filter(c => new Date(c.dueDate) < tomorrowStart).length;
    const reviewsDueTomorrow = srData.cards.filter(c => 
      new Date(c.dueDate) >= tomorrowStart && 
      new Date(c.dueDate) < tomorrowEnd
    ).length;
    
    // Count completed reviews (approximation based on reps incremented today)
    // This is an approximation since we don't store review history
    const reviewsCompletedToday = srData.cards.filter(c => 
      c.dueDate > todayStart && 
      new Date(c.dueDate).getDate() !== now.getDate()
    ).length;
    
    return {
      reviewsDueToday,
      reviewsDueTomorrow,
      reviewsCompletedToday,
      totalCards: srData.cards.length
    };
  }
}
