import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Missing required parameter: userId'
      }, { status: 400 });
    }
    
    // Get test history
    const response = UserService.getTestHistory(userId, courseId || undefined);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error('Error handling GET /api/progress/history request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
