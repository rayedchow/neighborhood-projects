import { ApiResponse } from '@/types';
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
 * Interface for user study goals data
 */
export interface UserStudyGoals {
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
   * @returns ApiResponse with the created goal or null on failure
   */
  public static async createGoal(
    userId: string,
    type: GoalType,
    target: number,
    courseId?: string,
    deadline?: string
  ): Promise<ApiResponse<StudyGoal | null>> {
    try {
      const progressData = await readProgressData();
      
      // Find user in progress data
      let user: any = progressData.users.find(u => u.id === userId);
      
      // If user doesn't exist, create them
      if (!user) {
        user = {
          id: userId,
          courses: [],
          study_goals: {
            userId,
            goals: [],
            dailyStreak: 0,
            lastActivity: new Date().toISOString(),
            longestStreak: 0
          }
        };
        progressData.users.push(user);
      }
      
      // Ensure study_goals exists
      if (!user.study_goals) {
        user.study_goals = {
          userId,
          goals: [],
          dailyStreak: 0,
          lastActivity: new Date().toISOString(),
          longestStreak: 0
        };
      }
      
      let goalsData = user.study_goals;
      
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
      const success = await writeProgressData(progressData);
      
      if (!success) {
        return createApiResponse(false, null, 'Failed to save goal data');
      }
      
      return createApiResponse(true, newGoal);
    } catch (error) {
      console.error('Error creating goal:', error);
      return createApiResponse(false, null, 'Internal server error');
    }
  }
  
  /**
   * Update progress on a goal
   * @param userId User ID
   * @param goalId Goal ID
   * @param progress New progress value
   * @returns Updated goal or null on failure
   */
  public static async updateGoalProgress(
    userId: string,
    goalId: string,
    progress: number
  ): Promise<StudyGoal | null> {
    try {
      const goalsData = await this.getUserGoalsData(userId);
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
      await StudyGoalsService.saveUserGoalsData(goalsData);
      
      return goal;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return null;
    }
  }
  
  /**
   * Get all goals for a user
   * Get user's goals
   * @param userId User ID
   * @returns ApiResponse with array of goals
   */
  async getUserGoals(userId: string): Promise<ApiResponse<StudyGoal[]>> {
    try {
      const progressData = await readProgressData();
      const user: any = progressData.users.find((u) => u.id === userId);
      
      if (!user || !user.study_goals) {
        return createApiResponse(true, []);
      }
      
      return createApiResponse(true, user.study_goals.goals || []);
    } catch (error) {
      console.error('Error getting user goals:', error);
      return createApiResponse(false, [], 'Failed to retrieve goals');
    }
  }
  
  /**
   * Get user goals data
   * @param userId User ID
   * @returns User study goals data or null if not found
   */
  private static async getUserGoalsData(userId: string): Promise<StudyGoalsData | null> {
    try {
      const progressData = await readProgressData();
      const user: any = progressData.users.find(u => u.id === userId);
      
      if (!user || !user.study_goals) {
        return null;
      }
      
      return user.study_goals;
    } catch (error) {
      console.error('Error getting user goals data:', error);
      return null;
    }
  }
  
  /**
   * Save user goals data
   * @param goalsData User study goals data
   * @returns True if save was successful, false otherwise
   */
  private static async saveUserGoalsData(goalsData: StudyGoalsData): Promise<boolean> {
    try {
      const progressData: any = await readProgressData();
      const userIndex = progressData.users.findIndex((u: any) => u.id === goalsData.userId);
      
      if (userIndex === -1) return false;
      
      progressData.users[userIndex].study_goals = goalsData;
      
      return await writeProgressData(progressData);
    } catch (error) {
      console.error('Error saving user goals data:', error);
      return false;
    }
  }
  
