import { NextRequest, NextResponse } from 'next/server';
import { fetchFromApi, handleApiError } from '../../../utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  
  try {
    const result = await fetchFromApi(`/games/${id}/scores`);
    
    if (!result.success) {
      return handleApiError(
        result.error,
        `Failed to fetch scores for game with ID ${id}`,
        result.status
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error, `Failed to fetch scores for game with ID ${id}`);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const result = await fetchFromApi(`/games/${id}/scores`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!result.success) {
      return handleApiError(
        result.error,
        `Failed to update scores for game with ID ${id}`,
        result.status
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error, `Failed to update scores for game with ID ${id}`);
  }
}
