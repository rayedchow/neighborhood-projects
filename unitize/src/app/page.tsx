import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Master AP Exams with <span className="text-blue-600 dark:text-blue-500">Unitize</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Practice what you're struggling with, not what you already know.
            Get personalized recommendations based on your performance.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/courses">
              <Button variant="primary" size="lg">Browse Courses</Button>
            </Link>
            <Link href="/practice">
              <Button variant="outline" size="lg">Start Practicing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10">
        <h2 className="text-2xl font-bold mb-6">Why Choose Unitize?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our system identifies your weak areas and creates a custom study plan to help you improve where it matters most.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Realistic Bluebook Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Practice in an environment that simulates the actual AP test interface so you'll feel confident on exam day.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Track your progress with comprehensive statistics that show your improvement over time.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Your Learning Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Courses</h3>
            <p className="text-3xl font-bold">5</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions Answered</h3>
            <p className="text-3xl font-bold">247</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</h3>
            <p className="text-3xl font-bold">78%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Streak</h3>
            <p className="text-3xl font-bold">5 days</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to ace your AP exams?</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Join thousands of students improving their scores with Unitize.</p>
        <Link href="/courses">
          <Button variant="primary" size="lg">Get Started Now</Button>
        </Link>
      </section>
    </div>
  );
}
