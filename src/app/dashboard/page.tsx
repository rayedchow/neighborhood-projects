'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StudyGoal } from '@/lib/services/studyGoalsService';

// Mock user ID for demo
const DEMO_USER_ID = 'user1';

interface DashboardData {
  stats: {
    totalQuestions: number;
    correctQuestions: number;
    accuracy: number;
    timeSpent: number;
    streak: number;
    strengths: string[];
    weaknesses: string[];
  };
  recentCourses: {
    id: string;
    name: string;
    lastAccessed: string;
    completion: number;
  }[];
  reviewStats: {
    reviewsDueToday: number;
    reviewsDueTomorrow: number;
    reviewsCompletedToday: number;
    totalCards: number;
  };
  goals: StudyGoal[];
  streakInfo: {
    dailyStreak: number;
    longestStreak: number;
    lastActivity: string;
  };
  recommendations: {
    id: string;
    name: string;
    type: string;
    reason: string;
  }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch stats, recommendations, and goals in parallel
        const [statsRes, coursesRes, reviewStatsRes, goalsRes, recommendationsRes] = await Promise.all([
          fetch(`/api/progress/stats?userId=${DEMO_USER_ID}`).then(res => res.json()),
          fetch(`/api/progress?userId=${DEMO_USER_ID}`).then(res => res.json()),
          fetch(`/api/spaced-repetition?userId=${DEMO_USER_ID}`, {
            method: 'PATCH'
          }).then(res => res.json()),
          fetch(`/api/goals?userId=${DEMO_USER_ID}`).then(res => res.json()),
          fetch(`/api/progress/recommend?userId=${DEMO_USER_ID}`).then(res => res.json())
        ]);
        
        // Format data for dashboard
        const data: DashboardData = {
          stats: statsRes.success ? statsRes.data : {
            totalQuestions: 0,
            correctQuestions: 0,
            accuracy: 0,
            timeSpent: 0,
            streak: 0,
            strengths: [],
            weaknesses: []
          },
          recentCourses: coursesRes.success ? 
            coursesRes.data.courses_progress
              .sort((a: any, b: any) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime())
              .slice(0, 3)
              .map((course: any) => ({
                id: course.course_id,
                name: course.course_id.replace('ap_', 'AP ').replace('_', ' '),
                lastAccessed: course.last_accessed,
                completion: course.completion_percentage
              })) : [],
          reviewStats: reviewStatsRes.success ? reviewStatsRes.data : {
            reviewsDueToday: 0,
            reviewsDueTomorrow: 0,
            reviewsCompletedToday: 0,
            totalCards: 0
          },
          goals: goalsRes.success ? goalsRes.data.goals.filter((g: StudyGoal) => !g.achieved).slice(0, 3) : [],
          streakInfo: goalsRes.success ? goalsRes.data.streakInfo : {
            dailyStreak: 0,
            longestStreak: 0,
            lastActivity: ''
          },
          recommendations: recommendationsRes.success ? recommendationsRes.data.map((r: any) => ({
            id: r.id,
            name: r.name || r.id.replace('unit', 'Unit ').replace('topic', 'Topic '),
            type: r.id.includes('unit') ? 'unit' : 'topic',
            reason: r.reason || 'Recommended based on your progress'
          })) : []
        };
        
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  
  // Format minutes from seconds
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome section with streak */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, Student</h1>
          <p className="text-gray-600 dark:text-gray-300">Here's an overview of your learning progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Streak card */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-lg flex items-center shadow-lg">
            <div className="mr-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"></path>
              </svg>
            </div>
            <div>
              <div className="text-xs font-medium">Current Streak</div>
              <div className="text-xl font-bold">{dashboardData?.streakInfo.dailyStreak || 0} days</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats cards - Top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="glass" hoverEffect="lift">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="text-3xl font-bold mb-1">{dashboardData?.stats.totalQuestions || 0}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Questions Attempted</div>
          </CardContent>
        </Card>
        
