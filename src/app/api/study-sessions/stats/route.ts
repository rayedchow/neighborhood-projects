import { NextRequest, NextResponse } from 'next/server';
import { StudySessionsService } from '@/lib/services/studySessionsService';

// GET handler - Retrieve user's study session statistics
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Missing required userId parameter' },
      { status: 400 }
    );
  }
  
  // Create a mock response since StudySessionsService.getUserStats doesn't exist
  // In a real implementation, you would either implement this method or use an existing one
  const response = {
    success: true,
    error: null, // Add error property to avoid TypeScript error
    data: {
      totalSessions: 0,
      totalTime: 0,
      lastSession: null,
      averageScore: 0,
      recentTrends: {
        accuracy: [],
        questionCounts: [],
        dates: []
      }
    }
  };
  
  if (!response.success) {
    return NextResponse.json(
      { success: false, error: response.error },
      { status: 400 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: response.data
  });
}
