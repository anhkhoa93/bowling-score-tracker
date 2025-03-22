import Fastify, { FastifyInstance } from 'fastify';
import playerRoutes from '../../src/routes/players';
import { PlayerModel } from '../../src/models/player';
import db from '../../src/db/connection';
import { clearTestDb } from '../db/test-db';

// Import Jest types to fix TypeScript errors
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Player Routes', () => {
  let fastify: FastifyInstance;
  
  beforeEach(async () => {
    // Clear the test database before each test
    await clearTestDb();
    
    // Create a new Fastify instance for each test
    fastify = Fastify();
    
    // Register the player routes
    await fastify.register(playerRoutes, { prefix: '/' });
  });
  
  afterEach(async () => {
    // Close the Fastify server after each test
    if (fastify) {
      await fastify.close();
    }
  });
  
  describe('GET /', () => {
    it('should return all players', async () => {
      // Insert test data directly into the database
      await db.query('INSERT INTO players (name) VALUES ($1)', ['Player 1']);
      await db.query('INSERT INTO players (name) VALUES ($1)', ['Player 2']);
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/'
      });
      
      expect(response.statusCode).toBe(200);
      const players = JSON.parse(response.body);
      expect(players).toHaveLength(2);
      expect(players.some((p: any) => p.name === 'Player 1')).toBe(true);
      expect(players.some((p: any) => p.name === 'Player 2')).toBe(true);
    });
    
    it('should handle errors when getting all players', async () => {
      // Force an error
      jest.spyOn(PlayerModel, 'getAll').mockImplementationOnce(() => {
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
    it('should return a player by ID', async () => {
      // Insert test data directly into the database
      const result = await db.query('INSERT INTO players (name) VALUES ($1) RETURNING *', ['Player 1']);
      const playerId = result.rows[0].id;
      
      const response = await fastify.inject({
        method: 'GET',
        url: `/${playerId}`
      });
      
      expect(response.statusCode).toBe(200);
      const player = JSON.parse(response.body);
      expect(player.id).toBe(playerId);
      expect(player.name).toBe('Player 1');
    });
    
    it('should return 404 if player not found', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/999'
      });
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Player not found'
      });
    });
    
    it('should handle errors when getting a player by ID', async () => {
      // Force an error
      jest.spyOn(PlayerModel, 'getById').mockImplementationOnce(() => {
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
    it('should create a new player', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/',
        payload: {
          name: 'New Player'
        }
      });
      
      expect(response.statusCode).toBe(201);
      const player = JSON.parse(response.body);
      expect(player.id).toBeDefined();
      expect(player.name).toBe('New Player');
      
      // Verify the player was added to the database
      const dbResult = await db.query('SELECT * FROM players WHERE id = $1', [player.id]);
      expect(dbResult.rows).toHaveLength(1);
    });
    
    it('should return 400 if player name is missing', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/',
        payload: {
          name: ''
        }
      });
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Player name is required'
      });
    });
    
    it('should handle errors when creating a player', async () => {
      // Force an error
      jest.spyOn(PlayerModel, 'create').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const response = await fastify.inject({
        method: 'POST',
        url: '/',
        payload: {
          name: 'New Player'
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
});
