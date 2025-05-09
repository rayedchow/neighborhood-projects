import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Unitize
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
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive 
                        ? 'border-blue-500 text-gray-900 dark:text-white' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200'
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
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
              <span className="sr-only">Toggle dark mode</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                />
              </svg>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <SearchBar />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
