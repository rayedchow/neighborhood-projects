'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TimerProps {
  onSessionComplete?: (duration: number) => void;
  className?: string;
}

export enum TimerMode {
  FOCUS = 'focus',
  BREAK = 'break',
  LONG_BREAK = 'longBreak'
}

export default function StudyTimer({ onSessionComplete, className = '' }: TimerProps) {
  // Default Pomodoro settings
  const [focusDuration, setFocusDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60); // 15 minutes in seconds
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Audio refs
  const timerEndSound = useRef<HTMLAudioElement | null>(null);
  
  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize audio
  useEffect(() => {
    timerEndSound.current = new Audio('/sounds/timer-end.mp3');
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle timer tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);
  
  // Handle timer completion
  const handleTimerComplete = () => {
    // Play sound
    if (timerEndSound.current) {
      timerEndSound.current.play().catch(() => {
        console.log('Audio playback failed');
      });
    }
    
    // Clear interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsActive(false);
    
    // Update session count and change mode
    if (mode === TimerMode.FOCUS) {
      const newSessionCount = completedSessions + 1;
      setCompletedSessions(newSessionCount);
      
      // Call the callback with the session duration
      if (onSessionComplete) {
        onSessionComplete(focusDuration);
      }
      
      // Determine next mode
      if (newSessionCount % sessionsBeforeLongBreak === 0) {
        setMode(TimerMode.LONG_BREAK);
        setTimeRemaining(longBreakDuration);
      } else {
        setMode(TimerMode.BREAK);
        setTimeRemaining(breakDuration);
      }
    } else {
      // After break, go back to focus mode
      setMode(TimerMode.FOCUS);
      setTimeRemaining(focusDuration);
    }
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Unitize Timer', {
        body: mode === TimerMode.FOCUS 
          ? 'Focus session complete! Time for a break.' 
          : 'Break complete! Ready to focus again?',
        icon: '/favicon.ico'
      });
    }
  };
  
  // Timer controls
  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    
    // Reset to the current mode's duration
    if (mode === TimerMode.FOCUS) {
      setTimeRemaining(focusDuration);
    } else if (mode === TimerMode.BREAK) {
      setTimeRemaining(breakDuration);
    } else {
      setTimeRemaining(longBreakDuration);
    }
  };
  
  // Skip to next timer
  const skipToNext = () => {
    setIsActive(false);
    
    if (mode === TimerMode.FOCUS) {
      const newSessionCount = completedSessions + 1;
      setCompletedSessions(newSessionCount);
      
      if (newSessionCount % sessionsBeforeLongBreak === 0) {
        setMode(TimerMode.LONG_BREAK);
        setTimeRemaining(longBreakDuration);
      } else {
        setMode(TimerMode.BREAK);
        setTimeRemaining(breakDuration);
      }
    } else {
      setMode(TimerMode.FOCUS);
      setTimeRemaining(focusDuration);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update durations when settings change
  const updateSettings = () => {
    // Update current timer if needed
    if (mode === TimerMode.FOCUS) {
      setTimeRemaining(focusDuration);
    } else if (mode === TimerMode.BREAK) {
      setTimeRemaining(breakDuration);
    } else {
      setTimeRemaining(longBreakDuration);
    }
    
    setShowSettings(false);
  };
  
  // Request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };
  
  // Get timer color based on mode
  const getTimerColor = () => {
    switch (mode) {
      case TimerMode.FOCUS:
        return 'from-primary-500 to-primary-700';
      case TimerMode.BREAK:
        return 'from-green-500 to-teal-600';
      case TimerMode.LONG_BREAK:
        return 'from-blue-500 to-indigo-600';
    }
  };
  
  // Get mode label
  const getModeLabel = () => {
    switch (mode) {
      case TimerMode.FOCUS:
        return 'Focus Time';
      case TimerMode.BREAK:
        return 'Short Break';
      case TimerMode.LONG_BREAK:
        return 'Long Break';
    }
  };
  
  return (
    <div className={`${className}`}>
      <Card variant="glass" className="overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{getModeLabel()}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              <button 
                onClick={requestNotificationPermission}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Enable notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Timer circle */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  className="dark:stroke-gray-700"
                />
                
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="565.48"
                  strokeDashoffset={565.48 * (1 - timeRemaining / (
                    mode === TimerMode.FOCUS 
                      ? focusDuration 
                      : mode === TimerMode.BREAK 
                        ? breakDuration 
                        : longBreakDuration
                  ))}
                  transform="rotate(-90 100 100)"
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`stop-color-start ${getTimerColor().split(' ')[0]}`} />
                    <stop offset="100%" className={`stop-color-end ${getTimerColor().split(' ')[1]}`} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Timer text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {completedSessions} sessions completed
                </div>
              </div>
            </div>
          </div>
          
          {/* Timer controls */}
          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <Button 
                variant="primary" 
                onClick={startTimer}
                className="px-6"
              >
                Start
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={pauseTimer}
                className="px-6"
              >
                Pause
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={resetTimer}
              className="px-4"
            >
              Reset
            </Button>
            <Button 
              variant="outline" 
              onClick={skipToNext}
              className="px-4"
            >
              Skip
            </Button>
          </div>
          
          {/* Settings panel */}
          {showSettings && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium mb-4">Timer Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Focus Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={focusDuration / 60}
                    onChange={(e) => setFocusDuration(parseInt(e.target.value) * 60)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={breakDuration / 60}
                    onChange={(e) => setBreakDuration(parseInt(e.target.value) * 60)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={longBreakDuration / 60}
                    onChange={(e) => setLongBreakDuration(parseInt(e.target.value) * 60)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Sessions until long break
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sessionsBeforeLongBreak}
                    onChange={(e) => setSessionsBeforeLongBreak(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={updateSettings}
                  size="sm"
                >
                  Apply Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
