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
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'An unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const postData = async (postUrl: string = url!, body: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'An unknown error occurred');
      }
    } catch (err) {
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
