import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const limit = searchParams.get('limit');
    
    if (!userId || !courseId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Missing required parameters: userId and courseId'
      }, { status: 400 });
    }
    
    // Get recommendations
    const response = UserService.getRecommendations(
      userId,
      courseId,
      limit ? parseInt(limit) : 5
    );
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error('Error handling GET /api/recommendations request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
