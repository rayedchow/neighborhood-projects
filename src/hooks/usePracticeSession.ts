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

export interface UserProfileData {
  questionsCompleted: number;
  correctAnswers: number;
  accuracy: number;
  lastActivityDate: string;
  streak: number;
  growth: number; // Percentage improvement over time
  recentTopics: string[]; // Array of recent topic IDs
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
  
  // Helper function to get user profile data from localStorage
  const getUserProfileData = (userId: string): UserProfileData => {
    if (typeof window === 'undefined') return {
      questionsCompleted: 0,
      correctAnswers: 0,
      accuracy: 0,
      lastActivityDate: new Date().toISOString(),
      streak: 0,
      growth: 0,
      recentTopics: []
    };
    
    const storedData = localStorage.getItem(`unitize_profile_${userId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // Default profile data if none exists
    return {
      questionsCompleted: 0,
      correctAnswers: 0,
      accuracy: 0,
      lastActivityDate: new Date().toISOString(),
      streak: 0,
      growth: 0,
      recentTopics: []
    };
  };
  
  // Helper function to update user profile data in localStorage
  const updateUserProfileData = (userId: string, isCorrect: boolean, topicId: string) => {
    const profileData = getUserProfileData(userId);
    
    // Calculate days between last activity
    const lastActivity = new Date(profileData.lastActivityDate);
    const today = new Date();
    const daysSinceActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Update streak based on consecutive days
    let streak = profileData.streak;
    if (daysSinceActivity === 0) {
      // Same day, streak unchanged
    } else if (daysSinceActivity === 1) {
      // Consecutive day, streak increases
      streak += 1;
    } else {
      // Streak broken
      streak = 1;
    }
    
    // Update recent topics (keep most recent 5)
    let recentTopics = profileData.recentTopics;
    if (topicId && !recentTopics.includes(topicId)) {
      recentTopics.unshift(topicId);
      if (recentTopics.length > 5) {
        recentTopics = recentTopics.slice(0, 5);
      }
    }
    
    // Calculate new accuracy
    const newTotalQuestions = profileData.questionsCompleted + 1;
    const newCorrectAnswers = profileData.correctAnswers + (isCorrect ? 1 : 0);
    const newAccuracy = (newCorrectAnswers / newTotalQuestions) * 100;
    
    // Calculate growth (improvement in accuracy over time)
    // Simple approach: compare new accuracy with old accuracy
    const prevAccuracy = profileData.accuracy;
    const growth = prevAccuracy > 0 ? 
      ((newAccuracy - prevAccuracy) / prevAccuracy) * 100 : 
      0;
    
    const updatedProfileData: UserProfileData = {
      questionsCompleted: newTotalQuestions,
      correctAnswers: newCorrectAnswers,
      accuracy: newAccuracy,
      lastActivityDate: today.toISOString(),
      streak: streak,
      growth: growth,
      recentTopics: recentTopics
    };
    
    // Store updated profile data
    if (typeof window !== 'undefined') {
      localStorage.setItem(`unitize_profile_${userId}`, JSON.stringify(updatedProfileData));
    }
    
    return updatedProfileData;
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
    
    // Update local storage with user profile data
    updateUserProfileData(userId, isCorrect, currentQuestion.topicId);
    
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
  
  // Function to get user profile data for UI display
  const getProfileData = () => {
    return getUserProfileData(userId);
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
    restartSession,
    getProfileData
  };
};
