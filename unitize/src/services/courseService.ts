import { CourseRepository } from '../repositories/courseRepository';
import { ApiResponse } from '../models';

/**
 * Service for course-related operations
 */
export class CourseService {
  private static repository = new CourseRepository();

  /**
   * Get all available courses 
   */
  static getAllCourses(): ApiResponse<any> {
    try {
      const courses = this.repository.getAllCourses();
      return { success: true, data: courses };
    } catch (error) {
      console.error('Error getting all courses:', error);
      return { success: false, data: null, error: 'Failed to retrieve courses' };
    }
  }

  /**
   * Get a specific course by ID
   */
  static getCourseById(courseId: string): ApiResponse<any> {
    try {
      const course = this.repository.getCourseById(courseId);
      
      if (!course) {
        return { success: false, data: null, error: `Course with ID ${courseId} not found` };
      }
      
      return { success: true, data: course };
    } catch (error) {
      console.error(`Error getting course ${courseId}:`, error);
      return { success: false, data: null, error: 'Failed to retrieve course' };
    }
  }

  /**
   * Get a specific unit by ID
   */
  static getUnitById(courseId: string, unitId: string): ApiResponse<any> {
    try {
      const unit = this.repository.getUnitById(courseId, unitId);
      
      if (!unit) {
        return { success: false, data: null, error: `Unit with ID ${unitId} not found in course ${courseId}` };
      }
      
      return { success: true, data: unit };
    } catch (error) {
      console.error(`Error getting unit ${unitId}:`, error);
      return { success: false, data: null, error: 'Failed to retrieve unit' };
    }
  }

  /**
   * Get a specific topic by ID
   */
  static getTopicById(courseId: string, unitId: string, topicId: string): ApiResponse<any> {
    try {
      const topic = this.repository.getTopicById(courseId, unitId, topicId);
      
      if (!topic) {
        return { success: false, data: null, error: `Topic with ID ${topicId} not found` };
      }
      
      return { success: true, data: topic };
    } catch (error) {
      console.error(`Error getting topic ${topicId}:`, error);
      return { success: false, data: null, error: 'Failed to retrieve topic' };
    }
  }

  /**
   * Search for questions across all courses
   */
  static searchQuestions(query: string): ApiResponse<any> {
    try {
      if (!query || query.trim().length === 0) {
        return { success: false, data: null, error: 'Search query cannot be empty' };
      }
      
      const results = this.repository.searchQuestions(query);
      return { success: true, data: results };
    } catch (error) {
      console.error(`Error searching for questions with query "${query}":`, error);
      return { success: false, data: null, error: 'Failed to search questions' };
    }
  }

  /**
   * Get practice questions based on criteria
   */
  static getPracticeQuestions(
    courseId: string, 
    count: number = 5, 
    unitIds?: string[],
    topicIds?: string[]
  ): ApiResponse<any> {
    try {
      const questions = this.repository.getPracticeQuestions(courseId, count, unitIds, topicIds);
      
      if (!questions) {
        return { success: false, data: null, error: `Failed to get practice questions for course ${courseId}` };
      }
      
      return { success: true, data: questions };
    } catch (error) {
      console.error('Error getting practice questions:', error);
      return { success: false, data: null, error: 'Failed to retrieve practice questions' };
    }
  }
}
