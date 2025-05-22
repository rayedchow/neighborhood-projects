import { NextRequest, NextResponse } from 'next/server';
import { FlashcardService, FlashcardDifficulty, ReviewResult } from '@/lib/services/flashcardService';

// GET handler - Get flashcards due for review or get a specific deck's cards
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const deckId = searchParams.get('deckId');
  const limitParam = searchParams.get('limit');
  
  const limit = limitParam ? parseInt(limitParam) : undefined;
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Missing required userId parameter' },
      { status: 400 }
    );
  }
  
  // If deckId is provided, get cards for that specific deck
  if (deckId) {
    const response = FlashcardService.getDeckWithCards(deckId);
    
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
  
  // Otherwise, get cards due for review
  const response = FlashcardService.getDueCards(userId, limit);
  
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

// POST handler - Create a new flashcard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      front, 
      back, 
      deckId, 
      tags, 
      hint, 
      courseId, 
      topicId, 
      difficulty 
    } = body;
    
    if (!userId || !front || !back || !deckId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId, front, back, and deckId are required' },
        { status: 400 }
      );
    }
    
    const validDifficulty = difficulty ? difficulty as FlashcardDifficulty : FlashcardDifficulty.MEDIUM;
    
    const response = FlashcardService.createFlashcard(
      userId,
      front,
      back,
      deckId,
      tags || [],
      hint,
      courseId,
      topicId,
      validDifficulty
    );
    
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
    console.error('Error in POST /api/flashcards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PATCH handler - Update a flashcard or process a review
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cardId, updates, reviewResult } = body;
    
    if (!userId || !cardId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId and cardId are required' },
        { status: 400 }
      );
    }
    
    // If reviewResult is provided, process a review
    if (reviewResult) {
      const validResult = reviewResult as ReviewResult;
      const response = FlashcardService.reviewCard(userId, cardId, validResult);
      
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
    
    // Otherwise, update the flashcard
    if (!updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: updates is required for card updates' },
        { status: 400 }
      );
    }
    
    const response = FlashcardService.updateFlashcard(userId, cardId, updates);
    
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
    console.error('Error in PATCH /api/flashcards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a flashcard
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const cardId = searchParams.get('cardId');
  
  if (!userId || !cardId) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters: userId and cardId are required' },
      { status: 400 }
    );
  }
  
  const response = FlashcardService.deleteFlashcard(userId, cardId);
  
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
