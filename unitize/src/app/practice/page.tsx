'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { usePracticeSession } from '@/hooks/usePracticeSession';

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const courseId = searchParams.get('courseId');
  const unitId = searchParams.get('unitId');
  const topicId = searchParams.get('topicId');
  const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 5;
  
  // Hardcoded user ID for now (in a real app, this would come from auth)
  const userId = "user1";
  
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
    userId
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading practice questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/courses')}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Practice Completed!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-5xl font-bold mb-2">
                {stats.correct} / {stats.total}
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                You answered {stats.correct} out of {stats.total} questions correctly.
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-6">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${stats.accuracy}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {Math.round(stats.accuracy)}% accuracy
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push('/courses')}
            >
              Back to Courses
            </Button>
            <Button 
              variant="primary" 
              onClick={restartSession}
            >
              Practice Again
            </Button>
          </CardFooter>
        </Card>
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium">Score: {stats.correct}/{stats.total}</span>
        </div>
      </div>

      {currentQuestion && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => selectOption(index)}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedOption === index 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } ${
                    isAnswerSubmitted && index === currentQuestion.answer
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : ''
                  } ${
                    isAnswerSubmitted && selectedOption === index && index !== currentQuestion.answer
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : ''
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>

            {isAnswerSubmitted && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <h3 className="font-medium mb-2">Explanation:</h3>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
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
