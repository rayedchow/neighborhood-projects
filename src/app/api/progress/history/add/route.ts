import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { TestHistoryRequest } from '@/models';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    
    // Validate required fields
    const { 
      userId, 
      courseId, 
      totalQuestions, 
      correctQuestions, 
      timeSpentSeconds,
      score
    } = requestData;
    
    if (!userId || !courseId || !totalQuestions || correctQuestions === undefined || !timeSpentSeconds || score === undefined) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const historyRequest: TestHistoryRequest = {
      userId,
      courseId,
      unitId: requestData.unitId,
      topicId: requestData.topicId,
      totalQuestions,
      correctQuestions,
      timeSpentSeconds,
      score
    };
    
    // Add test history entry
    const response = UserService.addTestHistoryEntry(historyRequest);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 400 
    });
  } catch (error) {
    console.error('Error handling POST /api/progress/history/add request:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
