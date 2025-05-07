import { NextRequest, NextResponse } from 'next/server';
import { UnitsService } from '@/lib/services/unitsService';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    
    // Get course by ID
    const response = UnitsService.getCourseById(courseId);
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 404 }
    );
  } catch (error) {
    console.error(`Error handling GET /api/units/${params.courseId} request:`, error);
    
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
