'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  unitId: string;
  topicId: string;
}

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const courseId = searchParams.get('courseId');
  const unitId = searchParams.get('unitId');
  const topicId = searchParams.get('topicId');
  const count = searchParams.get('count') || '5';
  
  // Hardcoded user ID for now (in a real app, this would come from auth)
  const userId = "user1";
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  useEffect(() => {
    async function fetchPracticeQuestions() {
      try {
        // Build the API URL based on the search params
        let url = `/api/practice?courseId=${courseId}`;
        if (unitId) url += `&unitId=${unitId}`;
        if (topicId) url += `&topicId=${topicId}`;
        url += `&count=${count}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch practice questions`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setQuestions(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch practice questions');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchPracticeQuestions();
      setStartTime(new Date());
    } else {
      setError('Course ID is required to start practice');
      setLoading(false);
    }
  }, [courseId, unitId, topicId, count]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (answerSubmitted) return;
    setSelectedOptionIndex(optionIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOptionIndex === null || answerSubmitted || !currentQuestion) return;
    
    const endTime = new Date();
    const timeSpentSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const isCorrect = selectedOptionIndex === currentQuestion.answer;
    
    // Update the results
    setResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    setAnswerSubmitted(true);
    
    // Update user progress in the backend
    try {
      await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          unitId: currentQuestion.unitId,
          topicId: currentQuestion.topicId,
          questionId: currentQuestion.id,
          isCorrect,
          timeSpentSeconds
        }),
      });
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionIndex(null);
      setAnswerSubmitted(false);
      setStartTime(new Date());
    } else {
      // Practice completed
      setPracticeCompleted(true);
    }
  };

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

  if (practiceCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Practice Completed!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-5xl font-bold mb-2">
                {results.correct} / {results.total}
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                You answered {results.correct} out of {results.total} questions correctly.
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-6">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${(results.correct / results.total) * 100}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {Math.round((results.correct / results.total) * 100)}% accuracy
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
              onClick={() => window.location.reload()}
            >
              Practice Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
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
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium">Score: {results.correct}/{results.total}</span>
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
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedOptionIndex === index 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } ${
                    answerSubmitted && index === currentQuestion.answer
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : ''
                  } ${
                    answerSubmitted && selectedOptionIndex === index && index !== currentQuestion.answer
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : ''
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>

            {answerSubmitted && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <h3 className="font-medium mb-2">Explanation:</h3>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {!answerSubmitted ? (
              <Button 
                variant="primary" 
                onClick={handleSubmitAnswer} 
                disabled={selectedOptionIndex === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
