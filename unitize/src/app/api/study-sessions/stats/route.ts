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
  
  const response = StudySessionsService.getUserStats(userId);
  
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
