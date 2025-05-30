import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

export async function GET(request: NextRequest) {
  // Extract the parameters from the URL path
  const requestUrl = new URL(request.url);
  const pathParts = requestUrl.pathname.split('/');
  
  // The parameters are in the URL path - extract them
  const topicId = pathParts[pathParts.length - 1];
  const unitId = pathParts[pathParts.length - 3];
  const courseId = pathParts[pathParts.length - 5];
  
  try {
    
    // Get topic by ID
    const response = CourseService.getTopicById(courseId, unitId, topicId);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error(`Error handling GET /api/units/${courseId}/${unitId}/${topicId} request:`, error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
