"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/search/SearchBar';
import { theme } from '@/styles/theme';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('unitize_user_id');
      const email = localStorage.getItem('unitize_user_email');
      setIsLoggedIn(!!userId);
      setUserEmail(email);
    };

    // Check on initial load
    checkAuth();

    // Also add event listener for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('unitize_user_id');
    localStorage.removeItem('unitize_user_email');
    setIsLoggedIn(false);
    setUserEmail(null);
    router.push('/login');
  };

  // Handle scroll events for navbar styling and progress indicator
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      // Calculate scroll progress percentage
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for user's dark mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleDarkMode = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
      setIsDarkMode(!isDarkMode);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md' : 'py-4'}`}
    >
      {/* Scroll Progress Indicator */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center" aria-label="Home">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mr-3 shadow-md transform transition-transform hover:scale-105 duration-300">
                  U
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                  Unitize
                </span>
              </Link>
            </div>

            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                href="/"
                className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
              >
                Home
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
              >
                Courses
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
              >
                Practice
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/profile"
                    className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/progress"
                    className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
                  >
                    Progress
                  </Link>
                </>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-all duration-300 hover:scale-110"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Profile Button */}
            <Link href="/profile">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md transform transition-transform hover:scale-105 duration-300">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
            </Link>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                aria-expanded={isOpen ? 'true' : 'false'}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Link href="/profile">
                  <Button
                    size="sm"
                    variant="secondary"
                    rounded="full"
                    className="font-medium transform hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white mr-2 shadow-sm">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="truncate max-w-[100px]">
                        {userEmail ? userEmail.split('@')[0] : 'Account'}
                      </span>
                    </div>
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant={scrolled ? "glass" : "primary"}
                  rounded="full"
                  className="transform hover:-translate-y-1 transition-transform duration-300"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  variant={scrolled ? "glass" : "primary"}
                  rounded="full"
                  className="transform hover:-translate-y-1 transition-transform duration-300"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out border-t dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/courses"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/practice"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Practice
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/progress"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Progress
                  </Link>
                </>
              )}

              {/* Auth buttons for mobile */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white mr-3 shadow-sm">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {userEmail || 'Account'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-center text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
