import Fastify, { FastifyInstance } from 'fastify';
import gameRoutes from '../../src/routes/games';
import { GameModel } from '../../src/models/game';
import { GameScoreModel, NewGameScore } from '../../src/models/gameScore';
import db from '../../src/db/connection';
import { clearTestDb } from '../db/test-db';

// Import Jest types to fix TypeScript errors
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Game Routes', () => {
  let fastify: FastifyInstance;
  
  beforeEach(async () => {
    // Clear the test database before each test
    await clearTestDb();
    
    // Create a new Fastify instance for each test
    fastify = Fastify();
    
    // Register the game routes
    await fastify.register(gameRoutes, { prefix: '/' });
  });
  
  afterEach(async () => {
    // Close the Fastify server after each test
    if (fastify) {
      await fastify.close();
    }
  });
  
  describe('GET /', () => {
    it('should return all games with players', async () => {
      // Insert test data directly into the database
      const player1Result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 1']);
      const player2Result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 2']);
      const player1Id = player1Result.rows[0].id;
      const player2Id = player2Result.rows[0].id;
      
      const gameResult = await db.query('INSERT INTO games (date_played) VALUES (CURRENT_TIMESTAMP) RETURNING *');
      const gameId = gameResult.rows[0].id;
      
      // Add players to the game by creating game scores
      await db.query(
        'INSERT INTO game_scores (game_id, player_id, frame_number, roll_1, roll_2, frame_score, total_score) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [gameId, player1Id, 1, 5, 3, 8, 8]
      );
      await db.query(
        'INSERT INTO game_scores (game_id, player_id, frame_number, roll_1, roll_2, frame_score, total_score) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [gameId, player2Id, 1, 7, 2, 9, 9]
      );
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/'
      });
      
      expect(response.statusCode).toBe(200);
      const games = JSON.parse(response.body);
      expect(games).toHaveLength(1);
      expect(games[0].id).toBe(gameId);
      expect(games[0].player_count).toBe(2);
    });
    
    it('should handle errors when getting all games', async () => {
      // Force an error
      jest.spyOn(GameModel, 'getGamesWithPlayers').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/'
      });
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal Server Error'
      });
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });
  
  describe('GET /:id', () => {
    it('should return a game by ID with players and scores', async () => {
      // Insert test data directly into the database
      const player1Result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 1']);
      const player2Result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 2']);
      const player1Id = player1Result.rows[0].id;
      const player2Id = player2Result.rows[0].id;
      
      const gameResult = await db.query('INSERT INTO games (date_played) VALUES (CURRENT_TIMESTAMP) RETURNING *');
      const gameId = gameResult.rows[0].id;
      
      // Add players to the game by creating game scores
      await db.query(
        'INSERT INTO game_scores (game_id, player_id, frame_number, roll_1, roll_2, frame_score, total_score) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [gameId, player1Id, 1, 5, 3, 8, 8]
      );
      await db.query(
        'INSERT INTO game_scores (game_id, player_id, frame_number, roll_1, roll_2, frame_score, total_score) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [gameId, player2Id, 1, 7, 2, 9, 9]
      );
      
      const response = await fastify.inject({
        method: 'GET',
        url: `/${gameId}`
      });
      
      expect(response.statusCode).toBe(200);
      const game = JSON.parse(response.body);
      expect(game.id).toBe(gameId);
      expect(game.players).toBeDefined();
      expect(game.players.length).toBe(2);
      
      // Find player 1 in the players array
      const player1 = game.players.find((p: any) => p.id === player1Id);
      expect(player1).toBeDefined();
      expect(player1.name).toBe('Player 1');
      expect(player1.frames).toBeDefined();
      expect(player1.frames.length).toBe(1);
      expect(player1.frames[0].frame_number).toBe(1);
      expect(player1.frames[0].roll_1).toBe(5);
      expect(player1.frames[0].roll_2).toBe(3);
      expect(player1.frames[0].frame_score).toBe(8);
      expect(player1.frames[0].total_score).toBe(8);
      
      // Find player 2 in the players array
      const player2 = game.players.find((p: any) => p.id === player2Id);
      expect(player2).toBeDefined();
      expect(player2.name).toBe('Player 2');
      expect(player2.frames).toBeDefined();
    });
    
    it('should return 404 if game not found', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/999'
      });
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Game not found'
      });
    });
    
    it('should handle errors when getting a game by ID', async () => {
      // Force an error
      jest.spyOn(GameModel, 'getById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/1'
      });
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal Server Error'
      });
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });
  
  describe('POST /', () => {
    it('should create a new game', async () => {
      // Insert test players
      const player1Result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 1']);
      const player2Result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 2']);
      const player1Id = player1Result.rows[0].id;
      const player2Id = player2Result.rows[0].id;
      
      const response = await fastify.inject({
        method: 'POST',
        url: '/',
        payload: {
          playerIds: [player1Id, player2Id]
        }
      });
      
      expect(response.statusCode).toBe(201);
      const game = JSON.parse(response.body);
      expect(game.id).toBeDefined();
      
      // Verify the game was added to the database
      const dbResult = await db.query('SELECT * FROM games WHERE id = $1', [game.id]);
      expect(dbResult.rows).toHaveLength(1);
    });
    
    it('should handle errors when creating a game', async () => {
      // Force an error
      jest.spyOn(GameModel, 'create').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const response = await fastify.inject({
        method: 'POST',
        url: '/',
        payload: {
          playerIds: [1, 2]
        }
      });
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal Server Error'
      });
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });
  
  describe('PUT /:id/scores', () => {
    it('should update a game score', async () => {
      // Insert test data directly into the database
      const player1Result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 1']);
      const player1Id = player1Result.rows[0].id;
      
      const gameResult = await db.query('INSERT INTO games (date_played) VALUES (CURRENT_TIMESTAMP) RETURNING *');
      const gameId = gameResult.rows[0].id;
      
      // Add initial game score
      const scoreResult = await db.query(
        'INSERT INTO game_scores (game_id, player_id, frame_number, roll_1, roll_2, frame_score, total_score) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [gameId, player1Id, 1, 5, 3, 8, 8]
      );
      const scoreId = scoreResult.rows[0].id;
      
      // Mock the GameScoreModel.getByGameAndPlayer method to return our test data
      const mockGetByGameAndPlayer = jest.spyOn(GameScoreModel, 'getByGameAndPlayer');
      mockGetByGameAndPlayer.mockResolvedValue([{
        id: scoreId,
        game_id: gameId,
        player_id: player1Id,
        frame_number: 1,
        roll_1: 5,
        roll_2: 3,
        roll_3: null,
        frame_score: 8,
        total_score: 8
      }]);
      
      // Mock the GameScoreModel.update method
      const mockUpdate = jest.spyOn(GameScoreModel, 'update');
      mockUpdate.mockResolvedValue({
        id: scoreId,
        game_id: gameId,
        player_id: player1Id,
        frame_number: 1,
        roll_1: 10,
        roll_2: null,
        roll_3: null,
        frame_score: 10,
        total_score: 10
      });
      
      // Update the score
      const scoreUpdate = {
        game_id: gameId,
        player_id: player1Id,
        frame_number: 1,
        roll_1: 10,
        roll_2: null,
        frame_score: 10,
        total_score: 10
      };
      
      const response = await fastify.inject({
        method: 'PUT',
        url: `/${gameId}/scores`,
        payload: scoreUpdate
      });
      
      expect(response.statusCode).toBe(200);
      const updatedScore = JSON.parse(response.body);
      expect(updatedScore.roll_1).toBe(10);
      expect(updatedScore.roll_2).toBeNull();
      expect(updatedScore.frame_score).toBe(10);
      expect(updatedScore.total_score).toBe(10);
      
      // Verify our mocked methods were called correctly
      expect(mockGetByGameAndPlayer).toHaveBeenCalledWith(gameId, player1Id);
      expect(mockUpdate).toHaveBeenCalledWith(scoreId, expect.objectContaining({
        roll_1: 10,
        roll_2: null,
        frame_score: 10,
        total_score: 10
      }));
      
      // Clean up mocks
      mockGetByGameAndPlayer.mockRestore();
      mockUpdate.mockRestore();
    });
    
    it('should handle errors when updating a game score', async () => {
      // Mock the GameScoreModel.getByGameAndPlayer method to throw an error
      const mockGetByGameAndPlayer = jest.spyOn(GameScoreModel, 'getByGameAndPlayer');
      mockGetByGameAndPlayer.mockRejectedValue(new Error('Database error'));
      
      // Create test data to send in the request
      const scoreUpdate = {
        game_id: 1,
        player_id: 1,
        frame_number: 1,
        roll_1: 10,
        roll_2: null,
        frame_score: 10,
        total_score: 10
      };
      
      const response = await fastify.inject({
        method: 'PUT',
        url: '/1/scores',
        payload: scoreUpdate
      });
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Internal Server Error'
      });
      
      // Restore the original implementation
      mockGetByGameAndPlayer.mockRestore();
    });
  });
});
