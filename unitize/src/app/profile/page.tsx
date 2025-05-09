'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface UserStats {
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
}

interface Recommendation {
  topicId: string;
  unitId: string;
  accuracyRate: number;
  attemptsCount: number;
}

export default function ProfilePage() {
  // Hardcoded user ID for now (in a real app, this would come from auth)
  const userId = "user1";
  const courseId = "ap_calc_ab"; // Default course for this demo
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch user stats and recommendations in parallel
        const [statsResponse, recommendationsResponse] = await Promise.all([
          fetch(`/api/progress?userId=${userId}&courseId=${courseId}`),
          fetch(`/api/recommendations?userId=${userId}&courseId=${courseId}&limit=3`)
        ]);
        
        if (!statsResponse.ok) {
          throw new Error(`Error ${statsResponse.status}: Failed to fetch user stats`);
        }
        
        if (!recommendationsResponse.ok) {
          throw new Error(`Error ${recommendationsResponse.status}: Failed to fetch recommendations`);
        }
        
        const statsData = await statsResponse.json();
        const recommendationsData = await recommendationsResponse.json();
        
        if (statsData.success && statsData.data) {
          setUserStats(statsData.data);
        }
        
        if (recommendationsData.success && recommendationsData.data) {
          setRecommendations(recommendationsData.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  // Format time function (converts seconds to hours, minutes, seconds format)
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your profile data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Overview Stats */}
          <section>
            <h2 className="text-xl font-bold mb-4">Your Progress Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions Attempted</div>
                  <div className="text-3xl font-bold mt-1">{userStats?.totalAttempted || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy Rate</div>
                  <div className="text-3xl font-bold mt-1">{Math.round(userStats?.accuracyRate || 0)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Correct Answers</div>
                  <div className="text-3xl font-bold mt-1">{userStats?.totalCorrect || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Study Time</div>
                  <div className="text-3xl font-bold mt-1">{formatTime(userStats?.totalTimeSpent || 0)}</div>
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Recommendations */}
          <section>
            <h2 className="text-xl font-bold mb-4">Recommended Topics</h2>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <Card key={rec.topicId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Topic: {rec.topicId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Your accuracy rate: {Math.round(rec.accuracyRate)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {rec.attemptsCount} attempts
                      </p>
                      <Link href={`/courses/${courseId}/${rec.unitId}/${rec.topicId}`}>
                        <Button variant="primary" size="sm" fullWidth>Practice Now</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No recommendations available yet. Start practicing to get personalized recommendations!
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
          
          {/* Unit Breakdown */}
          {userStats?.unitBreakdown && userStats.unitBreakdown.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Performance by Unit</h2>
              <div className="space-y-4">
                {userStats.unitBreakdown.map((unit) => (
                  <Card key={unit.unitId}>
                    <CardHeader>
                      <CardTitle className="text-lg">Unit: {unit.unitId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between">
                          <span>Questions:</span>
                          <span>{unit.questionsAttempted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Correct:</span>
                          <span>{unit.questionsCorrect}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span>{Math.round(unit.accuracyRate)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${unit.accuracyRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
          
          {/* Call to Action */}
          <section className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Ready to improve your skills?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Continue practicing to track your progress and improve your AP test scores.
              </p>
              <Link href="/courses">
                <Button variant="primary" size="lg">Continue Studying</Button>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
