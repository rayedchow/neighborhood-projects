import { NextResponse } from 'next/server';
import { UnitsService } from '@/lib/services/unitsService';
import { ensureDataFilesExist } from '@/lib/utils/fileOperations';

export async function GET() {
  try {
    // Ensure data files exist
    ensureDataFilesExist();
    
    // Get all courses
    const response = UnitsService.getAllCourses();
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 404 }
    );
  } catch (error) {
    console.error('Error handling GET /api/units request:', error);
    
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
