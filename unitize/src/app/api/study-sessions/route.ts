import { NextRequest, NextResponse } from 'next/server';
import { StudySessionsService } from '@/lib/services/studySessionsService';

// GET handler - Retrieve user's study sessions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  
  // Parse limit and offset if provided
  const limit = limitParam ? parseInt(limitParam) : undefined;
  const offset = offsetParam ? parseInt(offsetParam) : undefined;
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Missing required userId parameter' },
      { status: 400 }
    );
  }
  
  const response = StudySessionsService.getUserSessions(userId, limit, offset);
  
  if (!response.success) {
    return NextResponse.json(
      { success: false, error: response.error },
      { status: 400 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: response.data
  });
}

// POST handler - Create a new study session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, duration, courseId, topicId, notes } = body;
    
    if (!userId || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId and duration are required' },
        { status: 400 }
      );
    }
    
    const response = StudySessionsService.createSession(userId, duration, courseId, topicId, notes);
    
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error in POST /api/study-sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a study session
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Missing required sessionId parameter' },
      { status: 400 }
    );
  }
  
  const response = StudySessionsService.deleteSession(sessionId);
  
  if (!response.success) {
    return NextResponse.json(
      { success: false, error: response.error },
      { status: 400 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: { deleted: true }
  });
}
