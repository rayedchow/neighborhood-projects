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
        const response = await fetch('/api/units');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch courses`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setCourses(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch courses');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AP Courses</h1>
      </div>

      {loading && (
        <div className="text-center py-10">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading courses...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">View Course</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-lg text-gray-600 dark:text-gray-400">No courses found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
