'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Course {
  id: string;
  name: string;
  description: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        // In Next.js, when calling API routes from the client side,
        // we need to use the full URL based on the current host
        const baseUrl = window.location.origin; // Gets the base URL of the current site
        const response = await fetch(`${baseUrl}/api/units`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch courses`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.success && data.data) {
          setCourses(data.data);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          // If the API returns data directly without a success wrapper
          setCourses(data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="relative mb-12 pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
          AP Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
          Browse our collection of AP courses and start practicing
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 border-b-blue-600 shadow-md"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading courses...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg shadow-md animate-fade-in p-6 mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Unable to load courses</h3>
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

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="group">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] h-full rounded-lg overflow-hidden relative animate-fade-in">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{course.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{course.description}</p>
                    <div className="flex justify-end">
                      <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
                        View Course
                        <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No courses available</p>
              <p className="text-gray-500 dark:text-gray-500">Check back later for new courses</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
