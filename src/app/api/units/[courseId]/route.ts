import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

export async function GET(request: NextRequest) {
  // Extract the courseId from the URL path
  const requestUrl = new URL(request.url);
  const pathParts = requestUrl.pathname.split('/');
  const courseId = pathParts[pathParts.length - 1];
  
  try {
    
    // Get course by ID
    const response = CourseService.getCourseById(courseId);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error(`Error handling GET /api/units/${courseId} request:`, error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
