'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ActivityChart from '@/components/analytics/ActivityChart';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import ProgressTracker from '@/components/analytics/ProgressTracker';
import TopicInsights from '@/components/analytics/TopicInsights';
import { ComprehensiveAnalytics } from '@/lib/services/analyticsService';
import Link from 'next/link';

// Mock user ID for demo
const DEMO_USER_ID = 'user1';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  
  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?userId=${DEMO_USER_ID}`);
        const data = await response.json();
        
        if (data.success) {
          setAnalytics(data.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, []);
  
  // Format time (minutes to hours and minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  // Get current performance trend based on selected timeframe
  const getCurrentTrend = () => {
    if (!analytics) return null;
    return timeframe === 'week' ? analytics.performanceTrends.weekly : analytics.performanceTrends.monthly;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg">Analyzing your study data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your progress and optimize your learning</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant={timeframe === 'week' ? 'primary' : 'outline'} 
            onClick={() => setTimeframe('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeframe === 'month' ? 'primary' : 'outline'} 
            onClick={() => setTimeframe('month')}
          >
            Month
          </Button>
        </div>
      </div>
      
      {!analytics ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No Analytics Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start practicing and studying to generate analytics data
          </p>
          <Link href="/practice">
            <Button variant="primary">Go to Practice</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Key stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="glass" hoverEffect="lift">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{analytics.totalStats.questionsAnswered}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Questions Answered</div>
              </CardContent>
            </Card>
            
            <Card variant="glass" hoverEffect="lift">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{Math.round(analytics.totalStats.averageAccuracy)}%</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Average Accuracy</div>
              </CardContent>
            </Card>
            
            <Card variant="glass" hoverEffect="lift">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{formatTime(analytics.totalStats.minutesStudied)}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Total Study Time</div>
              </CardContent>
            </Card>
            
            <Card variant="glass" hoverEffect="lift">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">{analytics.studyHabitInsights.currentStreak}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Day Streak</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Activity chart */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityChart 
                  data={analytics.dailyActivity.slice(-7)} 
                  className="h-[300px]" 
                />
                <div className="grid grid-cols-3 mt-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                    <p className="font-medium">
                      {analytics.dailyActivity.slice(-7).reduce((sum, day) => sum + day.questionCount, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Minutes</p>
                    <p className="font-medium">
                      {analytics.dailyActivity.slice(-7).reduce((sum, day) => sum + day.minutesStudied, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Flashcards</p>
                    <p className="font-medium">
                      {analytics.dailyActivity.slice(-7).reduce((sum, day) => sum + day.flashcardsReviewed, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance trend */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {getCurrentTrend() && (
                  <PerformanceChart 
                    data={getCurrentTrend()!} 
                    className="h-[300px]" 
                  />
                )}
                <div className="flex justify-between mt-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average Accuracy</p>
                    <p className="font-medium">
                      {(() => {
                        const trend = getCurrentTrend();
                        if (!trend || !trend.accuracy || trend.accuracy.length === 0) return 0;
                        
                        const sum = trend.accuracy.reduce((sum, val) => sum + val, 0);
                        const count = trend.accuracy.filter(val => val > 0).length;
                        return count > 0 ? Math.round(sum / count) : 0;
                      })()}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Questions</p>
                    <p className="font-medium">
                      {(() => {
                        const trend = getCurrentTrend();
                        if (!trend || !trend.questionCounts) return 0;
                        return trend.questionCounts.reduce((sum, val) => sum + val, 0);
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Study Time</p>
                    <p className="font-medium">
                      {formatTime(getCurrentTrend()?.studyMinutes.reduce((sum, val) => sum + val, 0) || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Topic insights */}
          <div className="mb-8">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Topic Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <TopicInsights data={analytics.topicPerformance} />
              </CardContent>
            </Card>
          </div>
          
          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course progress */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTracker courses={analytics.totalStats.courseProgress} />
              </CardContent>
            </Card>
            
            {/* Study habits */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Study Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Best Time to Study</h3>
                        <p className="text-lg font-bold capitalize">{analytics.studyHabitInsights.bestTimeOfDay}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Average Session</h3>
                        <p className="text-lg font-bold">{formatTime(analytics.studyHabitInsights.averageSessionLength)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Study Consistency</h3>
                        <p className="text-lg font-bold">{Math.round(analytics.studyHabitInsights.studyConsistency)}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Top Tags</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analytics.studyHabitInsights.topTags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-xs"
                            >
                              {tag.tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Reviews and goals */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Upcoming Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Due today</h3>
                      <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-bold">
                        {analytics.reviewDue.today}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Due tomorrow</h3>
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                        {analytics.reviewDue.tomorrow}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Coming next week</h3>
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-bold">
                        {analytics.reviewDue.nextWeek}
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/review" className="block mt-4">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      disabled={analytics.reviewDue.today === 0}
                    >
                      Start Review Session
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium mb-4">Active Goals</h3>
                  {analytics.goalProgress.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.goalProgress.slice(0, 3).map(goal => (
                        <div key={goal.goalId} className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{goal.type.replace('_', ' ')}</h4>
                            <div className="text-sm font-bold">
                              {Math.round(goal.percentage)}%
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary-500"
                              style={{ width: `${goal.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {goal.current} / {goal.target}
                          </div>
                        </div>
                      ))}
                      
                      <Link href="/goals" className="block">
                        <Button variant="outline" className="w-full">View All Goals</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <p className="mb-3">No active goals</p>
                      <Link href="/goals">
                        <Button variant="outline" size="sm">Create a Goal</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
