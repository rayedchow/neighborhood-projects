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

interface StudySession {
  id: string;
  name: string;
  topicId: string;
  hostId: string;
  hostName: string;
  participants: number;
  status: 'active' | 'scheduled';
  startTime: string;
}

export default function TopicPage() {
  const { courseId, unitId, topicId } = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [activeSessions, setActiveSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopicDetails() {
      try {
        // Fetch topic details and active study sessions in parallel
        const [topicResponse, sessionsResponse] = await Promise.all([
          fetch(`/api/units/${courseId}/${unitId}/${topicId}`),
          fetch(`/api/study-sessions?topicId=${topicId}&status=active`)
        ]);
        
        if (!topicResponse.ok) {
          throw new Error(`Error ${topicResponse.status}: Failed to fetch topic details`);
        }
        
        const topicData = await topicResponse.json();
        if (topicData.success && topicData.data) {
          setTopic(topicData.data);
        } else {
          throw new Error(topicData.error || 'Failed to fetch topic details');
        }
        
        // Process study sessions if available
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          if (sessionsData.success && sessionsData.data) {
            setActiveSessions(sessionsData.data);
          }
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
            <div className="space-y-10">
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
              
              {/* Collaborative Study Section */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">Collaborative Study</h2>
                  <Link href={`/study-sessions/create?topicId=${topicId}&courseId=${courseId}&unitId=${unitId}`}>
                    <Button variant="outline" size="sm" className="group shadow-sm hover:shadow-md transition-all duration-300">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Host Study Session
                      </span>
                    </Button>
                  </Link>
                </div>
                
                {activeSessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.map(session => (
                      <Card 
                        key={session.id} 
                        variant="glass" 
                        hoverEffect="lift" 
                        highlight="top"
                        className="border-blue-100 dark:border-blue-900/30 animate"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold text-blue-600 dark:text-blue-400">{session.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mb-2">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              Started {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{session.participants} participants</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span>Hosted by {session.hostName}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/study-sessions/${session.id}`} className="w-full">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="w-full group"
                            >
                              <span className="flex items-center justify-center">
                                Join Session
                                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                                </svg>
                              </span>
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card 
                    variant="glass" 
                    className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 shadow-lg"
                    highlight="top"
                    animate
                  >
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shadow-inner">
                        <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">No active study sessions</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Be the first to host a collaborative study session for this topic and invite others to join you
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={`/study-sessions/create?topicId=${topicId}&courseId=${courseId}&unitId=${unitId}`}>
                          <Button 
                            variant="primary" 
                            size="lg"
                            className="group shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <span className="flex items-center">
                              Host New Session
                              <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                              </svg>
                            </span>
                          </Button>
                        </Link>
                        <Link href={`/study-groups?topicId=${topicId}`}>
                          <Button 
                            variant="secondary" 
                            size="lg"
                            className="group shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <span className="flex items-center">
                              Find Study Groups
                              <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                              </svg>
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
