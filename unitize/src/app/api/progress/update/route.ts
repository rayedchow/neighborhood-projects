import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { ProgressUpdateRequest } from '@/models';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    
    // Validate required fields
    const { userId, courseId, unitId, topicId, questionId, isCorrect, timeSpentSeconds } = requestData;
    
    if (!userId || !courseId || !unitId || !topicId || !questionId || isCorrect === undefined || !timeSpentSeconds) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const updateRequest: ProgressUpdateRequest = {
      userId,
      courseId,
      unitId,
      topicId,
      questionId,
      isCorrect,
      timeSpentSeconds
    };
    
    // Update progress
    const response = UserService.updateProgress(updateRequest);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error('Error handling POST /api/progress/update request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
