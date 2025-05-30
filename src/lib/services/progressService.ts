import {
  User,
  CourseProgress,
  UnitProgress,
  TopicProgress,
  GetUserProgressRequest,
  UpdateProgressRequest,
  ApiResponse
} from '@/types';
import { readProgressData, writeProgressData, createApiResponse } from '../utils/fileOperations';

/**
 * Service class for handling all user progress data operations
 */
export class ProgressService {
  /**
   * Get user data by user ID
   * @param userId ID of the user to retrieve
   * @returns ApiResponse containing the User object or error
   */
  public static async getUserById(userId: string): Promise<ApiResponse<User | null>> {
    try {
      const data = await readProgressData();
      const user = data.users.find(u => u.id === userId);
      
      if (!user) {
        return createApiResponse(false, null, `User with ID ${userId} not found`);
      }
      
      return createApiResponse(true, user);
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error);
      return createApiResponse(false, null, 'Failed to retrieve user data');
    }
  }

  /**
   * Get user progress data based on request parameters
   * @param request GetUserProgressRequest containing userId and optional courseId
   * @returns ApiResponse containing user progress data
   */
  public static async getUserProgress(request: GetUserProgressRequest): Promise<ApiResponse<User | CourseProgress | null>> {
    const { userId, courseId } = request;
    
    try {
      const data = await readProgressData();
      const user = data.users.find((u: any) => u.id === userId);
      
      if (!user) {
        return createApiResponse(false, null, `User with ID ${userId} not found`);
      }
      
      // If courseId is provided, return the specific course progress
      if (courseId) {
        const courseProgress = user.courses_progress.find(cp => cp.course_id === courseId);
        
        if (!courseProgress) {
          return createApiResponse(false, null, `Course progress for course ${courseId} not found for user ${userId}`);
        }
        
        return createApiResponse(true, courseProgress);
      }
      
      // Otherwise return the entire user data
      return createApiResponse(true, user);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return createApiResponse(false, null, 'Failed to retrieve user progress');
    }
  }

  /**
   * Update user progress after attempting a question
   * @param request UpdateProgressRequest containing the progress update data
   * @returns ApiResponse indicating success or failure
   */
  public static async updateProgress(request: UpdateProgressRequest): Promise<ApiResponse<boolean>> {
    const { userId, courseId, unitId, topicId, questionId, isCorrect, timeSpentSeconds } = request;
    
    try {
      const data = await readProgressData();
      const userIndex = data.users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        return createApiResponse(false, false, `User with ID ${userId} not found`);
      }
      
      const user = data.users[userIndex];
      
      // Find or create course progress
      let courseProgressIndex = user.courses_progress.findIndex(cp => cp.course_id === courseId);
      if (courseProgressIndex === -1) {
        // Create new course progress if it doesn't exist
        user.courses_progress.push({
          course_id: courseId,
          last_accessed: new Date().toISOString(),
          completion_percentage: 0,
          units_progress: [],
          time_spent_seconds: 0,
          strengths: [],
          weaknesses: []
        });
        courseProgressIndex = user.courses_progress.length - 1;
      }
      
      const courseProgress = user.courses_progress[courseProgressIndex];
      
      // Update course last_accessed
      courseProgress.last_accessed = new Date().toISOString();
      
      // Find or create unit progress
      let unitProgressIndex = courseProgress.units_progress.findIndex(up => up.unit_id === unitId);
      if (unitProgressIndex === -1) {
        // Create new unit progress if it doesn't exist
        courseProgress.units_progress.push({
          unit_id: unitId,
          completion_percentage: 0,
          topics_progress: [],
          time_spent_seconds: 0,
          last_accessed: new Date().toISOString()
        });
        unitProgressIndex = courseProgress.units_progress.length - 1;
      }
      
      const unitProgress = courseProgress.units_progress[unitProgressIndex];
      
      // Update unit last_accessed
      unitProgress.last_accessed = new Date().toISOString();
      
      // Find or create topic progress
      let topicProgressIndex = unitProgress.topics_progress.findIndex(tp => tp.topic_id === topicId);
      if (topicProgressIndex === -1) {
        // Create new topic progress if it doesn't exist
        unitProgress.topics_progress.push({
          topic_id: topicId,
          completion_percentage: 0,
          questions_attempted: [],
          questions_correct: [],
          time_spent_seconds: 0,
          last_accessed: new Date().toISOString()
        });
        topicProgressIndex = unitProgress.topics_progress.length - 1;
      }
      
      const topicProgress = unitProgress.topics_progress[topicProgressIndex];
      
      // Update topic progress
      topicProgress.last_accessed = new Date().toISOString();
      topicProgress.time_spent_seconds += timeSpentSeconds;
      
      // Add question to attempted if not already present
      if (!topicProgress.questions_attempted.includes(questionId)) {
        topicProgress.questions_attempted.push(questionId);
      }
      
      // Add question to correct if the answer was correct and not already present
      if (isCorrect && !topicProgress.questions_correct.includes(questionId)) {
        topicProgress.questions_correct.push(questionId);
      }
      
      // Update completion percentages
      ProgressService.recalculateCompletionPercentages(user);
      
      // Update aggregated stats
      unitProgress.time_spent_seconds += timeSpentSeconds;
      courseProgress.time_spent_seconds += timeSpentSeconds;
      user.total_time_spent_seconds += timeSpentSeconds;
      
      // Update question stats
      user.total_questions_attempted = Array.from(
        new Set(
          user.courses_progress.flatMap(cp => 
            cp.units_progress.flatMap(up => 
              up.topics_progress.flatMap(tp => 
                tp.questions_attempted
              )
            )
          )
        )
      ).length;
      
      user.total_questions_correct = Array.from(
        new Set(
          user.courses_progress.flatMap(cp => 
            cp.units_progress.flatMap(up => 
              up.topics_progress.flatMap(tp => 
                tp.questions_correct
              )
            )
          )
        )
      ).length;
      
      // Update strengths and weaknesses
      ProgressService.updateStrengthsAndWeaknesses(user);
      
      // Update last login
      user.last_login = new Date().toISOString();
      
      // Update study streak
      ProgressService.updateStudyStreak(user);
      
      // Save the updated data
      const success = writeProgressData(data);
      
      if (!success) {
        return createApiResponse(false, false, 'Failed to save progress data');
      }
      
      return createApiResponse(true, true);
    } catch (error) {
      console.error('Error updating progress:', error);
      return createApiResponse(false, false, 'Failed to update progress');
    }
  }

  /**
   * Create a new user account
   * @param name User's name
   * @param email User's email
   * @returns ApiResponse containing the created User object or error
   */
  public static async createUser(name: string, email: string): Promise<ApiResponse<User | null>> {
    try {
      const data = await readProgressData();
      
      // Check if email already exists
      if (data.users.some((u: any) => u.email === email)) {
        return createApiResponse(false, null, `User with email ${email} already exists`);
      }
      
      // Generate a new user ID
      const userId = `user${data.users.length + 1}`;
      
      // Create new user object
      const newUser: User = {
        id: userId,
        name,
        email,
        courses_progress: [],
        study_streak_days: 0,
        total_questions_attempted: 0,
        total_questions_correct: 0,
        total_time_spent_seconds: 0,
        joined_date: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      // Add user to data
      data.users.push(newUser);
      
      // Save updated data
      const success = writeProgressData(data);
      
      if (!success) {
        return createApiResponse(false, null, 'Failed to save user data');
      }
      
      return createApiResponse(true, newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return createApiResponse(false, null, 'Failed to create user');
    }
  }

  /**
   * Get recommended practice units based on user progress
   * @param userId User ID
   * @param courseId Course ID
   * @param count Number of recommendations to return
   * @returns ApiResponse containing array of recommended unit IDs
   */
  public static async getRecommendedPractice(
    userId: string,
    courseId: string,
    count: number = 3
  ): Promise<ApiResponse<string[] | null>> {
    try {
      const data = await readProgressData();
      const user = data.users.find((u: any) => u.id === userId);
      
      if (!user) {
        return createApiResponse(false, null, `User with ID ${userId} not found`);
      }
      
      const courseProgress = user.courses_progress.find(cp => cp.course_id === courseId);
      
      if (!courseProgress) {
        // If no course progress, recommend starting with any unit
        return createApiResponse(true, ['unit1']);
      }
      
      // Sort units by completion percentage (ascending)
      const sortedUnits = [...courseProgress.units_progress]
        .sort((a, b) => a.completion_percentage - b.completion_percentage);
      
      // Get the unit IDs with lowest completion
      const recommendedUnits = sortedUnits
        .slice(0, Math.min(count, sortedUnits.length))
        .map(up => up.unit_id);
      
      // If we don't have enough recommendations, add 'unit1'
      if (recommendedUnits.length < count && !recommendedUnits.includes('unit1')) {
        recommendedUnits.push('unit1');
      }
      
      return createApiResponse(true, recommendedUnits);
    } catch (error) {
      console.error('Error getting recommended practice:', error);
      return createApiResponse(false, null, 'Failed to determine recommended practice');
    }
  }

  /**
   * Get user performance statistics
   * @param userId User ID
   * @returns ApiResponse containing user statistics
   */
  public static async getUserStats(userId: string): Promise<ApiResponse<{
    totalQuestions: number;
    correctQuestions: number;
    accuracy: number;
    timeSpent: number;
    streak: number;
    strengths: string[];
    weaknesses: string[];
  } | null>> {
    try {
      const data = await readProgressData();
      const user = data.users.find((u: any) => u.id === userId);
      
      if (!user) {
        return createApiResponse(false, null, `User with ID ${userId} not found`);
      }
      
      // Calculate overall accuracy
      const accuracy = user.total_questions_attempted > 0
        ? (user.total_questions_correct / user.total_questions_attempted) * 100
        : 0;
      
      // Compile stats
      const stats = {
        totalQuestions: user.total_questions_attempted,
        correctQuestions: user.total_questions_correct,
        accuracy,
        timeSpent: user.total_time_spent_seconds,
        streak: user.study_streak_days,
        strengths: user.courses_progress.flatMap(cp => cp.strengths),
        weaknesses: user.courses_progress.flatMap(cp => cp.weaknesses)
      };
      
      return createApiResponse(true, stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      return createApiResponse(false, null, 'Failed to retrieve user statistics');
    }
  }

  /**
   * Reset user progress for a specific course
   * @param userId User ID
   * @param courseId Course ID
   * @returns ApiResponse indicating success or failure
   */
  public static async resetCourseProgress(userId: string, courseId: string): Promise<ApiResponse<boolean>> {
    try {
      const data = await readProgressData();
      const userIndex = data.users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        return createApiResponse(false, false, `User with ID ${userId} not found`);
      }
      
      const user = data.users[userIndex];
      
      // Find the course progress
      const courseProgressIndex = user.courses_progress.findIndex(cp => cp.course_id === courseId);
      
      if (courseProgressIndex === -1) {
        return createApiResponse(false, false, `Course progress for course ${courseId} not found for user ${userId}`);
      }
      
      // Reset course progress
      user.courses_progress[courseProgressIndex] = {
        course_id: courseId,
        last_accessed: new Date().toISOString(),
        completion_percentage: 0,
        units_progress: [],
        time_spent_seconds: 0,
        strengths: [],
        weaknesses: []
      };
      
      // Recalculate user stats
      ProgressService.recalculateUserStats(user);
      
      // Save the updated data
      const success = writeProgressData(data);
      
      if (!success) {
        return createApiResponse(false, false, 'Failed to save progress data');
      }
      
      return createApiResponse(true, true);
    } catch (error) {
      console.error('Error resetting course progress:', error);
      return createApiResponse(false, false, 'Failed to reset course progress');
    }
  }

  /**
   * Helper method to recalculate completion percentages for a user
   * @param user User object to update
   */
  private static recalculateCompletionPercentages(user: User): void {
    // For each course
    user.courses_progress.forEach((courseProgress: CourseProgress) => {
      // For each unit
      courseProgress.units_progress.forEach((unitProgress: UnitProgress) => {
        // For each topic
        unitProgress.topics_progress.forEach((topicProgress: TopicProgress) => {
          // Calculate topic completion percentage
          if (topicProgress.questions_attempted.length > 0) {
            topicProgress.completion_percentage = 
              (topicProgress.questions_correct.length / topicProgress.questions_attempted.length) * 100;
          } else {
            topicProgress.completion_percentage = 0;
          }
        });
        
        // Calculate unit completion percentage (average of topics)
        if (unitProgress.topics_progress.length > 0) {
          unitProgress.completion_percentage = 
            unitProgress.topics_progress.reduce((sum: number, tp: TopicProgress) => sum + tp.completion_percentage, 0) / 
            unitProgress.topics_progress.length;
        } else {
          unitProgress.completion_percentage = 0;
        }
      });
      
      // Calculate course completion percentage (average of units)
      if (courseProgress.units_progress.length > 0) {
        courseProgress.completion_percentage = 
          courseProgress.units_progress.reduce((sum: number, up: UnitProgress) => sum + up.completion_percentage, 0) / 
          courseProgress.units_progress.length;
      } else {
        courseProgress.completion_percentage = 0;
      }
    });
  }

  /**
   * Helper method to update strengths and weaknesses for a user
   * @param user User object to update
   */
  private static updateStrengthsAndWeaknesses(user: User): void {
    // For each course
    user.courses_progress.forEach((courseProgress: CourseProgress) => {
      const unitAccuracies: { unitId: string, name: string, accuracy: number }[] = [];
      
      // Calculate accuracy for each unit
      courseProgress.units_progress.forEach((unitProgress: UnitProgress) => {
        const totalAttempted = unitProgress.topics_progress.reduce(
          (sum: number, tp: TopicProgress) => sum + tp.questions_attempted.length, 0
        );
        
        const totalCorrect = unitProgress.topics_progress.reduce(
          (sum: number, tp: TopicProgress) => sum + tp.questions_correct.length, 0
        );
        
        if (totalAttempted > 0) {
          unitAccuracies.push({
            unitId: unitProgress.unit_id,
            name: unitProgress.unit_id.replace('unit', 'Unit '), // Simple name for demo
            accuracy: (totalCorrect / totalAttempted) * 100
          });
        }
      });
      
      // Sort by accuracy
      const sorted = [...unitAccuracies].sort((a, b) => b.accuracy - a.accuracy);
      
      // Set strengths (top 2)
      courseProgress.strengths = sorted
        .slice(0, Math.min(2, sorted.length))
        .filter(unit => unit.accuracy >= 70) // Only include as strength if >= 70%
        .map(unit => unit.name);
      
      // Set weaknesses (bottom 2)
      courseProgress.weaknesses = sorted
        .slice(-Math.min(2, sorted.length))
        .filter(unit => unit.accuracy < 70) // Only include as weakness if < 70%
        .map(unit => unit.name);
    });
  }

  /**
   * Helper method to update study streak for a user
   * @param user User object to update
   */
  private static updateStudyStreak(user: User): void {
    const lastLoginDate = new Date(user.last_login);
    const currentDate = new Date();
    
    // Get dates without time
    const lastLoginDay = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate()).getTime();
    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
    
    // Calculate difference in days
    const diffDays = Math.floor((currentDay - lastLoginDay) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, no change to streak
      return;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      user.study_streak_days += 1;
    } else {
      // Streak broken, reset to 1
      user.study_streak_days = 1;
    }
  }

  /**
   * Helper method to recalculate all user stats
   * @param user User object to update
   */
  private static recalculateUserStats(user: User): void {
    // Calculate total questions attempted
    user.total_questions_attempted = Array.from(
      new Set(
        user.courses_progress.flatMap(cp => 
          cp.units_progress.flatMap(up => 
            up.topics_progress.flatMap(tp => 
              tp.questions_attempted
            )
          )
        )
      )
    ).length;
    
    // Calculate total questions correct
    user.total_questions_correct = Array.from(
      new Set(
        user.courses_progress.flatMap(cp => 
          cp.units_progress.flatMap(up => 
            up.topics_progress.flatMap(tp => 
              tp.questions_correct
            )
          )
        )
      )
    ).length;
    
    // Calculate total time spent
    user.total_time_spent_seconds = user.courses_progress.reduce(
      (sum: number, cp: CourseProgress) => sum + cp.time_spent_seconds, 0
    );
    
    // Update strengths and weaknesses
    ProgressService.updateStrengthsAndWeaknesses(user);
  }
}
