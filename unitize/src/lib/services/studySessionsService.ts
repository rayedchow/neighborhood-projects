import fs from 'fs';
import path from 'path';
import { ApiResponse, createApiResponse } from '@/types';

// Define the path to the sessions data file
const SESSIONS_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'study_sessions.json');

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
const readSessionsData = (): SessionsData => {
  try {
    // Create file with default data if it doesn't exist
    if (!fs.existsSync(SESSIONS_DATA_PATH)) {
      const defaultData: SessionsData = { sessions: [] };
      fs.writeFileSync(SESSIONS_DATA_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    
    const data = fs.readFileSync(SESSIONS_DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading sessions data:', error);
    return { sessions: [] };
  }
};

// Write sessions data to file
const writeSessionsData = (data: SessionsData): boolean => {
  try {
    fs.writeFileSync(SESSIONS_DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing sessions data:', error);
    return false;
  }
};

export class StudySessionsService {
  // Create a new study session
  public static createSession(
    userId: string,
    duration: number,
    courseId?: string,
    topicId?: string,
    notes?: string
  ): ApiResponse<StudySession> {
    try {
      const data = readSessionsData();
      
      const now = new Date();
      const endTime = new Date(now);
      const startTime = new Date(endTime.getTime() - duration * 60000); // Convert minutes to milliseconds
      
      const newSession: StudySession = {
        id: `session_${Date.now()}`,
        userId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        courseId,
        topicId,
        notes
      };
      
      // Add the new session
      data.sessions.push(newSession);
      
      // Save the updated data
      if (!writeSessionsData(data)) {
        return createApiResponse(false, null, 'Failed to save session data');
      }
      
      // Update the user's streak
      this.updateUserStreak(userId);
      
      return createApiResponse(true, newSession);
    } catch (error) {
      console.error('Error creating study session:', error);
      return createApiResponse(false, null, 'Failed to create study session');
    }
  }
  
  // Get user's study sessions
  public static getUserSessions(
    userId: string,
    limit?: number,
    offset?: number
  ): ApiResponse<StudySession[]> {
    try {
      const data = readSessionsData();
      
      // Filter sessions by user ID
      let userSessions = data.sessions
        .filter(session => session.userId === userId)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      // Apply pagination if needed
      if (offset !== undefined && limit !== undefined) {
        userSessions = userSessions.slice(offset, offset + limit);
      } else if (limit !== undefined) {
        userSessions = userSessions.slice(0, limit);
      }
      
      return createApiResponse(true, userSessions);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return createApiResponse(false, [], 'Failed to retrieve user sessions');
    }
  }
  
  // Delete a study session
  public static deleteSession(sessionId: string): ApiResponse<boolean> {
    try {
      const data = readSessionsData();
      
      // Find the session index
      const sessionIndex = data.sessions.findIndex(session => session.id === sessionId);
      
      if (sessionIndex === -1) {
        return createApiResponse(false, false, `Session with ID ${sessionId} not found`);
      }
      
      // Remove the session
      data.sessions.splice(sessionIndex, 1);
      
      // Save the updated data
      if (!writeSessionsData(data)) {
        return createApiResponse(false, false, 'Failed to save session data');
      }
      
      return createApiResponse(true, true);
    } catch (error) {
      console.error('Error deleting study session:', error);
      return createApiResponse(false, false, 'Failed to delete study session');
    }
  }
  
  // Get user's study session statistics
  public static getUserStats(userId: string): ApiResponse<SessionStats> {
    try {
      const data = readSessionsData();
      
      // Filter sessions by user ID
      const userSessions = data.sessions.filter(session => session.userId === userId);
      
      if (userSessions.length === 0) {
        const emptyStats: SessionStats = {
          todayMinutes: 0,
          weekMinutes: 0,
          totalSessions: 0,
          averageSessionLength: 0,
          longestSession: 0,
          currentStreak: 0
        };
        return createApiResponse(true, emptyStats);
      }
      
      // Get today's date at start of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Calculate today's minutes
      const todaySessions = userSessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= today;
      });
      
      const todayMinutes = todaySessions.reduce((total, session) => total + session.duration, 0);
      
      // Calculate this week's minutes
      const weekSessions = userSessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= startOfWeek;
      });
      
      const weekMinutes = weekSessions.reduce((total, session) => total + session.duration, 0);
      
      // Calculate average session length
      const totalMinutes = userSessions.reduce((total, session) => total + session.duration, 0);
      const averageSessionLength = userSessions.length > 0 ? Math.round(totalMinutes / userSessions.length) : 0;
      
      // Find longest session
      const longestSession = userSessions.length > 0 
        ? Math.max(...userSessions.map(session => session.duration))
        : 0;
      
      // Get current streak
      const currentStreak = this.calculateUserStreak(userId);
      
      const stats: SessionStats = {
        todayMinutes,
        weekMinutes,
        totalSessions: userSessions.length,
        averageSessionLength,
        longestSession,
        currentStreak
      };
      
      return createApiResponse(true, stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      return createApiResponse(false, null, 'Failed to retrieve user stats');
    }
  }
  
  // Calculate and update user's streak
  private static updateUserStreak(userId: string): void {
    try {
      const data = readSessionsData();
      
      // Filter sessions by user ID
      const userSessions = data.sessions.filter(session => session.userId === userId);
      
      if (userSessions.length === 0) {
        return;
      }
      
      // Sort sessions by date
      userSessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      // Create a map of days with sessions
      const sessionDays = new Map<string, boolean>();
      
      userSessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const dateKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth() + 1}-${sessionDate.getDate()}`;
        sessionDays.set(dateKey, true);
      });
      
      // Calculate streak
      const streak = this.calculateUserStreak(userId);
      
      // We could save this streak value to a user metadata file if needed
      // For now, we just calculate it on demand
    } catch (error) {
      console.error('Error updating user streak:', error);
    }
  }
  
  // Calculate user's current streak
  private static calculateUserStreak(userId: string): number {
    try {
      const data = readSessionsData();
      
      // Filter sessions by user ID
      const userSessions = data.sessions.filter(session => session.userId === userId);
      
      if (userSessions.length === 0) {
        return 0;
      }
      
      // Create a map of days with sessions
      const sessionDays = new Map<string, boolean>();
      
      userSessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const dateKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth() + 1}-${sessionDate.getDate()}`;
        sessionDays.set(dateKey, true);
      });
      
      // Get today's date
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      
      // Check if there's a session today
      const hasSessionToday = sessionDays.has(todayKey);
      
      // If no session today, streak might have ended yesterday
      if (!hasSessionToday) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
        
        // If no session yesterday either, streak is 0
        if (!sessionDays.has(yesterdayKey)) {
          return 0;
        }
      }
      
      // Calculate streak by checking consecutive days
      let streak = hasSessionToday ? 1 : 0;
      let currentDate = new Date(today);
      
      if (!hasSessionToday) {
        // Start from yesterday if no session today
        currentDate.setDate(currentDate.getDate() - 1);
        streak = 1; // Yesterday's session counts as 1
      }
      
      // Check previous days
      while (true) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        
        if (sessionDays.has(dateKey)) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating user streak:', error);
      return 0;
    }
  }
}
