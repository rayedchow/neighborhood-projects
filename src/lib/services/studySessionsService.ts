import { ApiResponse, createApiResponse } from '@/types';
import { readStudySessionsData as readServerData, writeStudySessionsData as writeServerData } from '@/lib/server/actions';

// Define the session data structure
export interface StudySession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  courseId?: string;
  topicId?: string;
  notes?: string;
}

export interface SessionsData {
  sessions: StudySession[];
}

// Interface for session stats
export interface SessionStats {
  todayMinutes: number;
  weekMinutes: number;
  totalSessions: number;
  averageSessionLength: number;
  longestSession: number;
  currentStreak: number;
}

// Read sessions data from file
const readSessionsData = async (): Promise<SessionsData> => {
  try {
    return await readServerData<SessionsData>();
  } catch (error) {
    console.error('Error reading sessions data:', error);
    return { sessions: [] };
  }
};

// Write sessions data to file
const writeSessionsData = async (data: SessionsData): Promise<boolean> => {
  try {
    return await writeServerData<SessionsData>(data);
  } catch (error) {
    console.error('Error writing sessions data:', error);
    return false;
  }
};

export class StudySessionsService {
  /**
   * Create a new study session
   * @param userId User ID
   * @param duration Duration in minutes
   * @param courseId Optional course ID
   * @param topicId Optional topic ID
   * @param notes Optional notes
   * @returns ApiResponse with the created session
   */
  async createSession(
    userId: string,
    duration: number,
    courseId?: string,
    topicId?: string,
    notes?: string
  ): Promise<ApiResponse<StudySession | null>> {
    try {
      if (!userId) {
        return createApiResponse(false, null, 'User ID is required');
      }

      if (duration <= 0) {
        return createApiResponse(false, null, 'Duration must be greater than 0');
      }

      const sessionsData = await readSessionsData();
      
      // Create a new session
      const newSession: StudySession = {
        id: Math.random().toString(36).substring(2, 15),
        userId,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + duration * 60 * 1000).toISOString(),
        duration,
        courseId,
        topicId,
        notes
      };

      sessionsData.sessions.push(newSession);
      
      // Write the updated data
      const writeSuccess = await writeSessionsData(sessionsData);
      if (!writeSuccess) {
        return createApiResponse(false, null, 'Failed to save the session');
      }
      
      return createApiResponse(true, newSession);
    } catch (error) {
      console.error('Error creating session:', error);
      return createApiResponse(false, null, 'Internal server error');
    }
  }
  
  /**
   * Get user's study sessions
   * @param userId User ID
   * @param limit Optional limit
   * @param offset Optional offset
   * @returns ApiResponse with user's sessions
   */
  async getUserSessions(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<StudySession[]>> {
    try {
      const data = await readSessionsData();
      
      // Filter sessions by user ID
      let userSessions = data.sessions.filter((session: StudySession) => session.userId === userId);
      
      // Sort by date (most recent first)
      userSessions.sort((a: StudySession, b: StudySession) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      // Apply pagination if provided
      if (limit !== undefined && offset !== undefined) {
        userSessions = userSessions.slice(offset, offset + limit);
      } else if (limit !== undefined) {
        userSessions = userSessions.slice(0, limit);
      }
      
      return createApiResponse(true, userSessions);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return createApiResponse(false, [], 'Failed to get user sessions');
    }
  }
  
  /**
   * Delete a study session
   * @param sessionId Session ID to delete
   * @returns ApiResponse indicating success or failure
   */
  async deleteSession(sessionId: string): Promise<ApiResponse<boolean>> {
    try {
      const data = await readSessionsData();
      
      // Find the index of the session
      const sessionIndex = data.sessions.findIndex((session: StudySession) => session.id === sessionId);
      
      if (sessionIndex === -1) {
        return createApiResponse(false, false, 'Session not found');
      }
      
      // Remove the session
      data.sessions.splice(sessionIndex, 1);
      
      // Save the updated data
      const writeSuccess = await writeSessionsData(data);
      if (!writeSuccess) {
        return createApiResponse(false, false, 'Failed to save session data');
      }
      
      return createApiResponse(true, true);
    } catch (error) {
      console.error('Error deleting study session:', error);
      return createApiResponse(false, false, 'Failed to delete study session');
    }
  }
  
  /**
   * Get user's study session statistics
   * @param userId User ID
   * @returns ApiResponse with session statistics
   */
  async getUserStats(userId: string): Promise<ApiResponse<SessionStats | null>> {
    try {
      const data = await readSessionsData();
      
      // Filter sessions by user ID
      const userSessions = data.sessions.filter((session: StudySession) => session.userId === userId);
      
      if (userSessions.length === 0) {
        return createApiResponse(true, {
          todayMinutes: 0,
          weekMinutes: 0,
          totalSessions: 0,
          averageSessionLength: 0,
          longestSession: 0,
          currentStreak: 0
        });
      }
      
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Calculate statistics
      const todayMinutes = userSessions
        .filter((session: StudySession) => new Date(session.startTime) >= today)
        .reduce((total: number, session: StudySession) => total + session.duration, 0);
      
      const weekMinutes = userSessions
        .filter((session: StudySession) => new Date(session.startTime) >= startOfWeek)
        .reduce((total: number, session: StudySession) => total + session.duration, 0);
      
      const totalSessions = userSessions.length;
      
      const averageSessionLength = Math.round(
        userSessions.reduce((total: number, session: StudySession) => total + session.duration, 0) / totalSessions
      );
      
      const longestSession = Math.max(
        ...userSessions.map((session: StudySession) => session.duration)
      );
      
      // Calculate streak
      const currentStreak = await this.calculateUserStreak(userId);
      
      return createApiResponse(true, {
        todayMinutes,
        weekMinutes,
        totalSessions,
        averageSessionLength,
        longestSession,
        currentStreak
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      return createApiResponse(false, null, 'Failed to retrieve user statistics');
    }
  }
  
  /**
   * Calculate and update user's streak
   * @param userId User ID
   */
  async updateUserStreak(userId: string): Promise<void> {
    // Calculate streak and return the result
    await this.calculateUserStreak(userId);
  }
  
  /**
   * Calculate user's current streak
   * @param userId User ID
   * @returns The current streak count
   */
  async calculateUserStreak(userId: string): Promise<number> {
    try {
      const data = await readSessionsData();
      const userSessions = data.sessions.filter((session: StudySession) => session.userId === userId);
      
      if (userSessions.length === 0) {
        return 0;
      }
      
      // Sort sessions by date (most recent first)
      userSessions.sort((a: StudySession, b: StudySession) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      // Get unique dates (YYYY-MM-DD format)
      const uniqueDates = new Set<string>();
      userSessions.forEach((session: StudySession) => {
        const date = new Date(session.startTime).toISOString().split('T')[0];
        uniqueDates.add(date);
      });
      
      // Convert to array and sort dates
      const sortedDates = Array.from(uniqueDates).sort().reverse();
      
      if (sortedDates.length === 0) {
        return 0;
      }
      
      // Check if the most recent date is today or yesterday
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
        return 0; // Streak broken
      }
      
      // Count consecutive days
      let streak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = new Date(sortedDates[i + 1]);
        
        // Check if dates are consecutive
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating user streak:', error);
      return 0;
    }
  }
}