  /**
   * Auto-update goals based on user progress
   * @param userId User ID
   * @returns ApiResponse with number of goals updated
   */
  async autoUpdateGoals(userId: string): Promise<ApiResponse<number>> {
    try {
      const progressData = await readProgressData();
      const user: any = progressData.users.find((u) => u.id === userId);
      
      if (!user || !user.study_goals) {
        return createApiResponse(true, 0);
      }
      
      let updatedCount = 0;
      const goalsData = user.study_goals;
      
      // For each goal, update progress
      for (const goal of goalsData.goals) {
        let newProgress = 0;
        
        switch(goal.type) {
          // Update daily question count
          case GoalType.DAILY_QUESTIONS:
            // Count completed questions today
            if (user.progress && user.progress.questions) {
              const today = new Date().toISOString().split('T')[0];
              const completedToday = Object.values(user.progress.questions)
                .filter((q: any) => q.lastCompleted && q.lastCompleted.startsWith(today))
                .reduce((count: number, cp: any) => count + 1, 0);
                
              newProgress = completedToday;
            }
            break;
            
          // Update daily minutes
          case GoalType.DAILY_MINUTES:
            // Sum up study minutes from today
            if (user.sessions) {
              const today = new Date().toISOString().split('T')[0];
              const minutesToday = user.sessions
                .filter((s: any) => s.date && s.date.startsWith(today))
                .reduce((uCount: number, up: any) => uCount + (up.duration || 0), 0);
              const topicsToday = user.topics_studied
                .filter((t: any) => t.date && t.date.startsWith(today))
                .reduce((tCount: number, tp: any) => tCount + (tp.duration || 0), 0);
                
              newProgress = Math.floor((minutesToday + topicsToday) / 60); // Convert to minutes
            }
            break;
            
          // Update weekly topics
          case GoalType.WEEKLY_TOPICS:
            // Count completed topics this week
            if (user.topics_studied) {
              const now = new Date();
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
              startOfWeek.setHours(0, 0, 0, 0);
              
              const topicsThisWeek = new Set();
              
              user.topics_studied
                .filter((s: any) => {
                  const date = new Date(s.date);
                  return date >= startOfWeek;
                })
                .forEach((t: any) => {
                  if (t.topicId) topicsThisWeek.add(t.topicId);
                });
                
              newProgress = topicsThisWeek.size;
            }
            break;
            
          // Update weekly units
          case GoalType.WEEKLY_UNITS:
            // Count completed units this week
            if (user.progress && user.progress.units) {
              const now = new Date();
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
              startOfWeek.setHours(0, 0, 0, 0);
              
              const completedUnits = Object.values(user.progress.units)
                .filter((u: any) => u.completed && new Date(u.completedAt) >= startOfWeek)
                .reduce((count: number, cp: any) => count + 1, 0);
                
              const startedUnits = Object.values(user.progress.units)
                .filter((u: any) => u.started && new Date(u.startedAt) >= startOfWeek && !u.completed)
                .reduce((uCount: number, up: any) => uCount + (up.progress || 0) / 100, 0);
                
              const topics = Object.values(user.progress.topics || {})
                .filter((t: any) => t.lastStudied && new Date(t.lastStudied) >= startOfWeek)
                .reduce((tp: number, u: any) => tp + 0.1, 0); // 10 topics = 1 unit
                
              newProgress = Math.floor(completedUnits + startedUnits + topics);
            }
            break;
            
          // Update course completion
          case GoalType.COURSE_COMPLETION:
            // Calculate overall course progress
            if (goal.courseId && user.progress && user.progress.courses && 
                user.progress.courses[goal.courseId]) {
              newProgress = Math.floor(user.progress.courses[goal.courseId].progress || 0);
            }
            break;
        }
        
        // If progress changed, update it
        if (newProgress !== goal.progress) {
          goal.progress = newProgress;
          
          // Check if goal achieved
          if (newProgress >= goal.target && !goal.achieved) {
            goal.achieved = true;
            goal.completedAt = new Date().toISOString();
            goal.streakCount++;
          }
          
          updatedCount++;
        }
      }
      
      // Save changes if any goals were updated
      if (updatedCount > 0) {
        await writeProgressData(progressData);
      }
      
      return createApiResponse(true, updatedCount);
    } catch (error) {
      console.error('Error auto-updating goals:', error);
      return createApiResponse(false, 0, 'Error updating goals');
    }
  }
}
