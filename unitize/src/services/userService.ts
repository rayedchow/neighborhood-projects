import { UserRepository } from '../repositories/userRepository';
import { ApiResponse, ProgressUpdateRequest, TestHistoryRequest, TestHistoryEntry } from '../models';

/**
 * Service for user progress-related operations
 */
export class UserService {
  private static repository = new UserRepository();

  /**
   * Get a user by ID
   */
  static getUserById(userId: string): ApiResponse<any> {
    try {
      const user = this.repository.getUserById(userId);
      
      if (!user) {
        return { success: false, data: null, error: `User with ID ${userId} not found` };
      }
      
      return { success: true, data: user };
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error);
      return { success: false, data: null, error: 'Failed to retrieve user data' };
    }
  }

  /**
   * Update a user's progress for a question attempt
   */
  static updateProgress(request: ProgressUpdateRequest): ApiResponse<any> {
    try {
      const success = this.repository.updateProgress(request);
      
      if (!success) {
        return { success: false, data: null, error: 'Failed to update progress' };
      }
      
      return { success: true, data: { updated: true } };
    } catch (error) {
      console.error('Error updating user progress:', error);
      return { success: false, data: null, error: 'Failed to update progress' };
    }
  }

  /**
   * Get user progress stats for a course
   */
  static getCourseStats(userId: string, courseId: string): ApiResponse<any> {
    try {
      const stats = this.repository.getUserCourseStats(userId, courseId);
      
      if (!stats) {
        return { success: false, data: null, error: `Stats not found for user ${userId} and course ${courseId}` };
      }
      
      return { success: true, data: stats };
    } catch (error) {
      console.error(`Error getting stats for user ${userId} and course ${courseId}:`, error);
      return { success: false, data: null, error: 'Failed to retrieve user stats' };
    }
  }

  /**
   * Get user test history
   */
  static getTestHistory(userId: string, courseId?: string): ApiResponse<TestHistoryEntry[]> {
    try {
      const history = this.repository.getUserTestHistory(userId, courseId);
      
      if (!history) {
        return { 
          success: false, 
          data: null, 
          error: courseId
            ? `Test history not found for user ${userId} and course ${courseId}`
            : `Test history not found for user ${userId}`
        };
      }
      
      return { success: true, data: history };
    } catch (error) {
      console.error(`Error getting test history for user ${userId}:`, error);
      return { success: false, data: null, error: 'Failed to retrieve test history' };
    }
  }
  
  /**
   * Add a new test history entry
   */
  static addTestHistoryEntry(request: TestHistoryRequest): ApiResponse<TestHistoryEntry> {
    try {
      const newEntry = this.repository.addTestHistoryEntry(request);
      
      if (!newEntry) {
        return { success: false, data: null, error: 'Failed to add test history entry' };
      }
      
      return { success: true, data: newEntry };
    } catch (error) {
      console.error('Error adding test history entry:', error);
      return { success: false, data: null, error: 'Failed to add test history entry' };
    }
  }

  /**
   * Get recommended topics for a user based on performance
   */
  static getRecommendations(userId: string, courseId: string, limit: number = 5): ApiResponse<any> {
    try {
      const recommendations = this.repository.getRecommendedTopics(userId, courseId, limit);
      return { success: true, data: recommendations };
    } catch (error) {
      console.error(`Error getting recommendations for user ${userId}:`, error);
      return { success: false, data: null, error: 'Failed to generate recommendations' };
    }
  }
}
