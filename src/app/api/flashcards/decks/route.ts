import { NextRequest, NextResponse } from 'next/server';
import { FlashcardService } from '@/lib/services/flashcardService';

// GET handler - Get user's decks or public decks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const publicParam = searchParams.get('public');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  
  const isPublic = publicParam === 'true';
  const limit = limitParam ? parseInt(limitParam) : 20;
  const offset = offsetParam ? parseInt(offsetParam) : 0;
  
  // If public flag is set, get public decks
  if (isPublic) {
    const response = await FlashcardService.getPublicDecks(limit, offset);
    
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
  
  // Otherwise, get user's decks
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Missing required userId parameter for personal decks' },
      { status: 400 }
    );
  }
  
  const response = await FlashcardService.getUserDecks(userId);
  
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

// POST handler - Create a new deck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, courseId, topicId, isPublic } = body;
    
    if (!userId || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId and name are required' },
        { status: 400 }
      );
    }
    
    const response = await FlashcardService.createDeck(
      userId,
      name,
      description,
      courseId,
      topicId,
      isPublic
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
    console.error('Error in POST /api/flashcards/decks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PATCH handler - Update a deck
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, deckId, updates } = body;
    
    if (!userId || !deckId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId, deckId, and updates are required' },
        { status: 400 }
      );
    }
    
    const response = await FlashcardService.updateDeck(userId, deckId, updates);
    
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
    console.error('Error in PATCH /api/flashcards/decks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a deck
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const deckId = searchParams.get('deckId');
  
  if (!userId || !deckId) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters: userId and deckId are required' },
      { status: 400 }
    );
  }
  
  const response = await FlashcardService.deleteDeck(userId, deckId);
  
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
