import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Missing required parameter: userId'
      }, { status: 400 });
    }
    
    let response;
    
    // Get user data or course specific stats
    if (courseId) {
      response = UserService.getCourseStats(userId, courseId);
    } else {
      response = UserService.getUserById(userId);
    }
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 404 
    });
  } catch (error) {
    console.error('Error handling GET /api/progress request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    
    // Check if creating a new user
    if (requestData.action === 'create_user') {
      const { name, email } = requestData;
      
      if (!name || !email) {
        return NextResponse.json({
          success: false,
          data: null,
          error: 'Missing required parameters: name and email'
        }, { status: 400 });
      }
      
      // We'll implement user creation in a future version
      return NextResponse.json({
        success: false,
        data: null,
        error: 'User creation not implemented in this version'
      }, { status: 501 });
    }
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    console.error('Error handling POST /api/progress request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
