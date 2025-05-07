import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@/lib/services/progressService';
import { ensureDataFilesExist } from '@/lib/utils/fileOperations';
import { GetUserProgressRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Ensure data files exist
    ensureDataFilesExist();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId') || undefined;
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Missing required parameter: userId',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    const requestData: GetUserProgressRequest = {
      userId,
      courseId
    };
    
    // Get user progress
    const response = ProgressService.getUserProgress(requestData);
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 404 }
    );
  } catch (error) {
    console.error('Error handling GET /api/progress request:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    // Ensure data files exist
    ensureDataFilesExist();
    
    // Parse request body
    const requestData = await request.json();
    
    // Check if creating a new user
    if (requestData.action === 'create_user') {
      const { name, email } = requestData;
      
      if (!name || !email) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: 'Missing required parameters: name and email',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }
      
      // Create user
      const response = ProgressService.createUser(name, email);
      
      return NextResponse.json(response, 
        { status: response.success ? 201 : 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Invalid action',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling POST /api/progress request:', error);
    
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
