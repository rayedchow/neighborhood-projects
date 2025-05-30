import { NextRequest, NextResponse } from 'next/server';
import { UnitsService } from '@/lib/services/unitsService';

export async function GET(request: NextRequest) {
  // Extract the parameters from the URL path
  const requestUrl = new URL(request.url);
  const pathParts = requestUrl.pathname.split('/');
  const unitId = pathParts[pathParts.length - 1];
  const courseId = pathParts[pathParts.length - 3];
  
  try {
    
    // Get unit by ID
    const response = await UnitsService.getUnitById(courseId, unitId);
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 404 }
    );
  } catch (error) {
    console.error(`Error handling GET /api/units/${courseId}/${unitId} request:`, error);
    
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
