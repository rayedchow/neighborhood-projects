'use client';

interface ProgressTrackerProps {
  courses: {
    courseId: string;
    courseName: string;
    progress: number;
  }[];
  className?: string;
}

export default function ProgressTracker({ courses, className = '' }: ProgressTrackerProps) {
  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.courseId} className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{course.courseName}</h3>
              <span className="text-sm font-bold">{Math.round(course.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="text-center py-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <p className="text-gray-500 dark:text-gray-400">No course progress data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
