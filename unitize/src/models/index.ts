// Core data models for Unitize

// Course content models
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

// User progress models
export interface QuestionAttempt {
  questionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  attemptDate: string;
}

export interface TopicProgress {
  topicId: string;
  questionsAttempted: QuestionAttempt[];
  lastAccessed: string;
}

export interface UnitProgress {
  unitId: string;
  topicsProgress: TopicProgress[];
  lastAccessed: string;
}

export interface CourseProgress {
  courseId: string;
  unitsProgress: UnitProgress[];
  lastAccessed: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  coursesProgress: CourseProgress[];
  joinedDate: string;
  lastLogin: string;
}

// Database schema models
export interface CourseDatabase {
  courses: Course[];
}

export interface UserDatabase {
  users: User[];
}

// API request/response models
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// Request models
export interface ProgressUpdateRequest {
  userId: string;
  courseId: string;
  unitId: string;
  topicId: string;
  questionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface PracticeRequest {
  courseId: string;
  count?: number;
  unitIds?: string[];
  topicIds?: string[];
}
