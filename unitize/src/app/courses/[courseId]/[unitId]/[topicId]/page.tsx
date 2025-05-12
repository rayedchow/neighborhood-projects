'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { MathText } from '@/components/ui/Math';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Topic {
  id: string;
  name: string;
  questions: Question[];
  courseName?: string;
  unitName?: string;
}

export default function TopicPage() {
  const { courseId, unitId, topicId } = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopicDetails() {
      try {
        const response = await fetch(`/api/units/${courseId}/${unitId}/${topicId}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch topic details`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setTopic(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch topic details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (courseId && unitId && topicId) {
      fetchTopicDetails();
    }
  }, [courseId, unitId, topicId]);

  const startPractice = () => {
    if (topic?.questions.length) {
      router.push(`/practice?courseId=${courseId}&unitId=${unitId}&topicId=${topicId}`);
    }
  };

  return (
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading topic details...</p>
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

      {!loading && !error && topic && (
        <>
          <div className="space-y-2">
            <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/courses" className="hover:underline">Courses</Link>
              <span>/</span>
              <Link href={`/courses/${courseId}`} className="hover:underline">{topic.courseName}</Link>
              <span>/</span>
              <span>{topic.unitName}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{topic.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {topic.questions.length} questions available
                </p>
              </div>
              
              <Button 
                variant="primary"
                onClick={startPractice}
                disabled={topic.questions.length === 0}
              >
                Practice This Topic
              </Button>
            </div>
          </div>

          {topic.questions.length > 0 ? (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h2 className="text-xl font-bold mb-6">Questions Preview</h2>
              
              <div className="space-y-4">
                {topic.questions.slice(0, 3).map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4"><MathText text={question.question} /></p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Start practicing to see answer options and explanations
                      </p>
                    </CardContent>
                  </Card>
                ))}
                
                {topic.questions.length > 3 && (
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    + {topic.questions.length - 3} more questions
                  </p>
                )}
                
                <div className="text-center mt-8">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={startPractice}
                  >
                    Start Practicing
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">No questions available for this topic yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
