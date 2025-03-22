import { NextRequest, NextResponse } from 'next/server';
import { fetchFromApi, handleApiError } from '../../../../utils';

// This is the approach recommended in Next.js App Router documentation
// for handling nested dynamic routes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
): Promise<NextResponse> {
  const { id, playerId } = await params;
  
  try {
    const body = await request.json();

    const result = await fetchFromApi(`/games/${id}/players/${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!result.success) {
      return handleApiError(
        result.error,
        `Failed to add player to game`,
        result.status
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, `Failed to add player ${playerId} to game ${id}`);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
): Promise<NextResponse> {
  const { id, playerId } = await params;
  
  try {
    const result = await fetchFromApi(`/games/${id}/players/${playerId}`, {
      method: 'DELETE',
    });
    
    if (!result.success) {
      return handleApiError(
        result.error,
        `Failed to remove player from game`,
        result.status
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, `Failed to remove player ${playerId} from game ${id}`);
  }
}
