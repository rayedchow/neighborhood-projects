import { BaseRepository } from './baseRepository';
import { User, UserDatabase, QuestionAttempt, ProgressUpdateRequest } from '../models';

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
  getUserCourseStats(userId: string, courseId: string): {
    totalAttempted: number;
    totalCorrect: number;
    accuracyRate: number;
    totalTimeSpent: number;
    unitBreakdown: Array<{
      unitId: string;
      questionsAttempted: number;
      questionsCorrect: number;
      accuracyRate: number;
    }>;
  } | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    const courseProgress = user.coursesProgress.find(cp => cp.courseId === courseId);
    if (!courseProgress) return null;

    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalTimeSpent = 0;
    const unitBreakdown = [];

    for (const unitProgress of courseProgress.unitsProgress) {
      let unitAttempted = 0;
      let unitCorrect = 0;

      for (const topicProgress of unitProgress.topicsProgress) {
        for (const attempt of topicProgress.questionsAttempted) {
          totalAttempted++;
          unitAttempted++;
          totalTimeSpent += attempt.timeSpentSeconds;

          if (attempt.isCorrect) {
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
}
