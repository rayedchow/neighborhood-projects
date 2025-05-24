'use client';

import { TopicPerformance } from '@/lib/services/analyticsService';

interface TopicInsightsProps {
  data: TopicPerformance[];
  className?: string;
}

export default function TopicInsights({ data, className = '' }: TopicInsightsProps) {
  // Sort topics by accuracy
  const sortedTopics = [...data].sort((a, b) => b.accuracy - a.accuracy);
  
  // Get top 5 and bottom 5
  const topTopics = sortedTopics.slice(0, 5);
  const bottomTopics = [...sortedTopics].reverse().slice(0, 5);

  // Helper function for accuracy color
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) {
      return 'text-green-600 dark:text-green-400';
    } else if (accuracy >= 60) {
      return 'text-blue-600 dark:text-blue-400';
    } else if (accuracy >= 40) {
      return 'text-amber-600 dark:text-amber-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium mb-4 text-green-600 dark:text-green-400">Strengths</h3>
          
          {topTopics.length > 0 ? (
            <div className="space-y-3">
              {topTopics.map((topic) => (
                <div key={topic.topicId} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{topic.topicName}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {topic.questionCount} questions answered
                      </p>
                    </div>
                    <div className={`font-bold ${getAccuracyColor(topic.accuracy)}`}>
                      {Math.round(topic.accuracy)}%
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        topic.accuracy >= 80 
                          ? 'bg-green-500' 
                          : topic.accuracy >= 60 
                            ? 'bg-blue-500' 
                            : topic.accuracy >= 40 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${topic.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Not enough data to identify strengths yet
            </div>
          )}
        </div>
        
        {/* Weaknesses */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium mb-4 text-amber-600 dark:text-amber-400">Areas for Improvement</h3>
          
          {bottomTopics.length > 0 ? (
            <div className="space-y-3">
              {bottomTopics.map((topic) => (
                <div key={topic.topicId} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{topic.topicName}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {topic.questionCount} questions answered
                      </p>
                    </div>
                    <div className={`font-bold ${getAccuracyColor(topic.accuracy)}`}>
                      {Math.round(topic.accuracy)}%
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        topic.accuracy >= 80 
                          ? 'bg-green-500' 
                          : topic.accuracy >= 60 
                            ? 'bg-blue-500' 
                            : topic.accuracy >= 40 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${topic.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Not enough data to identify areas for improvement yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
