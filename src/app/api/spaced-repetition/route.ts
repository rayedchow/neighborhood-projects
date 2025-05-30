import { NextRequest, NextResponse } from 'next/server';
import { SpacedRepetitionService, Difficulty } from '@/lib/services/spacedRepetitionService';
import { createApiResponse } from '@/lib/utils/fileOperations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
  
  if (!userId) {
    return NextResponse.json(
      createApiResponse(false, null, 'User ID is required'),
      { status: 400 }
    );
  }
  
  try {
    const dueCards = SpacedRepetitionService.getDueCards(userId, limit);
    
    return NextResponse.json(
      createApiResponse(true, dueCards)
    );
  } catch (error) {
    console.error('Error fetching due cards:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to fetch due cards'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, unitId, topicId, questionId, difficulty } = body;
    
    if (!userId || !courseId || !unitId || !topicId || !questionId || difficulty === undefined) {
      return NextResponse.json(
        createApiResponse(false, null, 'Missing required fields'),
        { status: 400 }
      );
    }
    
    const result = await SpacedRepetitionService.processReview(
      userId,
      courseId,
      unitId,
      topicId,
      questionId,
      difficulty
    );
    
    if (result) {
      return NextResponse.json(
        createApiResponse(true, { success: true })
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to process review'),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to process review'),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, unitId, topicId, questionId } = body;
    
    if (!userId || !courseId || !unitId || !topicId || !questionId) {
      return NextResponse.json(
        createApiResponse(false, null, 'Missing required fields'),
        { status: 400 }
      );
    }
    
    const result = await SpacedRepetitionService.addQuestion(
      userId,
      courseId,
      unitId,
      topicId,
      questionId
    );
    
    if (result) {
      return NextResponse.json(
        createApiResponse(true, { success: true })
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to add question to spaced repetition'),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding question to spaced repetition:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to add question to spaced repetition'),
      { status: 500 }
    );
  }
}

// Get stats for a user
export async function PATCH(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      createApiResponse(false, null, 'User ID is required'),
      { status: 400 }
    );
  }
  
  try {
    const stats = SpacedRepetitionService.getReviewStats(userId);
    
    return NextResponse.json(
      createApiResponse(true, stats)
    );
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to fetch review stats'),
      { status: 500 }
    );
  }
}
