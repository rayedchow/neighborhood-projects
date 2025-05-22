'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FlashcardDifficulty } from '@/lib/services/flashcardService';

// Mock user ID for demo purposes
const DEMO_USER_ID = 'user1';

export default function CreateDeckPage() {
  const router = useRouter();
  
  // Deck info
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // Cards
  const [cards, setCards] = useState<{
    id: string;
    front: string;
    back: string;
    hint?: string;
    tags: string[];
    difficulty: FlashcardDifficulty;
  }[]>([]);
  
  // Form state
  const [currentFront, setCurrentFront] = useState('');
  const [currentBack, setCurrentBack] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [currentTags, setCurrentTags] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState<FlashcardDifficulty>(FlashcardDifficulty.MEDIUM);
  
  // Validation and loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Available courses for dropdown
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);
  const [topics, setTopics] = useState<{id: string, name: string}[]>([]);
  
  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/units');
        const data = await response.json();
        
        if (data.success) {
          setCourses(data.data.map((course: any) => ({
            id: course.id,
            name: course.name || course.id.replace('ap_', 'AP ').replace('_', ' ')
          })));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    
    fetchCourses();
  }, []);
  
  // Fetch topics when course changes
  useEffect(() => {
    async function fetchTopics() {
      if (!courseId) {
        setTopics([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/units/${courseId}/topics`);
        const data = await response.json();
        
        if (data.success) {
          setTopics(data.data.map((topic: any) => ({
            id: topic.id,
            name: topic.name || topic.id.replace('topic_', 'Topic ').replace('_', ' ')
          })));
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    }
    
    fetchTopics();
  }, [courseId]);
  
  // Add a card to the deck
  const addCard = () => {
    setError('');
    
    // Validate required fields
    if (!currentFront.trim() || !currentBack.trim()) {
      setError('Front and back of the card are required');
      return;
    }
    
    // Create a new card
    const newCard = {
      id: `temp_${Date.now()}`,
      front: currentFront.trim(),
      back: currentBack.trim(),
      hint: currentHint.trim() || undefined,
      tags: currentTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      difficulty: currentDifficulty
    };
    
    // Add to cards array
    setCards([...cards, newCard]);
    
    // Reset form
    setCurrentFront('');
    setCurrentBack('');
    setCurrentHint('');
    setCurrentTags('');
    setCurrentDifficulty(FlashcardDifficulty.MEDIUM);
    
    // Show success message
    setSuccess('Card added to deck');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // Remove a card from the deck
  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };
  
  // Create the deck
  const createDeck = async () => {
    setError('');
    setLoading(true);
    
    // Validate deck name
    if (!deckName.trim()) {
      setError('Deck name is required');
      setLoading(false);
      return;
    }
    
    // Validate at least one card
    if (cards.length === 0) {
      setError('Add at least one card to your deck');
      setLoading(false);
      return;
    }
    
    try {
      // Create the deck
      const deckResponse = await fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          name: deckName.trim(),
          description: deckDescription.trim() || undefined,
          courseId: courseId || undefined,
          topicId: topicId || undefined,
          isPublic
        })
      });
      
      const deckData = await deckResponse.json();
      
      if (!deckData.success) {
        throw new Error(deckData.error || 'Failed to create deck');
      }
      
      const deckId = deckData.data.id;
      
      // Add cards to the deck
      for (const card of cards) {
        const cardResponse = await fetch('/api/flashcards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            deckId,
            front: card.front,
            back: card.back,
            hint: card.hint,
            tags: card.tags,
            difficulty: card.difficulty,
            courseId: courseId || undefined,
            topicId: topicId || undefined
          })
        });
        
        const cardData = await cardResponse.json();
        
        if (!cardData.success) {
          console.error('Error adding card:', cardData.error);
        }
      }
      
      // Navigate to the deck
      router.push('/flashcards');
    } catch (error) {
      console.error('Error creating deck:', error);
      setError(error instanceof Error ? error.message : 'Failed to create deck');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Flashcard Deck</h1>
        <p className="text-gray-600 dark:text-gray-300">Build your own custom study deck</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Deck info */}
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Deck Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deck Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    placeholder="e.g., AP Biology Unit 1"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 min-h-24"
                    placeholder="Describe what this deck covers..."
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Course (Optional)</label>
                  <select 
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setTopicId('');
                    }}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Topic (Optional)</label>
                  <select 
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    disabled={!courseId}
                  >
                    <option value="">Select a topic</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm">
                    Make this deck public for everyone
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Deck Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Cards</span>
                  <span className="font-medium">{cards.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Easy</span>
                  <span className="font-medium">{cards.filter(c => c.difficulty === FlashcardDifficulty.EASY).length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Medium</span>
                  <span className="font-medium">{cards.filter(c => c.difficulty === FlashcardDifficulty.MEDIUM).length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Hard</span>
                  <span className="font-medium">{cards.filter(c => c.difficulty === FlashcardDifficulty.HARD).length}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={createDeck}
                disabled={loading || cards.length === 0 || !deckName.trim()}
              >
                {loading ? 'Creating...' : 'Create Deck'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column - Card creation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card creation form */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Add Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Front (Question) *</label>
                  <textarea
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 min-h-24"
                    placeholder="Enter the question or front of the card..."
                    value={currentFront}
                    onChange={(e) => setCurrentFront(e.target.value)}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Back (Answer) *</label>
                  <textarea
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 min-h-24"
                    placeholder="Enter the answer or back of the card..."
                    value={currentBack}
                    onChange={(e) => setCurrentBack(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hint (Optional)</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    placeholder="Add a hint for this card..."
                    value={currentHint}
                    onChange={(e) => setCurrentHint(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (Optional)</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800"
                    placeholder="Comma separated tags, e.g., important, exam, review"
                    value={currentTags}
                    onChange={(e) => setCurrentTags(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-green-500"
                      name="difficulty"
                      checked={currentDifficulty === FlashcardDifficulty.EASY}
                      onChange={() => setCurrentDifficulty(FlashcardDifficulty.EASY)}
                    />
                    <span className="ml-2 text-green-600 dark:text-green-400">Easy</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-500"
                      name="difficulty"
                      checked={currentDifficulty === FlashcardDifficulty.MEDIUM}
                      onChange={() => setCurrentDifficulty(FlashcardDifficulty.MEDIUM)}
                    />
                    <span className="ml-2 text-blue-600 dark:text-blue-400">Medium</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-red-500"
                      name="difficulty"
                      checked={currentDifficulty === FlashcardDifficulty.HARD}
                      onChange={() => setCurrentDifficulty(FlashcardDifficulty.HARD)}
                    />
                    <span className="ml-2 text-red-600 dark:text-red-400">Hard</span>
                  </label>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-3 rounded-md mb-4">
                  {success}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={addCard}
                  disabled={!currentFront.trim() || !currentBack.trim()}
                >
                  Add Card to Deck
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Preview of added cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Cards in this Deck ({cards.length})</h3>
            
            {cards.length === 0 ? (
              <div className="text-center py-8 bg-white/50 dark:bg-neutral-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  No cards added yet. Fill in the form above to add your first card.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map((card, index) => (
                  <Card key={card.id} variant="glass">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Card {index + 1}
                        </div>
                        <button
                          onClick={() => removeCard(card.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Front</div>
                          <div className="bg-white dark:bg-neutral-800 p-3 rounded-md min-h-16 border border-gray-200 dark:border-gray-700">
                            {card.front}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Back</div>
                          <div className="bg-white dark:bg-neutral-800 p-3 rounded-md min-h-16 border border-gray-200 dark:border-gray-700">
                            {card.back}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center mt-3 gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          card.difficulty === FlashcardDifficulty.EASY 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                            : card.difficulty === FlashcardDifficulty.MEDIUM
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                          {card.difficulty}
                        </span>
                        
                        {card.hint && (
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                            Has hint
                          </span>
                        )}
                        
                        {card.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
