import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@/lib/services/progressService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Missing required parameter: userId',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Get user stats
    const response = await ProgressService.getUserStats(userId);
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 404 }
    );
  } catch (error) {
    console.error('Error handling GET /api/progress/stats request:', error);
    
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
