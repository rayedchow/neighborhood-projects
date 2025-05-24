import { ApiResponse, createApiResponse } from '@/types';
import { ProgressService } from './progressService';
import { StudySessionsService } from './studySessionsService';
import { FlashcardService } from './flashcardService';
import { SpacedRepetitionService } from './spacedRepetitionService';
import { StudyGoalsService } from './studyGoalsService';

// Types for analytics data
export interface DailyActivity {
  date: string;
  questionCount: number;
  correctCount: number;
  minutesStudied: number;
  flashcardsReviewed: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  questionCount: number;
  correctCount: number;
  accuracy: number;
}

export interface StrengthsWeaknesses {
  strengths: {
    topicId: string;
    topicName: string;
    accuracy: number;
  }[];
  weaknesses: {
    topicId: string;
    topicName: string;
    accuracy: number;
  }[];
}

export interface StudyHabitInsights {
  bestTimeOfDay: string;
  averageSessionLength: number;
  longestStreak: number;
  currentStreak: number;
  averageAccuracy: number;
  studyConsistency: number; // 0-100 score
  topTags: { tag: string; count: number }[];
}

export interface PerformanceTrend {
  period: string; // week, month
  dates: string[];
  accuracy: number[];
  questionCounts: number[];
  studyMinutes: number[];
}

export interface GoalProgress {
  goalId: string;
  type: string;
  target: number;
  current: number;
  percentage: number;
}

export interface ComprehensiveAnalytics {
  dailyActivity: DailyActivity[];
  topicPerformance: TopicPerformance[];
  strengthsWeaknesses: StrengthsWeaknesses;
  studyHabitInsights: StudyHabitInsights;
  performanceTrends: {
    weekly: PerformanceTrend;
    monthly: PerformanceTrend;
  };
  goalProgress: GoalProgress[];
  reviewDue: {
    today: number;
    tomorrow: number;
    nextWeek: number;
  };
  totalStats: {
    questionsAnswered: number;
    correctAnswers: number;
    minutesStudied: number;
    flashcardsReviewed: number;
    averageAccuracy: number;
    courseProgress: {
      courseId: string;
      courseName: string;
      progress: number;
    }[];
  };
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics for a user
   */
  public static getComprehensiveAnalytics(userId: string): ApiResponse<ComprehensiveAnalytics> {
    try {
      // Get user progress data
      const progressResponse = ProgressService.getUserById(userId);
      if (!progressResponse.success || !progressResponse.data) {
        return createApiResponse(false, null, 'Failed to retrieve user progress data');
      }
      
      const user = progressResponse.data;
      
      // Get study sessions data
      const sessionsResponse = StudySessionsService.getUserStats(userId);
      const sessionStats = sessionsResponse.success ? sessionsResponse.data : null;
      
      // Get spaced repetition data
      const srData = SpacedRepetitionService.getUserSRData(userId);
      
      // Get study goals data
      const goalsResponse = StudyGoalsService.getUserGoalsData(userId);
      const goalsData = goalsResponse || null;
      
      // Calculate daily activity (last 30 days)
      const dailyActivity = this.calculateDailyActivity(userId, 30);
      
      // Calculate topic performance
      const topicPerformance = this.calculateTopicPerformance(userId);
      
      // Identify strengths and weaknesses
      const strengthsWeaknesses = this.identifyStrengthsWeaknesses(topicPerformance);
      
      // Generate study habit insights
      const studyHabitInsights = this.generateStudyHabitInsights(userId);
      
      // Calculate performance trends
      const performanceTrends = {
        weekly: this.calculatePerformanceTrend(userId, 'week'),
        monthly: this.calculatePerformanceTrend(userId, 'month')
      };
      
      // Calculate goal progress
      const goalProgress = this.calculateGoalProgress(userId);
      
      // Calculate reviews due
      const reviewDue = this.calculateReviewsDue(userId);
      
      // Calculate total stats
      const totalStats = this.calculateTotalStats(userId);
      
      // Compile comprehensive analytics
      const analytics: ComprehensiveAnalytics = {
        dailyActivity,
        topicPerformance,
        strengthsWeaknesses,
        studyHabitInsights,
        performanceTrends,
        goalProgress,
        reviewDue,
        totalStats
      };
      
      return createApiResponse(true, analytics);
    } catch (error) {
      console.error('Error getting comprehensive analytics:', error);
      return createApiResponse(false, null, 'Failed to retrieve analytics data');
    }
  }
  
