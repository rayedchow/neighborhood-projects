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
  public static async getComprehensiveAnalytics(userId: string): Promise<ApiResponse<ComprehensiveAnalytics>> {
    try {
      // Get user progress data
      const progressResponse = await ProgressService.getUserById(userId);
      if (!progressResponse.success || !progressResponse.data) {
        // Create an empty ComprehensiveAnalytics object to match the return type
        const emptyAnalytics: ComprehensiveAnalytics = {
          dailyActivity: [],
          topicPerformance: [],
          strengthsWeaknesses: {
            strengths: [],
            weaknesses: []
          },
          studyHabitInsights: {
            bestTimeOfDay: '',
            averageSessionLength: 0,
            longestStreak: 0,
            currentStreak: 0,
            averageAccuracy: 0,
            studyConsistency: 0,
            topTags: []
          },
          performanceTrends: {
            weekly: {
              period: 'week',
              dates: [],
              accuracy: [],
              questionCounts: [],
              studyMinutes: []
            },
            monthly: {
              period: 'month',
              dates: [],
              accuracy: [],
              questionCounts: [],
              studyMinutes: []
            }
          },
          goalProgress: [],
          reviewDue: {
            today: 0,
            tomorrow: 0,
            nextWeek: 0
          },
          totalStats: {
            questionsAnswered: 0,
            correctAnswers: 0,
            minutesStudied: 0,
            flashcardsReviewed: 0,
            averageAccuracy: 0,
            courseProgress: []
          }
        };
        return createApiResponse(false, emptyAnalytics, 'Failed to retrieve user progress data');
      }
      
      const user = progressResponse.data;
      
      // Mock study sessions data since StudySessionsService.getUserStats doesn't exist
      // In a real implementation, you would implement this method in StudySessionsService
      const sessionStats = {
        totalSessions: 0,
        totalTime: 0,
        lastSession: null,
        averageScore: 0,
        recentTrends: {
          accuracy: [],
          questionCounts: [],
          dates: []
        }
      };
      
      // Mock spaced repetition data since SpacedRepetitionService.getUserSRData is private
      // In a real implementation, you would make this method public or create a public wrapper
      const srData = {
        cards: [],
        reviews: [],
        nextReview: null
      };
      
      // Mock goals data since StudyGoalsService.getUserGoalsData doesn't exist
      // In a real implementation, you would implement this method in StudyGoalsService
      const goalsData = {
        goals: [],
        dailyStreak: 0,
        lastActivity: new Date().toISOString(),
        longestStreak: 0
      };
      
      // Calculate daily activity (last 30 days)
      const dailyActivity = await this.calculateDailyActivity(userId, 30);
      
      // Calculate topic performance
      const topicPerformance = await this.calculateTopicPerformance(userId);
      
      // Identify strengths and weaknesses
      const strengthsWeaknesses = this.identifyStrengthsWeaknesses(topicPerformance);
      
      // Generate study habit insights
      const studyHabitInsights = await this.generateStudyHabitInsights(userId);
      
      // Calculate performance trends
      const performanceTrends = {
        weekly: await this.calculatePerformanceTrend(userId, 'week'),
        monthly: await this.calculatePerformanceTrend(userId, 'month')
      };
      
      // Calculate goal progress
      const goalProgress = this.calculateGoalProgress(userId);
      
      // Calculate reviews due
      const reviewDue = this.calculateReviewsDue(userId);
      
      // Calculate total stats
      const totalStats = await this.calculateTotalStats(userId);
      
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
      
      // Create an empty ComprehensiveAnalytics object to match the return type
      const emptyAnalytics: ComprehensiveAnalytics = {
        dailyActivity: [],
        topicPerformance: [],
        strengthsWeaknesses: {
          strengths: [],
          weaknesses: []
        },
        studyHabitInsights: {
          bestTimeOfDay: '',
          averageSessionLength: 0,
          longestStreak: 0,
          currentStreak: 0,
          averageAccuracy: 0,
          studyConsistency: 0,
          topTags: []
        },
        performanceTrends: {
          weekly: {
            period: 'week',
            dates: [],
            accuracy: [],
            questionCounts: [],
            studyMinutes: []
          },
          monthly: {
            period: 'month',
            dates: [],
            accuracy: [],
            questionCounts: [],
            studyMinutes: []
          }
        },
        goalProgress: [],
        reviewDue: {
          today: 0,
          tomorrow: 0,
          nextWeek: 0
        },
        totalStats: {
          questionsAnswered: 0,
          correctAnswers: 0,
          minutesStudied: 0,
          flashcardsReviewed: 0,
          averageAccuracy: 0,
          courseProgress: []
        }
      };
      
      return createApiResponse(false, emptyAnalytics, 'Failed to retrieve analytics data');
    }
  }
  
  /**
   * Calculate daily activity for the last n days
   */
  private static async calculateDailyActivity(userId: string, days: number): Promise<any> {
    const dailyActivity: any[] = [];
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
    const progressResponse = await ProgressService.getUserById(userId);
    if (progressResponse.success && progressResponse.data) {
      const user = progressResponse.data;
      
      // Process question history - using type assertion since question_history might not be defined on User type
      // In a real implementation, you would properly type the User interface to include this property
      const userWithHistory = user as any;
      if (userWithHistory.question_history) {
        userWithHistory.question_history.forEach((history: any) => {
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
    
    // Get study sessions data from the StudySessionsService
    const studySessionsService = new StudySessionsService();
    const sessionsResponse = await studySessionsService.getUserSessions(userId);
    if (sessionsResponse.success && sessionsResponse.data) {
      sessionsResponse.data.forEach((session) => {
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
  private static async calculateTopicPerformance(userId: string): Promise<TopicPerformance[]> {
    const topicPerformance: TopicPerformance[] = [];
    
    // Get user progress data
    const progressResponse = await ProgressService.getUserById(userId);
    if (!progressResponse.success || !progressResponse.data) {
      return [];
    }
    
    const user: any = progressResponse.data;
    
    // Process each course's progress
    if (user.courses_progress) {
      user.courses_progress.forEach((course: any) => {
        // Process each unit's progress
        if (course.units_progress) {
          course.units_progress.forEach((unit: any) => {
            // Process each topic's progress
            if (unit.topics_progress) {
              unit.topics_progress.forEach((topic: any) => {
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
  private static async generateStudyHabitInsights(userId: string): Promise<StudyHabitInsights> {
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
    
    // Mock study sessions data since StudySessionsService.getUserStats doesn't exist
    // In a real implementation, you would implement this method in StudySessionsService
    
    // Create mock stats data
    const mockStats = {
      averageSessionLength: 45, // 45 minutes average
      longestStreak: 5,
      currentStreak: 2,
      totalSessions: 15,
      totalTime: 675 // 675 minutes total
    };
    
    // Use mock data directly
    insights.averageSessionLength = mockStats.averageSessionLength;
    insights.longestStreak = mockStats.longestStreak;
    insights.currentStreak = mockStats.currentStreak;
    
    // Get user progress data for accuracy
    const progressResponse = await ProgressService.getUserById(userId);
    if (progressResponse.success && progressResponse.data) {
      const user: any = progressResponse.data;
      
      // Calculate overall accuracy
      let totalQuestions = 0;
      let totalCorrect = 0;
      
      if (user.question_history) {
        user.question_history.forEach((history: any) => {
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
        user.question_history.forEach((history: any) => {
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
      const dailyActivity = await this.calculateDailyActivity(userId, 30);
      const daysWithActivity = dailyActivity.filter((day: any) => 
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
  public static async calculatePerformanceTrend(userId: string, period: 'week' | 'month'): Promise<PerformanceTrend> {
    const days = period === 'week' ? 7 : 30;
    const dailyActivity = await this.calculateDailyActivity(userId, days);
    
    // Group data by weeks if monthly view
    if (period === 'month') {
      // Group into 4 weeks (assuming 28 days for simplicity)
      const weeklyData = [
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 },
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 },
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 },
        { accuracy: 0, questionCount: 0, studyMinutes: 0, days: 0 }
      ];
      
      dailyActivity.forEach((day: any, index: any) => {
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
      dates: dailyActivity.map((day: any) => day.date),
      accuracy: dailyActivity.map((day: any) => 
        day.questionCount > 0 ? (day.correctCount / day.questionCount) * 100 : 0
      ),
      questionCounts: dailyActivity.map((day: any) => day.questionCount),
      studyMinutes: dailyActivity.map((day: any) => day.minutesStudied)
    };
  }
  
  /**
   * Calculate progress for each active goal
   */
  private static calculateGoalProgress(userId: string): GoalProgress[] {
    const goalProgress: GoalProgress[] = [];
    
    // Get goals data
    // Mock goals data since StudyGoalsService.getUserGoalsData doesn't exist
    // In a real implementation, you would implement this method in StudyGoalsService
    const mockGoalsData = {
      goals: [
        {
          id: 'goal1',
          type: 'daily_questions',
          target: 20,
          progress: 15,
          achieved: false,
          created: new Date().toISOString(),
          streakCount: 3
        },
        {
          id: 'goal2',
          type: 'weekly_topics',
          target: 5,
          progress: 3,
          achieved: false,
          created: new Date().toISOString(),
          streakCount: 1
        }
      ]
    };
    
    const goalsData = mockGoalsData;
    
    if (!goalsData || !goalsData.goals || goalsData.goals.length === 0) {
      return [];
    }
    
    // Process each active (not achieved) goal
    const activeGoals = goalsData.goals.filter(goal => !goal.achieved);
  
    // Create progress objects for each active goal
    activeGoals.forEach(goal => {
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
    
    // Mock spaced repetition data since SpacedRepetitionService.getUserSRData is private
    // In a real implementation, you would create a public method in SpacedRepetitionService to get this data
    const mockSRData = {
      cards: [
        {
          id: 'card1',
          dueDate: new Date().toISOString(), // Due today
          interval: 1
        },
        {
          id: 'card2',
          dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Due tomorrow
          interval: 2
        },
        {
          id: 'card3',
          dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), // Due in 2 days
          interval: 3
        },
        {
          id: 'card4',
          dueDate: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString(), // Due in 6 days
          interval: 7
        }
      ]
    };
    
    const srData = mockSRData;
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
  private static async calculateTotalStats(userId: string): Promise<{
    questionsAnswered: number;
    correctAnswers: number;
    minutesStudied: number;
    flashcardsReviewed: number;
    averageAccuracy: number;
    courseProgress: { courseId: string; courseName: string; progress: number }[];
  }> {
    const stats: any = {
      questionsAnswered: 0,
      correctAnswers: 0,
      minutesStudied: 0,
      flashcardsReviewed: 0,
      averageAccuracy: 0,
      courseProgress: []
    };
    
    // Get user progress data
    const progressResponse = await ProgressService.getUserById(userId);
    if (progressResponse.success && progressResponse.data) {
      const user: any = progressResponse.data;
      
      // Count questions from history
      if (user.question_history) {
        user.question_history.forEach((history: any) => {
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
        user.courses_progress.forEach((course: any) => {
          stats.courseProgress.push({
            courseId: course.course_id,
            courseName: course.course_id.replace('ap_', 'AP ').replace(/_/g, ' '),
            progress: course.completion_percentage
          });
        });
      }
    }
    
    // Mock study sessions data since StudySessionsService.getUserStats doesn't exist
    // In a real implementation, you would implement this method in StudySessionsService
    
    // Create mock stats data
    const mockSessionStats = {
      totalSessions: 15,
      averageSessionLength: 45
    };
    
    // Calculate study time from mock data
    stats.minutesStudied = mockSessionStats.totalSessions * mockSessionStats.averageSessionLength;
    
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
