import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string, unitId: string, topicId: string } }
) {
  try {
    const { courseId, unitId, topicId } = params;
    
    // Get topic by ID
    const response = CourseService.getTopicById(courseId, unitId, topicId);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error(`Error handling GET /api/units/${params.courseId}/${params.unitId}/${params.topicId} request:`, error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
