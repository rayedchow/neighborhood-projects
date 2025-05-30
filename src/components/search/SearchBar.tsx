"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MathText } from '@/components/ui/Math';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for questions...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search function to prevent excessive API calls
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Use the full URL with window.location.origin for Next.js API routes
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search API response:', data);
      
      if (data.success && data.data) {
        setResults(data.data);
        setShowResults(true);
      } else if (data) {
        // Handle case where API might return data directly
        setResults(Array.isArray(data) ? data : []);
        setShowResults(true);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (courseId: string, unitId: string, topicId: string) => {
    router.push(`/courses/${courseId}/${unitId}/${topicId}`);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className={`flex items-center border rounded-md overflow-hidden ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-700'}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-grow px-4 py-2 outline-none bg-transparent"
        />
        <Button
          variant="ghost"
          onClick={handleSearch}
          className="h-full px-4"
          disabled={loading}
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </Button>
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            {results.length} results found
          </div>
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result.courseId, result.unitId, result.topicId)}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="font-medium"><MathText text={result.question.question} /></div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Course: {result.courseId} • Unit: {result.unitId} • Topic: {result.topicId}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query && !loading && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400">No results found</p>
        </div>
      )}
    </div>
  );
};
