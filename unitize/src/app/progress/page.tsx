'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TestHistoryEntry } from '@/models';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressPage() {
  const [userId, setUserId] = useState<string | null>(null);
  
  const [testHistory, setTestHistory] = useState<TestHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TestHistoryEntry[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseList, setCourseList] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check for authenticated user on component mount
  useEffect(() => {
    // Check if user is logged in via localStorage
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('unitize_user_id') : null;
    
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Redirect to login if no user ID found
      window.location.href = '/login';
      return;
    }
  }, []);

  // Fetch all available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        
        if (data.success) {
          setCourseList(data.data);
        } else {
          setError('Failed to load courses');
        }
      } catch (err) {
        setError('Error fetching courses');
        console.error(err);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch test history for the user
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const url = selectedCourse 
          ? `/api/progress/history?userId=${userId}&courseId=${selectedCourse}`
          : `/api/progress/history?userId=${userId}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          // Sort by date (newest first)
          const sortedHistory = data.data.sort(
            (a: TestHistoryEntry, b: TestHistoryEntry) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setTestHistory(sortedHistory);
          setFilteredHistory(sortedHistory);
        } else {
          setError(data.error || 'Failed to load test history');
        }
      } catch (err) {
        setError('Error fetching test history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchHistory();
    }
  }, [userId, selectedCourse]);
  
  // Handle course filter change
  const handleCourseChange = (courseId: string | null) => {
    setSelectedCourse(courseId);
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    // Get last 10 test entries for the chart (in chronological order)
    const chartEntries = [...filteredHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10);
    
    return {
      labels: chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Test Score (%)',
          data: chartEntries.map(entry => entry.score),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(79, 70, 229)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(79, 70, 229)',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };
  
  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Test Date',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Score Progress Over Time',
      },
    },
  };
  
  // Calculate average score
  const averageScore = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((acc, entry) => acc + entry.score, 0) / filteredHistory.length)
    : 0;
  
  // Calculate improvement (comparing first and last test)
  const calculateImprovement = () => {
    if (filteredHistory.length < 2) return { value: 0, improving: false };
    
    const sortedHistory = [...filteredHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstScore = sortedHistory[0].score;
    const latestScore = sortedHistory[sortedHistory.length - 1].score;
    const improvement = latestScore - firstScore;
    
    return {
      value: improvement,
      improving: improvement > 0
    };
  };
  
  const improvement = calculateImprovement();
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="relative mb-12 pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
          Your Progress Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
          Track your performance across courses, monitor improvements, and analyze your test history.
        </p>
      </div>
      
      {/* Course Filter */}
      <div className="mb-10 px-1 py-2">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Course</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCourse === null ? "primary" : "ghost"}
            size="sm"
            rounded="lg"
            onClick={() => handleCourseChange(null)}
          >
            All Courses
          </Button>
          {courseList.map(course => (
            <Button
              key={course.id}
              variant={selectedCourse === course.id ? "primary" : "ghost"}
              size="sm"
              rounded="lg"
              onClick={() => handleCourseChange(course.id)}
            >
              {course.name}
            </Button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 border-b-blue-600 shadow-md"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading your progress data...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-red-500">{error}</div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-600 dark:text-gray-300">Tests Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{filteredHistory.length}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total tests completed</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-600 dark:text-gray-300">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{averageScore}%</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all tests</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-600 dark:text-gray-300">Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${improvement.improving ? 'text-green-500' : improvement.value < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {improvement.value > 0 ? '+' : ''}{improvement.value}%
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From first to last test</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Score Chart */}
          {filteredHistory.length > 0 ? (
            <Card className="mb-10 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Score Progress</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Showing your performance trend over time</p>
              </CardHeader>
              <CardContent>
                <div className="h-80 transition-all duration-500 animate-fade-in">
                  <Line data={prepareChartData()} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="p-6">
                <p>No test history available. Take some practice tests to see your progress!</p>
              </CardContent>
            </Card>
          )}
          
          {/* Recent Tests Table */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-600"></div>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Recent Test Results</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your most recent test attempts</p>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm">Date</th>
                        <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm">Course</th>
                        <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm">Score</th>
                        <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm">Correct</th>
                        <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm">Total</th>
                        <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.slice(0, 10).map((entry, index) => {
                        const course = courseList.find(c => c.id === entry.course_id);
                        const date = new Date(entry.date);
                        
                        return (
                          <tr 
                            key={entry.id} 
                            className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-150 ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}
                          >
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-300">
                              {date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-300 font-medium">{course?.name || entry.course_id}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full font-medium ${
entry.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
entry.score >= 60 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                                {entry.score}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{entry.correct_questions}</td>
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{entry.total_questions}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {Math.floor(entry.time_spent_seconds / 60)}m {entry.time_spent_seconds % 60}s
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No recent tests found.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
