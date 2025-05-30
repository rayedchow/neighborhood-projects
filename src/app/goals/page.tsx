'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalType, StudyGoal } from '@/lib/services/studyGoalsService';
import Link from 'next/link';

// Mock user ID for demo purposes
const DEMO_USER_ID = 'user1';

interface GoalFormData {
  type: GoalType;
  target: number;
  courseId?: string;
  deadline?: string;
}

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [streakInfo, setStreakInfo] = useState({
    dailyStreak: 0,
    longestStreak: 0,
    lastActivity: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState<GoalFormData>({
    type: GoalType.DAILY_QUESTIONS,
    target: 10
  });

  // Fetch goals data
  useEffect(() => {
    async function fetchGoalsData() {
      try {
        setLoading(true);
        
        // Fetch courses first (for dropdown)
        const coursesResponse = await fetch('/api/units');
        const coursesData = await coursesResponse.json();
        
        if (coursesData.success) {
          setCourses(coursesData.data.map((course: any) => ({
            id: course.id,
            name: course.name
          })));
        }
        
        // Fetch goals data
        const response = await fetch(`/api/goals?userId=${DEMO_USER_ID}`);
        const data = await response.json();
        
        if (data.success) {
          setGoals(data.data.goals);
          setStreakInfo(data.data.streakInfo);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching goals data:', error);
        setLoading(false);
      }
    }
    
    fetchGoalsData();
  }, []);

  // Create a new goal
  const createGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          ...formData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new goal to our state
        setGoals([...goals, data.data]);
        
        // Reset form
        setFormData({
          type: GoalType.DAILY_QUESTIONS,
          target: 10
        });
        
        // Hide form
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };
  
  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals?userId=${DEMO_USER_ID}&goalId=${goalId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the goal from our state
        setGoals(goals.filter(g => g.id !== goalId));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };
  
  // Calculate progress percentage
  const getProgressPercentage = (goal: StudyGoal) => {
    return Math.min(100, Math.floor((goal.progress / goal.target) * 100));
  };
  
  // Get human-readable goal type
  const getGoalTypeLabel = (type: GoalType) => {
    switch (type) {
      case GoalType.DAILY_QUESTIONS:
        return 'Daily Questions';
      case GoalType.DAILY_MINUTES:
        return 'Daily Study Minutes';
      case GoalType.WEEKLY_TOPICS:
        return 'Weekly Topics';
      case GoalType.WEEKLY_UNITS:
        return 'Weekly Units';
      case GoalType.COURSE_COMPLETION:
        return 'Course Completion';
    }
  };
  
  // Group goals by type
  const groupedGoals = goals.reduce<Record<string, StudyGoal[]>>((acc, goal) => {
    const key = goal.type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(goal);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Study Goals</h1>
          <p className="text-gray-600 dark:text-gray-300">Set targets and track your progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Streak card */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-lg flex items-center shadow-lg">
            <div className="mr-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a.75.75 0 01.75.75v.25h1.5a.75.75 0 010 1.5h-1.5v.25a.75.75 0 01-1.5 0V4.5H7.75a.75.75 0 010-1.5h1.5v-.25A.75.75 0 0110 2z" />
                <path fillRule="evenodd" d="M10 5a.75.75 0 01.75.75v.25h1.5a.75.75 0 010 1.5h-1.5v.25a.75.75 0 01-1.5 0V7.5H7.75a.75.75 0 010-1.5h1.5v-.25A.75.75 0 0110 5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3.22 7.22a.75.75 0 011.06 0l2.22 2.22V4.75a.75.75 0 011.5 0v4.69l2.22-2.22a.75.75 0 011.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
                <path d="M2 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-6z" />
                <path d="M12 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-medium">Current Streak</div>
              <div className="text-xl font-bold">{streakInfo.dailyStreak} days</div>
            </div>
          </div>
          
          <Button 
            variant="primary"
            onClick={() => setShowForm(true)}
            className="whitespace-nowrap"
          >
            Add New Goal
          </Button>
        </div>
      </div>
      
      {/* Goal creation form */}
      {showForm && (
        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Type</label>
                <select 
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as GoalType})}
                >
                  <option value={GoalType.DAILY_QUESTIONS}>Daily Questions</option>
                  <option value={GoalType.DAILY_MINUTES}>Daily Study Minutes</option>
                  <option value={GoalType.WEEKLY_TOPICS}>Weekly Topics</option>
                  <option value={GoalType.WEEKLY_UNITS}>Weekly Units</option>
                  <option value={GoalType.COURSE_COMPLETION}>Course Completion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target</label>
                <input
                  type="number"
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                  value={formData.target}
                  min={1}
                  onChange={e => setFormData({...formData, target: parseInt(e.target.value)})}
                />
              </div>
              
              {(formData.type === GoalType.COURSE_COMPLETION || formData.type === GoalType.WEEKLY_TOPICS) && (
                <div>
                  <label className="block text-sm font-medium mb-2">Course</label>
                  <select 
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    value={formData.courseId || ''}
                    onChange={e => setFormData({...formData, courseId: e.target.value})}
                  >
                    <option value="">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                  value={formData.deadline || ''}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={createGoal}>Create Goal</Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Display goals by type */}
      {Object.keys(groupedGoals).length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No goals yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first study goal to track your progress</p>
          <Button variant="primary" onClick={() => setShowForm(true)}>Create Your First Goal</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedGoals).map(([type, typeGoals]) => (
            <div key={type} className="space-y-4">
              <h2 className="text-xl font-bold">{getGoalTypeLabel(type as GoalType)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeGoals.map(goal => (
                  <Card key={goal.id} variant="glass" className={goal.achieved ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""} hoverEffect="lift">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{goal.target} {getGoalTypeLabel(goal.type)}</CardTitle>
                        <button 
                          onClick={() => deleteGoal(goal.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {goal.courseId && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Course: {courses.find(c => c.id === goal.courseId)?.name || goal.courseId}
                        </div>
                      )}
                      
                      {goal.deadline && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Due by: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{goal.progress} / {goal.target}</span>
                          <span>{getProgressPercentage(goal)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${goal.achieved ? 'bg-green-500' : 'bg-primary-500'}`}
                            style={{width: `${getProgressPercentage(goal)}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      {goal.achieved && (
                        <div className="mt-4 flex items-center text-green-500 dark:text-green-400">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          <span className="font-medium">Goal achieved!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Badges/achievements section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Your Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { name: 'First Goal', description: 'Created your first study goal', achieved: goals.length > 0 },
            { name: 'Goal Crusher', description: 'Achieved 5 goals', achieved: goals.filter(g => g.achieved).length >= 5 },
            { name: 'Streak Master', description: 'Maintained a 7-day streak', achieved: streakInfo.dailyStreak >= 7 },
            { name: 'Diverse Learner', description: 'Created goals of 3 different types', achieved: Object.keys(groupedGoals).length >= 3 },
            { name: 'Perfect Planner', description: 'Created a goal with a deadline', achieved: goals.some(g => g.deadline) }
          ].map((badge, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-4 text-center border ${badge.achieved 
                ? 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800' 
                : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50'}`}
            >
              <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                badge.achieved 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">{badge.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
