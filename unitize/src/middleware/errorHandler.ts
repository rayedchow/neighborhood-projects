import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle errors in API requests
 */
export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error(`Error handling ${req.method} ${req.nextUrl.pathname} request:`, error);
      
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Internal server error'
      }, { status: 500 });
    }
  };
}
