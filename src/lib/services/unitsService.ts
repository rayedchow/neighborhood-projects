import {
  Course,
  Unit,
  Topic,
  Question,
  GetUnitDataRequest,
  ApiResponse
} from '@/types';
import { readUnitsData, createApiResponse } from '../utils/fileOperations';

/**
 * Service class for handling all AP course unit data operations
 */
export class UnitsService {
  /**
   * Get all available AP courses
   * @returns ApiResponse containing array of Course objects with minimal data (no units)
   */
  public static async getAllCourses(): Promise<ApiResponse<Course[] | null>> {
    try {
      const data = await readUnitsData();
      
      // Map to a simplified version of courses without unit details for better performance
      const courses = data.ap_courses.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description,
        units: [] // Exclude unit details from the response
      }));
      
      return createApiResponse(true, courses);
    } catch (error) {
      console.error('Error getting all courses:', error);
      return createApiResponse(false, null, 'Failed to retrieve courses');
    }
  }

  /**
   * Get details for a specific course including all units
   * @param courseId ID of the course to retrieve
   * @returns ApiResponse containing the Course object with all unit details
   */
  public static async getCourseById(courseId: string): Promise<ApiResponse<Course | null>> {
    try {
      const data = await readUnitsData();
      const course = data.ap_courses.find(c => c.id === courseId);
      
      if (!course) {
        return createApiResponse(false, null, `Course with ID ${courseId} not found`);
      }
      
      return createApiResponse(true, course);
    } catch (error) {
      console.error(`Error getting course ${courseId}:`, error);
      return createApiResponse(false, null, 'Failed to retrieve course');
    }
  }

  /**
   * Get a specific unit from a course
   * @param courseId ID of the course
   * @param unitId ID of the unit to retrieve
   * @returns ApiResponse containing the Unit object
   */
  public static async getUnitById(courseId: string, unitId: string): Promise<ApiResponse<Unit | null>> {
    try {
      const data = await readUnitsData();
      const course = data.ap_courses.find(c => c.id === courseId);
      
      if (!course) {
        return createApiResponse(false, null, `Course with ID ${courseId} not found`);
      }
      
      const unit = course.units.find(u => u.id === unitId);
      
      if (!unit) {
        return createApiResponse(false, null, `Unit with ID ${unitId} not found in course ${courseId}`);
      }
      
      return createApiResponse(true, unit);
    } catch (error) {
      console.error(`Error getting unit ${unitId} from course ${courseId}:`, error);
      return createApiResponse(false, null, 'Failed to retrieve unit');
    }
  }

  /**
   * Get a specific topic from a unit
   * @param courseId ID of the course
   * @param unitId ID of the unit
   * @param topicId ID of the topic to retrieve
   * @returns ApiResponse containing the Topic object
   */
  public static async getTopicById(courseId: string, unitId: string, topicId: string): Promise<ApiResponse<Topic | null>> {
    try {
      const data = await readUnitsData();
      const course = data.ap_courses.find(c => c.id === courseId);
      
      if (!course) {
        return createApiResponse(false, null, `Course with ID ${courseId} not found`);
      }
      
      const unit = course.units.find(u => u.id === unitId);
      
      if (!unit) {
        return createApiResponse(false, null, `Unit with ID ${unitId} not found in course ${courseId}`);
      }
      
      const topic = unit.topics.find(t => t.id === topicId);
      
      if (!topic) {
        return createApiResponse(false, null, `Topic with ID ${topicId} not found in unit ${unitId}`);
      }
      
      return createApiResponse(true, topic);
    } catch (error) {
      console.error(`Error getting topic ${topicId} from unit ${unitId} in course ${courseId}:`, error);
      return createApiResponse(false, null, 'Failed to retrieve topic');
    }
  }

  /**
   * Get a specific question from a topic
   * @param courseId ID of the course
   * @param unitId ID of the unit
   * @param topicId ID of the topic
   * @param questionId ID of the question to retrieve
   * @returns ApiResponse containing the Question object
   */
  public static async getQuestionById(courseId: string, unitId: string, topicId: string, questionId: string): Promise<ApiResponse<Question | null>> {
    try {
      const data = await readUnitsData();
      const course = data.ap_courses.find(c => c.id === courseId);
      
      if (!course) {
        return createApiResponse(false, null, `Course with ID ${courseId} not found`);
      }
      
      const unit = course.units.find(u => u.id === unitId);
      
      if (!unit) {
        return createApiResponse(false, null, `Unit with ID ${unitId} not found in course ${courseId}`);
      }
      
      const topic = unit.topics.find(t => t.id === topicId);
      
      if (!topic) {
        return createApiResponse(false, null, `Topic with ID ${topicId} not found in unit ${unitId}`);
      }
      
      const question = topic.questions.find(q => q.id === questionId);
      
      if (!question) {
        return createApiResponse(false, null, `Question with ID ${questionId} not found in topic ${topicId}`);
      }
      
      return createApiResponse(true, question);
    } catch (error) {
      console.error(`Error getting question ${questionId} from topic ${topicId} in unit ${unitId} in course ${courseId}:`, error);
      return createApiResponse(false, null, 'Failed to retrieve question');
    }
  }

  /**
   * Get unit data based on request parameters
   * Can fetch an entire course, a specific unit, or a specific topic
   * @param request GetUnitDataRequest containing courseId and optional unitId and topicId
   * @returns ApiResponse containing the requested data
   */
  public static async getUnitData(request: GetUnitDataRequest): Promise<ApiResponse<Course | Unit | Topic | null>> {
    const { courseId, unitId, topicId } = request;
    
    try {
      // If topicId is provided, return the specific topic
      if (topicId && unitId) {
        return this.getTopicById(courseId, unitId, topicId);
      }
      
      // If unitId is provided, return the specific unit
      if (unitId) {
        return this.getUnitById(courseId, unitId);
      }
      
      // Otherwise return the entire course
      return this.getCourseById(courseId);
    } catch (error) {
      console.error('Error fetching unit data:', error);
      return createApiResponse(false, null, 'Failed to retrieve requested data');
    }
  }

  /**
   * Search for questions across all courses, units, and topics based on keywords
   * @param query Search query string
   * @returns ApiResponse containing array of matching Question objects with metadata
   */
  public static async searchQuestions(query: string): Promise<ApiResponse<Array<Question & { courseId: string, unitId: string, topicId: string }> | null>> {
    try {
      const data = await readUnitsData();
      const normalizedQuery = query.toLowerCase();
      const results: Array<Question & { courseId: string, unitId: string, topicId: string }> = [];
      
      // Search through all courses, units, topics, and questions
      data.ap_courses.forEach(course => {
        course.units.forEach(unit => {
          unit.topics.forEach(topic => {
            topic.questions.forEach(question => {
              // Check if the question text or options contain the query
              if (
                question.question.toLowerCase().includes(normalizedQuery) ||
                question.explanation.toLowerCase().includes(normalizedQuery) ||
                question.options.some(option => option.toLowerCase().includes(normalizedQuery))
              ) {
                // Add metadata to the question
                results.push({
                  ...question,
                  courseId: course.id,
                  unitId: unit.id,
                  topicId: topic.id
                });
              }
            });
          });
        });
      });
      
      return createApiResponse(true, results);
    } catch (error) {
      console.error('Error searching questions:', error);
      return createApiResponse(false, null, 'Failed to search questions');
    }
  }

  /**
   * Get random practice questions based on specified criteria
   * @param courseId ID of the course
   * @param count Number of questions to return
   * @param unitIds Optional array of unit IDs to filter by
   * @param topicIds Optional array of topic IDs to filter by
   * @returns ApiResponse containing array of Question objects with metadata
   */
  public static async getPracticeQuestions(
    courseId: string,
    count: number = 5,
    unitIds?: string[],
    topicIds?: string[]
  ): Promise<ApiResponse<Array<Question & { unitId: string, topicId: string }> | null>> {
    try {
      const data = await readUnitsData();
      const course = data.ap_courses.find(c => c.id === courseId);
      
      if (!course) {
        return createApiResponse(false, null, `Course with ID ${courseId} not found`);
      }
      
      const allQuestions: Array<Question & { unitId: string, topicId: string }> = [];
      
      // Filter units based on unitIds if provided
      const filteredUnits = unitIds 
        ? course.units.filter(unit => unitIds.includes(unit.id))
        : course.units;
      
      // Collect all questions that match the criteria
      filteredUnits.forEach(unit => {
        // Filter topics based on topicIds if provided
        const filteredTopics = topicIds
          ? unit.topics.filter(topic => topicIds.includes(topic.id))
          : unit.topics;
        
        filteredTopics.forEach(topic => {
          topic.questions.forEach(question => {
            allQuestions.push({
              ...question,
              unitId: unit.id,
              topicId: topic.id
            });
          });
        });
      });
      
      // Shuffle the questions
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      
      // Take the requested number of questions
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));
      
      return createApiResponse(true, selected);
    } catch (error) {
      console.error('Error getting practice questions:', error);
      return createApiResponse(false, null, 'Failed to retrieve practice questions');
    }
  }
}
