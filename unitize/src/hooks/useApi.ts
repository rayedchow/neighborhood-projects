import { useState, useEffect } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

interface UseApiOptions {
  skipInitialFetch?: boolean;
}

/**
 * Custom hook for API data fetching with built-in loading and error handling
 */
export function useApi<T>(url: string | null, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skipInitialFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (fetchUrl: string = url!) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure the URL starts with / for Next.js API routes
      const apiUrl = fetchUrl.startsWith('/') ? fetchUrl : `/${fetchUrl}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText || 'Failed to fetch data'}`);
      }
      
      const result = await response.json();
      
      if (result && result.success && result.data !== undefined) {
        setData(result.data);
      } else if (result && result.error) {
        throw new Error(result.error);
      } else if (result) {
        // Handle case where API might return data directly without success wrapper
        setData(result as T);
      } else {
        throw new Error('No data returned from API');
      }
    } catch (err) {
      console.error('API fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const postData = async (postUrl: string = url!, body: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure the URL starts with / for Next.js API routes
      const apiUrl = postUrl.startsWith('/') ? postUrl : `/${postUrl}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText || 'Failed to post data'}`);
      }
      
      const result = await response.json();
      
      if (result && result.success && result.data !== undefined) {
        setData(result.data);
        return { success: true, data: result.data };
      } else if (result && result.error) {
        throw new Error(result.error);
      } else if (result) {
        // Handle case where API might return data directly without success wrapper
        setData(result as T);
        return { success: true, data: result as T };
      } else {
        throw new Error('No data returned from API');
      }
    } catch (err) {
      console.error('API post error:', err);
      setError(err instanceof Error ? err.message : 'Failed to post data');
      return { success: false, error: err instanceof Error ? err.message : 'Failed to post data' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url && !options.skipInitialFetch) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error, fetchData, postData };
}
