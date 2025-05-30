import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section with gradient background */}
      <section className="relative py-20 overflow-hidden">
        {/* Background gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/30 -z-10"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-300/10 dark:bg-primary-500/10 rounded-full blur-3xl -z-5"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-300/10 dark:bg-secondary-500/10 rounded-full blur-3xl -z-5"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 text-transparent bg-clip-text">Master AP Exams</span>
              <br />
              <span className="text-gray-900 dark:text-white">with Unitize</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Practice what you're struggling with, not what you already know.
              Get personalized recommendations based on your performance.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <Link href="/courses">
                <Button 
                  variant="primary" 
                  size="lg" 
                  rounded="full"
                  className="px-8 py-6 font-medium text-base animate-pulse hover:animate-none"
                >
                  Browse Courses
                </Button>
              </Link>
              <Link href="/practice">
                <Button 
                  variant="glass" 
                  size="lg" 
                  rounded="full"
                  className="px-8 py-6 font-medium text-base"
                >
                  Start Practicing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 text-transparent bg-clip-text inline-block">Why Choose Unitize?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Our platform is designed to help you succeed with cutting-edge features</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass" hoverEffect="lift" animate={true}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <CardTitle>Personalized Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our system identifies your weak areas and creates a custom study plan to help you improve where it matters most.</p>
            </CardContent>
          </Card>
          <Card variant="glass" hoverEffect="lift" animate={true}>
            <CardHeader>
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <CardTitle>Realistic Bluebook Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Practice in an environment that simulates the actual AP test interface so you'll feel confident on exam day.</p>
            </CardContent>
          </Card>
          <Card variant="glass" hoverEffect="lift" animate={true}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle>Detailed Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Track your progress with detailed reports that show where you're improving and what needs more work.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 -z-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl -z-5"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-200/20 dark:bg-secondary-800/10 rounded-full blur-3xl -z-5"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Empowering Student Success</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg shadow-sm border border-white/30 dark:border-white/5 transform transition-all duration-300 hover:scale-105">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 mb-2">15+</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">AP Courses</div>
            </div>
            <div className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg shadow-sm border border-white/30 dark:border-white/5 transform transition-all duration-300 hover:scale-105">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 mb-2">1000+</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Practice Questions</div>
            </div>
            <div className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg shadow-sm border border-white/30 dark:border-white/5 transform transition-all duration-300 hover:scale-105">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 mb-2">95%</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Score Improvement</div>
            </div>
            <div className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg shadow-sm border border-white/30 dark:border-white/5 transform transition-all duration-300 hover:scale-105">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 mb-2">24/7</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Learning Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="relative overflow-hidden max-w-6xl mx-auto rounded-2xl p-12 text-center">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-90 dark:opacity-80 -z-10"></div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-pattern opacity-10 -z-5"></div>
          
          {/* Floating shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -z-5"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -z-5"></div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Ready to Ace Your AP Exams?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">Join thousands of students who have improved their scores with Unitize.</p>
          
          <Link href="/signup">
            <Button 
              variant="glass" 
              size="lg" 
              rounded="full"
              className="px-8 py-6 font-medium text-lg border-white/30 text-white hover:bg-white/30"
            >
              Get Started Free
            </Button>
          </Link>
          
          <p className="mt-6 text-sm text-white/70">No credit card required. Start learning today.</p>
        </div>
      </section>
      
      {/* Footer Banner */}
      <section className="py-8 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neutral-600 dark:text-neutral-400"> {new Date().getFullYear()} Unitize. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}
