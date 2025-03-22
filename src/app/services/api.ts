// API service for interacting with the Fastify backend

const API_BASE_URL = 'http://localhost:3001/api';
export const SERVER_ERROR_MESSAGE = 'Cannot connect to server, game is running without saving';

// Player API methods
export const playerApi = {
  // Get all players
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/players`, {
        // Adding a timeout to prevent long hanging requests
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(SERVER_ERROR_MESSAGE);
      }
      
      return response.json();
    } catch (error) {
      console.error('Network error when fetching players:', error);
      // Return an empty array instead of throwing to prevent app crashes
      return [];
    }
  },

  // Create a new player
  create: async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return response.json();
  },

  // Delete a player
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return true;
  },
};

// Game API methods
export const gameApi = {
  // Get all games
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/games`);
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return response.json();
  },

  // Get a game by ID with scores
  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/games/${id}`);
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return response.json();
  },

  // Create a new game
  create: async () => {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return response.json();
  },

  // Update a game (set winner or completed status)
  update: async (id: number, data: { winner_id?: number; completed?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return response.json();
  },

  // Add a player to a game
  addPlayer: async (gameId: number, playerId: number) => {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/players/${playerId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return response.json();
  },

  // Update a score
  updateScore: async (gameId: number, data: {
    player_id: number;
    frame_number: number;
    roll_1: number;
    roll_2?: number | null;
    roll_3?: number | null;
    frame_score?: number | null;
    total_score?: number | null;
  }) => {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/scores`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return response.json();
  },
};
