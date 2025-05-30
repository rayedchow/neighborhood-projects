'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Flashcard, FlashcardDeck, ReviewResult } from '@/lib/services/flashcardService';

// Mock user ID for demo purposes
const DEMO_USER_ID = 'user1';

export default function StudyDeckPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;
  
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    cardsStudied: 0,
    correct: 0,
    incorrect: 0
  });
  
  // Fetch deck and cards
  useEffect(() => {
    async function fetchDeckData() {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/flashcards?deckId=${deckId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setDeck(data.data.deck);
          
          // Shuffle the cards
          const shuffledCards = [...data.data.cards].sort(() => Math.random() - 0.5);
          setCards(shuffledCards);
          
          setStudyStats({
            totalCards: data.data.cards.length,
            cardsStudied: 0,
            correct: 0,
            incorrect: 0
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching deck data:', error);
        setLoading(false);
      }
    }
    
    fetchDeckData();
  }, [deckId]);
  
  // Handle card flip
  const flipCard = () => {
    setFlipped(!flipped);
  };
  
  // Handle review result
  const handleReviewResult = async (result: ReviewResult) => {
    if (!cards[currentCardIndex]) return;
    
    try {
      // Update the review in the API
      await fetch('/api/flashcards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          cardId: cards[currentCardIndex].id,
          reviewResult: result
        })
      });
      
      // Update stats
      setStudyStats(prev => ({
        ...prev,
        cardsStudied: prev.cardsStudied + 1,
        correct: prev.correct + (result === ReviewResult.GOOD || result === ReviewResult.EASY ? 1 : 0),
        incorrect: prev.incorrect + (result === ReviewResult.AGAIN || result === ReviewResult.HARD ? 1 : 0)
      }));
      
      // Move to next card or end study session
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setFlipped(false);
        setShowHint(false);
      } else {
        setStudyComplete(true);
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };
  
  // Reset study session
  const resetStudy = () => {
    // Shuffle the cards again
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setFlipped(false);
    setShowHint(false);
    setStudyComplete(false);
    setStudyStats({
      totalCards: cards.length,
      cardsStudied: 0,
      correct: 0,
      incorrect: 0
    });
  };
  
  // Format progress percentage
  const progressPercentage = studyStats.totalCards > 0 
    ? Math.floor((studyStats.cardsStudied / studyStats.totalCards) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg">Loading flashcards...</p>
        </div>
      </div>
    );
  }
  
  if (!deck || cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No flashcards found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This deck has no cards yet or could not be loaded</p>
          <Button variant="primary" onClick={() => router.push('/flashcards')}>Back to Decks</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      {/* Header with deck info */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">{deck.description || 'No description provided'}</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => router.push('/flashcards')}>
              Exit
            </Button>
            <Button 
              variant="primary" 
              onClick={resetStudy}
              disabled={cards.length === 0 || (!studyComplete && currentCardIndex === 0)}
            >
              Restart
            </Button>
          </div>
        </div>
      </div>
      
      {/* Study progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{studyStats.cardsStudied} / {studyStats.totalCards} cards</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {studyComplete ? (
        // Study complete view
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all duration-500 max-w-3xl mx-auto p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Study Session Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Great job! You've reviewed all cards in this deck.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white/50 dark:bg-neutral-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1 text-primary-600 dark:text-primary-400">
                {studyStats.correct}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            
            <div className="bg-white/50 dark:bg-neutral-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1 text-amber-600 dark:text-amber-400">
                {studyStats.incorrect}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Needs Review</div>
            </div>
            
            <div className="bg-white/50 dark:bg-neutral-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">
                {studyStats.totalCards}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
            </div>
            
            <div className="bg-white/50 dark:bg-neutral-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1 text-green-600 dark:text-green-400">
                {studyStats.correct > 0 && studyStats.totalCards > 0
                  ? Math.round((studyStats.correct / studyStats.totalCards) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => router.push('/flashcards')}>
              Back to Decks
            </Button>
            <Button variant="primary" onClick={resetStudy}>
              Study Again
            </Button>
          </div>
        </div>
      ) : (
        // Flashcard study view
        <div className="max-w-3xl mx-auto">
          <div 
            className={`perspective-1000 w-full mb-8 ${flipped ? 'h-[400px]' : 'h-[300px]'} transition-height duration-300`}
          >
            <div 
              className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                flipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of card */}
              <div 
                className={`absolute inset-0 backface-hidden bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 flex flex-col ${
                  flipped ? 'invisible' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium px-2.5 py-0.5 rounded">
                    Front
                  </div>
                  
                  {cards[currentCardIndex].hint && (
                    <button
                      className="text-gray-500 hover:text-amber-500 transition-colors"
                      onClick={() => setShowHint(true)}
                      disabled={showHint}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-xl font-medium text-center">
                    {cards[currentCardIndex].front}
                  </div>
                </div>
                
                {showHint && cards[currentCardIndex].hint && (
                  <div className="mt-4 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-3 rounded-md">
                    <div className="font-medium mb-1">Hint:</div>
                    {cards[currentCardIndex].hint}
                  </div>
                )}
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="primary" 
                    onClick={flipCard}
                    className="px-8"
                  >
                    Show Answer
                  </Button>
                </div>
              </div>
              
              {/* Back of card */}
              <div 
                className={`absolute inset-0 backface-hidden bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 flex flex-col rotate-y-180 ${
                  !flipped ? 'invisible' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded">
                    Back
                  </div>
                </div>
                
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-xl font-medium text-center">
                    {cards[currentCardIndex].back}
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    How well did you know this?
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      variant="secondary"
                      className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400"
                      onClick={() => handleReviewResult(ReviewResult.AGAIN)}
                    >
                      Again
                    </Button>
                    <Button 
                      variant="secondary"
                      className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                      onClick={() => handleReviewResult(ReviewResult.HARD)}
                    >
                      Hard
                    </Button>
                    <Button 
                      variant="secondary"
                      className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                      onClick={() => handleReviewResult(ReviewResult.GOOD)}
                    >
                      Good
                    </Button>
                    <Button 
                      variant="secondary"
                      className="bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400"
                      onClick={() => handleReviewResult(ReviewResult.EASY)}
                    >
                      Easy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card metadata */}
          <Card variant="glass" className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Difficulty</div>
                  <div className={`text-sm font-medium ${
                    cards[currentCardIndex].difficulty === 'easy' 
                      ? 'text-green-600 dark:text-green-400' 
                      : cards[currentCardIndex].difficulty === 'medium'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {cards[currentCardIndex].difficulty.charAt(0).toUpperCase() + cards[currentCardIndex].difficulty.slice(1)}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reviews</div>
                  <div className="text-sm font-medium">
                    {cards[currentCardIndex].reviewCount}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</div>
                  <div className="text-sm font-medium">
                    {cards[currentCardIndex].reviewCount > 0
                      ? Math.round((cards[currentCardIndex].correctCount / cards[currentCardIndex].reviewCount) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentCardIndex > 0) {
                  setCurrentCardIndex(currentCardIndex - 1);
                  setFlipped(false);
                  setShowHint(false);
                }
              }}
              disabled={currentCardIndex === 0}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </Button>
            
            <div className="text-sm text-center text-gray-600 dark:text-gray-400 py-2">
              Card {currentCardIndex + 1} of {cards.length}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentCardIndex < cards.length - 1) {
                  setCurrentCardIndex(currentCardIndex + 1);
                  setFlipped(false);
                  setShowHint(false);
                }
              }}
              disabled={currentCardIndex === cards.length - 1}
            >
              Skip
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
