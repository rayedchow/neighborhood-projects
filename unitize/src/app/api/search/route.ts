import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Missing required parameter: q (search query)'
      }, { status: 400 });
    }
    
    // Search for questions
    const response = CourseService.searchQuestions(query);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error('Error handling GET /api/search request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
