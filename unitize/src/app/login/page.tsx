'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For this demo, we'll use a simple hardcoded login
  // In a real app, this would connect to a backend authentication service
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // This is a demo login that accepts any input but requires both fields
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, automatically log in as user1
      localStorage.setItem('unitize_user_id', 'user1');
      localStorage.setItem('unitize_user_email', email);
      
      // Redirect to profile page after successful login
      router.push('/profile');
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login by clicking the "Demo Account" button
  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set demo user details
      localStorage.setItem('unitize_user_id', 'user1');
      localStorage.setItem('unitize_user_email', 'demo@example.com');
      
      // Redirect to profile page
      router.push('/profile');
      
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-8rem)] px-4">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-xl animate-fade-in overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Sign In to Unitize</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Continue your AP test preparation journey
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md border border-red-100 dark:border-red-900/30 animate-fade-in flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/80 bg-white dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/80 bg-white dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
                placeholder="••••••••"
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 group"
              disabled={isLoading}
              isLoading={isLoading}
            >
              <span className="flex items-center justify-center">
                {isLoading ? 'Signing In...' : 'Sign In'}
                <svg 
                  className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                variant="secondary"
                className="w-full group"
                onClick={handleDemoLogin}
                disabled={isLoading}
                isLoading={isLoading}
              >
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demo Account
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300">
              Sign up for free
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
