import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const count = searchParams.get('count');
    const unitIds = searchParams.getAll('unitId');
    const topicIds = searchParams.getAll('topicId');
    
    if (!courseId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Missing required parameter: courseId'
      }, { status: 400 });
    }
    
    // Get practice questions
    const response = CourseService.getPracticeQuestions(
      courseId,
      count ? parseInt(count) : 5,
      unitIds.length > 0 ? unitIds : undefined,
      topicIds.length > 0 ? topicIds : undefined
    );
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error('Error handling GET /api/practice request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
