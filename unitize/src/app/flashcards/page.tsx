'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FlashcardDeck } from '@/lib/services/flashcardService';

// Mock user ID for demo purposes
const DEMO_USER_ID = 'user1';

export default function FlashcardsPage() {
  const [userDecks, setUserDecks] = useState<FlashcardDeck[]>([]);
  const [publicDecks, setPublicDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-decks' | 'discover'>('my-decks');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch decks data
  useEffect(() => {
    async function fetchDecks() {
      try {
        setLoading(true);
        
        // Fetch user's decks
        const userDecksResponse = await fetch(`/api/flashcards/decks?userId=${DEMO_USER_ID}`);
        const userDecksData = await userDecksResponse.json();
        
        if (userDecksData.success) {
          setUserDecks(userDecksData.data);
        }
        
        // Fetch public decks
        const publicDecksResponse = await fetch('/api/flashcards/decks?public=true');
        const publicDecksData = await publicDecksResponse.json();
        
        if (publicDecksData.success) {
          setPublicDecks(publicDecksData.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching flashcard decks:', error);
        setLoading(false);
      }
    }
    
    fetchDecks();
  }, []);
  
  // Clone a public deck
  const handleCloneDeck = async (deckId: string) => {
    try {
      const response = await fetch('/api/flashcards/decks/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          deckId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new deck to userDecks
        setUserDecks([...userDecks, data.data]);
        
        // Switch to my-decks tab
        setActiveTab('my-decks');
      }
    } catch (error) {
      console.error('Error cloning deck:', error);
    }
  };
  
  // Delete a deck
  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/flashcards/decks?userId=${DEMO_USER_ID}&deckId=${deckId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deck from userDecks
        setUserDecks(userDecks.filter(deck => deck.id !== deckId));
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };
  
  // Filter decks based on search query
  const filteredUserDecks = searchQuery
    ? userDecks.filter(deck => 
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : userDecks;
    
  const filteredPublicDecks = searchQuery
    ? publicDecks.filter(deck => 
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : publicDecks;
  
  // Get cards due for review
  const [dueCards, setDueCards] = useState<number>(0);
  
  useEffect(() => {
    async function fetchDueCards() {
      try {
        const response = await fetch(`/api/flashcards?userId=${DEMO_USER_ID}`);
        const data = await response.json();
        
        if (data.success) {
          setDueCards(data.data.length);
        }
      } catch (error) {
        console.error('Error fetching due cards:', error);
      }
    }
    
    fetchDueCards();
  }, []);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
          <p className="text-gray-600 dark:text-gray-300">Create, study, and master with spaced repetition</p>
        </div>
        
        <div className="flex space-x-4">
          {dueCards > 0 && (
            <Link href="/flashcards/review">
              <Button variant="primary" className="flex items-center">
                <span className="bg-white text-primary-600 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm font-bold">
                  {dueCards}
                </span>
                <span>Review Cards</span>
              </Button>
            </Link>
          )}
          
          <Link href="/flashcards/create">
            <Button variant="outline">
              Create Deck
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and tabs */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search flashcard decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-2 bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'my-decks'
                  ? 'bg-white dark:bg-neutral-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('my-decks')}
            >
              My Decks
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'discover'
                  ? 'bg-white dark:bg-neutral-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('discover')}
            >
              Discover
            </button>
          </div>
        </div>
      </div>
      
      {/* Decks grid */}
      {activeTab === 'my-decks' ? (
        <>
          {filteredUserDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUserDecks.map((deck) => (
                <Card key={deck.id} variant="glass" hoverEffect="lift">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{deck.name}</CardTitle>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDeleteDeck(deck.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete deck"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                        <Link href={`/flashcards/edit/${deck.id}`}>
                          <button
                            className="text-gray-500 hover:text-blue-500 transition-colors"
                            title="Edit deck"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 min-h-12">
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {deck.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{deck.cardIds.length} cards</span>
                      <span>Updated {formatDate(deck.lastModified)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/flashcards/study/${deck.id}`} className="w-full">
                      <Button variant="primary" className="w-full">Study</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Create deck card */}
              <Card variant="glass" className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Create a New Deck</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
                    Start building your own custom flashcard deck
                  </p>
                  <Link href="/flashcards/create">
                    <Button variant="outline">Create Deck</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No matching decks found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search terms</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No flashcard decks yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first deck or browse the community decks</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/flashcards/create">
                  <Button variant="primary">Create Your First Deck</Button>
                </Link>
                <Button variant="outline" onClick={() => setActiveTab('discover')}>Browse Community Decks</Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {filteredPublicDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicDecks.map((deck) => (
                <Card key={deck.id} variant="glass" hoverEffect="lift">
                  <CardHeader>
                    <CardTitle className="text-xl">{deck.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 min-h-12">
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {deck.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{deck.cardIds.length} cards</span>
                      <span>Updated {formatDate(deck.lastModified)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      className="w-1/2 mr-2"
                      onClick={() => handleCloneDeck(deck.id)}
                    >
                      Clone
                    </Button>
                    <Link href={`/flashcards/preview/${deck.id}`} className="w-1/2 ml-2">
                      <Button variant="primary" className="w-full">Preview</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No matching community decks found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search terms</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No community decks available yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to share a deck with the community!</p>
              <Link href="/flashcards/create">
                <Button variant="primary">Create a Public Deck</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
