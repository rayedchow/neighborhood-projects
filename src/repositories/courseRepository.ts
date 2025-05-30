import { BaseRepository } from './baseRepository';
import { Course, CourseDatabase } from '../models';

// Define the actual structure of the JSON file
interface UnitsDatabaseFile {
  ap_courses: Course[];
}

/**
 * Repository for handling course data operations
 */
export class CourseRepository extends BaseRepository<CourseDatabase> {
  constructor() {
    super('units.json');
    this.ensureFileExists({ ap_courses: [] });
  }

  /**
   * Get all courses (without detailed units)
   */
  getAllCourses(): Course[] {
    const data = this.readData() as unknown as UnitsDatabaseFile;
    
    // Return courses with minimal data (without detailed unit content)
    return data.ap_courses.map(course => ({
      id: course.id,
      name: course.name,
      description: course.description,
      units: [] // Exclude full unit details for better performance
    }));
  }

  /**
   * Get a specific course by ID
   */
  getCourseById(courseId: string): Course | null {
    const data = this.readData() as unknown as UnitsDatabaseFile;
    return data.ap_courses.find(course => course.id === courseId) || null;
  }

  /**
   * Get a specific unit from a course
   */
  getUnitById(courseId: string, unitId: string): (Course['units'][0] & { courseName: string }) | null {
    const course = this.getCourseById(courseId);
    
    if (!course) return null;
    
    const unit = course.units.find(unit => unit.id === unitId);
    
    if (!unit) return null;
    
    return { ...unit, courseName: course.name };
  }

  /**
   * Get a specific topic from a unit
   */
  getTopicById(courseId: string, unitId: string, topicId: string): (Course['units'][0]['topics'][0] & { 
    courseName: string;
    unitName: string;
  }) | null {
    const unit = this.getUnitById(courseId, unitId);
    
    if (!unit) return null;
    
    const topic = unit.topics.find(topic => topic.id === topicId);
    
    if (!topic) return null;
    
    return { 
      ...topic, 
      courseName: unit.courseName,
      unitName: unit.name
    };
  }

  /**
   * Search for questions across all courses
   */
  searchQuestions(query: string): Array<{ 
    question: Course['units'][0]['topics'][0]['questions'][0],
    courseId: string;
    unitId: string;
    topicId: string;
  }> {
    const data = this.readData() as unknown as UnitsDatabaseFile;
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const course of data.ap_courses) {
      for (const unit of course.units) {
        for (const topic of unit.topics) {
          for (const question of topic.questions) {
            if (
              question.question.toLowerCase().includes(lowerQuery) ||
              question.explanation.toLowerCase().includes(lowerQuery) ||
              question.options.some((option: string) => option.toLowerCase().includes(lowerQuery))
            ) {
              results.push({
                question,
                courseId: course.id,
                unitId: unit.id,
                topicId: topic.id
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Get practice questions based on specified criteria
   */
  getPracticeQuestions(
    courseId: string, 
    count: number = 5, 
    unitIds?: string[],
    topicIds?: string[]
  ): Array<{ 
    question: Course['units'][0]['topics'][0]['questions'][0],
    unitId: string;
    topicId: string;
  }> | null {
    const course = this.getCourseById(courseId);
    
    if (!course) return null;
    
    const allQuestions = [];
    
    // Filter units if unitIds is provided
    const unitsToUse = unitIds?.length 
      ? course.units.filter(unit => unitIds.includes(unit.id))
      : course.units;
    
    for (const unit of unitsToUse) {
      // Filter topics if topicIds is provided
      const topicsToUse = topicIds?.length
        ? unit.topics.filter(topic => topicIds.includes(topic.id))
        : unit.topics;
      
      for (const topic of topicsToUse) {
        for (const question of topic.questions) {
          allQuestions.push({
            question,
            unitId: unit.id,
            topicId: topic.id
          });
        }
      }
    }
    
    // Shuffle the questions and take the requested number
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
