'use client';

import { useState, useEffect } from 'react';
import StudyTimer from '@/components/StudyTimer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Mock user ID for demo purposes
const DEMO_USER_ID = 'user1';

interface SessionStats {
  todayMinutes: number;
  weekMinutes: number;
  totalSessions: number;
  averageSessionLength: number;
  longestSession: number;
  currentStreak: number;
}

interface StudySession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;
  courseId?: string;
  topicId?: string;
}

export default function TimerPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);
  const [topics, setTopics] = useState<{id: string, name: string}[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    todayMinutes: 0,
    weekMinutes: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    longestSession: 0,
    currentStreak: 0
  });
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  
  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesResponse = await fetch('/api/units');
        const coursesData = await coursesResponse.json();
        
        if (coursesData.success) {
          setCourses(coursesData.data.map((course: any) => ({
            id: course.id,
            name: course.name || course.id.replace('ap_', 'AP ').replace('_', ' ')
          })));
        }
        
        // Fetch study session stats
        const statsResponse = await fetch(`/api/study-sessions/stats?userId=${DEMO_USER_ID}`);
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setSessionStats(statsData.data);
        }
        
        // Fetch recent sessions
        const sessionsResponse = await fetch(`/api/study-sessions?userId=${DEMO_USER_ID}&limit=5`);
        const sessionsData = await sessionsResponse.json();
        
        if (sessionsData.success) {
          setRecentSessions(sessionsData.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching timer data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Fetch topics when course changes
  useEffect(() => {
    async function fetchTopics() {
      if (!selectedCourse) {
        setTopics([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/units/${selectedCourse}/topics`);
        const data = await response.json();
        
        if (data.success) {
          setTopics(data.data.map((topic: any) => ({
            id: topic.id,
            name: topic.name || topic.id.replace('topic_', 'Topic ').replace('_', ' ')
          })));
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    }
    
    fetchTopics();
  }, [selectedCourse]);
  
  // Handle session completion
  const handleSessionComplete = async (durationSeconds: number) => {
    // Convert to minutes for API
    const durationMinutes = Math.floor(durationSeconds / 60);
    
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          duration: durationMinutes,
          courseId: selectedCourse || undefined,
          topicId: selectedTopic || undefined,
          notes: notes.trim() || undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh stats
        const statsResponse = await fetch(`/api/study-sessions/stats?userId=${DEMO_USER_ID}`);
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setSessionStats(statsData.data);
        }
        
        // Refresh recent sessions
        const sessionsResponse = await fetch(`/api/study-sessions?userId=${DEMO_USER_ID}&limit=5`);
        const sessionsData = await sessionsResponse.json();
        
        if (sessionsData.success) {
          setRecentSessions(sessionsData.data);
        }
        
        // Clear notes
        setNotes('');
      }
    } catch (error) {
      console.error('Error recording study session:', error);
    }
  };
  
  // Format minutes as hours and minutes
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg">Loading study timer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Timer</h1>
          <p className="text-gray-600 dark:text-gray-300">Use the Pomodoro technique to boost your productivity</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main timer */}
          <StudyTimer 
            onSessionComplete={handleSessionComplete}
          />
          
          {/* Study session context */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Study Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course (Optional)</label>
                  <select 
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    value={selectedCourse}
                    onChange={e => {
                      setSelectedCourse(e.target.value);
                      setSelectedTopic('');
                    }}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Topic (Optional)</label>
                  <select 
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    value={selectedTopic}
                    onChange={e => setSelectedTopic(e.target.value)}
                    disabled={!selectedCourse}
                  >
                    <option value="">Select a topic</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Session Notes (Optional)</label>
                <textarea
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 min-h-24"
                  placeholder="What do you want to accomplish in this study session?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent sessions */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Recent Study Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{formatDate(session.startTime)}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                          {formatMinutes(session.duration)}
                        </div>
                      </div>
                      
                      {(session.courseId || session.topicId) && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {session.courseId && (
                            <span className="mr-2">
                              Course: {courses.find(c => c.id === session.courseId)?.name || session.courseId}
                            </span>
                          )}
                          {session.topicId && (
                            <span>
                              Topic: {topics.find(t => t.id === session.topicId)?.name || session.topicId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400">No study sessions recorded yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Complete your first session to see it here
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/history" className="w-full">
                <Button variant="outline" className="w-full">View All Sessions</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Stats column */}
        <div className="space-y-6">
          {/* Study stats */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Your Study Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1 text-primary-600 dark:text-primary-400">
                    {formatMinutes(sessionStats.todayMinutes)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
                </div>
                
                <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1 text-primary-600 dark:text-primary-400">
                    {formatMinutes(sessionStats.weekMinutes)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
                </div>
                
                <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {sessionStats.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
                </div>
                
                <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {formatMinutes(sessionStats.averageSessionLength)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Length</div>
                </div>
                
                <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {formatMinutes(sessionStats.longestSession)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Longest Session</div>
                </div>
                
                <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {sessionStats.currentStreak} days
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pomodoro info */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>About the Pomodoro Technique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s.
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">How it works:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Break work into intervals, traditionally 25 minutes in length</li>
                    <li>Take a short break (5 minutes) after each interval</li>
                    <li>Take a longer break (15-30 minutes) after 4 intervals</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Benefits:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Improves focus and concentration</li>
                    <li>Reduces mental fatigue</li>
                    <li>Increases awareness of time spent</li>
                    <li>Helps avoid procrastination</li>
                  </ul>
                </div>
                
                <p>
                  Customize the timer settings to match your personal preferences and study needs.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Related goals */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Related Study Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <Link href="/goals" className="w-full">
                  <Button variant="primary" className="w-full">Create Study Time Goal</Button>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Set daily or weekly study time goals to track your progress
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