  /**
   * Calculate daily activity for the last n days
   */
  private static calculateDailyActivity(userId: string, days: number): DailyActivity[] {
    const dailyActivity: DailyActivity[] = [];
    const today = new Date();
    
    // Generate empty data for each day
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      dailyActivity.push({
        date: dateString,
        questionCount: 0,
        correctCount: 0,
        minutesStudied: 0,
        flashcardsReviewed: 0
      });
    }
    
    // Get user progress data to fill in question data
    const progressResponse = ProgressService.getUserById(userId);
    if (progressResponse.success && progressResponse.data) {
      const user = progressResponse.data;
      
      // Process question history
      if (user.question_history) {
        user.question_history.forEach((history) => {
          const date = new Date(history.timestamp);
          const dateString = date.toISOString().split('T')[0];
          
          // Find matching day in our array
          const dayIndex = dailyActivity.findIndex(day => day.date === dateString);
          if (dayIndex !== -1) {
            dailyActivity[dayIndex].questionCount++;
            if (history.correct) {
              dailyActivity[dayIndex].correctCount++;
            }
          }
        });
      }
    }
    
    // Get study sessions data to fill in study time
    const sessionsResponse = StudySessionsService.getUserSessions(userId);
    if (sessionsResponse.success && sessionsResponse.data) {
      const sessions = sessionsResponse.data;
      
      sessions.forEach(session => {
        const date = new Date(session.startTime);
        const dateString = date.toISOString().split('T')[0];
        
        // Find matching day in our array
        const dayIndex = dailyActivity.findIndex(day => day.date === dateString);
        if (dayIndex !== -1) {
          dailyActivity[dayIndex].minutesStudied += session.duration;
        }
      });
    }
    
    // Get flashcard review data
    const flashcardReviews = this.getFlashcardReviewsByDate(userId);
    flashcardReviews.forEach(review => {
      const dayIndex = dailyActivity.findIndex(day => day.date === review.date);
      if (dayIndex !== -1) {
        dailyActivity[dayIndex].flashcardsReviewed += review.count;
      }
    });
    
