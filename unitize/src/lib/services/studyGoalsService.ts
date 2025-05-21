import { User } from '@/types';
import { readProgressData, writeProgressData, createApiResponse } from '../utils/fileOperations';

// Study goal types
export enum GoalType {
  DAILY_QUESTIONS = 'daily_questions',
  DAILY_MINUTES = 'daily_minutes',
  WEEKLY_TOPICS = 'weekly_topics',
  WEEKLY_UNITS = 'weekly_units',
  COURSE_COMPLETION = 'course_completion'
}

export interface StudyGoal {
  id: string;
  type: GoalType;
  target: number;
  progress: number;
  deadline?: string; // ISO date string
  completedAt?: string; // ISO date string
  courseId?: string;
  created: string; // ISO date string
  achieved: boolean;
  streakCount: number; // Consecutive achievements
}

interface StudyGoalsData {
  userId: string;
  goals: StudyGoal[];
  dailyStreak: number;
  lastActivity: string; // ISO date string
  longestStreak: number;
}

/**
 * Service for managing study goals and streaks
 */
export class StudyGoalsService {
  /**
   * Create a new study goal for a user
   * @param userId User ID
   * @param type Goal type
   * @param target Target value to achieve
   * @param courseId Optional course ID if goal is course-specific
   * @param deadline Optional deadline date
   * @returns The created goal or null on failure
   */
  public static createGoal(
    userId: string,
    type: GoalType,
    target: number,
    courseId?: string,
    deadline?: string
  ): StudyGoal | null {
    try {
      let goalsData = this.getUserGoalsData(userId);
      
      // If no goals data exists, create a new entry
      if (!goalsData) {
        goalsData = {
          userId,
          goals: [],
          dailyStreak: 0,
          lastActivity: new Date().toISOString(),
          longestStreak: 0
        };
      }
      
      // Create new goal
      const newGoal: StudyGoal = {
        id: `goal_${Date.now()}`,
        type,
        target,
        progress: 0,
        created: new Date().toISOString(),
        achieved: false,
        streakCount: 0,
        courseId
      };
      
      if (deadline) {
        newGoal.deadline = deadline;
      }
      
      // Add to goals
      goalsData.goals.push(newGoal);
      
      // Save data
      this.saveUserGoalsData(goalsData);
      
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  }
  
  /**
   * Update progress on a goal
   * @param userId User ID
   * @param goalId Goal ID
   * @param progress New progress value
   * @returns Updated goal or null on failure
   */
  public static updateGoalProgress(
    userId: string,
    goalId: string,
    progress: number
  ): StudyGoal | null {
    try {
      const goalsData = this.getUserGoalsData(userId);
      if (!goalsData) return null;
      
      // Find the goal
      const goalIndex = goalsData.goals.findIndex(g => g.id === goalId);
      if (goalIndex === -1) return null;
      
      const goal = goalsData.goals[goalIndex];
      
      // Update progress
      goal.progress = progress;
      
      // Check if goal is now achieved
      if (progress >= goal.target && !goal.achieved) {
        goal.achieved = true;
        goal.completedAt = new Date().toISOString();
        goal.streakCount += 1;
      }
      
      // Save data
      this.saveUserGoalsData(goalsData);
      
      return goal;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return null;
    }
  }
  
  /**
   * Get all goals for a user
   * @param userId User ID
   * @returns Array of goals or empty array if none found
   */
  public static getGoals(userId: string): StudyGoal[] {
    const goalsData = this.getUserGoalsData(userId);
    return goalsData ? goalsData.goals : [];
  }
  
  /**
   * Delete a goal
   * @param userId User ID
   * @param goalId Goal ID
   * @returns True if successful
   */
  public static deleteGoal(userId: string, goalId: string): boolean {
    try {
      const goalsData = this.getUserGoalsData(userId);
      if (!goalsData) return false;
      
      // Filter out the goal
      goalsData.goals = goalsData.goals.filter(g => g.id !== goalId);
      
      // Save data
      this.saveUserGoalsData(goalsData);
      
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }
  
  /**
   * Reset a goal's progress
   * @param userId User ID
   * @param goalId Goal ID
   * @returns Updated goal or null on failure
   */
  public static resetGoal(userId: string, goalId: string): StudyGoal | null {
    try {
      const goalsData = this.getUserGoalsData(userId);
      if (!goalsData) return null;
      
      // Find the goal
      const goalIndex = goalsData.goals.findIndex(g => g.id === goalId);
      if (goalIndex === -1) return null;
      
      const goal = goalsData.goals[goalIndex];
      
      // Reset progress
      goal.progress = 0;
      goal.achieved = false;
      goal.completedAt = undefined;
      
      // Save data
      this.saveUserGoalsData(goalsData);
      
      return goal;
    } catch (error) {
      console.error('Error resetting goal:', error);
      return null;
    }
  }
  
  /**
   * Update a user's streak information
   * @param userId User ID
   * @returns Updated streak information
   */
  public static updateStreak(userId: string): { dailyStreak: number, longestStreak: number } | null {
    try {
      let goalsData = this.getUserGoalsData(userId);
      
      // If no goals data exists, create a new entry
      if (!goalsData) {
        goalsData = {
          userId,
          goals: [],
          dailyStreak: 1, // First day
          lastActivity: new Date().toISOString(),
          longestStreak: 1
        };
        
        this.saveUserGoalsData(goalsData);
        return { dailyStreak: 1, longestStreak: 1 };
      }
      
      const now = new Date();
      const lastActivity = new Date(goalsData.lastActivity);
      
      // Get dates without time
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const lastDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate()).getTime();
      
      // Calculate difference in days
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Same day, no change to streak
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        goalsData.dailyStreak += 1;
        
        // Update longest streak if needed
        if (goalsData.dailyStreak > goalsData.longestStreak) {
          goalsData.longestStreak = goalsData.dailyStreak;
        }
      } else {
        // Streak broken, reset to 1
        goalsData.dailyStreak = 1;
      }
      
      // Update last activity
      goalsData.lastActivity = now.toISOString();
      
      // Save data
      this.saveUserGoalsData(goalsData);
      
      return { 
        dailyStreak: goalsData.dailyStreak, 
        longestStreak: goalsData.longestStreak 
      };
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }
  
  /**
   * Get a user's current streak information
   * @param userId User ID
   * @returns Streak information
   */
  public static getStreakInfo(userId: string): { 
    dailyStreak: number, 
    longestStreak: number,
    lastActivity: string
  } | null {
    try {
      const goalsData = this.getUserGoalsData(userId);
      
      if (!goalsData) return { 
        dailyStreak: 0, 
        longestStreak: 0,
        lastActivity: new Date().toISOString()
      };
      
      return { 
        dailyStreak: goalsData.dailyStreak, 
        longestStreak: goalsData.longestStreak,
        lastActivity: goalsData.lastActivity
      };
    } catch (error) {
      console.error('Error getting streak info:', error);
      return null;
    }
  }
  
  /**
   * Get a user's study goals data
   * @param userId User ID
   * @returns User's goals data or null if not found
   */
  private static getUserGoalsData(userId: string): StudyGoalsData | null {
    try {
      // Read from storage
      const data = readProgressData();
      
      // Find user
      const user = data.users.find(u => u.id === userId);
      if (!user) return null;
      
      // Check if user has goals data in metadata
      if (!user.metadata) {
        user.metadata = {};
      }
      
      if (!user.metadata.studyGoals) {
        user.metadata.studyGoals = {
          userId,
          goals: [],
          dailyStreak: 0,
          lastActivity: new Date().toISOString(),
          longestStreak: 0
        };
        
        // Save the initialized metadata
        writeProgressData(data);
      }
      
      return user.metadata.studyGoals as StudyGoalsData;
    } catch (error) {
      console.error('Error getting goals data:', error);
      return null;
    }
  }
  
  /**
   * Save a user's study goals data
   * @param goalsData Goals data to save
   * @returns True if successful
   */
  private static saveUserGoalsData(goalsData: StudyGoalsData): boolean {
    try {
      // Read from storage
      const data = readProgressData();
      
      // Find user
      const user = data.users.find(u => u.id === goalsData.userId);
      if (!user) return false;
      
      // Initialize metadata if it doesn't exist
      if (!user.metadata) {
        user.metadata = {};
      }
      
      // Update goals data
      user.metadata.studyGoals = goalsData;
      
      // Save data
      return writeProgressData(data);
    } catch (error) {
      console.error('Error saving goals data:', error);
      return false;
    }
  }
  
  /**
   * Auto-update goals based on user progress
   * @param userId User ID
   * @returns Number of goals updated
   */
  public static autoUpdateGoals(userId: string): number {
    try {
      const goalsData = this.getUserGoalsData(userId);
      if (!goalsData) return 0;
      
      const data = readProgressData();
      const user = data.users.find(u => u.id === userId);
      if (!user) return 0;
      
      let updatedCount = 0;
      
      // Update each goal based on its type
      goalsData.goals.forEach(goal => {
        let newProgress = 0;
        
        switch (goal.type) {
          case GoalType.DAILY_QUESTIONS:
            // Count questions attempted today
            const today = new Date().toISOString().split('T')[0];
            const questionCount = user.courses_progress.reduce((count, cp) => {
              if (goal.courseId && cp.course_id !== goal.courseId) return count;
              
              // Count questions attempted today (approximate)
              // This is simplified - in a real app you'd track daily attempts separately
              const todayAttempts = cp.units_progress.reduce((uCount, up) => {
                return uCount + up.topics_progress.reduce((tCount, tp) => {
                  if (tp.last_accessed.startsWith(today)) {
                    return tCount + tp.questions_attempted.length;
                  }
                  return tCount;
                }, 0);
              }, 0);
              
              return count + todayAttempts;
            }, 0);
            
            newProgress = questionCount;
            break;
            
          case GoalType.DAILY_MINUTES:
            // Calculate minutes spent today
            // Simplified - would need better time tracking
            const minutesToday = Math.floor(user.total_time_spent_seconds / 60);
            newProgress = minutesToday;
            break;
            
          case GoalType.WEEKLY_TOPICS:
            // Count topics with progress this week
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekStartStr = weekStart.toISOString();
            
            const topicCount = user.courses_progress.reduce((count, cp) => {
              if (goal.courseId && cp.course_id !== goal.courseId) return count;
              
              const courseTopics = cp.units_progress.reduce((uCount, up) => {
                return uCount + up.topics_progress.filter(tp => 
                  tp.last_accessed > weekStartStr && tp.completion_percentage > 0
                ).length;
              }, 0);
              
              return count + courseTopics;
            }, 0);
            
            newProgress = topicCount;
            break;
            
          case GoalType.COURSE_COMPLETION:
            if (goal.courseId) {
              const courseProgress = user.courses_progress.find(cp => cp.course_id === goal.courseId);
              if (courseProgress) {
                newProgress = Math.floor(courseProgress.completion_percentage);
              }
            }
            break;
        }
        
        // Update goal if progress changed
        if (newProgress !== goal.progress) {
          goal.progress = newProgress;
          
          // Check if goal is now achieved
          if (newProgress >= goal.target && !goal.achieved) {
            goal.achieved = true;
            goal.completedAt = new Date().toISOString();
            goal.streakCount += 1;
          }
          
          updatedCount++;
        }
      });
      
      // Save if any goals were updated
      if (updatedCount > 0) {
        this.saveUserGoalsData(goalsData);
      }
      
      return updatedCount;
    } catch (error) {
      console.error('Error auto-updating goals:', error);
      return 0;
    }
  }
}
