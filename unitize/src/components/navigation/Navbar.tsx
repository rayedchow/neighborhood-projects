"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/Button';
import { theme } from '@/styles/theme';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Handle scroll effect for navbar
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
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Practice', path: '/practice' },
    { name: 'Profile', path: '/profile' },
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-neutral-900'
      } border-b ${scrolled ? 'border-transparent' : 'border-neutral-200 dark:border-neutral-800'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text text-2xl font-bold relative group">
                  Unitize
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <div className="ml-2 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-full w-3 h-3 animate-pulse"></div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.path || 
                  (item.path !== '/' && pathname?.startsWith(item.path));
                  
                return (
                  <Link 
                    key={item.name}
                    href={item.path}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 hover:-translate-y-0.5 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-primary-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Search Bar */}
          <div className="hidden md:block mx-4 flex-grow max-w-md">
            <SearchBar />
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100/80 hover:text-primary-600 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-primary-400 focus:outline-none transition-all duration-300 hover:scale-110"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Profile Button */}
            <Link href="/profile">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 hover:ring-2 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all cursor-pointer">
                <span className="text-sm font-medium">U</span>
              </div>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 focus:outline-none transition-colors"
              aria-label="Open main menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path || 
                  (item.path !== '/' && pathname?.startsWith(item.path));
                  
                return (
                  <Link 
                    key={item.name}
                    href={item.path}
                    className={`block px-4 py-2.5 rounded-lg text-base font-medium ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Search */}
              <div className="p-4 mt-2 bg-neutral-50 rounded-lg dark:bg-neutral-800/50">
                <SearchBar />
              </div>
              
              {/* Progress bar */}
              <div 
                className="h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300" 
                style={{ width: `${scrollProgress}%` }}
              ></div>

              {/* Mobile actions */}
              <div className={`mt-4 px-4 py-3 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'} bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md`}>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Theme
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 focus:outline-none transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Sign In Button */}
        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
          <Link href="/login">
            <Button 
              size="sm" 
              variant={scrolled ? "glass" : "primary"}
              rounded="full"
              className="font-medium transform hover:-translate-y-1 transition-transform duration-300"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