    // Reverse so dates are in ascending order
    return dailyActivity.reverse();
  }
  
  /**
   * Calculate performance by topic
   */
  private static calculateTopicPerformance(userId: string): TopicPerformance[] {
    const topicPerformance: TopicPerformance[] = [];
    
    // Get user progress data
    const progressResponse = ProgressService.getUserById(userId);
    if (!progressResponse.success || !progressResponse.data) {
      return [];
    }
    
    const user = progressResponse.data;
    
    // Process each course's progress
    if (user.courses_progress) {
      user.courses_progress.forEach(course => {
        // Process each unit's progress
        if (course.units_progress) {
          course.units_progress.forEach(unit => {
            // Process each topic's progress
            if (unit.topics_progress) {
              unit.topics_progress.forEach(topic => {
                // Skip topics with no questions answered
                if (!topic.questions_answered || topic.questions_answered === 0) {
                  return;
                }
                
                const performance: TopicPerformance = {
                  topicId: topic.topic_id,
                  topicName: topic.topic_id.replace('topic_', '').replace(/_/g, ' '),
                  questionCount: topic.questions_answered,
                  correctCount: topic.correct_answers,
                  accuracy: topic.correct_answers / topic.questions_answered * 100
                };
                
                topicPerformance.push(performance);
              });
            }
          });
        }
      });
    }
    
    // Sort by question count (descending)
    return topicPerformance.sort((a, b) => b.questionCount - a.questionCount);
  }
  
  /**
   * Identify strengths and weaknesses based on topic performance
   */
  private static identifyStrengthsWeaknesses(topicPerformance: TopicPerformance[]): StrengthsWeaknesses {
    // Filter topics with at least 5 questions answered
    const significantTopics = topicPerformance.filter(topic => topic.questionCount >= 5);
    
    // Sort by accuracy
    const sortedByAccuracy = [...significantTopics].sort((a, b) => b.accuracy - a.accuracy);
    
    return {
      strengths: sortedByAccuracy.slice(0, 5).map(topic => ({
        topicId: topic.topicId,
        topicName: topic.topicName,
        accuracy: topic.accuracy
      })),
      weaknesses: sortedByAccuracy.reverse().slice(0, 5).map(topic => ({
        topicId: topic.topicId,
        topicName: topic.topicName,
        accuracy: topic.accuracy
      }))
    };
  }
  
  /**
   * Generate insights about study habits
   */
  private static generateStudyHabitInsights(userId: string): StudyHabitInsights {
    // Default values
    const insights: StudyHabitInsights = {
      bestTimeOfDay: 'afternoon',
      averageSessionLength: 0,
      longestStreak: 0,
      currentStreak: 0,
      averageAccuracy: 0,
      studyConsistency: 0,
      topTags: []
    };
    
    // Get study sessions data
    const sessionsResponse = StudySessionsService.getUserStats(userId);
    if (sessionsResponse.success && sessionsResponse.data) {
      const stats = sessionsResponse.data;
      insights.averageSessionLength = stats.averageSessionLength;
      insights.longestStreak = stats.longestStreak;
      insights.currentStreak = stats.currentStreak;
    }
    
    // Get user progress data for accuracy
    const progressResponse = ProgressService.getUserById(userId);
    if (progressResponse.success && progressResponse.data) {
      const user = progressResponse.data;
      
      // Calculate overall accuracy
      let totalQuestions = 0;
      let totalCorrect = 0;
      
      if (user.question_history) {
        user.question_history.forEach(history => {
          totalQuestions++;
          if (history.correct) {
            totalCorrect++;
          }
        });
      }
      
      if (totalQuestions > 0) {
        insights.averageAccuracy = (totalCorrect / totalQuestions) * 100;
      }
      
      // Determine best time of day
      const morningCount = 0;
      const afternoonCount = 0;
      const eveningCount = 0;
      const nightCount = 0;
      
      if (user.question_history) {
        user.question_history.forEach(history => {
          const hour = new Date(history.timestamp).getHours();
          
          if (hour >= 5 && hour < 12) {
            morningCount + 1;
          } else if (hour >= 12 && hour < 17) {
            afternoonCount + 1;
          } else if (hour >= 17 && hour < 22) {
            eveningCount + 1;
          } else {
            nightCount + 1;
          }
        });
      }
      
      // Determine the best time of day
      const timeCount = [
        { time: 'morning', count: morningCount },
        { time: 'afternoon', count: afternoonCount },
        { time: 'evening', count: eveningCount },
        { time: 'night', count: nightCount }
      ];
      
      timeCount.sort((a, b) => b.count - a.count);
      insights.bestTimeOfDay = timeCount[0].time;
      
      // Calculate study consistency (based on last 30 days activity)
      const dailyActivity = this.calculateDailyActivity(userId, 30);
      const daysWithActivity = dailyActivity.filter(day => 
        day.questionCount > 0 || day.minutesStudied > 0 || day.flashcardsReviewed > 0
      ).length;
      
      insights.studyConsistency = (daysWithActivity / 30) * 100;
    }
    
    // Get top flashcard tags
    const flashcardTags = this.getTopFlashcardTags(userId);
    insights.topTags = flashcardTags;
    
    return insights;
  }
  
  /**
   * Calculate performance trend over a period
   */
  private static calculatePerformanceTrend(userId: string, period: 'week' | 'month'): PerformanceTrend {
    const days = period === 'week' ? 7 : 30;
    const dailyActivity = this.calculateDailyActivity(userId, days);
    
    // Group data by weeks if monthly view
    if (period === 'month') {
      // Group into 4 weeks (assuming 28 days for simplicity)
      const weeklyData = [
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 },
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 },
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 },
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 }
      ];
      
      dailyActivity.forEach((day, index) => {
        const weekIndex = Math.floor(index / 7);
        if (weekIndex < 4) {
          weeklyData[weekIndex].questionCount += day.questionCount;
          weeklyData[weekIndex].studyMinutes += day.minutesStudied;
          
          if (day.questionCount > 0) {
            weeklyData[weekIndex].accuracy += (day.correctCount / day.questionCount) * 100;
            weeklyData[weekIndex].days += 1;
          }
        }
      });
      
      // Calculate averages
      weeklyData.forEach(week => {
        if (week.days > 0) {
          week.accuracy = week.accuracy / week.days;
        } else {
          week.accuracy = 0;
        }
      });
      
      return {
        period: 'month',
        dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        accuracy: weeklyData.map(week => week.accuracy),
        questionCounts: weeklyData.map(week => week.questionCount),
        studyMinutes: weeklyData.map(week => week.studyMinutes)
      };
    }
    
    // Daily data for weekly view
    return {
      period: 'week',
      dates: dailyActivity.map(day => day.date),
      accuracy: dailyActivity.map(day => 
        day.questionCount > 0 ? (day.correctCount / day.questionCount) * 100 : 0
      ),
      questionCounts: dailyActivity.map(day => day.questionCount),
      studyMinutes: dailyActivity.map(day => day.minutesStudied)
    };
  }
  
  /**
   * Calculate progress for each active goal
   */
  private static calculateGoalProgress(userId: string): GoalProgress[] {
    const goalProgress: GoalProgress[] = [];
    
    // Get goals data
    const goalsData = StudyGoalsService.getUserGoalsData(userId);
    if (!goalsData) {
      return [];
    }
    
    // Process each goal
    goalsData.goals.forEach(goal => {
      // Skip achieved goals
      if (goal.achieved) {
        return;
      }
      
      const progress: GoalProgress = {
        goalId: goal.id,
        type: goal.type,
        target: goal.target,
        current: goal.progress,
        percentage: (goal.progress / goal.target) * 100
      };
      
      goalProgress.push(progress);
    });
    
    // Sort by completion percentage (descending)
    return goalProgress.sort((a, b) => b.percentage - a.percentage);
  }
  
  /**
   * Calculate reviews due in different time periods
   */
  private static calculateReviewsDue(userId: string): { today: number; tomorrow: number; nextWeek: number } {
    const result = { today: 0, tomorrow: 0, nextWeek: 0 };
    
    // Get spaced repetition data
    const srData = SpacedRepetitionService.getUserSRData(userId);
    if (!srData) {
      return result;
    }
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Count cards due in each time period
    srData.cards.forEach(card => {
      const dueDate = new Date(card.dueDate);
      
      if (dueDate <= now) {
        result.today++;
      } else if (dueDate <= tomorrow) {
        result.tomorrow++;
      } else if (dueDate <= nextWeek) {
        result.nextWeek++;
      }
    });
    
    return result;
  }
  
  /**
   * Calculate total statistics
   */
  private static calculateTotalStats(userId: string): {
    questionsAnswered: number;
    correctAnswers: number;
    minutesStudied: number;
    flashcardsReviewed: number;
    averageAccuracy: number;
    courseProgress: { courseId: string; courseName: string; progress: number }[];
  } {
    const stats = {
      questionsAnswered: 0,
      correctAnswers: 0,
      minutesStudied: 0,
      flashcardsReviewed: 0,
      averageAccuracy: 0,
      courseProgress: []
    };
    
    // Get user progress data
    const progressResponse = ProgressService.getUserById(userId);
    if (progressResponse.success && progressResponse.data) {
      const user = progressResponse.data;
      
      // Count questions from history
      if (user.question_history) {
        user.question_history.forEach(history => {
          stats.questionsAnswered++;
          if (history.correct) {
            stats.correctAnswers++;
          }
        });
      }
      
      // Calculate average accuracy
      if (stats.questionsAnswered > 0) {
        stats.averageAccuracy = (stats.correctAnswers / stats.questionsAnswered) * 100;
      }
      
      // Get course progress
      if (user.courses_progress) {
        user.courses_progress.forEach(course => {
          stats.courseProgress.push({
            courseId: course.course_id,
            courseName: course.course_id.replace('ap_', 'AP ').replace(/_/g, ' '),
            progress: course.completion_percentage
          });
        });
      }
    }
    
    // Get study time from sessions
    const sessionsResponse = StudySessionsService.getUserStats(userId);
    if (sessionsResponse.success && sessionsResponse.data) {
      stats.minutesStudied = sessionsResponse.data.totalSessions * sessionsResponse.data.averageSessionLength;
    }
    
    // Count flashcard reviews
    const flashcardReviews = this.getFlashcardReviewsByDate(userId);
    stats.flashcardsReviewed = flashcardReviews.reduce((total, day) => total + day.count, 0);
    
    return stats;
  }
  
  /**
   * Helper method to get flashcard reviews by date
   */
  private static getFlashcardReviewsByDate(userId: string): { date: string; count: number }[] {
    const reviewsByDate: { date: string; count: number }[] = [];
    
    // This is a mock implementation since we don't have direct access to flashcard review dates
    // In a real implementation, you would query the flashcard review history
    
    return reviewsByDate;
  }
  
  /**
   * Helper method to get top flashcard tags
   */
  private static getTopFlashcardTags(userId: string): { tag: string; count: number }[] {
    // This is a mock implementation
    return [
      { tag: 'important', count: 15 },
      { tag: 'difficult', count: 12 },
      { tag: 'exam', count: 10 },
      { tag: 'formula', count: 8 },
      { tag: 'definition', count: 7 }
    ];
  }
}
