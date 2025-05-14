import { BaseRepository } from './baseRepository';
import { User, UserDatabase, QuestionAttempt, ProgressUpdateRequest, TestHistoryRequest, TestHistoryEntry } from '../models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for handling user data and progress operations
 */
export class UserRepository extends BaseRepository<UserDatabase> {
  constructor() {
    super('progress.json');
    this.ensureFileExists({ users: [] });
  }

  /**
   * Get a user by ID
   */
  getUserById(userId: string): User | null {
    const data = this.readData();
    return data.users.find(user => user.id === userId) || null;
  }

  /**
   * Update a user's progress for a specific question
   */
  updateProgress(request: ProgressUpdateRequest): boolean {
    const {
      userId,
      courseId,
      unitId,
      topicId,
      questionId,
      isCorrect,
      timeSpentSeconds
    } = request;

    const data = this.readData();
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex === -1) return false;

    const user = data.users[userIndex];
    const now = new Date().toISOString();

    // Create a new question attempt
    const questionAttempt: QuestionAttempt = {
      questionId,
      isCorrect,
      timeSpentSeconds,
      attemptDate: now
    };

    // Find or create course progress
    let courseProgress = user.coursesProgress.find(cp => cp.courseId === courseId);
    if (!courseProgress) {
      courseProgress = {
        courseId,
        unitsProgress: [],
        lastAccessed: now
      };
      user.coursesProgress.push(courseProgress);
    } else {
      courseProgress.lastAccessed = now;
    }

    // Find or create unit progress
    let unitProgress = courseProgress.unitsProgress.find(up => up.unitId === unitId);
    if (!unitProgress) {
      unitProgress = {
        unitId,
        topicsProgress: [],
        lastAccessed: now
      };
      courseProgress.unitsProgress.push(unitProgress);
    } else {
      unitProgress.lastAccessed = now;
    }

    // Find or create topic progress
    let topicProgress = unitProgress.topicsProgress.find(tp => tp.topicId === topicId);
    if (!topicProgress) {
      topicProgress = {
        topicId,
        questionsAttempted: [],
        lastAccessed: now
      };
      unitProgress.topicsProgress.push(topicProgress);
    } else {
      topicProgress.lastAccessed = now;
    }

    // Add the question attempt
    topicProgress.questionsAttempted.push(questionAttempt);

    // Update user lastLogin
    user.lastLogin = now;

    // Save updated data
    return this.writeData(data);
  }

  /**
   * Get user progress stats for a specific course
   */
  getUserCourseStats(userId: string, courseId: string): any | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    const courseProgress = user.coursesProgress.find(cp => cp.courseId === courseId);
    if (!courseProgress) return null;

    // Calculate course-level stats
    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalTimeSpent = 0;
    const unitBreakdown = [];

    // Loop through all units, topics and questions to gather stats
    for (const unitProgress of courseProgress.unitsProgress) {
      let unitAttempted = 0;
      let unitCorrect = 0;

      for (const topicProgress of unitProgress.topicsProgress) {
        for (const question of topicProgress.questionsAttempted) {
          totalAttempted++;
          unitAttempted++;
          totalTimeSpent += question.timeSpentSeconds;

          if (question.isCorrect) {
            totalCorrect++;
            unitCorrect++;
          }
        }
      }

      unitBreakdown.push({
        unitId: unitProgress.unitId,
        questionsAttempted: unitAttempted,
        questionsCorrect: unitCorrect,
        accuracyRate: unitAttempted > 0 ? (unitCorrect / unitAttempted) * 100 : 0
      });
    }

    return {
      totalAttempted,
      totalCorrect,
      accuracyRate: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
      totalTimeSpent,
      unitBreakdown
    };
  }

  /**
   * Get recommended topics for a user based on performance
   */
  getRecommendedTopics(userId: string, courseId: string, limit: number = 5): Array<{
    topicId: string;
    unitId: string;
    accuracyRate: number;
    attemptsCount: number;
  }> {
    const user = this.getUserById(userId);
    if (!user) return [];

    const courseProgress = user.coursesProgress.find(cp => cp.courseId === courseId);
    if (!courseProgress) return [];

    const topicStats = [];

    // Gather stats for each topic
    for (const unitProgress of courseProgress.unitsProgress) {
      for (const topicProgress of unitProgress.topicsProgress) {
        const attempts = topicProgress.questionsAttempted.length;
        const correct = topicProgress.questionsAttempted.filter(a => a.isCorrect).length;
        const accuracyRate = attempts > 0 ? (correct / attempts) * 100 : 0;

        topicStats.push({
          topicId: topicProgress.topicId,
          unitId: unitProgress.unitId,
          accuracyRate,
          attemptsCount: attempts
        });
      }
    }

    // Sort topics by accuracy rate (ascending) and attempts count (descending)
    // This prioritizes topics with low accuracy but more attempts
    topicStats.sort((a, b) => {
      // First compare by accuracy rate (ascending)
      if (a.accuracyRate !== b.accuracyRate) {
        return a.accuracyRate - b.accuracyRate;
      }
      // Then by attempts count (descending)
      return b.attemptsCount - a.attemptsCount;
    });

    // Return the top recommendations
    return topicStats.slice(0, limit);
  }

  /**
   * Get user's test history
   * @param userId The user ID
   * @param courseId Optional course ID to filter by
   * @returns Array of test history entries or null if user not found
   */
  getUserTestHistory(userId: string, courseId?: string): TestHistoryEntry[] | null {
    const user = this.getUserById(userId);
    if (!user || !user.test_history) return null;
    
    // Filter by course if specified
    if (courseId) {
      return user.test_history.filter(entry => entry.course_id === courseId);
    }
    
    return user.test_history;
  }
  
  /**
   * Add a new test history entry for a user
   * @param request Test history data
   * @returns The newly created test history entry or null if failed
   */
  addTestHistoryEntry(request: TestHistoryRequest): TestHistoryEntry | null {
    const { userId, courseId, unitId, topicId, totalQuestions, correctQuestions, timeSpentSeconds, score } = request;
    
    const data = this.readData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return null;
    
    // Create new test history entry
    const newEntry: TestHistoryEntry = {
      id: `test_${uuidv4().substring(0, 8)}`,
      course_id: courseId,
      unit_id: unitId,
      topic_id: topicId,
      date: new Date().toISOString(),
      score,
      total_questions: totalQuestions,
      correct_questions: correctQuestions,
      time_spent_seconds: timeSpentSeconds
    };
    
    // Initialize test_history array if it doesn't exist
    if (!data.users[userIndex].test_history) {
      data.users[userIndex].test_history = [];
    }
    
    // Add the new entry
    data.users[userIndex].test_history.push(newEntry);
    
    // Save the data
    this.writeData(data);
    
    return newEntry;
  }
}
