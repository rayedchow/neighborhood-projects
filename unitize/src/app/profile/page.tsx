"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const userId = 'user1'; // Hardcoded for demo
  
  const [userData, setUserData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // In Next.js, when calling API routes from the client side,
        // we need to use the full URL based on the current host
        const baseUrl = window.location.origin;
        
        // Fetch user progress data
        const progressResponse = await fetch(`${baseUrl}/api/progress?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!progressResponse.ok) {
          throw new Error(`Error ${progressResponse.status}: Failed to fetch user progress`);
        }
        
        const progressData = await progressResponse.json();
        console.log('Progress API response:', progressData);
        
        // Set user data
        if (progressData.success && progressData.data) {
          setUserData(progressData);
        } else if (progressData) {
          setUserData({ data: progressData, success: true });
        }
        
        // Fetch recommendations data
        const recsResponse = await fetch(`${baseUrl}/api/recommendations?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!recsResponse.ok) {
          console.warn(`Warning: ${recsResponse.status}: Failed to fetch recommendations`);
          // Don't throw here, we can still show the profile without recommendations
        } else {
          const recsData = await recsResponse.json();
          console.log('Recommendations API response:', recsData);
          
          // Set recommendations data
          if (recsData.success && recsData.data) {
            setRecommendations(recsData);
          } else if (recsData) {
            setRecommendations({ data: recsData, success: true });
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [userId]);
  
  // Calculate overall stats
  const calculateOverallStats = () => {
    if (!userData || !userData.success || !userData.data) {
      return { totalAttempted: 0, totalCorrect: 0, accuracy: 0 };
    }
    
    const { data } = userData;
    let totalAttempted = 0;
    let totalCorrect = 0;
    
    Object.values(data.courses || {}).forEach((course: any) => {
      totalAttempted += course.questionsAttempted || 0;
      totalCorrect += course.questionsCorrect || 0;
    });
    
    return {
      totalAttempted,
      totalCorrect,
      accuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0
    };
  };
  
  const stats = calculateOverallStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
          <p className="text-neutral-600 dark:text-neutral-300 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Error Loading Profile</h2>
          <p className="text-neutral-600 dark:text-neutral-300">Sorry, we couldn't load your profile data. Please try again later.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 md:py-24">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-primary-700 text-transparent bg-clip-text dark:from-primary-400 dark:to-primary-500">Your Learning Profile</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">Track your progress and see personalized topic recommendations</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card 
          variant="elevated" 
          padding="lg"
          className="transform transition-all hover:scale-105"
          highlight="top"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Questions Attempted</h3>
              <p className="mt-2 text-4xl font-bold">{stats.totalAttempted}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full dark:bg-primary-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card 
          variant="elevated" 
          padding="lg"
          className="transform transition-all hover:scale-105"
          highlight="top"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Questions Correct</h3>
              <p className="mt-2 text-4xl font-bold">{stats.totalCorrect}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full dark:bg-green-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card 
          variant="elevated" 
          padding="lg"
          className="transform transition-all hover:scale-105"
          highlight="top"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Accuracy Rate</h3>
              <div className="flex items-baseline mt-2">
                <p className="text-4xl font-bold">{stats.accuracy}</p>
                <span className="ml-1 text-2xl font-medium">%</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Course Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Course Progress</h2>
          <Link href="/courses">
            <Button variant="outline" size="sm">
              View All Courses
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userData?.data?.courses && Object.entries(userData.data.courses).map(([courseId, course]: [string, any]) => {
            const accuracy = course.questionsAttempted > 0 
              ? Math.round((course.questionsCorrect / course.questionsAttempted) * 100) 
              : 0;
              
            let statusColor = 'bg-neutral-200 dark:bg-neutral-700';
            if (accuracy > 80) statusColor = 'bg-green-500';
            else if (accuracy > 50) statusColor = 'bg-yellow-500';
            else if (accuracy > 0) statusColor = 'bg-orange-500';
              
            return (
              <Card 
                key={courseId}
                variant="default"
                padding="none"
                clickable
              >
                <div className="p-5" onClick={() => window.location.href = `/courses/${courseId}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${statusColor} mr-2`}></div>
                        <h3 className="text-lg font-semibold">{courseId}</h3>
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                        {course.questionsAttempted || 0} questions attempted
                      </p>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full h-12 w-12 flex items-center justify-center">
                      <span className="text-lg font-bold">{accuracy}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${statusColor}`}
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recommended Topics</h2>
          <Link href="/practice">
            <Button variant="primary" size="sm">
              Start Practice
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations?.data?.map((rec: any, index: number) => (
            <Card 
              key={index} 
              variant="interactive"
              padding="lg"
              clickable
            >
              <div className="space-y-3" onClick={() => window.location.href = `/courses/${rec.courseId}/${rec.unitId}/${rec.topicId}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                    Needs Review • {rec.score?.toFixed(1) || '0'}%
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-medium">{rec.topic?.name || 'Topic'}</h3>
                
                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="font-medium">{rec.courseId}</span>
                  <span className="mx-2">•</span>
                  <span>Unit {rec.unitId}</span>
                </div>
              </div>
            </Card>
          ))}
          
          {(!recommendations?.data || recommendations.data.length === 0) && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div className="w-16 h-16 mx-auto text-neutral-400 dark:text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium">No Recommendations Yet</h3>
              <p className="mt-2 text-neutral-500 dark:text-neutral-400">Complete more practice questions to get personalized recommendations</p>
              <div className="mt-6">
                <Link href="/practice">
                  <Button variant="primary">Start Practicing</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
