import { NextResponse } from 'next/server';

// Shared constants
export const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
export const SERVER_ERROR_MESSAGE = 'Cannot connect to server, game is running without saving';

// Helper function to handle API errors
export function handleApiError(error: unknown, message: string, statusCode = 500) {
  console.error(`${message}:`, error);
  return NextResponse.json(
    { error: message },
    { status: statusCode }
  );
}

// Helper function to fetch data from the API
export async function fetchFromApi(path: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        status: response.status,
        error: errorText || 'Unknown error',
        data: null
      };
    }
    
    // Check if the response is empty (204 No Content)
    if (response.status === 204) {
      return {
        success: true,
        status: 204,
        error: null,
        data: null
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      status: response.status,
      error: null,
      data
    };
  } catch (error) {
    console.error(`Error fetching from ${path}:`, error);
    return {
      success: false,
      status: 500,
      error: SERVER_ERROR_MESSAGE,
      data: null
    };
  }
}
