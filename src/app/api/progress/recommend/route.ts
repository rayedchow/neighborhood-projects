import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@/lib/services/progressService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const count = searchParams.get('count');
    
    if (!userId || !courseId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Missing required parameters: userId and courseId',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Get practice recommendations
    const response = await ProgressService.getRecommendedPractice(
      userId,
      courseId,
      count ? parseInt(count) : undefined
    );
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 404 }
    );
  } catch (error) {
    console.error('Error handling GET /api/progress/recommend request:', error);
    
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
