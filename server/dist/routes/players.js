"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = playerRoutes;
const player_1 = require("../models/player");
async function playerRoutes(fastify) {
    // Get all players
    fastify.get('/', async (_request, reply) => {
        try {
            const players = await player_1.PlayerModel.getAll();
            return reply.send(players);
        }
        catch (error) {
            console.error('Error getting players:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Get a player by ID
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const player = await player_1.PlayerModel.getById(parseInt(id));
            if (!player) {
                return reply.status(404).send({ error: 'Player not found' });
            }
            return reply.send(player);
        }
        catch (error) {
            console.error('Error getting player:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Create a new player
    fastify.post('/', async (request, reply) => {
        try {
            const player = request.body;
            if (!player.name || player.name.trim() === '') {
                return reply.status(400).send({ error: 'Player name is required' });
            }
            const newPlayer = await player_1.PlayerModel.create(player);
            return reply.status(201).send(newPlayer);
        }
        catch (error) {
            console.error('Error creating player:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Update a player
    fastify.put('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const player = request.body;
            if (!player.name || player.name.trim() === '') {
                return reply.status(400).send({ error: 'Player name is required' });
            }
            const updatedPlayer = await player_1.PlayerModel.update(parseInt(id), player);
            if (!updatedPlayer) {
                return reply.status(404).send({ error: 'Player not found' });
            }
            return reply.send(updatedPlayer);
        }
        catch (error) {
            console.error('Error updating player:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    // Delete a player
    fastify.delete('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const deleted = await player_1.PlayerModel.delete(parseInt(id));
            if (!deleted) {
                return reply.status(404).send({ error: 'Player not found' });
            }
            return reply.status(204).send();
        }
        catch (error) {
            console.error('Error deleting player:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
