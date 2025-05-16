'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Unit {
  id: string;
  name: string;
  topics: Array<{
    id: string;
    name: string;
    questions: Array<{
      id: string;
      question: string;
    }>
  }>;
}

interface Course {
  id: string;
  name: string;
  description: string;
  units: Unit[];
}

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const response = await fetch(`/api/units/${courseId}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch course details`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setCourse(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch course details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 border-b-blue-600 shadow-md"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading course details...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg shadow-md animate-fade-in p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Unable to load course</h3>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <Button 
                variant="primary" 
                size="sm" 
                rounded="default"
                onClick={() => window.location.reload()} 
              >
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && course && (
        <div className="animate-fade-in">
          <div className="relative mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{course.name}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">{course.description}</p>
              </div>
              <Link href={`/practice?courseId=${course.id}`}>
                <Button 
                  variant="primary" 
                  size="lg"
                  rounded="default"
                  className="group shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="flex items-center">
                    Start Practice
                    <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                    </svg>
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">Units</h2>
            
            <div className="space-y-10">
              {course.units.map((unit) => (
                <div key={unit.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden relative animate-fade-in">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
                  <div className="p-6 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{unit.name}</h3>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-medium mb-4 text-blue-600 dark:text-blue-400 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Topics in this Unit
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unit.topics.map((topic) => (
                        <Link key={topic.id} href={`/courses/${course.id}/${unit.id}/${topic.id}`} className="group">
                          <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <div className="flex-1">
                              <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{topic.name}</p>
                              <div className="flex items-center mt-1">
                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {topic.questions.length} questions
                                </p>
                              </div>
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                              <span className="mr-1 text-sm font-medium">Study</span>
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center bg-blue-50/50 dark:bg-blue-900/20 rounded-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-blue-100 dark:border-blue-800/30">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Unit total: <strong>{unit.topics.length}</strong> topics, <strong>{unit.topics.reduce((acc, topic) => acc + topic.questions.length, 0)}</strong> questions</span>
                      </div>
                      <Link href={`/practice?courseId=${course.id}&unitId=${unit.id}`}>
                        <Button variant="primary" size="md" rounded="default" className="group">
                          <span className="flex items-center">
                            Practice this unit
                            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
