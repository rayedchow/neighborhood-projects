import { NextRequest, NextResponse } from 'next/server';
import { StudyGoalsService, GoalType } from '@/lib/services/studyGoalsService';
import { createApiResponse } from '@/lib/utils/fileOperations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      createApiResponse(false, null, 'User ID is required'),
      { status: 400 }
    );
  }
  
  try {
    // Get goals
    const goals = StudyGoalsService.getGoals(userId);
    
    // Auto-update goals based on latest progress
    StudyGoalsService.autoUpdateGoals(userId);
    
    // Update streak
    StudyGoalsService.updateStreak(userId);
    
    // Get streak info
    const streakInfo = StudyGoalsService.getStreakInfo(userId);
    
    return NextResponse.json(
      createApiResponse(true, { goals, streakInfo })
    );
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to fetch goals'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, target, courseId, deadline } = body;
    
    if (!userId || !type || !target) {
      return NextResponse.json(
        createApiResponse(false, null, 'Missing required fields'),
        { status: 400 }
      );
    }
    
    // Validate goal type
    if (!Object.values(GoalType).includes(type as GoalType)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid goal type'),
        { status: 400 }
      );
    }
    
    const goal = StudyGoalsService.createGoal(
      userId,
      type as GoalType,
      target,
      courseId,
      deadline
    );
    
    if (goal) {
      return NextResponse.json(
        createApiResponse(true, goal)
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to create goal'),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to create goal'),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, goalId, progress } = body;
    
    if (!userId || !goalId || progress === undefined) {
      return NextResponse.json(
        createApiResponse(false, null, 'Missing required fields'),
        { status: 400 }
      );
    }
    
    const goal = StudyGoalsService.updateGoalProgress(
      userId,
      goalId,
      progress
    );
    
    if (goal) {
      return NextResponse.json(
        createApiResponse(true, goal)
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to update goal progress'),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to update goal progress'),
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const goalId = searchParams.get('goalId');
  
  if (!userId || !goalId) {
    return NextResponse.json(
      createApiResponse(false, null, 'User ID and Goal ID are required'),
      { status: 400 }
    );
  }
  
  try {
    const success = StudyGoalsService.deleteGoal(userId, goalId);
    
    if (success) {
      return NextResponse.json(
        createApiResponse(true, { success: true })
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to delete goal'),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to delete goal'),
      { status: 500 }
    );
  }
}

// Reset a goal's progress
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, goalId } = body;
    
    if (!userId || !goalId) {
      return NextResponse.json(
        createApiResponse(false, null, 'Missing required fields'),
        { status: 400 }
      );
    }
    
    const goal = StudyGoalsService.resetGoal(
      userId,
      goalId
    );
    
    if (goal) {
      return NextResponse.json(
        createApiResponse(true, goal)
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to reset goal'),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error resetting goal:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Failed to reset goal'),
      { status: 500 }
    );
  }
}
