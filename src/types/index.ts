// Types for the AP Test Practice App

// Unit Data Types
export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export interface Unit {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  units: Unit[];
}

export interface CoursesData {
  ap_courses: Course[];
}

// Progress Tracking Types
export interface TopicProgress {
  topic_id: string;
  completion_percentage: number;
  questions_attempted: string[];
  questions_correct: string[];
  time_spent_seconds: number;
  last_accessed: string;
}

export interface UnitProgress {
  unit_id: string;
  completion_percentage: number;
  topics_progress: TopicProgress[];
  time_spent_seconds: number;
  last_accessed: string;
}

export interface CourseProgress {
  course_id: string;
  last_accessed: string;
  completion_percentage: number;
  units_progress: UnitProgress[];
  time_spent_seconds: number;
  strengths: string[];
  weaknesses: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  courses_progress: CourseProgress[];
  study_streak_days: number;
  total_questions_attempted: number;
  total_questions_correct: number;
  total_time_spent_seconds: number;
  joined_date: string;
  last_login: string;
  metadata?: {
    spacedRepetition?: any;
    studyGoals?: any;
    preferences?: {
      theme?: string;
      notifications?: boolean;
      studyReminders?: boolean;
    }
  };
}

export interface ProgressData {
  users: User[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  timestamp: string;
}

// Helper function to create consistent API responses
export function createApiResponse<T>(success: boolean, data: T | null, error?: string): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  };
}

// Request Types
export interface UpdateProgressRequest {
  userId: string;
  courseId: string;
  unitId: string;
  topicId: string;
  questionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface GetUserProgressRequest {
  userId: string;
  courseId?: string;
}

export interface GetUnitDataRequest {
  courseId: string;
  unitId?: string;
  topicId?: string;
}
