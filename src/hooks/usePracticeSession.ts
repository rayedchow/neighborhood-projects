import { useState, useEffect } from 'react';
import { useApi } from './useApi';

// Define the structure of an individual question as it appears in the database
export interface QuestionData {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

// Define the structure of a question as it is returned from the API
export interface Question {
  question: QuestionData;
  unitId: string;
  topicId: string;
}

export interface PracticeSessionStats {
  correct: number;
  total: number;
  accuracy: number;
}

interface PracticeSessionOptions {
  courseId: string;
  unitId?: string;
  topicId?: string;
  count?: number;
  userId: string;
}

/**
 * Custom hook for managing a practice session with questions, answers, and progress tracking
 */
export const usePracticeSession = (options: PracticeSessionOptions) => {
  const { courseId, unitId, topicId, count = 5, userId } = options;
  
  // Build API URL for fetching questions
  let apiUrl = `/api/practice?courseId=${courseId}`;
  if (unitId) apiUrl += `&unitId=${unitId}`;
  if (topicId) apiUrl += `&topicId=${topicId}`;
  apiUrl += `&count=${count}`;
  
  const { data: questions, loading, error } = useApi<Question[]>(apiUrl);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [stats, setStats] = useState<PracticeSessionStats>({ correct: 0, total: 0, accuracy: 0 });
  
  // Current question getter
  const currentQuestion = questions && questions.length > 0 ? questions[currentIndex] : null;
  
  // Reset timer when moving to a new question
  useEffect(() => {
    setStartTime(new Date());
  }, [currentIndex]);
  
  // Select an option (answer)
  const selectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };
  
  // Submit the current answer and record progress
  const submitAnswer = async () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQuestion) return;
    
    const endTime = new Date();
    const timeSpentSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const isCorrect = selectedOption === currentQuestion.question.answer;
    
    // Update stats
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      accuracy: 0
    };
    newStats.accuracy = (newStats.correct / newStats.total) * 100;
    setStats(newStats);
    
    setIsAnswerSubmitted(true);
    
    // Send progress update to API
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
          questionId: currentQuestion.question.id,
          isCorrect,
          timeSpentSeconds
        }),
      });
    } catch (err) {
      console.error('Error recording progress:', err);
    }
  };
  
  // Move to the next question or complete the session
  const nextQuestion = () => {
    if (!questions) return;
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setSessionComplete(true);
    }
  };
  
  // Restart the practice session
  const restartSession = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSessionComplete(false);
    setStats({ correct: 0, total: 0, accuracy: 0 });
    setStartTime(new Date());
  };
  
  return {
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
  };
};
