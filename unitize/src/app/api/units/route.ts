import { NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

export async function GET() {
  try {
    // Get all courses
    const response = CourseService.getAllCourses();
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error('Error handling GET /api/units request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
