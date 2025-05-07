import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@/lib/services/progressService';
import { UpdateProgressRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    
    // Validate required fields
    const { userId, courseId, unitId, topicId, questionId, isCorrect, timeSpentSeconds } = requestData;
    
    if (!userId || !courseId || !unitId || !topicId || !questionId || isCorrect === undefined || !timeSpentSeconds) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Missing required parameters',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    const updateRequest: UpdateProgressRequest = {
      userId,
      courseId,
      unitId,
      topicId,
      questionId,
      isCorrect,
      timeSpentSeconds
    };
    
    // Update progress
    const response = ProgressService.updateProgress(updateRequest);
    
    return NextResponse.json(response, 
      { status: response.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('Error handling POST /api/progress/update request:', error);
    
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
