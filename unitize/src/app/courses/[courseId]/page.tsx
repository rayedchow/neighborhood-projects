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
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading course details...</p>
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

      {!loading && !error && course && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{course.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{course.description}</p>
            </div>
            <Link href={`/practice?courseId=${course.id}`}>
              <Button variant="primary">Start Practice</Button>
            </Link>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h2 className="text-2xl font-bold mb-6">Units</h2>
            
            <div className="space-y-6">
              {course.units.map((unit) => (
                <Card key={unit.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900">
                    <CardTitle>{unit.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg font-medium mb-4">Topics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unit.topics.map((topic) => (
                        <Link 
                          key={topic.id} 
                          href={`/courses/${course.id}/${unit.id}/${topic.id}`}
                        >
                          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                            <h4 className="font-medium mb-2">{topic.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {topic.questions.length} questions
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
