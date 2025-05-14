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
  // Hardcoded user ID for demo (in a real app, this would come from auth)
  const userId = "user1";
  
  const [testHistory, setTestHistory] = useState<TestHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TestHistoryEntry[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseList, setCourseList] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Progress Dashboard</h1>
      
      {/* Course Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button 
          variant={selectedCourse === null ? "primary" : "secondary"}
          onClick={() => handleCourseChange(null)}
        >
          All Courses
        </Button>
        {courseList.map(course => (
          <Button
            key={course.id}
            variant={selectedCourse === course.id ? "primary" : "secondary"}
            onClick={() => handleCourseChange(course.id)}
          >
            {course.name}
          </Button>
        ))}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Tests Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{filteredHistory.length}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{averageScore}%</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${improvement.improving ? 'text-green-500' : 'text-red-500'}`}>
                  {improvement.value > 0 ? '+' : ''}{improvement.value}%
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Score Chart */}
          {filteredHistory.length > 0 ? (
            <Card className="mb-8 p-4 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Score Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Correct</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.slice(0, 10).map(entry => {
                        const course = courseList.find(c => c.id === entry.course_id);
                        const date = new Date(entry.date);
                        
                        return (
                          <tr key={entry.id} className="border-b dark:border-gray-700">
                            <td className="py-3 px-4">
                              {date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="py-3 px-4">{course?.name || entry.course_id}</td>
                            <td className="py-3 px-4 font-bold">{entry.score}%</td>
                            <td className="py-3 px-4">{entry.correct_questions}</td>
                            <td className="py-3 px-4">{entry.total_questions}</td>
                            <td className="py-3 px-4">
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
