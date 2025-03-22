import { NextRequest, NextResponse } from 'next/server';
import { fetchFromApi, handleApiError } from '../../utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  
  try {
    const result = await fetchFromApi(`/games/${id}`);

    if (!result.success) {
      return handleApiError(
        result.error,
        `Game with ID ${id} not found`,
        result.status
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error, `Failed to fetch game with ID ${id}`);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  
  try {
    const result = await fetchFromApi(`/games/${id}`, {
      method: 'DELETE',
    });
    
    if (!result.success) {
      return handleApiError(
        result.error,
        `Failed to delete game with ID ${id}`,
        result.status
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, `Failed to delete game with ID ${id}`);
  }
}
