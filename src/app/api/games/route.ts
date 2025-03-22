import { NextRequest, NextResponse } from 'next/server';
import { fetchFromApi, handleApiError } from '../utils';

// The root /games route doesn't have dynamic params
export async function GET(): Promise<Response> {
  try {
    const result = await fetchFromApi('/games');
    
    if (!result.success) {
      return handleApiError(
        result.error,
        'Failed to fetch games',
        result.status
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch games');
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    
    const result = await fetchFromApi('/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!result.success) {
      return handleApiError(
        result.error,
        `Failed to create game: ${result.error}`,
        result.status
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error, 'Failed to create game');
  }
}
