'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

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

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  isPublic: boolean;
  lastActivity: string;
}

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [relatedGroups, setRelatedGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        // Fetch course details and related study groups in parallel
        const [courseResponse, groupsResponse] = await Promise.all([
          fetch(`/api/units/${courseId}`),
          fetch(`/api/study-groups/public?courseId=${courseId}`)
        ]);
        
        if (!courseResponse.ok) {
          throw new Error(`Error ${courseResponse.status}: Failed to fetch course details`);
        }
        
        const courseData = await courseResponse.json();
        if (courseData.success && courseData.data) {
          setCourse(courseData.data);
        } else {
          throw new Error(courseData.error || 'Failed to fetch course details');
        }
        
        // Process study groups data if available
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          if (groupsData.success && groupsData.data) {
            setRelatedGroups(groupsData.data);
          }
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
        <div className="space-y-12">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{course.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{course.description}</p>
            
            <div className="flex gap-4">
              <Link href={`/practice?courseId=${course.id}`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="group"
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
                <div key={unit.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{unit.name}</h3>
                    <Link href={`/practice?courseId=${course.id}&unitId=${unit.id}`}>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="group"
                      >
                        <span className="flex items-center">
                          Practice Unit
                          <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {unit.topics.map((topic) => (
                      <div key={topic.id} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{topic.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {topic.questions.length} question{topic.questions.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Link href={`/practice?courseId=${course.id}&unitId=${unit.id}&topicId=${topic.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="group"
                            >
                              <span className="flex items-center">
                                Practice Topic
                                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                                </svg>
                              </span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {relatedGroups.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">Related Study Groups</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedGroups.map((group) => (
                  <Link key={group.id} href={`/study-groups/${group.id}`} className="group">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
                      <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{group.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{group.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {group.members} member{group.members !== 1 ? 's' : ''}
                        </div>
                        
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Last active {group.lastActivity}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!loading && !error && course && (
        <div className="space-y-12">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{course.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{course.description}</p>
            
            <div className="flex gap-4">
              <Link href={`/practice?courseId=${course.id}`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="group"
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
                <div key={unit.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{unit.name}</h3>
                    <Link href={`/practice?courseId=${course.id}&unitId=${unit.id}`}>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="group"
                      >
                        <span className="flex items-center">
                          Practice Unit
                          <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {unit.topics.map((topic) => (
                      <div key={topic.id} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{topic.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {topic.questions.length} question{topic.questions.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Link href={`/practice?courseId=${course.id}&unitId=${unit.id}&topicId=${topic.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="group"
                            >
                              <span className="flex items-center">
                                Practice Topic
                                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                                </svg>
                              </span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {relatedGroups.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">Related Study Groups</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedGroups.map((group) => (
                  <Link key={group.id} href={`/study-groups/${group.id}`} className="group">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
                      <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{group.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{group.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {group.members} member{group.members !== 1 ? 's' : ''}
                        </div>
                        
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Last active {group.lastActivity}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Study Group Creation Card */}
              <Card className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-lg shadow-md">
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Create a study group and collaborate with other students taking this course
                  </p>
                  <Link href={`/study-groups/create?courseId=${course.id}`}>
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="group shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span className="flex items-center">
                        Create Study Group
                        <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
