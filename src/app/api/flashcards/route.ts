import { NextRequest, NextResponse } from 'next/server';
import { FlashcardService } from './service';
import { FlashcardDifficulty, ReviewResult } from '@/lib/types/flashcards';

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
  
  try {
    // If deckId is provided, get cards for that specific deck
    if (deckId) {
      const response = await FlashcardService.getDeckWithCards(deckId);
      
      if (!response.success) {
        return NextResponse.json(
          { success: false, error: response.error || 'Failed to get deck with cards' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: true, data: response.data },
        { status: 200 }
      );
    }
    
    // Otherwise get due cards for the user
    const response = await FlashcardService.getDueCards(userId, limit || 20);
    
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to get due cards' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: response.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET flashcards:', error);
    return NextResponse.json(
      { success: false, error: 'Server error processing request' },
      { status: 500 }
    );
  }
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
      tags = [],
      hint,
      courseId,
      topicId,
      difficulty = FlashcardDifficulty.MEDIUM
    } = body;
    
    // Validate required fields
    if (!userId || !front || !back || !deckId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const response = await FlashcardService.createFlashcard(
      userId,
      front,
      back,
      deckId,
      tags,
      hint,
      courseId,
      topicId,
      difficulty
    );
    
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create flashcard' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: response.data
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { success: false, error: 'Server error creating flashcard' },
      { status: 500 }
    );
  }
}

// PATCH handler - Update a flashcard or process a review
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    // Determine if this is a review operation by checking the URL path
    const isReview = pathParts[pathParts.length - 1] === 'review';
    const cardId = isReview ? pathParts[pathParts.length - 3] : pathParts[pathParts.length - 1];
    
    const body = await request.json();
    const { userId, ...updates } = body;
    
    if (!userId || !cardId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId and cardId' },
        { status: 400 }
      );
    }
    
    let response;
    
    if (isReview) {
      // This is a review operation
      const { result } = updates;
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Missing required parameter: result' },
          { status: 400 }
        );
      }
      
      const validResult = result as ReviewResult;
      response = await FlashcardService.reviewCard(userId, cardId, validResult);
    } else {
      // This is a regular update operation
      response = await FlashcardService.updateFlashcard(userId, cardId, updates);
    }
    
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
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const cardId = pathParts[pathParts.length - 1];
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || !cardId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId and cardId' },
        { status: 400 }
      );
    }
    
    const response = await FlashcardService.deleteFlashcard(userId, cardId);
    
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/flashcards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
