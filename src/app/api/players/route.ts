import { NextRequest, NextResponse } from 'next/server';
import { fetchFromApi, handleApiError } from '../utils';

export async function GET(): Promise<NextResponse> {
  try {
    const result = await fetchFromApi('/players');
    
    if (!result.success) {
      return handleApiError(result.error, 'Failed to fetch players', result.status);
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch players');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const result = await fetchFromApi('/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!result.success) {
      return handleApiError(result.error, `Failed to create player: ${result.error}`, result.status);
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error, 'Failed to create player');
  }
}