        <Card variant="glass" hoverEffect="lift">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="text-3xl font-bold mb-1">{Math.round(dashboardData?.stats.accuracy || 0)}%</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Accuracy</div>
          </CardContent>
        </Card>
        
        <Card variant="glass" hoverEffect="lift">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="text-3xl font-bold mb-1">{formatTime(dashboardData?.stats.timeSpent || 0)}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Study Time</div>
          </CardContent>
        </Card>
        
        <Card variant="glass" hoverEffect="lift">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
            </div>
            <div className="text-3xl font-bold mb-1">{dashboardData?.reviewStats.reviewsDueToday || 0}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Reviews Due Today</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Your courses */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Recent Courses</CardTitle>
              <Link href="/courses">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentCourses && dashboardData.recentCourses.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentCourses.map((course, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{course.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last studied: {new Date(course.lastAccessed).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="outline" size="sm">Continue</Button>
                        </Link>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round(course.completion)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500"
                            style={{width: `${course.completion}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400">No courses started yet</p>
                  <Link href="/courses" className="mt-2 inline-block">
                    <Button variant="outline">Browse Courses</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recommendations */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recommendations && dashboardData.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                      <div className="bg-primary-100 dark:bg-primary-900/30 rounded-lg p-2 mr-4">
                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{rec.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{rec.reason}</p>
                          </div>
                          <Link href={rec.type === 'unit' ? `/courses/${rec.id.split('_')[0]}/${rec.id}` : `/courses/${rec.id.split('_')[0]}/${rec.id.split('_')[1]}/${rec.id}`}>
                            <Button variant="outline" size="sm">Study</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400">Practice more to get personalized recommendations</p>
                  <Link href="/practice" className="mt-2 inline-block">
                    <Button variant="outline">Go to Practice</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column */}
        <div className="space-y-8">
          {/* Spaced repetition card */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Daily Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {dashboardData?.reviewStats.reviewsDueToday || 0}
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-1">Cards due today</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Keep your streak going!
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-3">
                    <div className="text-lg font-bold">{dashboardData?.reviewStats.reviewsCompletedToday || 0}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Completed today</div>
                  </div>
                  <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-3">
                    <div className="text-lg font-bold">{dashboardData?.reviewStats.reviewsDueTomorrow || 0}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Due tomorrow</div>
                  </div>
                </div>
                
                <Link href="/review" className="block">
                  <Button 
                    variant="primary" 
                    className="w-full"
                    disabled={!dashboardData?.reviewStats.reviewsDueToday}
                  >
                    Start Review Session
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          

          
          {/* Study goals */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Goals</CardTitle>
              <Link href="/goals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData?.goals && dashboardData.goals.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.goals.map((goal, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="mb-2">
                        <h3 className="font-medium">{goal.target} {goal.type.replace('_', ' ')}</h3>
                        {goal.deadline && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Due by: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{goal.progress} / {goal.target}</span>
                          <span>{Math.min(100, Math.floor((goal.progress / goal.target) * 100))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500"
                            style={{width: `${Math.min(100, (goal.progress / goal.target) * 100)}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400">No active goals yet</p>
                  <Link href="/goals" className="mt-2 inline-block">
                    <Button variant="outline">Create Goals</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Strengths and weaknesses */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Strengths</h3>
                  {dashboardData?.stats.strengths && dashboardData.stats.strengths.length > 0 ? (
                    <div className="space-y-2">
                      {dashboardData.stats.strengths.map((strength, index) => (
                        <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md py-2 px-3 text-sm flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Practice more to uncover your strengths
                    </p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Areas for Improvement</h3>
                  {dashboardData?.stats.weaknesses && dashboardData.stats.weaknesses.length > 0 ? (
                    <div className="space-y-2">
                      {dashboardData.stats.weaknesses.map((weakness, index) => (
                        <div key={index} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md py-2 px-3 text-sm flex items-center">
                          <svg className="w-4 h-4 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                          </svg>
                          <span>{weakness}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Practice more to identify areas for improvement
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
