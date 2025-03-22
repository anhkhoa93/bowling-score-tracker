"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gameRoutes;
const game_1 = require("../models/game");
const gameScore_1 = require("../models/gameScore");
async function gameRoutes(fastify) {
    // Get all games
    fastify.get('/', async (_request, reply) => {
        try {
            const games = await game_1.GameModel.getGamesWithPlayers();
            return reply.send(games);
        }
        catch (error) {
            console.error('Error getting games:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Get a game by ID with scores
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const gameId = parseInt(id);
            const game = await game_1.GameModel.getById(gameId);
            if (!game) {
                return reply.status(404).send({ error: 'Game not found' });
            }
            const gameWithScores = await gameScore_1.GameScoreModel.getGameWithScores(gameId);
            return reply.send(gameWithScores);
        }
        catch (error) {
            console.error('Error getting game:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Create a new game
    fastify.post('/', async (_request, reply) => {
        try {
            const newGame = await game_1.GameModel.create();
            return reply.status(201).send(newGame);
        }
        catch (error) {
            console.error('Error creating game:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Update a game (set winner or completed status)
    fastify.put('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const game = request.body;
            const updatedGame = await game_1.GameModel.update(parseInt(id), game);
            if (!updatedGame) {
                return reply.status(404).send({ error: 'Game not found' });
            }
            return reply.send(updatedGame);
        }
        catch (error) {
            console.error('Error updating game:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Delete a game
    fastify.delete('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const deleted = await game_1.GameModel.delete(parseInt(id));
            if (!deleted) {
                return reply.status(404).send({ error: 'Game not found' });
            }
            return reply.status(204).send();
        }
        catch (error) {
            console.error('Error deleting game:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Get scores for a game
    fastify.get('/:id/scores', async (request, reply) => {
        try {
            const { id } = request.params;
            const scores = await gameScore_1.GameScoreModel.getByGameId(parseInt(id));
            return reply.send(scores);
        }
        catch (error) {
            console.error('Error getting game scores:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Add a player to a game
    fastify.post('/:gameId/players/:playerId', async (request, reply) => {
        try {
            const { gameId, playerId } = request.params;
            // Initialize 10 frames for the player with default values
            const frames = [];
            for (let i = 1; i <= 10; i++) {
                frames.push({
                    game_id: parseInt(gameId),
                    player_id: parseInt(playerId),
                    frame_number: i,
                    roll_1: 0,
                    roll_2: null,
                    roll_3: null,
                    frame_score: 0,
                    total_score: 0
                });
            }
            // Create all frames for the player
            for (const frame of frames) {
                await gameScore_1.GameScoreModel.create(frame);
            }
            return reply.status(201).send({ message: 'Player added to game successfully' });
        }
        catch (error) {
            console.error('Error adding player to game:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Update a score
    fastify.put('/:gameId/scores', async (request, reply) => {
        try {
            const { gameId } = request.params;
            const scoreUpdate = request.body;
            // Ensure the game_id in the body matches the URL
            scoreUpdate.game_id = parseInt(gameId);
            // Find the existing score record
            const existingScores = await gameScore_1.GameScoreModel.getByGameAndPlayer(scoreUpdate.game_id, scoreUpdate.player_id);
            const existingScore = existingScores.find(s => s.frame_number === scoreUpdate.frame_number);
            if (!existingScore) {
                return reply.status(404).send({ error: 'Score record not found' });
            }
            // Update the score
            const updatedScore = await gameScore_1.GameScoreModel.update(existingScore.id, scoreUpdate);
            return reply.send(updatedScore);
        }
        catch (error) {
            console.error('Error updating score:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
