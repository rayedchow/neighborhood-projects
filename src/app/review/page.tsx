'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Difficulty } from '@/lib/services/spacedRepetitionService';
import Link from 'next/link';

// Mock user ID for demo purposes
const DEMO_USER_ID = 'user1';

interface ReviewQuestion {
  courseId: string;
  unitId: string;
  topicId: string;
  questionId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stats, setStats] = useState({
    reviewsDueToday: 0,
    reviewsDueTomorrow: 0,
    reviewsCompletedToday: 0,
    totalCards: 0
  });
  const [reviewsCompleted, setReviewsCompleted] = useState(0);

  // Fetch due cards for review
  useEffect(() => {
    async function fetchDueCards() {
      try {
        setLoading(true);
        const response = await fetch(`/api/spaced-repetition?userId=${DEMO_USER_ID}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // For each card, fetch the actual question data
          const questionPromises = data.data.map(async (card: any) => {
            const qResponse = await fetch(
              `/api/units/${card.courseId}/${card.unitId}/${card.topicId}?questionId=${card.questionId}`
            );
            const qData = await qResponse.json();
            
            if (qData.success && qData.data) {
              return {
                ...card,
                ...qData.data
              };
            }
            return null;
          });
          
          const questionData = await Promise.all(questionPromises);
          setQuestions(questionData.filter(q => q !== null));
        }
        
        // Fetch stats
        const statsResponse = await fetch(`/api/spaced-repetition?userId=${DEMO_USER_ID}`, {
          method: 'PATCH'
        });
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats(statsData.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching review data:', error);
        setLoading(false);
      }
    }
    
    fetchDueCards();
  }, []);

  // Process a review
  const processReview = async (difficulty: Difficulty) => {
    if (currentIndex >= questions.length) return;
    
    const currentQuestion = questions[currentIndex];
    
    try {
      const response = await fetch('/api/spaced-repetition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          courseId: currentQuestion.courseId,
          unitId: currentQuestion.unitId,
          topicId: currentQuestion.topicId,
          questionId: currentQuestion.questionId,
          difficulty
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReviewsCompleted(prev => prev + 1);
        moveToNextQuestion();
      }
    } catch (error) {
      console.error('Error processing review:', error);
    }
  };

  // Move to the next question
  const moveToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedOption(null);
    }
  };

  // Handle option selection
  const selectOption = (index: number) => {
    if (showAnswer) return;
    setSelectedOption(index);
  };

  // Reveal the answer
  const revealAnswer = () => {
    setShowAnswer(true);
  };

  // Get current question
  const currentQuestion = questions[currentIndex];
  
  // Check if current option is correct
  const isCorrect = selectedOption !== null && currentQuestion?.answer === selectedOption;
  
  // Get review difficulty based on performance
  const getReviewDifficulty = (): Difficulty => {
    if (!isCorrect) return Difficulty.VERY_HARD;
    
    // Time to answer could also be a factor here
    return Difficulty.EASY;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card variant="glass" className="max-w-4xl mx-auto p-8">
          <CardContent className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
              <p className="mt-4 text-lg">Loading your review session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card variant="glass" className="max-w-4xl mx-auto p-8 text-center">
          <CardHeader>
            <CardTitle>No Reviews Due</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="mb-8">
              <img src="/images/review-complete.svg" alt="All caught up" className="h-48 mx-auto" />
              <p className="mt-6 text-xl">You're all caught up!</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                There are no cards due for review at this time.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
              <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Due tomorrow</p>
                <p className="text-2xl font-bold">{stats.reviewsDueTomorrow}</p>
              </div>
              <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Completed today</p>
                <p className="text-2xl font-bold">{stats.reviewsCompletedToday}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/practice">
              <Button variant="primary">Practice New Material</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (currentIndex >= questions.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card variant="glass" className="max-w-4xl mx-auto p-8 text-center">
          <CardHeader>
            <CardTitle>Review Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="mb-8">
              <img src="/images/review-complete.svg" alt="Review complete" className="h-48 mx-auto" />
              <p className="mt-6 text-xl">Great job!</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                You've completed {reviewsCompleted} reviews in this session.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
              <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Completed today</p>
                <p className="text-2xl font-bold">{stats.reviewsCompletedToday + reviewsCompleted}</p>
              </div>
              <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Total cards</p>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Link href="/practice">
              <Button variant="outline">Practice More</Button>
            </Link>
            <Link href="/review">
              <Button variant="primary">New Review Session</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {currentIndex + 1} of {questions.length}
          </span>
          <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500"
              style={{width: `${((currentIndex + 1) / questions.length) * 100}%`}}
            ></div>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          <span className="mr-2">Remaining today: {Math.max(0, stats.reviewsDueToday - reviewsCompleted)}</span>
        </div>
      </div>
      
      <Card variant="glass" className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {currentQuestion.courseId} &gt; {currentQuestion.unitId} &gt; {currentQuestion.topicId}
            </span>
          </div>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              onClick={() => selectOption(index)}
              className={`
                p-4 rounded-lg transition-all duration-200 cursor-pointer
                ${showAnswer 
                  ? index === currentQuestion.answer 
                    ? 'bg-green-100 dark:bg-green-900/20 border border-green-500' 
                    : selectedOption === index 
                      ? 'bg-red-100 dark:bg-red-900/20 border border-red-500' 
                      : 'bg-white/50 dark:bg-neutral-800/50 border border-transparent'
                  : selectedOption === index 
                    ? 'bg-primary-100 dark:bg-primary-900/20 border border-primary-500' 
                    : 'bg-white/50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 border border-transparent'
                }
              `}
            >
              <div className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </div>
            </div>
          ))}
          
          {showAnswer && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium mb-2">Explanation</h4>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between flex-wrap gap-4">
          {!showAnswer ? (
            <Button 
              variant="primary" 
              onClick={revealAnswer}
              disabled={selectedOption === null}
              className="w-full"
            >
              Check Answer
            </Button>
          ) : (
            <div className="w-full">
              <p className="text-center mb-4">How well did you know this?</p>
              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => processReview(Difficulty.VERY_HARD)}
                  className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                >
                  Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => processReview(Difficulty.HARD)}
                  className="flex-1 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                >
                  Hard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => processReview(Difficulty.MEDIUM)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                  Good
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => processReview(Difficulty.EASY)}
                  className="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  Easy
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
