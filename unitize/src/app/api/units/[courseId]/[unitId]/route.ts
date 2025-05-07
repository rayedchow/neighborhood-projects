import { NextRequest, NextResponse } from 'next/server';
import { UnitsService } from '@/lib/services/unitsService';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string, unitId: string } }
) {
  try {
    const { courseId, unitId } = params;
    
    // Get unit by ID
    const response = UnitsService.getUnitById(courseId, unitId);
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 404 }
    );
  } catch (error) {
    console.error(`Error handling GET /api/units/${params.courseId}/${params.unitId} request:`, error);
    
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
