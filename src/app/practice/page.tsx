'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { MathText } from '@/components/ui/Math';
import { usePracticeSession } from '@/hooks/usePracticeSession';

// Wrapper component that uses search params
function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const courseId = searchParams.get('courseId');
  const unitId = searchParams.get('unitId');
  const topicId = searchParams.get('topicId');
  const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 5;

  // Redirect to course selection if no courseId is provided
  useEffect(() => {
    if (!courseId) {
      router.push('/courses');
    }
  }, [courseId, router]);

  // If no courseId, show loading state while redirecting
  if (!courseId) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="text-center py-8">
            <p>Redirecting to course selection...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get user ID from localStorage (authentication)
  const [userId, setUserId] = useState<string | null>("user1"); // Default for fallback
  
  useEffect(() => {
    // Check if user is logged in via localStorage
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('unitize_user_id') : null;
    
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);
  
  // Use our custom hook to manage the practice session
  const { 
    currentQuestion,
    questions,
    currentIndex,
    selectedOption,
    isAnswerSubmitted,
    sessionComplete,
    stats,
    loading,
    error,
    selectOption,
    submitAnswer,
    nextQuestion,
    restartSession
  } = usePracticeSession({
    courseId: courseId || '',
    unitId: unitId || undefined,
    topicId: topicId || undefined,
    count,
    userId: userId || 'user1' // Ensure userId is never null
  });


  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600 border-b-blue-600 shadow-md"></div>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 animate-pulse">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg shadow-md animate-fade-in p-6">
          <div className="flex items-start">
            <svg className="w-8 h-8 mr-4 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Unable to Load Practice Session</h2>
              <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
              <Button 
                variant="primary" 
                size="md"
                rounded="default"
                onClick={() => router.push('/courses')}
              >
                <span className="flex items-center">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Courses
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto py-16 animate-fade-in">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-600"></div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Practice Completed!</h2>
            <div className="text-center py-8">
              <div className="relative inline-block">
                <div className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">
                  {stats.correct} / {stats.total}
                </div>
                <div className="absolute -top-3 -right-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full px-3 py-1 shadow-sm border border-green-200 dark:border-green-800">
                  {Math.round(stats.accuracy)}%
                </div>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                You answered {stats.correct} out of {stats.total} questions correctly.
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-6 rounded-full transition-all duration-1000 flex items-center justify-end px-3" 
                  style={{ width: `${stats.accuracy}%` }}
                >
                  <span className="text-xs text-white font-medium">{Math.round(stats.accuracy)}%</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button 
                  variant="outline"
                  size="lg"
                  rounded="default"
                  onClick={() => router.push('/courses')}
                  className="group"
                >
                  <span className="flex items-center">
                    <svg className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Courses
                  </span>
                </Button>
                <Button 
                  variant="primary"
                  size="lg"
                  rounded="default" 
                  onClick={() => restartSession()}
                  className="group"
                >
                  <span className="flex items-center">
                    <svg className="mr-2 h-5 w-5 group-hover:rotate-[-360deg] transition-transform duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Practice Again
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <Card>
          <CardContent className="py-10">
            <p className="text-lg mb-4">No practice questions available for the selected criteria.</p>
            <Button 
              variant="primary" 
              onClick={() => router.push('/courses')}
            >
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">Practice Session</h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center animate-fade-in">
            <span className="inline-flex justify-center items-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full h-6 w-6 mr-2 text-sm font-medium">{currentIndex + 1}</span>
            of {questions?.length} questions
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mr-3">
              <svg className="w-5 h-5 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{stats.correct}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{stats.total - stats.correct}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            rounded="default"
            onClick={() => router.push('/courses')}
            className="group"
          >
            <span className="flex items-center">
              <svg className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Exit
            </span>
          </Button>
        </div>
      </div>

      {currentQuestion && typeof currentQuestion === 'object' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {currentQuestion.question?.question ? (
                <MathText text={currentQuestion.question.question} />
              ) : (
                <span>Loading question...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert prose-lg max-w-none mb-8 text-gray-800 dark:text-gray-200">
              {currentQuestion?.question && (
                <MathText text={currentQuestion.question.question} />
              )}
            </div>

            <div className="space-y-4">
              {currentQuestion?.question?.options?.map((option, index: number) => {
                const isCorrect = index === currentQuestion?.question?.answer;
                const isSelected = selectedOption === index;
                const isCorrectAndSubmitted = isAnswerSubmitted && isCorrect;
                const isSelectedAndWrong = isAnswerSubmitted && isSelected && !isCorrect;
                const isSelectedAndNotSubmitted = isSelected && !isAnswerSubmitted;
                
                return (
                  <div 
                    key={index}
                    onClick={() => !isAnswerSubmitted && selectOption(index)}
                    className={`p-4 border rounded-lg transition-all transform hover:translate-y-[-2px] ${!isAnswerSubmitted ? 'hover:shadow-md cursor-pointer' : ''} ${
                      isCorrectAndSubmitted
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-md'
                        : isSelectedAndWrong
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-md'
                          : isSelectedAndNotSubmitted
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center shadow-sm ${
                        isCorrectAndSubmitted
                          ? 'bg-green-500 text-white ring-2 ring-green-200 dark:ring-green-900'
                          : isSelectedAndWrong
                            ? 'bg-red-500 text-white ring-2 ring-red-200 dark:ring-red-900'
                            : isSelectedAndNotSubmitted
                              ? 'bg-blue-500 text-white ring-2 ring-blue-200 dark:ring-blue-900'
                              : 'border-2 border-gray-300 dark:border-gray-600'
                      }`}>
                        {isCorrectAndSubmitted || (isSelected && isAnswerSubmitted && isCorrect) ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isSelectedAndWrong ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : isSelectedAndNotSubmitted ? (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <MathText text={option} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {!isAnswerSubmitted ? (
              <Button 
                variant="primary" 
                onClick={submitAnswer} 
                disabled={selectedOption === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={nextQuestion}
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600 border-b-blue-600 shadow-md"></div>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 animate-pulse">Loading practice session...</p>
        </div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
